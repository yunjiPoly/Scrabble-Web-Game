import { TestBed } from '@angular/core/testing';
import { GameInit } from '@app/classes/game-info';
import { LetterPlacingService } from '@app/services/letter-placing.service';
import { TextboxService } from '@app/services/textbox.service';
import { WebsocketService } from '@app/services/websocket.service';
import { Subject } from 'rxjs';

describe('LetterPlacingService', () => {
    let service: LetterPlacingService;
    let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let textboxServiceSpy: jasmine.SpyObj<WebsocketService>;

    const gameInit = new Subject<GameInit>();
    const gameTurn = new Subject<boolean>();
    const gameBoard = new Subject<[string, string][]>();
    const gameHands = new Subject<{ ownHand: string[]; opponentHand: string[] }>();

    beforeEach(() => {
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [], {
            init: gameInit.asObservable(),
            turn: gameTurn.asObservable(),
            board: gameBoard.asObservable(),
            hands: gameHands.asObservable(),
        });

        textboxServiceSpy = jasmine.createSpyObj('TextboxService', { displayMessage: (_: string, __: string) => void [_, __] });

        TestBed.configureTestingModule({
            providers: [
                { provide: TextboxService, useValue: textboxServiceSpy },
                { provide: WebsocketService, useValue: websocketServiceSpy },
            ],
        });

        service = TestBed.inject(LetterPlacingService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should generate letters correctly', () => {
        service.word = 'stub';
        service.letters = new Map<string, string>();
        service.startCoords = 'a1';
        service.direction = 'h';
        service.generateLetters(service.letters, service.word, service.startCoords, service.direction);
        expect(Array.from(service.letters.entries())).toEqual([
            ['a1', 's'],
            ['a2', 't'],
            ['a3', 'u'],
            ['a4', 'b'],
        ]);

        service.letters.clear();
        service.word = 'flaShY';
        service.startCoords = 'j15';
        service.direction = 'v';
        service.generateLetters(service.letters, service.word, service.startCoords, service.direction);
        expect(Array.from(service.letters.entries())).toEqual([
            ['j15', 'f'],
            ['k15', 'l'],
            ['l15', 'a'],
            ['m15', 'S'],
            ['n15', 'h'],
            ['o15', 'Y'],
        ]);
    });

    it('should re-map special chars', () => {
        const expected = 'aeueaeioueiuc'.split('');
        const actual = 'àèùéâêîôûëïüç'.split('');
        expect(actual.every((letter, index) => service.mapSpecialChars(letter) === expected[index])).toBeTrue();
    });

    it('should not allow placing when not my turn', () => {
        expect(service.isMyTurn(false)).toBeFalse();
        expect(service.isMyTurn(true)).toBeTrue();
    });

    it('should reject invalid position params', () => {
        expect(service.isValidParam('a1v', 'stub')).toBeTrue();
        expect(service.isValidParam('o15h', 'stub')).toBeTrue();
        expect(service.isValidParam('a16v', 'stub')).toBeFalse();
        expect(service.isValidParam('p1h', 'stub')).toBeFalse();
        expect(service.isValidParam('top-left', 'stub')).toBeFalse();
        expect(service.isValidParam('', 'stub')).toBeFalse();
    });

    it('should reject invalid word params', () => {
        expect(service.isValidParam('a1v', 'StuB')).toBeTrue();
        expect(service.isValidParam('a1v', 'àèùéâêîôûëïüç')).toBeTrue();
        expect(service.isValidParam('a1v', 'Mild Seven')).toBeFalse();
        expect(service.isValidParam('a1v', "Denny's")).toBeFalse();
        expect(service.isValidParam('a1v', 'hy-phen')).toBeFalse();
        expect(service.isValidParam('a1v', '')).toBeFalse();
    });

    it('should not allow placing out of bounds', () => {
        expect(service.isInBounds('h8', 'v', 'stub')).toBeTrue();
        expect(service.isInBounds('l15', 'v', 'stub')).toBeTrue();
        expect(service.isInBounds('l15', 'h', 'stub')).toBeFalse();
        expect(service.isInBounds('o8', 'v', 'stub')).toBeFalse();
    });

    it('should not allow placing of letters not in hand', () => {
        const fakeHand = ['s', 't', 'u', 'b', 'l', 'e', '*'];
        let expectedHand = new Map<string, string>([
            ['1', 's'],
            ['2', 't'],
            ['3', 'u'],
            ['4', 'b'],
        ]);
        expect(service.isInHand(expectedHand, fakeHand)).toBeTrue();

        expectedHand = new Map<string, string>([
            ['1', 's'],
            ['2', 't'],
            ['3', 'u'],
            ['4', 'M'],
            ['5', 'b'],
            ['6', 'l'],
            ['7', 'e'],
        ]);
        expect(service.isInHand(expectedHand, fakeHand)).toBeTrue();

        expectedHand = new Map<string, string>([
            ['1', 'b'],
            ['2', 'u'],
            ['3', 'B'],
            ['4', 'B'],
            ['5', 'l'],
            ['6', 'e'],
        ]);
        expect(service.isInHand(expectedHand, fakeHand)).toBeFalse();
    });

    it('should place a letter on H8 on first turn', () => {
        const board = new Map<string, string>();
        let toPlace = new Map<string, string>([
            ['g8', 's'],
            ['h8', 't'],
            ['i8', 'u'],
            ['j8', 'b'],
        ]);
        expect(service.isAdjacent(board, toPlace, Array.from(toPlace.keys())[0], Array.from(toPlace.keys())[3])).toBeTrue();

        toPlace = new Map<string, string>([
            ['j7', 's'],
            ['j8', 't'],
            ['j9', 'u'],
            ['j10', 'b'],
        ]);
        expect(service.isAdjacent(board, toPlace, Array.from(toPlace.keys())[0], Array.from(toPlace.keys())[3])).toBeFalse();
    });

    it('should not allow placing of conflicting letters', () => {
        const board = new Map<string, string>();
        let toPlace = new Map<string, string>([
            ['g8', 's'],
            ['h8', 't'],
            ['i8', 'u'],
            ['j8', 'b'],
        ]);
        toPlace.forEach((value, key) => board.set(key, value));

        toPlace = new Map<string, string>([
            ['h7', 's'],
            ['h8', 't'],
            ['h9', 'u'],
            ['h10', 'b'],
        ]);
        expect(service.isAdjacent(board, toPlace, Array.from(toPlace.keys())[0], Array.from(toPlace.keys())[3])).toBeTrue();

        toPlace = new Map<string, string>([
            ['h7', 's'],
            ['h8', 'l'],
            ['h9', 'a'],
            ['h10', 'b'],
        ]);
        expect(service.isAdjacent(board, toPlace, Array.from(toPlace.keys())[0], Array.from(toPlace.keys())[3])).toBeFalse();
    });

    it('should check for adjacency', () => {
        const board = new Map<string, string>();
        let toPlace = new Map<string, string>([
            ['g8', 's'],
            ['h8', 't'],
            ['i8', 'u'],
            ['j8', 'b'],
        ]);
        toPlace.forEach((value, key) => board.set(key, value));

        toPlace = new Map<string, string>([
            ['g9', 't'],
            ['g10', 'u'],
            ['g11', 'b'],
        ]);
        expect(service.isAdjacent(board, toPlace, Array.from(toPlace.keys())[0], Array.from(toPlace.keys())[2])).toBeTrue();

        toPlace = new Map<string, string>([
            ['f9', 's'],
            ['f10', 't'],
            ['f11', 'u'],
            ['f12', 'b'],
        ]);
        expect(service.isAdjacent(board, toPlace, Array.from(toPlace.keys())[0], Array.from(toPlace.keys())[3])).toBeFalse();
    });
});
