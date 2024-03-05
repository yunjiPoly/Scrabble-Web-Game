/* eslint-disable dot-notation */
import { Container } from 'typedi';
import { io, Socket } from 'socket.io-client';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { GameInfo, GameMode, GameType } from '@app/classes/game-info';
import { Server } from '@app/server';
import { MessageType } from '@app/classes/message';
import { createSandbox } from 'sinon';
import { SocketService } from '@app/services/socket.service';

describe('SocketService', () => {
    let service: SocketService;
    let clientSocket: Socket;
    let clientSocket2: Socket;
    let server: Server;
    let configs: GameInfo;
    let counter: number;
    const sandbox = createSandbox();
    const url = 'http://localhost:3000';
    const turnLengthValue = 60;
    const DEFAULT_BASE_DELAY = 100;
    const INCREMENT_DELAY = 100;
    const DEFAULT_DELAY = 500;

    beforeEach(() => {
        service = server['socketService'];
        configs = {
            username: 'test',
            turnLength: turnLengthValue,
            randomized: false,
            gameMode: GameMode.Log2990,
            gameType: GameType.Single,
            difficulty: 1,
            roomID: '-' + clientSocket.id,
            dictID: '$default',
        };
        counter = 0;
        clientSocket = io(url);
        clientSocket.connect();
        clientSocket2 = io(url);
        clientSocket2.connect();
    });

    before(() => {
        server = Container.get(Server);
        clientSocket = io(url);
        clientSocket.connect();
        clientSocket2 = io(url);
        clientSocket2.connect();
    });

    afterEach(() => {
        clientSocket.close();
        clientSocket2.close();
    });

    it('updateObjectives should return valid objectives', (done) => {
        let publicObjContainer: [number, boolean][];
        let privateObjContainer: [number, boolean];
        clientSocket.on('updateObjectives', (publicObjective: [number, boolean][], privateObjective: [number, boolean]) => {
            publicObjContainer = publicObjective;
            privateObjContainer = privateObjective;
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs, (response: { status: string }) => {
                void response;
            });
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            clientSocket.emit('fetchObjectives');
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY + INCREMENT_DELAY + INCREMENT_DELAY);

        setTimeout(() => {
            expect(publicObjContainer[0][0]).greaterThan(0);
            expect(publicObjContainer[1][0]).greaterThan(0);
            expect(privateObjContainer[0]).greaterThan(0);
            expect(counter).greaterThan(0);
            done();
        }, DEFAULT_DELAY + DEFAULT_DELAY);
    });

    it('convertGame should call the right functions', (done) => {
        configs.gameType = GameType.Multi;
        clientSocket.emit('createGame', configs);
        const spy = sandbox.spy(service['waitingRooms'], 'delete');
        clientSocket.emit('convertGame', 1);
        setTimeout(() => {
            expect(spy.called).to.equals(true);
            done();
        }, DEFAULT_DELAY);
    });

    it('sendMessage should send properly the message', (done) => {
        configs.gameType = GameType.Multi;
        let typeContainer: string;
        let messageContainer: string;
        clientSocket2.on('receiveMessage', (type: string, message: string) => {
            typeContainer = type;
            messageContainer = message;
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            clientSocket2.emit('joinGame', 'test2', '_' + clientSocket.id, (response: { status: string }) => {
                void [response];
            });
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            clientSocket.emit('sendMessage', 'Hello World');
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            expect(typeContainer).to.equals(MessageType.User);
            expect(messageContainer).to.equals('Hello World');
            expect(counter).greaterThan(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('sendMessage shouldn`t send anything', (done) => {
        configs.gameType = GameType.Multi;
        let typeContainer: string;
        let messageContainer: string;
        clientSocket2.on('receiveMessage', (type: string, message: string) => {
            typeContainer = type;
            messageContainer = message;
            counter++;
        });
        setTimeout(() => {
            clientSocket2.emit('joinGame', 'test2', '_' + clientSocket.id, (response: { status: string }) => {
                void [response];
            });
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            clientSocket.emit('sendMessage', 'Hello World');
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            expect(typeContainer).to.equals(undefined);
            expect(messageContainer).to.equals(undefined);
            expect(counter).to.equals(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('place should call the right functions', (done) => {
        let boardContainer: [string, string][];
        clientSocket.on('updateBoard', (board: [string, string][]) => {
            boardContainer = board;
        });
        clientSocket.on('updateHands', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            clientSocket.emit('place', 'h8', [
                ['h8', 'l'],
                ['h9', 'e'],
            ]);
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            expect(boardContainer.length).greaterThan(0);
            expect(counter).greaterThan(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('place shouldn`t call anything', (done) => {
        let boardContainer: [string, string][];
        clientSocket.on('updateBoard', (board: [string, string][]) => {
            boardContainer = board;
        });
        clientSocket.on('updateHands', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('place', 'h8', [
                ['h8', 'l'],
                ['h9', 'e'],
            ]);
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            expect(boardContainer).to.equals(undefined);
            expect(counter).to.equals(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('exchange should call the right functions', (done) => {
        clientSocket.on('updateReserve', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            clientSocket.emit('exchange', 'abcd');
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            expect(counter).greaterThan(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('exchange shouldn`t call anything', (done) => {
        clientSocket.on('updateReserve', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('exchange', 'abcd');
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            expect(counter).to.equals(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('skipTurn should call the right functions', (done) => {
        clientSocket.on('updateTurn', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            clientSocket.emit('skipTurn');
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            expect(counter).greaterThan(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('updateScores should send data properly', (done) => {
        let ownScoreContainer: number;
        let opponentScoreContainer: number;
        clientSocket.on('updateScores', (ownScore: number, opponentScore: number) => {
            ownScoreContainer = ownScore;
            opponentScoreContainer = opponentScore;
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            service.updateScores(clientSocket.id, 2, 1);
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            expect(ownScoreContainer).to.equals(2);
            expect(opponentScoreContainer).to.equals(1);
            expect(counter).greaterThan(0);
            done();
        }, DEFAULT_DELAY);
    });

    it('gameEnded should send data properly', (done) => {
        let winnerContainer: string;
        clientSocket.on('gameEnded', (winner: string) => {
            winnerContainer = winner;
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, DEFAULT_BASE_DELAY);
        setTimeout(() => {
            service.gameEnded('_' + clientSocket.id, 'Hello');
        }, DEFAULT_BASE_DELAY + INCREMENT_DELAY);
        setTimeout(() => {
            expect(winnerContainer).to.equals('Hello');
            expect(counter).greaterThan(0);
            done();
        }, DEFAULT_DELAY);
    });
});
