import { Board } from '@app/classes/board';
import { DEFAULT_HAND_SIZE } from '@app/classes/config';
import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';

export class Game {
    // Key -- Player's socket ID <br>
    // Value -- Player
    readonly players: Map<string, Player>;
    readonly reserve = new Reserve();
    readonly publicObj: [number, boolean][];
    validTurnCounter: number;

    constructor(readonly board: Board, players: Map<string, Player>, publicObj: [number, boolean][]) {
        this.publicObj = publicObj;
        this.validTurnCounter = 0;
        this.players = players;
        Array.from(this.players.values()).forEach((player) => {
            const hand = this.reserve.draw(DEFAULT_HAND_SIZE);
            if (hand !== undefined) {
                player.addAll(hand);
            }
        });
    }

    completePublic(obj: number): boolean {
        for (const objective of this.publicObj) {
            if (objective[0] === obj && !objective[1]) {
                objective[1] = true;
                return true;
            }
        }
        return false;
    }
}
