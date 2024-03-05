import { AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CHARCODE_SMALL_A } from '@app/classes/config';
import { MessageType } from '@app/classes/message';
import { DEFAULT_HEIGHT_ALL, DEFAULT_WIDTH_ALL, HAND_MAX_SIZE, MouseButton, NUMBER_MAX_COORD, PIXEL_SIZE_GAMEBOARD } from '@app/classes/play-area';
import { Vec2 } from '@app/classes/vec2';
import { BasicActionDialogComponent } from '@app/components/basic-action-dialog/basic-action-dialog.component';
import { CommandService } from '@app/services/command.service';
import { GridService } from '@app/services/grid.service';
import { TextboxService } from '@app/services/textbox.service';
import { WebsocketService } from '@app/services/websocket.service';

// DON'T REMOVE MY COMMENTS MIGHT USEFUL FOP ME LATER
@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['../../styles.scss', './play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit {
    @Input() playerHand: string[] = [];
    @ViewChild('gridCanvas', { static: false }) private gridCanvas!: ElementRef<HTMLCanvasElement>;

    mousePosition: Vec2 = { x: 0, y: 0 };
    initPosition: Vec2 = { x: 0, y: 0 };
    buttonPressed = '';
    temp: [string, string][] = [];
    isEventReceiver: boolean = false;

    // used as save a hand for command. At that moment, it's the lettres that is gonna write on the command
    commandHand: string[] = [];
    isPlacing: boolean = false;
    placedLetters: Map<string, string> = new Map<string, string>();
    turnState: boolean;
    private gameBoard: Map<string, string> = new Map<string, string>();
    private upperCaseButtonPressed: string;
    private canvasSize = { x: DEFAULT_WIDTH_ALL, y: DEFAULT_HEIGHT_ALL };
    constructor(
        public dialog: MatDialog,
        private readonly gridService: GridService,
        private commandService: CommandService,
        private eRef: ElementRef,
        private webSocketService: WebsocketService,
        private textboxService: TextboxService,
    ) {
        this.webSocketService.init.subscribe((initPayload) => {
            this.playerHand = initPayload.hand;
            if (initPayload.turnState !== undefined) this.turnState = initPayload.turnState;
        });
        this.webSocketService.hands.subscribe((hands) => {
            this.playerHand = hands.ownHand;
        });
        this.webSocketService.turn.subscribe((turn) => {
            this.turnState = turn;
        });
        this.webSocketService.board.subscribe((gameBoard) => {
            this.gameBoard = new Map(gameBoard);
        });
        this.gridService.mousePositionSubject.asObservable().subscribe((mousePos) => {
            this.mousePosition = mousePos;
        });
    }

    @HostListener('document:click', ['$event'])
    clickout(event: MouseEvent) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.isPlacing = false;
            this.removeAll();
            this.isEventReceiver = false;
        }
    }

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent) {
        this.buttonPressed = event.key;

        if (this.buttonPressed === 'Enter') {
            this.commandPlace();
        }
        if (this.buttonPressed === 'Escape') {
            this.removeAll();
        }
        if (this.buttonPressed === 'Backspace') {
            this.removeOne();
        }

        if (this.verifyIsInHand()) {
            if (!this.gameBoard.has(this.positionStr())) {
                this.placeLetter();
                this.isPlacing = true;
                this.gridService.isPlacing = true;
                this.manageUntouchableLetters();
            } else if (this.isPlacing) {
                this.manageUntouchableLetters();
                this.placeLetter();
                this.manageUntouchableLetters();
            }
        }
    }
    // adding to commandHand the letters already on the board for saving for call later on command
    // and jump that square until it's an empty square
    manageUntouchableLetters() {
        while (this.gameBoard.has(this.positionStr())) {
            this.commandHand.push(this.gameBoard.get(this.positionStr()) as string);
            this.jumpLetter();
        }
    }
    placeLetter() {
        // verify if inside the board coord
        if (this.mousePosition.x < NUMBER_MAX_COORD && this.mousePosition.y < NUMBER_MAX_COORD) {
            // this.positionStr output a1 for the 1st square

            // updating chevalet
            this.removePlayerHand();

            // updating content in board
            if (this.buttonPressed === '*') {
                this.buttonPressed = this.upperCaseButtonPressed;
            }
            this.commandHand.push(this.buttonPressed);

            this.placedLetters.set(this.positionStr(), this.buttonPressed);
            this.gameBoard.set(this.positionStr(), this.buttonPressed);

            // to the next position
            this.jumpLetter();

            // convert Map to Array
            // passing the board to service
            this.convertMapToStringArray();
            this.webSocketService.gameBoard.next(this.temp);
        }
    }

    removeAll() {
        while (this.commandHand.length > 0) {
            // back to the removing position
            this.stepBack();

            // exemple: you see on the board: eTEe
            // TE already existed on the board so not from hand
            // we need to remove TE from commandHand
            while (!this.placedLetters.has(this.positionStr())) {
                this.commandHand.splice(this.commandHand.length - 1, 1);
                this.stepBack();
            }
            // update gameBoard
            if (this.gameBoard.has(this.positionStr())) {
                this.gameBoard.delete(this.positionStr());
            }
            this.placedLetters.delete(this.positionStr());

            // passing the board to service
            this.convertMapToStringArray();
            this.webSocketService.gameBoard.next(this.temp);

            // update playerHand
            if (this.commandHand[0] === this.commandHand[0].toUpperCase()) this.playerHand.push('*');
            else this.playerHand.push(this.commandHand[this.commandHand.length - 1]);
            this.commandHand.splice(this.commandHand.length - 1, 1);
        }

        this.gridService.drawGrid();
        this.isPlacing = false;
        this.gridService.isPlacing = false;
    }
    jumpLetter() {
        if (this.gridService.arrowDirection) {
            // down
            this.mousePosition.y++;
            this.gridService.selectSquare(this.mousePosition.x, this.mousePosition.y);
        } else {
            // up
            this.mousePosition.x++;
            this.gridService.selectSquare(this.mousePosition.x, this.mousePosition.y);
        }
    }

    stepBack() {
        if (!this.gridService.arrowDirection) {
            this.mousePosition.x--;
            this.gridService.selectSquare(this.mousePosition.x, this.mousePosition.y);
        } else {
            this.mousePosition.y--;
            this.gridService.selectSquare(this.mousePosition.x, this.mousePosition.y);
        }
    }

    removecommandHand(): void {
        const index = this.commandHand.indexOf(this.playerHand[this.playerHand.length - 1]);
        if (index >= 0) this.commandHand.splice(index, 1);
    }

    // remove a specified letter from playerHand
    removePlayerHand(): void {
        const index = this.playerHand.indexOf(this.buttonPressed);
        if (index >= 0) {
            this.playerHand.splice(index, 1);
        }
    }

    // back to the removed position
    removeOne(): void {
        if (this.commandHand.length > 0) {
            // back to the removing position
            this.stepBack();

            // exemple: you see on the board: eTEe
            // TE already existed on the board so not from hand
            // we need to remove TE from commandHand
            while (!this.placedLetters.has(this.positionStr())) {
                this.commandHand.pop();
                this.stepBack();
            }
            if (this.placedLetters.has(this.positionStr())) {
                // updating content in board
                if (this.gameBoard.has(this.positionStr())) {
                    this.gameBoard.delete(this.positionStr());
                }

                this.placedLetters.delete(this.positionStr());
                // updating chevalet
                this.playerHand.push(this.commandHand[this.commandHand.length - 1]); // addHand
                this.removecommandHand();

                // convert Map to Array
                // passing the board to service
                this.convertMapToStringArray();
                this.webSocketService.gameBoard.next(this.temp);
            }
        }
        if (this.playerHand.length === HAND_MAX_SIZE) {
            this.isPlacing = false;
            this.gridService.isPlacing = false;
        }
    }

    isUpperCase(): boolean {
        this.upperCaseButtonPressed = this.buttonPressed.toUpperCase();
        return this.buttonPressed === this.upperCaseButtonPressed;
    }
    redirectTo(): void {
        this.webSocketService.disconnect();
        window.location.reload();
    }

    openDialog(): void {
        const dialogRef = this.dialog.open(BasicActionDialogComponent, {
            data: { title: 'Abandonner la partie?', action: 'Abandonner', cancel: 'Annuler' },
        });
        dialogRef.afterClosed().subscribe((resign) => {
            if (resign) this.redirectTo();
        });
    }

    verifyIsInHand(): boolean {
        if (this.isUpperCase()) {
            // removes option of typing special char
            if (this.upperCaseButtonPressed === '') return false;
            this.buttonPressed = '*';
        }
        for (const it of this.playerHand) if (it === this.buttonPressed) return true;
        return false;
    }

    commandPlace() {
        // show commandHand
        const replaceInidHand = [...this.commandHand];
        // remove from the board pour placer des lettres
        this.removeAll();
        const direction = this.gridService.arrowDirection ? 'v' : 'h';
        // convert a string : 1 -> a, 0 -> 1
        const coords = String.fromCharCode(this.initPosition.y + CHARCODE_SMALL_A) + String(this.initPosition.x + 1);

        const command = `!placer ${coords}${direction} ${replaceInidHand.join('')}`;
        this.commandService.parseCommand(command);
        this.textboxService.displayMessage(MessageType.Own, command);
        this.gridService.isPlacing = false;
    }

    mouseHitDetect(event: MouseEvent) {
        if (!this.isPlacing && this.turnState && event.button === MouseButton.Left) {
            this.mousePosition = { x: event.offsetX, y: event.offsetY };

            // 0 et 0
            // convert pixel into x and y coord
            this.mousePosition.x = Math.floor(this.mousePosition.x / (PIXEL_SIZE_GAMEBOARD / NUMBER_MAX_COORD)) - 1; // 600-40 / 15
            this.mousePosition.y = Math.floor(this.mousePosition.y / (PIXEL_SIZE_GAMEBOARD / NUMBER_MAX_COORD)) - 1;
            if (!this.gameBoard.has(this.positionStr())) {
                this.gridService.mousePositionSubject.next({
                    x: this.mousePosition.x,
                    y: this.mousePosition.y,
                });
                if (this.initPosition.x === this.mousePosition.x && this.initPosition.y === this.mousePosition.y)
                    this.gridService.arrowDirection = !this.gridService.arrowDirection;
                else this.gridService.arrowDirection = false;

                // 0 to 14
                // and 0 to 14
                this.gridService.selectSquare(this.mousePosition.x, this.mousePosition.y);

                // deep copy it so it can't get modified by stepback()
                this.initPosition = { ...this.mousePosition }; // save for command placer for initial positions
            }
        }
    }

    removeAccents(): string {
        // const str = 'ÁÉÍÓÚáéíóúâêîôûàèìòùÇç/.,~!@#$%&_-12345';
        return this.buttonPressed.normalize('NFD').replace(/([\u0300-\u036f]|[^0-9a-zA-Z\s])/g, '');
    }

    // converts x:0,y:1 to a1
    positionStr(): string {
        // y et x start at 0 to 14
        let temp = String.fromCharCode(this.mousePosition.y + CHARCODE_SMALL_A); // 1 -> a
        temp += String(this.mousePosition.x + 1);
        return temp;
    }

    convertMapToStringArray() {
        // convert Map to Array
        this.temp = [];
        let i = 0;
        for (const it of this.gameBoard) {
            this.temp[i] = [it[0], it[1]];
            i++;
        }
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }
    ngAfterViewInit(): void {
        this.gridService.gridContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.handContext = this.gridCanvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;

        this.gridService.drawGrid();
        this.gridCanvas.nativeElement.focus();
    }
    maximize(): void {
        this.gridService.maxGrid();
    }
    minimize(): void {
        this.gridService.minGrid();
    }
}
