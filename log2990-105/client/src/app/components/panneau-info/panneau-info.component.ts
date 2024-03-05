import { Component } from '@angular/core';
import { DEFAULT_HAND_SIZE } from '@app/classes/config';
import { CommandService } from '@app/services/command.service';
import { TextboxService } from '@app/services/textbox.service';
import { WebsocketService } from '@app/services/websocket.service';
import { MessageType } from '@app/classes/message';

enum PlayerType {
    Self,
    Opponent,
}

@Component({
    selector: 'app-panneau-info',
    templateUrl: './panneau-info.component.html',
    styleUrls: ['./panneau-info.component.scss'],
})
export class PanneauInfoComponent {
    readonly playerType = PlayerType;

    isVisiblePlayer = false;
    isVisibleOpponent = false;
    isGameEnded = false;

    private turnState: boolean;
    private turnTime = 0;

    private playerName: string;
    private opponentName: string;

    private playerScore = 0;
    private opponentScore = 0;

    private playerHandSize = DEFAULT_HAND_SIZE;
    private opponentHandSize = DEFAULT_HAND_SIZE;
    private reserveSize = 0;

    private winner = '';

    constructor(private commandService: CommandService, private textboxService: TextboxService, private websocketService: WebsocketService) {
        this.websocketService.init.subscribe((initPayload) => {
            this.playerName = initPayload.self;
            this.opponentName = initPayload.opponent;
            this.reserveSize = initPayload.reserve.length;
            if (initPayload.turnState !== undefined) {
                this.turnState = initPayload.turnState;
            }
        });
        this.websocketService.turn.subscribe((turn) => {
            this.turnState = turn;
        });
        this.websocketService.time.subscribe((time) => {
            this.turnTime = time;
        });
        this.websocketService.hands.subscribe((hands) => {
            this.playerHandSize = hands.ownHand.length;
            this.opponentHandSize = hands.opponentHand.length;
            this.isVisiblePlayer = this.playerHandSize < DEFAULT_HAND_SIZE;
            this.isVisibleOpponent = this.opponentHandSize < DEFAULT_HAND_SIZE;
        });
        this.websocketService.scores.subscribe((scores) => {
            this.playerScore = scores.ownScore;
            this.opponentScore = scores.opponentScore;
        });
        this.websocketService.reserve.subscribe((reserve) => {
            this.reserveSize = reserve.length;
        });
        this.websocketService.endGame.subscribe((winner) => {
            this.winner = winner;
            this.isGameEnded = true;
        });
    }

    getTurnState(): boolean {
        return this.turnState;
    }

    getTurnTime(): string {
        const minutes = Math.floor(this.turnTime / MINUTE);
        const seconds = this.turnTime - minutes * MINUTE;
        return `${minutes}:${seconds >= MIN_SECONDS ? seconds : `0${seconds}`}`;
    }

    getTurnColor(): string {
        return this.turnState === undefined ? 'LightGray' : this.turnState ? 'Green' : 'Red';
    }

    getTurnMessage(): string {
        return this.turnState === undefined ? 'Initiez la partie' : this.turnState ? 'Votre tour' : "Tour de l'adversaire";
    }

    getReserveMessage(): string {
        return `Il reste ${this.reserveSize} pièce${this.reserveSize === 1 ? '' : 's'} dans la réserve`;
    }

    getHandMessage(player: number): string {
        const size = player === PlayerType.Self ? this.playerHandSize : this.opponentHandSize;
        return `${size} pièce${size === 1 ? '' : 's'} en main`;
    }

    getScoreMessage(player: number): string {
        const score = player === PlayerType.Self ? this.playerScore : this.opponentScore;
        return `${score} point${score === 1 ? '' : 's'}`;
    }

    getName(player: number): string {
        return player === PlayerType.Self ? this.playerName : this.opponentName;
    }

    getWinnerMessage(): string {
        return `Félicitation à ${this.winner}!`;
    }

    skipTurn(): void {
        const command = '!passer';
        this.textboxService.displayMessage(MessageType.Own, command);
        this.commandService.parseCommand(command);
    }
}

const MINUTE = 60;
const MIN_SECONDS = 10;
