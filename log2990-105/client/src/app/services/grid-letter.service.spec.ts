import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { GridLettersService } from './grid-letter.service';

describe('GridLettersService', () => {
    let service: GridLettersService;
    let ctxStub: CanvasRenderingContext2D;
    const CANVAS_WIDTH = 600;
    const CANVAS_HEIGHT = 600;
    const DEFAULT_NB_CASES = 16;
    const NUMBER_OF_COORD = 30;
    beforeEach(() => {
        service = TestBed.inject(GridLettersService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it(' drawGridCol should call the strokeText 16 times to draw black cols to separate the gameboard', () => {
        const strokeSpy = spyOn(ctxStub, 'stroke').and.callThrough();
        service.drawGridCol(ctxStub);

        expect(strokeSpy).toHaveBeenCalledTimes(DEFAULT_NB_CASES);
    });

    it(' drawGridLine should call the strokeText 16 times to draw black lignes to separate the gameboard', () => {
        const strokeSpy = spyOn(ctxStub, 'stroke').and.callThrough();
        service.drawGridLine(ctxStub);

        expect(strokeSpy).toHaveBeenCalledTimes(DEFAULT_NB_CASES);
    });

    it(' drawCoords should call the strokeText 32 times: 1 to 15 && a to idk', () => {
        const fillTextSpy = spyOn(ctxStub, 'fillText').and.callThrough();
        service.drawCoords(ctxStub);

        expect(fillTextSpy).toHaveBeenCalledTimes(NUMBER_OF_COORD);
    });
    it(' clearGrid should call clearRect ', () => {
        const clearRectSpy = spyOn(ctxStub, 'clearRect').and.callThrough();
        service.clearGrid(ctxStub);
        expect(clearRectSpy).toHaveBeenCalled();
    });
});
