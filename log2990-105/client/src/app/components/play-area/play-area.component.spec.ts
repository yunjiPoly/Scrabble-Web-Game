import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { GameInit } from '@app/classes/game-info';
import { MouseButton } from '@app/classes/play-area';
import { Vec2 } from '@app/classes/vec2';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { GridService } from '@app/services/grid.service';
import { WebsocketService } from '@app/services/websocket.service';
import { Subject } from 'rxjs';

const MOUSE_POSITION_PIXEL = 300;
const MOUSE_POSITION = 3;
describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let mouseEvent: MouseEvent;

    const gameInit = new Subject<GameInit>();
    const gameTurn = new Subject<boolean>();
    const gameReserve = new Subject<string[]>();
    const gameBoardSubject = new Subject<[string, string][]>();
    const gameHands = new Subject<{ ownHand: string[]; opponentHand: string[] }>();
    const mousePos = new Subject<Vec2>();

    const websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [], {
        init: gameInit.asObservable(),
        turn: gameTurn.asObservable(),
        reserve: gameReserve.asObservable(),
        board: gameBoardSubject.asObservable(),
        hands: gameHands.asObservable(),
        gameBoard: gameBoardSubject,
    });
    const gridServiceSpy = jasmine.createSpyObj('GridService', ['clearGrid', 'drawGrid', 'maxGrid', 'selectSquare'], {
        mousePositionSubject: mousePos,
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatDialogModule],
            declarations: [PlayAreaComponent],
            providers: [
                { provide: WebsocketService, useValue: websocketServiceSpy },
                { provide: GridService, useValue: gridServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    /* eslint-disable @typescript-eslint/no-magic-numbers -- Add reason */
    it('mouseHitDetect should not change the mouse position if it is not a left click', () => {
        const expectedPosition: Vec2 = { x: 0, y: 0 };
        mouseEvent = {
            offsetX: expectedPosition.x + 10,
            offsetY: expectedPosition.y + 10,
            button: 1,
        } as MouseEvent;
        component.mouseHitDetect(mouseEvent);
        expect(component.mousePosition).not.toEqual({ x: mouseEvent.offsetX, y: mouseEvent.offsetY });
        expect(component.mousePosition).toEqual(expectedPosition);
    });

    it('buttonDetect should modify the buttonPressed variable', () => {
        const expectedKey = 'a';
        const buttonEvent = {
            key: expectedKey,
        } as KeyboardEvent;
        component.buttonDetect(buttonEvent);
        expect(component.buttonPressed).toEqual(expectedKey);
    });
    it('mouseHitDetect should make mousePosition = initPosition', () => {
        component.isPlacing = false;
        component.turnState = true;
        mouseEvent = {
            offsetX: MOUSE_POSITION_PIXEL,
            offsetY: MOUSE_POSITION_PIXEL,
            button: MouseButton.Left,
            // eslint-disable-next-line @typescript-eslint/no-empty-function -- We need to preventDefault
        } as MouseEvent;
        component.mouseHitDetect(mouseEvent);
        expect(component.initPosition).toEqual(component.mousePosition);
    });

    it('removeOne should add a letter to hand', () => {
        component.mousePosition.x = 1;
        component.mousePosition.y = 1;
        component.turnState = true;
        component.buttonPressed = 'a';
        component.isPlacing = true;
        component.commandHand = ['a', 'b', 'c'];
        component.placedLetters = new Map<string, string>();
        component.placedLetters.set('a1', 'a');
        component.placedLetters.set('a2', 'a');
        component.placedLetters.set('b1', 'a');
        component.placedLetters.set('b2', 'a');

        const removecommandHandSpy = spyOn(component, 'removecommandHand').and.callThrough();
        component.removeOne();
        expect(removecommandHandSpy).toHaveBeenCalled();
    });

    it('placeLetter should select the next empty case after placed a letter on board ', () => {
        component.mousePosition.x = MOUSE_POSITION;
        component.mousePosition.y = MOUSE_POSITION;
        component.buttonPressed = 'a';
        component.turnState = true;
        const nextSpy = spyOn(websocketServiceSpy.gameBoard, 'next').and.callThrough();
        const jumpLetterSpy = spyOn(component, 'jumpLetter').and.callThrough();
        component.placeLetter();
        expect(jumpLetterSpy).toHaveBeenCalled();
        expect(nextSpy).toHaveBeenCalled();
    });

    it('commandPlace should end placing action', () => {
        component.commandPlace();
        expect(component.isPlacing).toBeFalse();
    });
});
