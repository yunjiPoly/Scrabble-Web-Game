import { Injectable } from '@angular/core';
import { CHARCODE_SMALL_A } from '@app/classes/config';
import { DEFAULT_HEIGHT, DEFAULT_NB_CASES, DEFAULT_WIDTH } from '@app/classes/grid';
@Injectable({
    providedIn: 'root',
})
export class GridLettersService {
    private startNumberPos: number = DEFAULT_WIDTH / DEFAULT_NB_CASES;
    private startLetterPos: number = DEFAULT_HEIGHT / DEFAULT_NB_CASES;

    /**
     * @description Function to draw the columns for the board
     */
    drawGridCol(gridContext: CanvasRenderingContext2D) {
        const START_GRID_POS = DEFAULT_WIDTH / DEFAULT_NB_CASES;
        for (let i = 1; i < DEFAULT_NB_CASES + 1; i++) {
            gridContext.lineWidth = 3;
            gridContext.beginPath();
            gridContext.moveTo(START_GRID_POS * i, START_GRID_POS);
            gridContext.lineTo(START_GRID_POS * i, DEFAULT_HEIGHT);
            gridContext.closePath();
            gridContext.stroke();
        }
    }
    /**
     * @description Function to draw the lines for the board
     */
    drawGridLine(gridContext: CanvasRenderingContext2D) {
        for (let i = 1; i < DEFAULT_NB_CASES + 1; i++) {
            const START_GRID_POS = DEFAULT_WIDTH / DEFAULT_NB_CASES;
            gridContext.lineWidth = 3;
            gridContext.beginPath();
            gridContext.moveTo(START_GRID_POS, START_GRID_POS * i);
            gridContext.lineTo(DEFAULT_HEIGHT, START_GRID_POS * i);
            gridContext.closePath();
            gridContext.stroke();
        }
    }

    /**
     * @description Function that draw the coordinates listed on the side
     */
    drawCoords(gridContext: CanvasRenderingContext2D) {
        gridContext.fillStyle = 'black';

        for (let i = 1; i < DEFAULT_NB_CASES; i++) {
            gridContext.font = '17px serif';

            gridContext.fillText(i.toString(), this.startNumberPos + DEFAULT_WIDTH / (2 * DEFAULT_NB_CASES), DEFAULT_HEIGHT / (DEFAULT_NB_CASES * 2));
            this.startNumberPos += DEFAULT_WIDTH / DEFAULT_NB_CASES;
        }
        for (let i = 1; i < DEFAULT_NB_CASES; i++) {
            const alphabet = String.fromCharCode(CHARCODE_SMALL_A - 1 + i);
            gridContext.font = '17px serif';

            gridContext.fillText(alphabet, DEFAULT_WIDTH / (DEFAULT_NB_CASES * 2), this.startLetterPos + DEFAULT_WIDTH / (2 * DEFAULT_NB_CASES));

            this.startLetterPos += DEFAULT_WIDTH / DEFAULT_NB_CASES;
        }
        // reset les pos pour si jamais reappeler cette methode
        this.startLetterPos = DEFAULT_HEIGHT / DEFAULT_NB_CASES;
        this.startNumberPos = DEFAULT_WIDTH / DEFAULT_NB_CASES;
    }

    /**
     * @description Function to wipe the board (nothing is left behind)
     */
    clearGrid(gridContext: CanvasRenderingContext2D) {
        gridContext.clearRect(0, 0, DEFAULT_WIDTH * 2, DEFAULT_HEIGHT * 2);
    }
}
