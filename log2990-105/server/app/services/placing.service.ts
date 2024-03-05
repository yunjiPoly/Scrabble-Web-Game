import { Board } from '@app/classes/board';
import { DEFAULT_HAND_SIZE } from '@app/classes/config';
import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import { Service } from 'typedi';

@Service()
export class PlacingService {
    /**
     * @description Place letters onto the board
     * @param letters Letters to be placed on the board. Key: Coords -- Value: Letter
     * @param board Game board on which to place the {@link letters}
     * @param player Player who is placing the {@link letters}
     */
    placeLetters(letters: Map<string, string>, board: Board, player: Player): void {
        letters.forEach((letter, coords) => {
            board.placeLetter(coords, letter);
            player.remove(WILDCARD_RE.test(letter) ? '*' : letter);
        });
    }

    /**
     * @description Remove placed letters from the board and return them to hand
     */
    returnLetters(letters: Map<string, string>, board: Board, player: Player): void {
        letters.forEach((letter, coords) => {
            board.removeAt(coords);
            player.add(WILDCARD_RE.test(letter) ? '*' : letter);
        });
    }

    /**
     * @description Draw as many letters as possible from the reserve and place them into the hand
     */
    replenishHand(reserve: Reserve, player: Player): void {
        for (let amount = DEFAULT_HAND_SIZE - player.size; amount > 0; amount--) {
            const letter = reserve.drawOne();
            if (letter === undefined) {
                return;
            }
            player.add(letter);
        }
    }
}

const WILDCARD_RE = /[A-Z]/;
