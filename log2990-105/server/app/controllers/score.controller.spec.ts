import { Application } from '@app/app';
import { expect } from 'chai';
import { StatusCodes } from 'http-status-codes';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import supertest from 'supertest';
import { Container } from 'typedi';
import { DatabaseService } from '@app/services/database.service';
import { HighScore } from '@app/classes/highscore';

const HTTP_STATUS_OK = StatusCodes.OK;

describe('ScoreController', () => {
    let dataBaseService: SinonStubbedInstance<DatabaseService>;
    let expressApp: Express.Application;
    let expected: HighScore[];

    beforeEach(async () => {
        expected = [
            { name: 'TheLegend27', score: 50 },
            { name: 'Kevin Nguyen', score: 48 },
            { name: '105mm APFSDS rnd', score: 42 },
            { name: 'ฅ^•ﻌ•^ฅ', score: 35 },
            { name: 'Иосиф Сталин', score: 27 },
        ];
        dataBaseService = createStubInstance(DatabaseService);
        const app = Container.get(Application);
        // eslint-disable-next-line dot-notation
        Object.defineProperty(app['scoreController'], 'dbService', { value: dataBaseService, writable: true });
        expressApp = app.app;
    });

    it('should return error 400', async () => {
        dataBaseService.getHighScores.resolves(expected);

        return (
            supertest(expressApp)
                .get('/api/score')
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                .expect(400)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                })
        );
    });

    it('should return error 409', async () => {
        dataBaseService.getHighScores.rejects(new Error('service error'));

        return (
            supertest(expressApp)
                .get('/api/score')
                .query({ gameMode: 1 })
                // eslint-disable-next-line @typescript-eslint/no-magic-numbers
                .expect(409)
                .then((response) => {
                    expect(response.body).to.deep.equal({});
                })
        );
    });

    it('should return highscores from database', async () => {
        dataBaseService.getHighScores.resolves(expected);

        return supertest(expressApp)
            .get('/api/score')
            .query({ gameMode: 1 })
            .expect(HTTP_STATUS_OK)
            .then((response) => {
                expect(response.body).to.deep.equal(expected);
            });
    });
});
