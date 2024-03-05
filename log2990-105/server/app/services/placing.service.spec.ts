import { Board } from '@app/classes/board';
import { DEFAULT_BONUSES } from '@app/classes/config';
import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import { expect } from 'chai';
import { PlacingService } from './placing.service';
import { Container } from 'typedi';

const PLAYER_HAND_SIZE = 7;

describe('PlacingService', () => {
    let service: PlacingService;
    let letters: Map<string, string>;
    let board: Board;
    let player: Player;
    let reserve: Reserve;

    beforeEach(() => {
        service = Container.get(PlacingService);
        reserve = new Reserve();
        letters = new Map();
        board = new Board(DEFAULT_BONUSES);
        player = new Player('Joe');
        letters.set('a1', 'a').set('a2', 'a').set('a3', 's');
        player.addAll(['a', 'a', 's']);
    });

    it('placeLetters should modify containers correctly', () => {
        service.placeLetters(letters, board, player);
        expect(board.hasCoords('a1')).to.equals(true);
        expect(board.hasCoords('a2')).to.equals(true);
        expect(board.hasCoords('a3')).to.equals(true);
    });

    it('returnLetters should put the letters back into player hand', () => {
        service.placeLetters(letters, board, player);
        service.returnLetters(letters, board, player);

        expect(player.has('a')).to.equals(true);
        expect(player.has('s')).to.equals(true);
    });

    it('replenishHand should refill player hand', () => {
        service.replenishHand(reserve, player);

        expect(player.hand.length).to.equals(PLAYER_HAND_SIZE);
    });
});
