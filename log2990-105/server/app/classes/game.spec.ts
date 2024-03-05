import { expect } from 'chai';
import { describe } from 'mocha';
import { Game } from '@app/classes/game';
import { Board } from '@app/classes/board';
import { DEFAULT_BONUSES } from '@app/classes/config';
import { Player } from '@app/classes/player';

describe('Game', () => {
    it('completePublic should return correct value', () => {
        const toPlaceLetters = new Map<string, string>([
            ['a1', 'a'],
            ['a2', 'b'],
            ['a3', 'b'],
            ['a4', 'e'],
            ['a5', 'i'],
            ['a6', 'x'],
            ['a7', 'k'],
            ['a8', 'j'],
        ]);
        const players = new Map<string, Player>([['test1', new Player('test1')]]);
        const board = new Board(DEFAULT_BONUSES);
        for (const letter of toPlaceLetters) board.placeLetter(letter[0], letter[1]);
        const game: Game = new Game(board, players, [
            [1, false],
            [2, false],
        ]);

        let result = game.completePublic(1);
        expect(game.publicObj[0][1]).to.equals(true);
        expect(result).to.equals(true);

        result = game.completePublic(3);
        expect(result).to.equals(false);
    });
});
