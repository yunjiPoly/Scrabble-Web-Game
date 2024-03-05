import { Injectable } from '@angular/core';
import { CHARCODE_SMALL_A } from '@app/classes/config';
import {
    ARROW_POSITION1,
    ARROW_POSITION2,
    ARROW_POSITION3,
    ARROW_POSITION5,
    DEFAULT_HEIGHT,
    DEFAULT_NB_CASES,
    DEFAULT_WIDTH,
    SCALE_MAX,
    SCALE_MIN,
    STROKE_RANGE,
    TEXT_DEFAULT_PX,
} from '@app/classes/grid';
import { Vec2 } from '@app/classes/vec2';
import { WebsocketService } from '@app/services/websocket.service';
import { Subject } from 'rxjs';
import { GridLettersService } from './grid-letter.service';
@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;
    handContext: CanvasRenderingContext2D;
    arrowDirection: boolean = false; // false = horizontal; true = vertival
    mousePosition: Vec2 = { x: 0, y: 0 };
    mousePositionSubject = new Subject<Vec2>();
    isPlacing: boolean = false;
    // drawarrow positions container
    arrowPosition: Vec2[] = [];
    turnState: boolean;
    private counter: number = 0;
    private tuileSize = DEFAULT_WIDTH / DEFAULT_NB_CASES;
    private canvasSize: Vec2 = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
    private startNumberPos: number = DEFAULT_WIDTH / DEFAULT_NB_CASES;
    private startLetterPos: number = DEFAULT_HEIGHT / DEFAULT_NB_CASES;
    private tuilePosX = DEFAULT_WIDTH / DEFAULT_NB_CASES;
    private tuilePosY = DEFAULT_HEIGHT / DEFAULT_NB_CASES;
    // private scale: number = DEFAULT_SCALE;
    private scaleCounter: number = 1;
    private size: string = '20';

    private bonuses = new Map<string, string>();
    private letters = new Map<string, string>();
    constructor(private websocketService: WebsocketService, private readonly gridLettersService: GridLettersService) {
        this.websocketService.turn.subscribe((turn) => {
            this.turnState = turn;
            this.drawGrid();
        });
        this.mousePositionSubject.asObservable().subscribe((mousePos) => {
            this.mousePosition = mousePos;
        });
        this.websocketService.init.subscribe((init) => {
            this.bonuses = new Map<string, string>(init.bonuses);
        });
        this.websocketService.board.subscribe((letters) => {
            this.letters = new Map<string, string>(letters);
            if (this.counter > 0) {
                this.drawGrid();
                this.selectSquare(this.mousePosition.x, this.mousePosition.y);
            }
        });
    }

    calculateArrow(xPosition: number, yPosition: number, posX: number, posY: number) {
        this.arrowPosition = [];

        if (this.arrowDirection) {
            // draw down arrow positions container
            this.arrowPosition.push({ x: ARROW_POSITION1 + xPosition, y: ARROW_POSITION1 + yPosition + this.tuileSize });
            this.arrowPosition.push({ x: ARROW_POSITION3 + xPosition, y: ARROW_POSITION1 + yPosition + this.tuileSize });
            this.arrowPosition.push({ x: ARROW_POSITION2 + xPosition, y: ARROW_POSITION2 + yPosition + this.tuileSize });
            this.arrowPosition.push({ x: ARROW_POSITION2 + xPosition, y: yPosition + this.tuileSize });
            this.drawArrow();
        }

        if (!this.arrowDirection && posY < DEFAULT_NB_CASES - 1 && posX < DEFAULT_NB_CASES - 2) {
            // draw left arrow positions container
            this.arrowPosition.push({ x: ARROW_POSITION5 + xPosition + this.tuileSize, y: ARROW_POSITION1 + yPosition });
            this.arrowPosition.push({ x: ARROW_POSITION5 + xPosition + this.tuileSize, y: ARROW_POSITION3 + yPosition });
            this.arrowPosition.push({ x: ARROW_POSITION2 + xPosition + this.tuileSize, y: ARROW_POSITION2 + yPosition });
            this.arrowPosition.push({ x: xPosition + this.tuileSize, y: ARROW_POSITION2 + yPosition });
            this.drawArrow();
        }
    }
    drawArrow() {
        this.gridContext.lineWidth = 5;
        this.gridContext.beginPath();
        this.gridContext.moveTo(this.arrowPosition[0].x, this.arrowPosition[0].y);
        this.gridContext.lineTo(this.arrowPosition[1].x, this.arrowPosition[1].y);
        this.gridContext.lineTo(this.arrowPosition[2].x, this.arrowPosition[2].y);
        this.gridContext.closePath();
        this.gridContext.stroke();
        this.gridContext.moveTo(this.arrowPosition[2].x, this.arrowPosition[2].y);
        this.gridContext.lineTo(this.arrowPosition[3].x, this.arrowPosition[3].y);
        this.gridContext.stroke();
    }
    selectSquare(posX: number, posY: number): void {
        if (posY < DEFAULT_NB_CASES - 1 && posX < DEFAULT_NB_CASES - 1 && posX >= 0 && posY >= 0) {
            this.mousePositionSubject.next({ x: posX, y: posY });
            this.drawGrid();
            let tuileX = DEFAULT_WIDTH / DEFAULT_NB_CASES;
            let tuileY = DEFAULT_HEIGHT / DEFAULT_NB_CASES;

            // Deplacer sa position en X
            for (let i = 0; i < posX; i++) {
                tuileX += this.tuileSize;
            }

            // Deplacer sa position en Y
            for (let y = 0; y < posY; y++) {
                tuileY += this.tuileSize;
            }
            // Background de ce tuile
            this.gridContext.lineWidth = 7;

            this.gridContext.strokeStyle = 'purple';
            this.gridContext.strokeRect(tuileX + 2, tuileY + 2, this.tuileSize - STROKE_RANGE, this.tuileSize - STROKE_RANGE);
            this.calculateArrow(tuileX, tuileY, posX, posY);
        }
        // return this.arrowDirection;
    }
    /**
     * @description Wrapper function to draw the entirety of the board
     */
    drawGrid() {
        this.gridLettersService.clearGrid(this.gridContext);
        this.gridContext.lineWidth = 1;
        this.gridContext.fillStyle = 'black';
        this.gridContext.strokeStyle = 'black';
        if (this.turnState) {
            this.gridContext.fillStyle = 'lightgreen';
            this.gridContext.fillRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        }

        // tracer le border
        this.drawBorder();
        // Afficher les coordonnes
        this.gridLettersService.drawCoords(this.gridContext);
        // Contour noir pour la beaute
        this.gridLettersService.drawGridCol(this.gridContext);
        this.gridLettersService.drawGridLine(this.gridContext);

        // Dessiner les grilles(rectangles)
        for (let x = 0; x < DEFAULT_NB_CASES - 1; x++) {
            for (let y = 0; y < DEFAULT_NB_CASES - 1; y++) {
                this.drawBonus(x, y);
                this.tuilePosX += this.tuileSize;
            }
            this.tuilePosY += this.tuileSize;
            this.tuilePosX = DEFAULT_HEIGHT / DEFAULT_NB_CASES;
        }
        this.tuilePosX = DEFAULT_WIDTH / DEFAULT_NB_CASES;
        this.tuilePosY = DEFAULT_HEIGHT / DEFAULT_NB_CASES;

        this.drawGridLetters(this.letters);
        this.counter++;
    }
    /**
     * @description Function to draw the borders of the board
     */
    drawBorder() {
        this.gridContext.beginPath();
        this.gridContext.moveTo(this.startNumberPos, this.startLetterPos);
        this.gridContext.lineTo(this.startNumberPos, DEFAULT_WIDTH);
        this.gridContext.stroke();
        this.gridContext.beginPath();
        this.gridContext.moveTo(this.startNumberPos, this.startLetterPos);
        this.gridContext.lineTo(DEFAULT_HEIGHT, this.startLetterPos);
        this.gridContext.stroke();
    }
    /**
     * @description Function to make the borders more visible
     */
    betterBorder() {
        this.gridContext.fillStyle = 'black';
        this.gridContext.fillRect(this.tuilePosX, this.tuilePosY, this.tuileSize, this.tuileSize);
    }
    /**
     * @description Function to draw the bonus Motx3 on the board
     */
    drawMx3() {
        this.betterBorder();

        this.gridContext.fillStyle = 'rgb(220, 73, 77)';
        this.gridContext.fillRect(this.tuilePosX + 2, this.tuilePosY + 2, this.tuileSize - STROKE_RANGE, this.tuileSize - STROKE_RANGE);

        this.gridContext.fillStyle = 'white';
        this.gridContext.font = '7px serif';
        this.gridContext.fillText('MOT X3', this.tuilePosX + 2, this.tuilePosY + DEFAULT_HEIGHT / DEFAULT_NB_CASES / 2);
    }
    /**
     * @description Function to draw the bonus Motx2 on the board
     */
    drawMx2() {
        this.betterBorder();

        this.gridContext.fillStyle = 'rgb(228, 180, 187)';
        this.gridContext.fillRect(this.tuilePosX + 2, this.tuilePosY + 2, this.tuileSize - STROKE_RANGE, this.tuileSize - STROKE_RANGE);

        this.gridContext.fillStyle = 'black';
        this.gridContext.font = '9px sans-serif';
        this.gridContext.fillText('Motx2', this.tuilePosX + 2, this.tuilePosY + DEFAULT_HEIGHT / DEFAULT_NB_CASES / 2);
    }
    /**
     * @description Function to draw the bonus Lettrex2 on the board
     */
    drawLx2() {
        this.betterBorder();

        this.gridContext.fillStyle = 'rgb(159, 211, 215)';
        this.gridContext.fillRect(this.tuilePosX + 2, this.tuilePosY + 2, this.tuileSize - STROKE_RANGE, this.tuileSize - STROKE_RANGE);

        this.gridContext.fillStyle = 'black';
        this.gridContext.font = '9px sans-serif';
        this.gridContext.fillText('Let X2', this.tuilePosX + 3, this.tuilePosY + DEFAULT_HEIGHT / DEFAULT_NB_CASES / 2);
    }
    /**
     * @description Function to draw the bonus Lettrex3 on the board
     */
    drawLx3() {
        this.betterBorder();

        this.gridContext.fillStyle = 'blue';
        this.gridContext.fillRect(this.tuilePosX + 2, this.tuilePosY + 2, this.tuileSize - STROKE_RANGE, this.tuileSize - STROKE_RANGE);
        this.gridContext.fillStyle = 'white';
        this.gridContext.font = '9px serif';
        this.gridContext.fillText('Let  X3', this.tuilePosX + 2, this.tuilePosY + DEFAULT_HEIGHT / DEFAULT_NB_CASES / 2);
    }
    /**
     * @description Function that fills the slots that doesn't contain a bonus
     */
    drawNONE() {
        this.gridContext.fillStyle = 'rgb(255, 221, 189)';
        this.gridContext.fillRect(this.tuilePosX + 2, this.tuilePosY + 2, this.tuileSize - STROKE_RANGE, this.tuileSize - STROKE_RANGE);
    }
    /**
     * @description Wrapper function to fill the slots of the board
     * @param x the X position in the gameBoard container
     * @param y the Y position in the gameBoard container
     * @returns nothing just in case the indexes are out of bound
     */
    drawBonus(x: number, y: number) {
        const bonus = this.bonuses.get(String.fromCharCode(CHARCODE_SMALL_A + x) + String(y + 1));
        switch (bonus) {
            case 'Lx2': {
                this.drawLx2();
                break;
            }
            case 'Lx3': {
                this.drawLx3();
                break;
            }
            case 'Wx2': {
                this.drawMx2();
                break;
            }
            case 'Wx3': {
                this.drawMx3();
                break;
            }
            default: {
                this.drawNONE();
                break;
            }
        }
    }
    /**
     * @description Function to draw a letter on the board
     * @param letter the letter to be draw (i.e.: 'b','a')
     * @param posX the X position in the gameBoard container
     * @param posY the Y position in the gameBoard container
     */
    drawLetter(letter: string, posX: number, posY: number) {
        letter = letter.toLowerCase();

        if (posY < DEFAULT_NB_CASES - 1 && posX < DEFAULT_NB_CASES - 1 && posX >= 0 && posY >= 0) {
            let tuileX = DEFAULT_WIDTH / DEFAULT_NB_CASES;
            let tuileY = DEFAULT_HEIGHT / DEFAULT_NB_CASES;

            // Deplacer sa position en X
            for (let i = 0; i < posX; i++) {
                tuileX += this.tuileSize;
            }

            // Deplacer sa position en Y
            for (let y = 0; y < posY; y++) {
                tuileY += this.tuileSize;
            }

            // Background de ce tuile
            this.gridContext.fillStyle = 'white';
            this.gridContext.fillRect(tuileX + 2, tuileY + 2, this.tuileSize - STROKE_RANGE, this.tuileSize - STROKE_RANGE);

            // Ecrire la lettre sur le tuile
            this.gridContext.fillStyle = 'black';
            // this.gridContext.font = '40px serif';
            this.size = this.size + 'px' + ' serif';
            this.gridContext.font = this.size;
            this.gridContext.fillText(letter, tuileX + STROKE_RANGE * 3, tuileY + DEFAULT_HEIGHT / DEFAULT_NB_CASES / 2 + 2 * STROKE_RANGE);
        }
    }
    /**
     * @description Function the converts the string map to coordinates
     * @param positions map that contains the data to be converted
     * b1 --> y = 2, x= 0
     * b12  -> y = 2, x= 11
     */
    drawGridLetters(positions: Map<string, string>) {
        let postionX: string;
        let letter;
        for (const it of positions) {
            letter = it[0].charAt(0);
            const positionY = letter.charCodeAt(0) - CHARCODE_SMALL_A;
            postionX = it[0].replace(/[^0-9]/g, '');
            const positionX = parseInt(postionX, 10);
            this.drawLetter(it[1], positionX - 1, positionY);
        }
    }
    /**
     * @description Function that makes the grid bigger
     */
    maxGrid() {
        this.gridLettersService.clearGrid(this.gridContext);
        if (this.scaleCounter < SCALE_MAX) {
            this.scaleCounter += 0.1;
            this.size = String(this.scaleCounter * TEXT_DEFAULT_PX);
        }
        this.drawGrid();
    }
    /**
     * @description Function that makes the grid smaller
     */
    minGrid() {
        this.gridLettersService.clearGrid(this.gridContext);
        if (this.scaleCounter > SCALE_MIN) {
            this.scaleCounter -= 0.1;
            this.size = String(this.scaleCounter * TEXT_DEFAULT_PX);
        }
        this.drawGrid();
    }

    get width(): number {
        return this.canvasSize.x;
    }
    get height(): number {
        return this.canvasSize.y;
    }
}
