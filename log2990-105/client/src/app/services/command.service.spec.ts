import { TestBed } from '@angular/core/testing';
import { CommandService } from './command.service';
import { AlertService } from '@app/services/alert.service';
import { LetterPlacingService } from '@app/services/letter-placing.service';
import { LetterExchangeService } from '@app/services/letter-exchange.service';
import { TextboxService } from '@app/services/textbox.service';
import { WebsocketService } from '@app/services/websocket.service';
import { GameInit } from '@app/classes/game-info';
import { Subject } from 'rxjs';

describe('CommandService', () => {
    let service: CommandService;
    let letterPlacingServiceSpy: jasmine.SpyObj<LetterPlacingService>;
    let letterExchangeServiceSpy: jasmine.SpyObj<LetterExchangeService>;
    let websocketServiceSpy: jasmine.SpyObj<LetterExchangeService>;

    const alertServiceSpy = jasmine.createSpyObj('AlertService', ['showAlert']);
    const textboxServiceSpy = jasmine.createSpyObj('TextBoxService', ['displayMessage']);

    const gameInit = new Subject<GameInit>();
    const gameTurn = new Subject<boolean>();
    const gameReserve = new Subject<string[]>();

    beforeEach(() => {
        letterPlacingServiceSpy = jasmine.createSpyObj('letterPlacingService', ['validateCommand']);
        letterExchangeServiceSpy = jasmine.createSpyObj('letterExchangeServiceSpy', ['validateCommand']);
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', ['placeLetters', 'exchangeLetters', 'skipTurn', 'sendMessage'], {
            init: gameInit.asObservable(),
            turn: gameTurn.asObservable(),
            reserve: gameReserve.asObservable(),
        });
        TestBed.configureTestingModule({
            providers: [
                { provide: AlertService, useValue: alertServiceSpy },
                { provide: LetterPlacingService, useValue: letterPlacingServiceSpy },
                { provide: LetterExchangeService, useValue: letterExchangeServiceSpy },
                { provide: TextboxService, useValue: textboxServiceSpy },
                { provide: WebsocketService, useValue: websocketServiceSpy },
            ],
        });
        service = TestBed.inject(CommandService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should allow the command', () => {
        service.parseCommand('!aide');
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();

        service.parseCommand('!échanger a');
        expect(letterExchangeServiceSpy.validateCommand).toHaveBeenCalledTimes(1);

        service.parseCommand('!debug');
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();

        service.debugActive = true;
        service.parseCommand('!debug');
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();

        service.parseCommand('!placer o15 s');
        expect(letterPlacingServiceSpy.validateCommand).toHaveBeenCalled();

        service.turn = false;
        service.parseCommand('!passer');
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();
    });

    it('should allow not the command', () => {
        service.parseCommand('!ass');
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();
    });
});
