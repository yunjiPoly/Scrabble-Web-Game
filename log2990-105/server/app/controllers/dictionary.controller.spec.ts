/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Application } from '@app/app';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import supertest from 'supertest';
import { Container } from 'typedi';
import { DatabaseService } from '@app/services/database.service';
import { ObjectId } from 'mongodb';

const HTTP_STATUS_OK = StatusCodes.OK;

describe('DictionaryController', () => {
    let dataBaseService: SinonStubbedInstance<DatabaseService>;
    let expressApp: Express.Application;
    let expected: { description: string; id?: string; name: string }[];

    beforeEach(async () => {
        expected = [{ description: 'Dictionnaire par défaut', id: '$default', name: 'Défaut' }];
        dataBaseService = createStubInstance(DatabaseService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['dictController'], 'dbService', { value: dataBaseService, writable: true });
        expressApp = app.app;
    });

    it('should call the right function', async () => {
        const expectedResult = [
            { description: 'Dictionnaire par défaut', id: '$default', name: 'Défaut' },
            { description: 'Dictionnaire par défaut', name: 'Défaut' },
        ];
        dataBaseService.getDictionaryDescriptions.resolves(expected);

        return supertest(expressApp)
            .get('/api/dict')
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expectedResult);
            });
    });

    it('should return error 500', async () => {
        dataBaseService.getDictionaryDescriptions.rejects(new Error('service error'));

        return supertest(expressApp)
            .get('/api/dict')
            .expect(500)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('POST should return 409', async () => {
        dataBaseService.countDictionaries.resolves(1);

        return supertest(expressApp).post('/api/dict').send({ name: 'name', description: 'description', words: 'words' }).expect(409);
    });

    it('POST should return 400', async () => {
        dataBaseService.countDictionaries.resolves(1);

        return supertest(expressApp).post('/api/dict').send({}).expect(400);
    });

    it('POST should return 200', async () => {
        dataBaseService.countDictionaries.resolves(0);
        dataBaseService.insertDictionary.resolves();

        return supertest(expressApp).post('/api/dict').send({ name: 'name', description: 'description', words: 'words' }).expect(HTTP_STATUS_OK);
    });

    it('POST should return 500', async () => {
        dataBaseService.countDictionaries.resolves(0);

        return supertest(expressApp).post('/api/dict').send({ name: 'name', description: 'description', words: 'words' }).expect(500);
    });

    it('POST should return 500 part 2', async () => {
        dataBaseService.countDictionaries.resolves(0);
        dataBaseService.insertDictionary.rejects(new Error('service error'));

        return supertest(expressApp).post('/api/dict').send({ name: 'name', description: 'description', words: 'words' }).expect(500);
    });

    it('PUT should return 409', async () => {
        dataBaseService.countDictionaries.resolves(1);

        return supertest(expressApp).put('/api/dict').send({ name: 'name', description: 'description', id: 'words' }).expect(409);
    });

    it('PUT should return 400', async () => {
        dataBaseService.countDictionaries.resolves(1);

        return supertest(expressApp).put('/api/dict').send({}).expect(400);
    });

    it('PUT should return 200', async () => {
        dataBaseService.countDictionaries.resolves(0);
        dataBaseService.editDictionary.resolves({
            matchedCount: 1,
            acknowledged: true,
            modifiedCount: 0,
            upsertedCount: 0,
            upsertedId: new ObjectId(),
        });

        return supertest(expressApp).put('/api/dict').send({ name: 'name', description: 'description', id: 'words' }).expect(HTTP_STATUS_OK);
    });

    it('PUT should return 500', async () => {
        dataBaseService.countDictionaries.resolves(0);
        dataBaseService.editDictionary.rejects(new Error('service error'));

        return supertest(expressApp).put('/api/dict').send({ name: 'name', description: 'description', id: 'words' }).expect(500);
    });

    it('PUT should return 500 part 2', async () => {
        dataBaseService.countDictionaries.rejects(new Error('service error'));

        return supertest(expressApp).put('/api/dict').send({ name: 'name', description: 'description', id: 'words' }).expect(500);
    });

    it('DELETE should return 200', async () => {
        dataBaseService.deleteDictionaries.resolves({ deletedCount: 1, acknowledged: true });

        return supertest(expressApp).delete('/api/dict').send({ ids: 'ids' }).expect(HTTP_STATUS_OK);
    });

    it('DELETE should return 400', async () => {
        dataBaseService.deleteDictionaries.resolves({ deletedCount: 1, acknowledged: true });

        return supertest(expressApp).delete('/api/dict').send({}).expect(400);
    });

    it('DELETE should return 500', async () => {
        dataBaseService.deleteDictionaries.rejects(new Error('service error'));

        return supertest(expressApp).delete('/api/dict').send({ ids: 'ids' }).expect(500);
    });

    it('GET download should correct value', async () => {
        dataBaseService.getDictionary.resolves();

        return supertest(expressApp)
            .get('/api/dict/download')
            .query({ id: '$id' })
            .expect(404)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('GET download should return 500', async () => {
        dataBaseService.getDictionary.rejects(new Error('service error'));

        return supertest(expressApp)
            .get('/api/dict/download')
            .query({ id: '$id' })
            .expect(500)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });

    it('GET download should return correct dictionary', async () => {
        dataBaseService.getDictionary.resolves(expected);

        return supertest(expressApp)
            .get('/api/dict/download')
            .query({ id: '$id' })
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal({});
            });
    });
});
