import { Injectable } from '@angular/core';
import { MessageType } from '@app/classes/message';
import { TextboxService } from '@app/services/textbox.service';
import { DEFAULT_HAND_SIZE } from '@app/classes/config';
import { WebsocketService } from '@app/services/websocket.service';

@Injectable({
    providedIn: 'root',
})
export class LetterExchangeService {
    private turnState: boolean;
    private playerHand: string[] = [];
    private reserve: string[] = [];

    constructor(private textboxService: TextboxService, private websocketService: WebsocketService) {
        this.websocketService.init.subscribe((initPayload) => {
            this.playerHand = initPayload.hand;
            this.reserve = initPayload.reserve;
        });
        this.websocketService.turn.subscribe((turn) => {
            this.turnState = turn;
        });
        this.websocketService.hands.subscribe((hands) => {
            this.playerHand = hands.ownHand;
        });
        this.websocketService.reserve.subscribe((reserve) => {
            this.reserve = reserve;
        });
    }

    /**
     * @description Validates the command
     * @param letters letters to exchange
     */
    validateCommand(letters: string): boolean {
        return (
            this.isMyTurn(this.turnState) && this.isValidParam(letters) && this.isFullReserve(this.reserve) && this.isInHand(letters, this.playerHand)
        );
    }

    /**
     * @description Assert that a proper parameter has been entered
     * @param letters to exchange
     */
    isValidParam(letters: string) {
        if (letters === undefined || letters === '') {
            this.textboxService.displayMessage(MessageType.System, 'Veuillez spécifier les lettres à échanger');
            return false;
        }
        if (letters.length > DEFAULT_HAND_SIZE) {
            this.textboxService.displayMessage(MessageType.System, 'Vous ne pouvez échanger plus que 7 lettres à la fois');
            return false;
        }
        if (letters !== letters.toLowerCase()) {
            this.textboxService.displayMessage(MessageType.System, 'Les lettres doivent être en minuscule');
            return false;
        }
        return true;
    }

    /**
     * @description Asserts that there is at least 7 letters remaining in the reserve
     */
    isFullReserve(reserve: string[]) {
        return reserve.length >= DEFAULT_HAND_SIZE;
    }

    /**
     * @description Assert that the hand contains all the letters to be exchanged
     * @param expected letters to exchange
     * @param actual player's current hand
     */
    isInHand(expected: string, actual: string[]): boolean {
        const letters = expected.split('');
        const isInHand = [...new Set<string>(letters)].every((expectedLetter) => {
            const amountRequired = letters.filter((letter) => {
                return letter === expectedLetter;
            }).length;
            const amountInHand = actual.filter((letter) => {
                return letter === expectedLetter;
            }).length;
            return amountRequired <= amountInHand;
        });
        if (!isInHand) {
            this.textboxService.displayMessage(MessageType.System, 'Vous ne pouvez pas échanger des lettres qui ne sont pas dans votre main');
        }
        return isInHand;
    }

    /**
     * @description Assert that it is currently the player's turn
     */
    isMyTurn(turnState: boolean): boolean {
        if (!turnState) {
            this.textboxService.displayMessage(MessageType.System, 'La commande !échanger peut seulement être utilisée lors de votre tour');
        }
        return turnState;
    }
}
