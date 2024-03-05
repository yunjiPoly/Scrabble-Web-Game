/* eslint-disable @typescript-eslint/quotes */
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PanneauInfoComponent } from './panneau-info.component';
import { CommandService } from '@app/services/command.service';
import { TextboxService } from '@app/services/textbox.service';
import { WebsocketService } from '@app/services/websocket.service';
import { GameInit } from '@app/classes/game-info';
import { Subject } from 'rxjs';

describe('PanneauInfoComponent', () => {
    let component: PanneauInfoComponent;
    let fixture: ComponentFixture<PanneauInfoComponent>;
    const playerLetter = ['a', 'b', 's'];
    const opponentLetter = ['c', 't'];
    const player = 0;
    const opponent = 1;
    const reserveContainer = ['a', 'b', 'c'];
    const bon: [string, string][] = [
        ['a', 'b'],
        ['c', 'd'],
    ];
    const game = {
        self: 'John',
        opponent: 'Rab',
        bonuses: bon,
        reserve: reserveContainer,
        hand: playerLetter,
        gameMode: 1,
        turnState: true,
    };

    const gameInit = new Subject<GameInit>();
    const gameTime = new Subject<number>();
    const gameTurn = new Subject<boolean>();
    const gameReserve = new Subject<string[]>();
    const gameHands = new Subject<{ ownHand: string[]; opponentHand: string[] }>();
    const gameScores = new Subject<{ ownScore: number; opponentScore: number }>();
    const gameEnded = new Subject<string>();

    const websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [], {
        init: gameInit.asObservable(),
        time: gameTime.asObservable(),
        turn: gameTurn.asObservable(),
        reserve: gameReserve.asObservable(),
        hands: gameHands.asObservable(),
        scores: gameScores.asObservable(),
        endGame: gameEnded.asObservable(),
    });

    const textboxServiceSpy = jasmine.createSpyObj('TextboxService', ['displayMessage']);

    const commandServiceSpy = jasmine.createSpyObj('CommandService', ['parseCommand']);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PanneauInfoComponent],
            providers: [
                { provide: WebsocketService, useValue: websocketServiceSpy },
                { provide: TextboxService, useValue: textboxServiceSpy },
                { provide: CommandService, useValue: commandServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PanneauInfoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should return the current turn when calling getTurnState', () => {
        gameTurn.next(true);
        const turn = component.getTurnState();
        expect(typeof turn).toEqual('boolean');
    });

    it('should return the size of the reserve when calling getReserveMessage', () => {
        gameReserve.next(reserveContainer);
        const reserveLetter = component.getReserveMessage();
        expect(reserveLetter).toEqual(`Il reste 3 pièces dans la réserve`);
    });

    it('should return the size of the hand of the wanted player when getHandMessage is called', () => {
        gameHands.next({ ownHand: playerLetter, opponentHand: opponentLetter });
        const playerLettersCount = component.getHandMessage(player);
        const opponentLettersCount = component.getHandMessage(opponent);
        expect(playerLettersCount).toEqual(`3 pièces en main`);
        expect(opponentLettersCount).toEqual(`2 pièces en main`);
    });

    it('should the name of the wanted player when calling getName', () => {
        gameInit.next(game);
        const playerName = component.getName(player);
        expect(playerName).toEqual('John');
    });

    it('should return a congratulatory message with the name of the winner when calling getWinnerMessage', () => {
        gameEnded.next('John');
        const winnerMessage = component.getWinnerMessage();
        expect(winnerMessage).toEqual(`Félicitation à John!`);
    });

    it('should call displayMessage and parseCommand with !passer in parameter when skipTurn is called', () => {
        component.skipTurn();
        expect(textboxServiceSpy.displayMessage).toHaveBeenCalled();
        expect(commandServiceSpy.parseCommand).toHaveBeenCalledWith('!passer');
    });
});
