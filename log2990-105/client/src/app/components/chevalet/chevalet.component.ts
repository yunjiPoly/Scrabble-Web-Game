import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { MessageType } from '@app/classes/message';
import { CommandService } from '@app/services/command.service';
import { GridService } from '@app/services/grid.service';
import { TextboxService } from '@app/services/textbox.service';
const HAND_SIZE = 7;
const MINUS1 = -1;
@Component({
    selector: 'app-chevalet',
    templateUrl: './chevalet.component.html',
    styleUrls: ['./chevalet.component.scss'],
})
export class ChevaletComponent {
    @Input() playerHand: string[];
    currentHand: string[] = [];
    isContainSelectedCard = false;
    isManipulating: boolean = false;
    isClicked: boolean[] = [false, false, false, false, false, false, false];
    activeLetter: boolean[] = [false, false, false, false, false, false, false];
    isYourTurn: boolean = true;
    isEventReceiver: boolean = false;
    constructor(
        private eRef: ElementRef,
        private commandService: CommandService,
        private textboxService: TextboxService,
        private gridService: GridService,
    ) {
        this.addWindowListener();
    }
    @HostListener('document:click', ['$event'])
    clickout(event: MouseEvent) {
        if (!this.eRef.nativeElement.contains(event.target)) {
            this.resetExchange();
            this.resetManipulation();
            this.isEventReceiver = false;
        }
    }
    @HostListener('wheel', ['$event'])
    onMouseWheel(event: WheelEvent) {
        // if (!event.target) return;
        if (!this.activeLetter[Number((event.target as HTMLElement).id.slice(MINUS1))]) return;
        if (event.deltaY > 0) {
            const next = this.moveRight(Number((event.target as HTMLElement).id.slice(MINUS1)));
            this.updateActiveLetter(next);
        } else if (event.deltaY < 0) {
            const next = this.moveLeft(Number((event.target as HTMLElement).id.slice(MINUS1)));
            this.updateActiveLetter(next);
        }
    }
    @HostListener('keydown', ['$event'])
    moveLetter(event: KeyboardEvent) {
        if (event.key === 'ArrowRight' && this.activeLetter[Number((event.target as HTMLElement).id.slice(MINUS1))]) {
            const next = this.moveRight(Number((event.target as HTMLElement).id.slice(MINUS1)));
            this.updateActiveLetter(next);
        } else if (event.key === 'ArrowLeft' && this.activeLetter[Number((event.target as HTMLElement).id.slice(MINUS1))]) {
            const next = this.moveLeft(Number((event.target as HTMLElement).id.slice(MINUS1)));
            this.updateActiveLetter(next);
        }
    }
    exchange() {
        const command = `!échanger ${this.currentHand.join('')}`;
        this.textboxService.displayMessage(MessageType.Own, command);
        this.commandService.parseCommand(command);
        this.resetExchange();
    }

    resetExchange() {
        for (let i = 0; i < this.isClicked.length; i++) {
            this.isClicked[i] = false;
            this.currentHand = [];
            this.isContainSelectedCard = false;
        }
    }
    resetManipulation() {
        for (let i = 0; i < this.activeLetter.length; i++) {
            this.activeLetter[i] = false;
        }
    }
    onRightClick(event: MouseEvent, letter: string, index: number) {
        this.isManipulating = false;
        for (const isActiveLetter of this.activeLetter) {
            if (!isActiveLetter) continue;
            this.isManipulating = true;
        }

        if (!this.isManipulating && !this.gridService.isPlacing) {
            event.preventDefault();
            this.isClicked[index] = !this.isClicked[index];
            if (this.isClicked[index]) {
                this.currentHand.push(letter);
            } else {
                this.currentHand = this.letterRemove(this.currentHand, letter);
            }
            this.verifySelected();
        }
    }
    verifySelected() {
        this.isContainSelectedCard = this.currentHand.length !== 0;
    }

    letterRemove(currentHand: string[], letter: string): string[] {
        const index = currentHand.indexOf(letter);
        if (index > MINUS1) {
            currentHand.splice(index, 1);
        }
        return currentHand;
    }

    addWindowListener() {
        window.addEventListener('keydown', (event) => {
            let isPresent = false;
            if (!this.isEventReceiver) return;
            if (this.activeLetter.includes(true) && event.key === this.playerHand[this.activeLetter.indexOf(true)]) {
                this.updateActiveLetter(this.findNextLetterIndex(this.activeLetter.indexOf(true)));
                isPresent = true;
            } else {
                for (let i = 0; i < this.playerHand.length; i++) {
                    if (event.key === this.playerHand[i]) {
                        isPresent = true;
                        this.updateActiveLetter(i);
                        break;
                    }
                }
            }
            if (event.key === 'ArrowRight') {
                isPresent = true;
                for (let i = 0; i < this.activeLetter.length; i++) {
                    if (this.activeLetter[i]) {
                        this.updateActiveLetter(this.moveRight(i));
                        break;
                    }
                }
            } else if (event.key === 'ArrowLeft') {
                isPresent = true;
                for (let i = 0; i < this.activeLetter.length; i++) {
                    if (this.activeLetter[i]) {
                        this.updateActiveLetter(this.moveLeft(i));
                        break;
                    }
                }
            }
            if (!isPresent) this.resetManipulation();
        });
    }

    findNextLetterIndex(current: number): number {
        for (let i = (current + 1) % HAND_SIZE; i !== current; i = (i + 1) % HAND_SIZE) {
            if (this.playerHand[i] === this.playerHand[current]) return i;
        }
        return current;
    }

    updateActiveLetter(current: number) {
        let isSelecting = false;
        for (const isActiveSelected of this.isClicked) {
            if (!isActiveSelected) continue;
            isSelecting = true;
        }
        if (isSelecting) return;
        this.isEventReceiver = true;
        for (let i = 0; i < this.activeLetter.length; i++) {
            this.activeLetter[i] = i === current;
        }
    }

    moveRight(current: number): number {
        const temp = this.playerHand[current];
        let next = current + 1;
        if (next === this.playerHand.length) next = 0;
        this.playerHand[current] = this.playerHand[next];
        this.playerHand[next] = temp;
        return next;
    }

    moveLeft(current: number): number {
        const temp = this.playerHand[current];
        let next = current - 1;
        if (next < 0) next = this.playerHand.length - 1;
        this.playerHand[current] = this.playerHand[next];
        this.playerHand[next] = temp;
        return next;
    }
}
