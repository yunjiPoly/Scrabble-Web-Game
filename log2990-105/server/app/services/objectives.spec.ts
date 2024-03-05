/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ObjectivesService } from '@app/services/objectives';
import { ValidationService } from '@app/services/validation.service';
import { expect } from 'chai';
import { Game } from '@app/classes/game';
import { DEFAULT_BONUSES } from '@app/classes/config';
import { Player } from '@app/classes/player';
import { Board } from '@app/classes/board';

describe('ObjectivesService', () => {
    let service: ObjectivesService;
    let validationService: ValidationService;
    let objectivesPoints: Map<number, number>;
    let toPlaceLetters: Map<string, string>;
    let game: Game;
    let board: Board;
    let players: Map<string, Player>;

    beforeEach(() => {
        toPlaceLetters = new Map<string, string>([
            ['a1', 'a'],
            ['a2', 'b'],
            ['a3', 'b'],
            ['a4', 'e'],
            ['a5', 'i'],
            ['a6', 'x'],
            ['a7', 'k'],
            ['a8', 'j'],
        ]);
        players = new Map<string, Player>([['test1', new Player('test1')]]);
        board = new Board(DEFAULT_BONUSES);
        for (const letter of toPlaceLetters) board.placeLetter(letter[0], letter[1]);

        validationService = new ValidationService();
        validationService.init('a1', toPlaceLetters, board);
        service = new ObjectivesService(validationService);

        objectivesPoints = new Map<number, number>([
            [1, 10],
            [2, 30],
            [3, 10],
            [4, 20],
            [5, 50],
            [6, 30],
            [7, 50],
            [8, 20],
        ]);
        game = new Game(board, players, [
            [1, false],
            [2, false],
        ]);
    });

    it('getPublicObjectives should return random objectives', () => {
        const result = service.getPublicObjectives();
        expect(result.length).to.equals(2);
        expect(result[0]).greaterThan(0);
        expect(result[1]).greaterThan(0);
    });

    it('getPrivateObjectives should return random objectives', () => {
        const result = service.getPrivateObjectives();
        expect(result).greaterThan(0);
    });

    it('getPoints should return correct values', () => {
        for (const objective of objectivesPoints) {
            const result = service.getPoints(objective[0]);
            expect(result).to.equals(objective[1]);
        }
    });

    it('checkObjective should call right function', () => {
        const expected = new Map<number, boolean>([
            [1, true],
            [2, false],
            [3, true],
            [4, true],
            [5, true],
            [6, false],
            [7, true],
            [8, false],
        ]);
        for (const objective of expected) {
            const result = service.checkObjective(objective[0], toPlaceLetters, game);
            expect(result).to.equals(objective[1]);
        }
    });
});
