import { DEFAULT_POINTS, MAX_TURN_SKIP_COUNT } from '@app/classes/config';
import { Game } from '@app/classes/game';
import { MessageType } from '@app/classes/message';
import { Player } from '@app/classes/player';
import { Reserve } from '@app/classes/reserve';
import { Service } from 'typedi';
import { SocketService } from '@app/services/socket.service';
import { GameDisplayService } from '@app/services/game-display.service';

@Service()
export class EndGameService {
    readonly turnSkipMap = new Map<string, number>();

    constructor(private gameDisplayService: GameDisplayService) {}
    /**
     * @description Function that increments the turnSkipCounter to keep track of the number of turns skipped
     * @param roomID room where a turn has been skipped
     */
    incrementTurnSkipCount(roomID: string): void {
        const roomSkipCounter = this.turnSkipMap.get(roomID);
        if (roomSkipCounter !== undefined) {
            this.turnSkipMap.set(roomID, roomSkipCounter + 1);
        }
    }
    /**
     * @description Function that resets the turnSkipCounter because people aren't AFK/doing nothing
     * @param roomID room where a turn has been played
     */
    resetTurnSkipCount(roomID: string): void {
        const roomSkipCounter = this.turnSkipMap.get(roomID);
        if (roomSkipCounter !== undefined) {
            this.turnSkipMap.set(roomID, 0);
        }
    }
    /**
     * @description Function that verifies if the game met one of the ending conditions
     * @param player1Hand the hand of player 1
     * @param player2Hand the hand of player 2
     * @param reserve container where the rest of the letters are
     * @param roomID room's ID
     * @returns boolean to indicate if the game ended
     */
    checkIfGameEnd(reserve: Reserve, player1Hand: Player, player2Hand: Player, roomID: string): boolean {
        if (reserve.size === 0) {
            if (player1Hand.size === 0 || player2Hand.size === 0) {
                return true;
            }
        }
        return this.turnSkipMap.get(roomID) === MAX_TURN_SKIP_COUNT;
    }
    /**
     * @description Function that subtracts the remaining letters value to the score
     * @param player player that needs to have its score deducted
     */
    deductPoints(player: Player): void {
        player.hand.forEach((letter) => {
            if (letter !== '*') {
                player.score -= DEFAULT_POINTS.get(letter) as number;
            }
        });
    }
    /**
     * @description Function that adds the remaining letters value of the enemy to the score
     * @param player player that emptied their hand
     * @param hand other player's hand
     */
    addPoints(player: Player, hand: string[]): void {
        hand.forEach((letter) => {
            player.score += DEFAULT_POINTS.get(letter) as number;
        });
    }
    /**
     * @description Function that verifies who has an empty hand
     * @param player1 player 1
     * @param player2 player 2
     * @returns a the player who emptied its hand and the hand of its opponent
     */
    checkWhoEmptiedHand(player1: Player, player2: Player): [Player, string[]] | undefined {
        let playerWhoEmptiedHand: Player | undefined;
        let otherHand: string[] | undefined;
        if (player1.hand.length === 0) {
            playerWhoEmptiedHand = player1;
            otherHand = player2.hand;
        }
        if (player2.hand.length === 0) {
            playerWhoEmptiedHand = player2;
            otherHand = player1.hand;
        }
        return playerWhoEmptiedHand && otherHand ? [playerWhoEmptiedHand, otherHand] : undefined;
    }
    /**
     * @description Function that displays the remaining letters of both parties
     * @param player1 player 1
     * @param player2 player 2
     * @returns an array containing the letters
     */
    showLettersLeft(player1: Player, player2: Player): string[] {
        const text: string[] = [];
        text.push('Fin de partie - lettres restantes');
        text.push(`${player1.name}:\t${player1.hand.join('')}`);
        text.push(`${player2.name}:\t${player2.hand.join('')}`);
        return text;
    }
    /**
     * @description Function finds the winner by comparing their scores
     * @param player1 player 1
     * @param player2 player 2
     * @returns the name(s) of the winner(s)
     */
    getWinner(player1: Player, player2: Player): string {
        return player1.score > player2.score ? player1.name : player1.score < player2.score ? player2.name : `${player1.name} et ${player2.name}`;
    }
    /**
     * @description Sets the final score of each player
     * @param player1 player 1
     * @param player2 player 2
     */
    setPoints(player1: Player, player2: Player): void {
        this.deductPoints(player1);
        this.deductPoints(player2);
        const result = this.checkWhoEmptiedHand(player1, player2);
        if (result) {
            this.addPoints(...result);
        }
    }

    gameEnded(roomID: string, game: Game, player1: Player, player2: Player, socket: SocketService): boolean {
        const gameEnd: boolean = this.checkIfGameEnd(game.reserve, player1, player2, roomID);
        if (!gameEnd) {
            return false;
        }
        this.setPoints(player1, player2);
        socket.gameEnded(roomID, this.getWinner(player1, player2));
        for (const message of this.showLettersLeft(player1, player2)) {
            socket.sendMessage(roomID, MessageType.System, message);
        }
        socket.updateTurn(roomID, false);
        this.gameDisplayService.updateScores(game, socket);
        return true;
    }
}
