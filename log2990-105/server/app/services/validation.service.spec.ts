import { Board } from '@app/classes/board';
import { DEFAULT_BONUSES, DEFAULT_DICTIONARY } from '@app/classes/config';
import { expect } from 'chai';
import { ASCII_SMALL_A, ValidationService } from './validation.service';

const INDEX_TEST_VALUE = 10;

describe('ValidationService', () => {
    let service: ValidationService;
    let coords: string;
    let startCoord: string;
    let expectedWord: string;
    let map: Map<string, string>;
    let hNewWordValues: Map<string, string>;
    let vNewWordValues: Map<string, string>;
    let singleNewWordValues: Map<string, string>;
    let validDictSearch: string[];
    let invalidDictSearch: string[];
    let board: Board;

    beforeEach(() => {
        service = new ValidationService();
        service.dictionaries.set('-1', DEFAULT_DICTIONARY.words);

        coords = 'a2';
        startCoord = 'a1';
        map = new Map([['h8', 'abaca']]);
        hNewWordValues = new Map([
            ['a2', 'a'],
            ['a3', 'a'],
            ['a4', 's'],
        ]);
        vNewWordValues = new Map([
            ['b1', 'a'],
            ['c1', 'a'],
            ['d1', 's'],
        ]);
        expectedWord = 'aas';
        singleNewWordValues = new Map([['a1', 'a']]);
        validDictSearch = ['abaca', 'aas', 'abacule'];
        invalidDictSearch = ['aaa', 'aasss', 'xfdjk'];
        board = new Board(DEFAULT_BONUSES);
    });

    it('init should affect correct values', () => {
        const expectedCoordValue = { x: ASCII_SMALL_A, y: 2 };
        service.init(coords, map, board);

        expect(service.startCoord.x).to.equals(expectedCoordValue.x);
        expect(service.startCoord.y).to.equals(expectedCoordValue.y);
        expect(service.newWord).to.equals(map);
    });

    it('findWord should return true', () => {
        expect(service.findWord('-1', validDictSearch)).to.equals(true);
    });

    it('findWord should return false', () => {
        expect(service.findWord('-1', invalidDictSearch)).to.equals(false);
    });

    it('variableReset should affect correct value', () => {
        service.index = INDEX_TEST_VALUE;
        expect(service.index).to.equals(INDEX_TEST_VALUE);
        service.resetVariable();
        expect(service.index).to.equals(1);
    });

    it('fetchWord horizontal', () => {
        for (const i of hNewWordValues) board.placeLetter(i[0], i[1]);
        service.init(startCoord, hNewWordValues, board);
        const returnValue = service.fetchWords();

        expect(returnValue[0]).to.equals(expectedWord);
    });

    it('fetchWord vertical', () => {
        startCoord = 'b1';
        for (const i of vNewWordValues) board.placeLetter(i[0], i[1]);
        service.init(startCoord, vNewWordValues, board);
        const returnValue = service.fetchWords();

        expect(returnValue[0]).to.equals(expectedWord);
    });

    it('fetchWord single letter placed', () => {
        service.init(startCoord, singleNewWordValues, board);
        const result = service.fetchWords();
        result.push('a');
        const expected = ['', '', 'a'];

        expect(result[2]).to.equals(expected[2]);
    });

    it('calcPoints Wx2 should return correct values', () => {
        startCoord = 'h8';
        const expectedPoints = 6;
        const word = new Map([
            ['h8', 'a'],
            ['h9', 'a'],
            ['h10', 's'],
        ]);
        for (const i of word) board.placeLetter(i[0], i[1]);
        service.init(startCoord, word, board);
        service.fetchWords();
        const returnValue = service.calcPoints();

        expect(returnValue).to.equals(expectedPoints);
    });

    it('calcPoints Wx3 should return correct values', () => {
        startCoord = 'a1';
        const expectedPoints = 9;
        const word = new Map([
            ['a1', 'a'],
            ['a2', 'a'],
            ['a3', 's'],
        ]);
        for (const i of word) board.placeLetter(i[0], i[1]);
        service.init(startCoord, word, board);
        service.fetchWords();
        const returnValue = service.calcPoints();

        expect(returnValue).to.equals(expectedPoints);
    });

    it('calcPoints Lx2 should return correct values', () => {
        startCoord = 'd1';
        const expectedPoints = 10;
        const word = new Map([
            ['d1', 'v'],
            ['d2', 'u'],
            ['d3', 'e'],
        ]);
        for (const i of word) board.placeLetter(i[0], i[1]);
        service.init(startCoord, word, board);
        service.fetchWords();
        const returnValue = service.calcPoints();

        expect(returnValue).to.equals(expectedPoints);
    });

    it('calcPoints Lx3 should return correct values', () => {
        startCoord = 'f2';
        const expectedPoints = 14;
        const word = new Map([
            ['f2', 'v'],
            ['g2', 'u'],
            ['h2', 'e'],
        ]);
        for (const i of word) board.placeLetter(i[0], i[1]);
        service.init(startCoord, word, board);
        service.fetchWords();
        const returnValue = service.calcPoints();

        expect(returnValue).to.equals(expectedPoints);
    });
});
