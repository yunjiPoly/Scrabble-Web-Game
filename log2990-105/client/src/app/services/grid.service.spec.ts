/* eslint-disable dot-notation */
// On disable quand on essaie d'acceder un attribut prive de notre service
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GameInit } from '@app/classes/game-info';
import { Vec2 } from '@app/classes/vec2';
import { GridService } from '@app/services/grid.service';
import { LetterExchangeService } from '@app/services/letter-exchange.service';
import { WebsocketService } from '@app/services/websocket.service';
import { Subject } from 'rxjs';
import { GridLettersService } from './grid-letter.service';

describe('GridService', () => {
    let service: GridService;
    let websocketServiceSpy: jasmine.SpyObj<LetterExchangeService>;
    let ctxStub: CanvasRenderingContext2D;
    let gridLetterServiceSpy: jasmine.SpyObj<GridLettersService>;
    const pointOnMap: Map<string, string> = new Map();
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 600;
    const DEFAULT_NB_CASES = 16;

    const gameInit = new Subject<GameInit>();
    const gameBoard = new Subject<[string, string][]>();
    const gameTurn = new Subject<boolean>();
    const gameReserve = new Subject<string[]>();
    const gameHands = new Subject<{ ownHand: string[]; opponentHand: string[] }>();

    beforeEach(() => {
        websocketServiceSpy = jasmine.createSpyObj('WebsocketService', [''], {
            init: gameInit.asObservable(),
            board: gameBoard.asObservable(),
            turn: gameTurn.asObservable(),
            reserve: gameReserve.asObservable(),
            hands: gameHands.asObservable(),
        });
        gridLetterServiceSpy = jasmine.createSpyObj('GridLettersService', ['drawCoords', 'drawGridCol', 'drawGridLine', 'clearGrid']);

        TestBed.configureTestingModule({
            providers: [
                { provide: WebsocketService, useValue: websocketServiceSpy },
                { provide: GridLettersService, useValue: gridLetterServiceSpy },
            ],
        });
        service = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
        service.handContext = ctxStub;
        pointOnMap.set('o11', 'a');
        pointOnMap.set('b11', 'b');
        pointOnMap.set('a2', 'c');
        pointOnMap.set('e1', 'e');
        service['scaleCounter'] = 1;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' width should return the width of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_WIDTH);
    });

    it(' height should return the height of the grid canvas', () => {
        expect(service.width).toEqual(CANVAS_HEIGHT);
    });

    it(' drawLetter should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();

        service.drawLetter('a', 1, 1);

        expect(fillTextSpy).toHaveBeenCalled();
    });
    it(' drawLetter should not call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLetter('a', DEFAULT_NB_CASES, DEFAULT_NB_CASES);

        expect(fillTextSpy).toHaveBeenCalledTimes(0);
    });
    it(' drawBonus should drawNONE', () => {
        const drawNONESpy = spyOn(service, 'drawNONE').and.callThrough();
        service.drawBonus(0, 1);

        expect(drawNONESpy).toHaveBeenCalled();
    });
    it(' drawGridLetter should call drawGridLetters', () => {
        const drawGridLettersSpy = spyOn(service, 'drawLetter').and.callThrough();

        service.drawGridLetters(pointOnMap);

        expect(drawGridLettersSpy).toHaveBeenCalled();
    });

    it(' drawGrid should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid();
        imageData = service.gridContext.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });
    it('should increment scaleCounter when maxGrid', () => {
        service.maxGrid();
        const scale = service['scaleCounter'];
        expect(scale).toBeGreaterThan(1);
    });
    it('should decrement scaleCounter when minGrid', () => {
        service.minGrid();
        const scale = service['scaleCounter'];
        expect(scale).toBeLessThan(1);
    });
    it('should call calculateArrow when selectSquare', () => {
        const mousePosition: Vec2 = { x: 1, y: 1 };
        const drawArrowSpy = spyOn(service, 'calculateArrow').and.callThrough();
        service.selectSquare(mousePosition.x, mousePosition.y);
        service.selectSquare(mousePosition.x + 1, mousePosition.y);
        service.selectSquare(mousePosition.x + 1, mousePosition.y + 1);
        service.arrowDirection = true;
        service.selectSquare(mousePosition.x, mousePosition.y);

        expect(drawArrowSpy).toHaveBeenCalled();
    });
    it('should call fillText when drawLx2', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLx2();
        expect(fillTextSpy).toHaveBeenCalled();
    });
    it('should call fillText when drawMx3', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawMx3();
        expect(fillTextSpy).toHaveBeenCalled();
    });
    it('should call fillText when drawMx2', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawMx2();
        expect(fillTextSpy).toHaveBeenCalled();
    });
    it('should call fillText when drawLx3', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.callThrough();
        service.drawLx3();
        expect(fillTextSpy).toHaveBeenCalled();
    });
});
