import { Service } from 'typedi';
import { Timer } from '@app/classes/timer';
import { BotService } from '@app/services/bot.service';
import { DEFAULT_TURN_TIMEOUT } from '@app/classes/config';
import { Game } from '@app/classes/game';
import { SocketService } from '@app/services/socket.service';

@Service()
export class TurnService {
    constructor(private botService: BotService) {}

    changeTurn(roomID: string, timer: Timer, socket: SocketService): void {
        if (timer === undefined) {
            return;
        }
        if (timer.isLocked) {
            socket.updateTurn(roomID, false);
        } else {
            timer.changeTurn();
        }
    }

    /**
     * @description Sends turn updates to sockets. Ends one's turn immediately, but waits 3 seconds to start other's turn.
     * @param socketID
     * @param turnState
     * @param timer
     */
    updateTurn(socketID: string, turnState: boolean, timer: Timer, games: Game, socket: SocketService) {
        // Check if the "socket" ID belongs to a bot
        const roomID = this.botService.games.get(socketID);
        if (turnState) {
            // If player on socketID is about to start their turn
            setTimeout(() => {
                timer.startTimer();
                if (roomID) {
                    // If bot, activate the service
                    this.botService.activate(socketID, games);
                } else {
                    // Else send turn update to player
                    socket.updateTurn(socketID, turnState);
                }
            }, DEFAULT_TURN_TIMEOUT);
        } else if (!roomID) {
            // If player, activate the service
            socket.updateTurn(socketID, turnState);
        }
    }
}
