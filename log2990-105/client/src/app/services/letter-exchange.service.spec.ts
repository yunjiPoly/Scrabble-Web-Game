import { TestBed } from '@angular/core/testing';
import { GameInit } from '@app/classes/game-info';
import { MessageType } from '@app/classes/message';
import { LetterExchangeService } from '@app/services/letter-exchange.service';
import { WebsocketService } from '@app/services/websocket.service';
import { Subject } from 'rxjs';
import { TextboxService } from './textbox.service';

describe('LetterExchangeService', () => {
    let service: LetterExchangeService;
    let websocketServiceSpy: jasmine.SpyObj<WebsocketService>;
    let textboxServiceSpy: jasmine.SpyObj<TextboxService>;

    const gameInit = new Subject<GameInit>();
    const gameTurn = new Subject<boolean>();
    const gameReserve = new Subject<string[]>();
    const gameHands = new Subject<{ ownHand: string[]; opponentHand: string[] }>();

    beforeEach(() => {
        textboxServiceSpy = jasmine.createSpyObj('TextboxService', ['displayMessage']);
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [], {
            init: gameInit.asObservable(),
            turn: gameTurn.asObservable(),
            reserve: gameReserve.asObservable(),
            hands: gameHands.asObservable(),
        });

        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: websocketServiceSpy },
                { provide: TextboxService, useValue: textboxServiceSpy },
                { provide: WebsocketService, useValue: websocketServiceSpy },
            ],
        });
        service = TestBed.inject(LetterExchangeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should not allow placing when not my turn', () => {
        expect(service.isMyTurn(false)).toBeFalse();
        expect(service.isMyTurn(true)).toBeTrue();
    });
    it('isValidParam should call the right functions', () => {
        const letters = '';
        const result = service.isValidParam(letters);
        const expected = 'Veuillez spécifier les lettres à échanger';
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalledWith(MessageType.System, expected);
        expect(result).toBeFalse();
    });
    it('isValidParam should enter 2nd branch value', () => {
        const letters = 'abcdefghijklmno';
        const result = service.isValidParam(letters);
        const expected = 'Vous ne pouvez échanger plus que 7 lettres à la fois';
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalledWith(MessageType.System, expected);
        expect(result).toBeFalse();
    });
    it('isValidParam should enter the 3rd branch', () => {
        const letters = 'VDS';
        const result = service.isValidParam(letters);
        const expected = 'Les lettres doivent être en minuscule';
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalledWith(MessageType.System, expected);
        expect(result).toBeFalse();
    });
    it('isValidParam should return true', () => {
        const letters = 'jdis';
        const result = service.isValidParam(letters);
        expect(result).toBeTrue();
    });
    it('isFullReserve should return correct value', () => {
        let reserve: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'a'];
        let result = service.isFullReserve(reserve);
        expect(result).toBeTrue();

        reserve = ['a', 'b', 'c', 'd', 'e', 'f'];
        result = service.isFullReserve(reserve);
        expect(result).toBeFalse();
    });
    it('isInHand should return correct value', () => {
        let exchangeLetters = 'abc';
        let hand: string[] = ['a', 'b', 'c', 'd', 'e', 'f', 'a'];
        let result = service.isInHand(exchangeLetters, hand);
        expect(result).toBeTrue();

        exchangeLetters = 'ghi';
        hand = ['a', 'b', 'c', 'd', 'e', 'f', 'a'];
        result = service.isInHand(exchangeLetters, hand);
        const expected = 'Vous ne pouvez pas échanger des lettres qui ne sont pas dans votre main';
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalledWith(MessageType.System, expected);
        expect(result).toBeFalse();
    });
    it('isMyTurn should return correct value', () => {
        let turn = true;
        let result = service.isMyTurn(turn);
        expect(result).toBeTrue();

        turn = false;
        result = service.isMyTurn(turn);
        const expected = 'La commande !échanger peut seulement être utilisée lors de votre tour';
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalledWith(MessageType.System, expected);
        expect(result).toBeFalse();
    });
    it('validateCommand should call the right functions', () => {
        const letters = 'abc';
        const spyTurn = spyOn(service, 'isMyTurn').and.callThrough();
        const spyHand = spyOn(service, 'isInHand').and.callThrough();
        const spyParam = spyOn(service, 'isValidParam').and.callThrough();
        const spyReserve = spyOn(service, 'isFullReserve').and.callThrough();
        service.validateCommand(letters);
        expect(spyTurn).toHaveBeenCalled();
        expect(spyHand).not.toHaveBeenCalled();
        expect(spyParam).not.toHaveBeenCalled();
        expect(spyReserve).not.toHaveBeenCalled();
    });
});
