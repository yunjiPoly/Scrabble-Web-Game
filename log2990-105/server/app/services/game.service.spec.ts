/* eslint-disable dot-notation,@typescript-eslint/no-magic-numbers */
import { GameService } from './game.service';
import { DEFAULT_BONUSES } from '@app/classes/config';
import { Container } from 'typedi';
import { beforeEach, describe, it } from 'mocha';
import { expect } from 'chai';
import { Server } from '@app/server';
import { io, Socket } from 'socket.io-client';
import { GameInfo, GameMode, GameType } from '@app/classes/game-info';
import sinon, { createSandbox } from 'sinon';
import { Game } from '@app/classes/game';
import { Player } from '@app/classes/player';
import { Board } from '@app/classes/board';

describe('GameService', () => {
    let service: GameService;
    let server: Server;
    let clientSocket: Socket;
    let counter: number;
    let configs: GameInfo;
    let toPlaceLetters: Map<string, string>;
    let game: Game;
    let board: Board;
    let players: Map<string, Player>;
    const url = 'http://localhost:3000';

    beforeEach(() => {
        counter = 0;
        clientSocket = io(url);
        clientSocket.connect();
        configs = {
            username: 'test',
            turnLength: 60,
            randomized: false,
            gameMode: GameMode.Log2990,
            gameType: GameType.Single,
            difficulty: 1,
            roomID: '-' + clientSocket.id,
            dictID: '$default',
        };
        toPlaceLetters = new Map<string, string>([
            ['a1', 'a'],
            ['a2', 'b'],
            ['a3', 'c'],
            ['a4', 'd'],
        ]);
        players = new Map<string, Player>([['test1', new Player('test1')]]);
        board = new Board(DEFAULT_BONUSES);
        for (const letter of toPlaceLetters) board.placeLetter(letter[0], letter[1]);
        game = new Game(board, players, [
            [1, false],
            [2, false],
        ]);
    });

    before(() => {
        server = Container.get(Server);
        server.init();
        service = server['gameService'];
        service.attachSocketListeners();
    });

    afterEach(() => {
        clientSocket.close();
    });

    it('should get random bonuses', () => {
        expect(service.getBonuses(false)).to.equals(DEFAULT_BONUSES);
        expect(service.getBonuses(true)).not.to.equals(DEFAULT_BONUSES);
    });

    it('exchange should return nothing with game undefined', (done) => {
        const stub = sinon.stub(service['games'], 'get').returns(undefined);
        clientSocket.on('updateReserve', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('exchange', 'abcd');
        }, 200);
        setTimeout(() => {
            expect(counter).to.equals(0);
            stub.restore();
            done();
        }, 500);
    });

    it('exchange should return nothing with player undefined', (done) => {
        const stub = sinon.stub(service['games'], 'get').returns(game);
        const stub2 = sinon.stub(game.players, 'get').returns(undefined);
        clientSocket.on('updateReserve', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('exchange', 'abcd');
        }, 200);
        setTimeout(() => {
            expect(counter).to.equals(0);
            stub.restore();
            stub2.restore();
            done();
        }, 500);
    });

    it('place should return nothing with game undefined', (done) => {
        const stub = sinon.stub(service['games'], 'get').returns(undefined);
        clientSocket.on('updateBoard', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('place', 'h8', [
                ['h8', 'l'],
                ['h9', 'e'],
            ]);
        }, 300);
        setTimeout(() => {
            expect(counter).to.equals(0);
            stub.restore();
            done();
        }, 500);
    });

    it('place should return nothing with player undefined', (done) => {
        const stub = sinon.stub(service['games'], 'get').returns(game);
        const stub2 = sinon.stub(game.players, 'get').returns(undefined);
        clientSocket.on('updateBoard', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('place', 'h8', [
                ['h8', 'l'],
                ['h9', 'e'],
            ]);
        }, 300);
        setTimeout(() => {
            expect(counter).to.equals(0);
            stub.restore();
            stub2.restore();
            done();
        }, 500);
    });

    it('place should call the right functions', (done) => {
        const stub = sinon.stub(service['validationService'], 'findWord').returns(false);
        const spy = createSandbox().spy(service['socketService'], 'sendMessage');
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('place', 'h8', [
                ['h8', 'l'],
                ['h9', 'e'],
            ]);
        }, 300);
        setTimeout(() => {
            spy.restore();
            stub.restore();
            done();
        }, 500);
    });

    it('updateObjectives should return nothing with game undefined', (done) => {
        const stub = sinon.stub(service['games'], 'get').returns(undefined);
        clientSocket.on('updateObjectives', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('fetchObjectives');
        }, 300);
        setTimeout(() => {
            expect(counter).to.equals(0);
            stub.restore();
            done();
        }, 500);
    });

    it('updateObjectives should return nothing with player undefined', (done) => {
        const stub = sinon.stub(service['games'], 'get').returns(game);
        const stub2 = sinon.stub(game.players, 'get').returns(undefined);
        clientSocket.on('updateObjectives', () => {
            counter++;
        });
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('fetchObjectives');
        }, 300);
        setTimeout(() => {
            expect(counter).to.equals(0);
            stub.restore();
            stub2.restore();
            done();
        }, 500);
    });

    it('timer updateTime should be called ', (done) => {
        const spy = createSandbox().spy(service['socketService'], 'updateTime');
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('updateTime', 1);
        }, 300);
        setTimeout(() => {
            expect(spy.called).to.equals(true);
            spy.restore();
            done();
        }, 500);
    });

    it('timer updateTurn should be called ', (done) => {
        const stub = sinon.stub(service['endGameService'], 'gameEnded').returns(true);
        const spy = createSandbox().spy(service, 'deleteRoom');
        setTimeout(() => {
            clientSocket.emit('createGame', configs);
        }, 100);
        setTimeout(() => {
            clientSocket.emit('updateTurn');
        }, 300);
        setTimeout(() => {
            expect(spy.called).to.equals(true);
            stub.restore();
            spy.restore();
            done();
        }, 500);
    });
});
