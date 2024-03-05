import { Board } from '@app/classes/board';
import { BotMapWrapper } from '@app/classes/bot-config';
import { BOT_MARKER, DEFAULT_BONUSES, DEFAULT_SOCKET_TIMEOUT, DEFAULT_TURN_TIMEOUT, HALF } from '@app/classes/config';
import { Game } from '@app/classes/game';
import { GameInfo, GameMode, GameType, PlayerInfo } from '@app/classes/game-info';
import { MessageType } from '@app/classes/message';
import { Player } from '@app/classes/player';
import { Timer } from '@app/classes/timer';
import { BotService } from '@app/services/bot.service';
import { DatabaseService } from '@app/services/database.service';
import { EndGameService } from '@app/services/end-game.service';
import { ExchangeService } from '@app/services/exchange.service';
import { GameDisplayService } from '@app/services/game-display.service';
import { ObjectivesService } from '@app/services/objectives';
import { PlacingService } from '@app/services/placing.service';
import { SocketService } from '@app/services/socket.service';
import { TurnService } from '@app/services/turn.service';
import { ValidationService } from '@app/services/validation.service';
import { Service } from 'typedi';

@Service()
export class GameService {
    // Key -- ID of the room <br>
    // Value -- Game being played in room
    readonly games = new Map<string, Game>();

    // Key -- ID of the room <br>
    // Value -- Timer of the room
    readonly timers = new Map<string, Timer>();

    constructor(
        private socketService: SocketService,
        private botService: BotService,
        private endGameService: EndGameService,
        private exchangeService: ExchangeService,
        private placingService: PlacingService,
        private validationService: ValidationService,
        private objectivesService: ObjectivesService,
        private dbService: DatabaseService,
        private turnService: TurnService,
        private gameDisplayService: GameDisplayService,
    ) {}

    attachSocketListeners() {
        this.socketService.socketEvents
            .on('createGame', (roomID: string, configs: GameInfo, players: PlayerInfo[]) => {
                this.createGame(roomID, configs, players);
            })
            .on('exchange', (socketID: string, roomId: string, letters: string) => {
                const game = this.games.get(roomId);
                if (game === undefined) {
                    return;
                }
                const player = game.players.get(socketID);
                if (player === undefined) {
                    return;
                }
                this.exchangeService.exchangeLetters(letters, player, game.reserve);
                this.socketService.updateReserve(roomId, game.reserve.letters);
                this.gameDisplayService.updateHands(game, this.socketService);
                this.endGameService.resetTurnSkipCount(roomId);
                this.turnService.changeTurn(roomId, this.timers.get(roomId) as Timer, this.socketService);
            })
            .on('place', (socketID: string, roomID: string, startCoords: string, letters: [string, string][]) => {
                const toPlace = new Map<string, string>(letters);
                const game = this.games.get(roomID);
                if (game === undefined) {
                    return;
                }
                const player = game.players.get(socketID);
                if (player === undefined) {
                    return;
                }
                this.placingService.placeLetters(toPlace, game.board, player);
                this.validationService.init(startCoords, toPlace, game.board);
                this.socketService.updateBoard(socketID, game.board.letters);
                this.socketService.updateHands(socketID, player.hand, Array.from(game.players.values()).filter((p) => p !== player)[0].hand);

                const isValidWord = this.validationService.findWord(roomID, this.validationService.fetchWords());
                setTimeout(() => {
                    if (isValidWord) {
                        player.score += this.validationService.calcPoints();
                        for (const objective of game.publicObj) {
                            const objNumber = objective[0];
                            if (this.objectivesService.checkObjective(objNumber, toPlace, game)) {
                                if (game.completePublic(objNumber)) player.score += this.objectivesService.getPoints(objNumber);
                            }
                        }
                        if (this.objectivesService.checkObjective(player.privateObj[0], toPlace, game)) {
                            if (player.completePrivate()) player.score += this.objectivesService.getPoints(player.privateObj[0]);
                        }
                        this.placingService.replenishHand(game.reserve, player);
                        this.socketService.updateReserve(roomID, game.reserve.letters);
                        this.gameDisplayService.updateScores(game, this.socketService);
                        this.endGameService.resetTurnSkipCount(roomID);
                    } else {
                        game.validTurnCounter = 0;
                        this.placingService.returnLetters(toPlace, game.board, player);
                        this.socketService.sendMessage(socketID, MessageType.System, 'Votre placement forme des mots invalides');
                    }
                    this.socketService.updateBoard(roomID, game.board.letters);
                    this.socketService.updateObjectives(socketID, game.publicObj, player.privateObj);
                    this.gameDisplayService.updateHands(game, this.socketService);
                }, DEFAULT_TURN_TIMEOUT);

                this.turnService.changeTurn(roomID, this.timers.get(roomID) as Timer, this.socketService);
            })
            .on('skipTurn', (roomID: string) => {
                this.endGameService.incrementTurnSkipCount(roomID);
                this.turnService.changeTurn(roomID, this.timers.get(roomID) as Timer, this.socketService);
            })
            .on('disconnect', (socketID: string, roomID: string) => {
                if (Array.from(this.socketService.activeRooms.values()).includes(roomID)) {
                    const game = this.games.get(roomID);
                    const timer = this.timers.get(roomID);
                    if (game === undefined || timer === undefined) {
                        return;
                    }
                    const quitter = game.players.get(socketID);
                    const skip = Array.from(game.players.values()).indexOf(quitter as Player) === 0 ? timer.turn : !timer.turn;
                    setTimeout(() => {
                        this.socketService.sendMessage(roomID, MessageType.System, `${quitter} a quitté le jeu!`);
                        this.socketService.sendMessage(roomID, MessageType.System, `${quitter} a été remplacé par un joueur virtuel`);
                        this.botService.games.set(socketID, roomID);
                        if (skip) {
                            this.turnService.changeTurn(roomID, this.timers.get(roomID) as Timer, this.socketService);
                        }
                    }, DEFAULT_SOCKET_TIMEOUT);
                } else {
                    this.deleteRoom(roomID);
                }
            })
            .on('updateObjectives', (socketId: string, roomId: string) => {
                const game = this.games.get(roomId);
                if (game === undefined) {
                    return;
                }
                const player = game.players.get(socketId);
                if (player === undefined) {
                    return;
                }
                this.socketService.updateObjectives(socketId, game.publicObj, player.privateObj);
            });
    }

    attachBotListeners() {
        this.botService.botEvents
            .on('skipTurn', (roomID) => {
                this.socketService.sendMessage(roomID, MessageType.User, '!passer');
                this.endGameService.incrementTurnSkipCount(roomID);
                this.turnService.changeTurn(roomID, this.timers.get(roomID) as Timer, this.socketService);
            })
            .on('place', (roomID, letters, board, player, points) => {
                this.placingService.placeLetters(letters, board, player);
                const game = this.games.get(roomID);
                if (game === undefined) {
                    return;
                }
                this.placingService.replenishHand(game.reserve, player);
                this.socketService.updateBoard(roomID, board.letters);
                this.socketService.updateReserve(roomID, game.reserve.letters);
                player.score += points;
                for (const objective of game.publicObj) {
                    const objNumber = objective[0];
                    if (this.objectivesService.checkObjective(objNumber, letters, game)) {
                        if (game.completePublic(objNumber)) player.score += this.objectivesService.getPoints(objNumber);
                    }
                }
                if (this.objectivesService.checkObjective(player.privateObj[0], letters, game)) {
                    if (player.completePrivate()) player.score += this.objectivesService.getPoints(player.privateObj[0]);
                }
                this.gameDisplayService.updateScores(game, this.socketService);
                this.socketService.sendMessage(roomID, MessageType.User, '!placer');
                this.turnService.changeTurn(roomID, this.timers.get(roomID) as Timer, this.socketService);
            })
            .on('exchange', (roomID, letters, player, reserve, isTest) => {
                this.exchangeService.exchangeLetters(letters, player, reserve);
                this.socketService.sendMessage(roomID, MessageType.User, '!échanger');
                if (!isTest) this.turnService.changeTurn(roomID, this.timers.get(roomID) as Timer, this.socketService);
            });
    }

    async createGame(roomID: string, configs: GameInfo, players: PlayerInfo[]) {
        const game = await this.setupGame(roomID, configs, players);
        const timer = this.setupTimer(roomID, configs, game);

        this.games.set(roomID, game);
        this.timers.set(roomID, timer);
        this.endGameService.turnSkipMap.set(roomID, 0);

        this.sendConfigs(configs, game);
        timer.changeTurn();
    }

    async setupGame(roomID: string, configs: GameInfo, playerInfos: PlayerInfo[]): Promise<Game> {
        // Generate entries for player map
        const players: [string, Player][] = playerInfos.map((entry) => {
            const player = new Player(entry.username);
            return [entry.socketID, player];
        });
        if (configs.gameType === GameType.Single) {
            // If single player, add a bot to the map entries
            const bot = new Player(await this.botService.getBotName(playerInfos[0].username, configs.difficulty as number));
            const botID = `${BOT_MARKER}${playerInfos[0].socketID}`;
            players.push([botID, bot]);
            this.botService.games.set(botID, roomID);
            this.botService.botDifficulties.set(botID, configs.difficulty as number);
            const newBotMapWrapper: BotMapWrapper = { map: new Map<string, string>() };
            this.botService.botMaps.set(botID, newBotMapWrapper);
        }
        const bonuses = this.getBonuses(configs.randomized);

        const publicObj: [number, boolean][] = [];
        if (configs.gameMode === GameMode.Log2990) {
            // If the gameMode is LOG2990 (with objectives)
            const tempObj = this.objectivesService.getPublicObjectives();
            for (const objective of tempObj) {
                publicObj.push([objective, false]);
            }
            Array.from(players.values()).forEach((player) => {
                player[1].privateObj = [this.objectivesService.getPrivateObjectives(), false];
            });
            this.objectivesService.resetObjArray();
        }
        return new Game(new Board(bonuses), new Map(players), publicObj);
    }

    setupTimer(roomID: string, configs: GameInfo, game: Game): Timer {
        const timer = new Timer(configs.turnLength as number);
        const players = Array.from(game.players.entries()).map(([socketID, player]) => {
            return { socketID, player };
        });
        timer
            .on(Timer.events.updateTime, (time: number) => {
                this.socketService.updateTime(roomID, time);
            })
            .on(Timer.events.updateTurn, (turnState: boolean) => {
                if (this.endGameService.gameEnded(roomID, game, players[0].player, players[1].player, this.socketService)) {
                    this.deleteRoom(roomID);
                    players.forEach(({ socketID, player }) => {
                        if (!this.botService.games.delete(socketID)) {
                            const highScore = { name: player.name, score: player.score };
                            this.dbService.updateHighScore(highScore, configs.gameMode as number);
                        }
                    });
                    return;
                }
                this.turnService.updateTurn(players[0].socketID, turnState, timer, this.games.get(roomID) as Game, this.socketService);
                this.turnService.updateTurn(players[1].socketID, !turnState, timer, this.games.get(roomID) as Game, this.socketService);
            })
            .on(Timer.events.timeElapsed, (turnState: boolean) => {
                this.endGameService.incrementTurnSkipCount(roomID);
                this.socketService.sendMessage(players[0].socketID, turnState ? MessageType.Own : MessageType.User, '!passer');
                if (configs.gameType === GameType.Multi) {
                    this.socketService.sendMessage(players[1].socketID, turnState ? MessageType.User : MessageType.Own, '!passer');
                }
                timer.changeTurn();
            });

        return timer;
    }

    sendConfigs(configs: GameInfo, game: Game): void {
        const players = Array.from(game.players.entries()).map(([socketID, player]) => {
            return { socketID, username: player.name, hand: player.hand };
        });
        this.socketService.setConfigs(
            players[0].socketID,
            players[0].username,
            players[1].username,
            game.board.bonuses,
            game.reserve.letters,
            players[0].hand,
            configs.gameMode as number,
            false,
        );
        if (configs.gameType === GameType.Single) {
            return;
        }
        this.socketService.setConfigs(
            players[1].socketID,
            players[1].username,
            players[0].username,
            game.board.bonuses,
            game.reserve.letters,
            players[1].hand,
            configs.gameMode as number,
            false,
        );
    }

    getBonuses(randomized: boolean): Map<string, string> {
        if (!randomized) {
            return DEFAULT_BONUSES;
        }
        // Randomly sort the coords
        const coords = Array.from(DEFAULT_BONUSES.keys()).sort(() => HALF - Math.random());
        const multiplier = Array.from(DEFAULT_BONUSES.values());
        return new Map(coords.map((key, index) => [key, multiplier[index]]));
    }

    deleteRoom(roomID: string): void {
        const players = this.games.get(roomID)?.players;
        if (players === undefined) {
            return;
        }
        // If either of the players are bots, delete them from the map
        Array.from(players.keys()).forEach((id) => this.botService.games.delete(id));
        this.games.delete(roomID);
        this.timers.get(roomID)?.clearTimer();
        this.timers.delete(roomID);
    }
}
