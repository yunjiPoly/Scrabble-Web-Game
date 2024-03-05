import { Service } from 'typedi';
import { Game } from '@app/classes/game';
import { SocketService } from './socket.service';

@Service()
export class GameDisplayService {
    updateHands(game: Game, socket: SocketService) {
        const entries = Array.from(game.players.entries());
        socket.updateHands(entries[0][0], entries[0][1].hand, entries[1][1].hand);
        socket.updateHands(entries[1][0], entries[1][1].hand, entries[0][1].hand);
    }

    updateScores(game: Game, socket: SocketService) {
        const entries = Array.from(game.players.entries());
        socket.updateScores(entries[0][0], entries[0][1].score, entries[1][1].score);
        socket.updateScores(entries[1][0], entries[1][1].score, entries[0][1].score);
    }
}
