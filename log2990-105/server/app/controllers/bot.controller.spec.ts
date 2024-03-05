/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Application } from '@app/app';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import supertest from 'supertest';
import { Container } from 'typedi';
import { DatabaseService } from '@app/services/database.service';
import { BotName } from '@app/classes/game-info';
import { ObjectId } from 'mongodb';

const HTTP_STATUS_OK = StatusCodes.OK;

describe('BotController', () => {
    let dataBaseService: SinonStubbedInstance<DatabaseService>;
    let expressApp: Express.Application;
    let expected: BotName[];

    beforeEach(async () => {
        expected = [{ _id: 'id', name: 'name' }];
        dataBaseService = createStubInstance(DatabaseService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['botController'], 'dbService', { value: dataBaseService, writable: true });
        expressApp = app.app;
    });

    it('GET should return correct value', async () => {
        const result = [
            { id: '0', name: 'tyler1', default: true },
            { id: '1', name: '< your ad here >', default: true },
            { id: '2', name: 'Kirikou', default: true },
            { id: 'id', name: 'name', default: false },
        ];
        dataBaseService.getBots.resolves(expected);

        return supertest(expressApp)
            .get('/api/bot')
            .query({ difficulty: '0' })
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(result);
            });
    });

    it('GET should return 400', async () => {
        dataBaseService.getBots.resolves(expected);

        return supertest(expressApp)
            .get('/api/bot')
            .query({})
            .expect(400)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('GET should return 500', async () => {
        dataBaseService.getBots.rejects(new Error('service error'));

        return supertest(expressApp)
            .get('/api/bot')
            .query({ difficulty: '0' })
            .expect(500)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('POST should return 400', async () => {
        dataBaseService.insertBot.resolves();

        return supertest(expressApp).post('/api/bot').send({}).expect(400);
    });

    it('POST should return 409', async () => {
        dataBaseService.countBots.resolves([2, 3]);

        return supertest(expressApp).post('/api/bot').send({ name: 'name', difficulty: '1' }).expect(409);
    });

    it('POST should return 200', async () => {
        dataBaseService.countBots.resolves([0, 0]);
        dataBaseService.insertBot.resolves();

        return supertest(expressApp).post('/api/bot').send({ name: 'name', difficulty: '1' }).expect(200);
    });

    it('POST should return 500', async () => {
        dataBaseService.countBots.rejects(new Error('service error'));

        return supertest(expressApp).post('/api/bot').send({ name: 'name', difficulty: '1' }).expect(500);
    });

    it('POST should return 500 part 2', async () => {
        dataBaseService.countBots.resolves([0, 0]);
        dataBaseService.insertBot.rejects(new Error('service error'));

        return supertest(expressApp).post('/api/bot').send({ name: 'name', difficulty: '1' }).expect(500);
    });

    it('PUT should return 400', async () => {
        dataBaseService.countBots.resolves([0, 0]);

        return supertest(expressApp).put('/api/bot').send({}).expect(400);
    });

    it('PUT should return 409', async () => {
        dataBaseService.countBots.resolves([2, 3]);

        return supertest(expressApp).put('/api/bot').send({ id: 'id', name: 'name', difficulty: '1' }).expect(409);
    });

    it('PUT should return 200', async () => {
        dataBaseService.countBots.resolves([0, 0]);
        dataBaseService.editBot.resolves({
            matchedCount: 1,
            acknowledged: true,
            modifiedCount: 0,
            upsertedCount: 0,
            upsertedId: new ObjectId(),
        });

        return supertest(expressApp).put('/api/bot').send({ id: 'id', name: 'name', difficulty: '1' }).expect(200);
    });

    it('PUT should return 500', async () => {
        dataBaseService.countBots.resolves([0, 0]);
        dataBaseService.editBot.rejects(new Error('service error'));

        return supertest(expressApp).put('/api/bot').send({ id: 'id', name: 'name', difficulty: '1' }).expect(500);
    });

    it('PUT should return 500 part 2', async () => {
        dataBaseService.countBots.rejects(new Error('service error'));

        return supertest(expressApp).put('/api/bot').send({ id: 'id', name: 'name', difficulty: '1' }).expect(500);
    });

    it('DELETE should return 400', async () => {
        return supertest(expressApp).delete('/api/bot').send({}).expect(400);
    });

    it('DELETE should return 200', async () => {
        dataBaseService.deleteBots.resolves({ deletedCount: 1, acknowledged: true });

        return supertest(expressApp).delete('/api/bot').send({ ids: 'id', difficulty: '1' }).expect(200);
    });

    it('DELETE should return 500', async () => {
        dataBaseService.deleteBots.rejects(new Error('service error'));

        return supertest(expressApp).delete('/api/bot').send({ ids: 'id', difficulty: '1' }).expect(500);
    });
});
