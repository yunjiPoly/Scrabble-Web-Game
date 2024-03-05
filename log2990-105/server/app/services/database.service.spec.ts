/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-underscore-dangle */
// To make testing easier
import { fail } from 'assert';
import { expect } from 'chai';
import { describe } from 'mocha';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { DatabaseService } from '@app/services/database.service';
import { GameDifficulty, GameMode } from '@app/classes/game-info';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    const fakeScorer1 = { name: 'FakePlayerButCooler', score: 100 };
    const fakeScorer2 = { name: 'FakePlayer', score: 8 };
    const fakeDictionary = { name: 'fakeDict', description: 'a fake dictionary', words: ['why'] };

    beforeEach(async () => {
        databaseService = new DatabaseService();

        mongoServer = await MongoMemoryServer.create();
    });

    afterEach(async () => {
        if (databaseService['client']) {
            await databaseService['client'].close();
        }
    });

    it('should connect to the database when databaseConnect is called', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        expect(databaseService['client']).to.not.be.undefined;
    });

    it('should not connect to the database when databaseConnect is called with wrong URL', async () => {
        try {
            await databaseService.databaseConnect('WRONG URL');
            fail();
        } catch {
            expect(databaseService['client']).to.be.undefined;
        }
    });

    it('should return the right highscore list when calling getHighScores', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDefaultScores();
        const scoreLog2990 = await databaseService.getHighScores(GameMode.Classical);
        expect(scoreLog2990[0].name).to.equal('TheLegend27');
        expect(scoreLog2990[1].name).to.equal('Kevin Nguyen');
        expect(scoreLog2990[2].name).to.equal('105mm APFSDS rnd');
    });

    it('should insertDefaultScores in the database', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDefaultScores();
        const scoreClassic = await databaseService.getHighScores(GameMode.Classical);
        const scoreLog2990 = await databaseService.getHighScores(GameMode.Log2990);
        expect(scoreClassic.length).to.equal(5);
        expect(scoreLog2990.length).to.equal(5);
    });

    it('should updateHighScore when a higher score has been reached in Classical', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDefaultScores();
        await databaseService.updateHighScore(fakeScorer1, GameMode.Classical);
        const scoreClassic = await databaseService.getHighScores(GameMode.Classical);
        expect(scoreClassic[0].name).to.equal('FakePlayerButCooler');
        expect(scoreClassic[0].score).to.equal(100);
    });

    it('should not updateHighScore when a new score is lower or equal than all of the current highscores in Classical', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDefaultScores();
        await databaseService.updateHighScore(fakeScorer2, GameMode.Classical);
        const scoreClassic = await databaseService.getHighScores(GameMode.Classical);
        for (const it of scoreClassic) {
            expect(it.name).to.not.equal('FakePlayer');
        }
    });

    it('should updateHighScore when a higher score has been reached in Log2990', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDefaultScores();
        await databaseService.updateHighScore(fakeScorer1, GameMode.Log2990);
        const scoreLog2990 = await databaseService.getHighScores(GameMode.Log2990);
        expect(scoreLog2990[0].name).to.equal('FakePlayerButCooler');
        expect(scoreLog2990[0].score).to.equal(100);
    });

    it('should not updateHighScore when a new score is lower or equal than all of the current highscores in Log2990', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDefaultScores();
        await databaseService.updateHighScore(fakeScorer2, GameMode.Log2990);
        const scoreLog2990 = await databaseService.getHighScores(GameMode.Log2990);
        for (const it of scoreLog2990) {
            expect(it.name).to.not.equal('FakePlayer');
        }
    });

    it('should return a random bot of the right difficulty when calling getBots', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        const botHard = await databaseService.getBots(GameDifficulty.Hard);
        const botEasy = await databaseService.getBots(GameDifficulty.Easy);
        expect(botHard).to.not.be.undefined;
        expect(botEasy).to.not.be.undefined;
    });

    it('should insert a bot when calling insertBot in hard difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertBot('Gridman', GameDifficulty.Hard);
        const bot = await databaseService.getBots(GameDifficulty.Hard);
        let botName = '';
        for (const it of bot) {
            if (it.name === 'Gridman') {
                botName = it.name;
            }
        }
        expect(botName).to.equal('Gridman');
    });

    it('should insert a bot when calling insertBot in easy difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertBot('Gridman', GameDifficulty.Easy);
        const bot = await databaseService.getBots(GameDifficulty.Easy);
        let botName = '';
        for (const it of bot) {
            if (it.name === 'Gridman') {
                botName = it.name;
            }
        }
        expect(botName).to.equal('Gridman');
    });

    it('should change the name of a bot identified with its id in hard difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertBot('Gridman', GameDifficulty.Hard);
        let botList = await databaseService.getBots(GameDifficulty.Hard);
        const bot = botList[0]._id;
        await databaseService.editBot(bot, 'Dynazenon', GameDifficulty.Hard);
        botList = await databaseService.getBots(GameDifficulty.Hard);
        let expected = '';
        for (const it of botList) {
            if (it.name === 'Dynazenon') {
                expected = it.name;
            }
        }
        expect(expected).to.equal('Dynazenon');
    });

    it('should change the name of a bot identified with its id in easy difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertBot('Gridman', GameDifficulty.Easy);
        let botList = await databaseService.getBots(GameDifficulty.Easy);
        const bot = botList[0]._id;
        await databaseService.editBot(bot, 'Dynazenon', GameDifficulty.Easy);
        botList = await databaseService.getBots(GameDifficulty.Easy);
        let expected = '';
        for (const it of botList) {
            if (it.name === 'Dynazenon') {
                expected = it.name;
            }
        }
        expect(expected).to.equal('Dynazenon');
    });

    it('should delete the bot identified with its id in hard difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertBot('Gridman', GameDifficulty.Hard);
        let botList = await databaseService.getBots(GameDifficulty.Hard);
        const botID = [botList[0]._id];
        await databaseService.deleteBots(botID, GameDifficulty.Hard);
        botList = await databaseService.getBots(GameDifficulty.Hard);
        expect(botList).to.be.empty;
    });

    it('should delete the bot identified with its id in easy difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertBot('Gridman', GameDifficulty.Easy);
        let botList = await databaseService.getBots(GameDifficulty.Easy);
        const botID = [botList[0]._id];
        await databaseService.deleteBots(botID, GameDifficulty.Easy);
        botList = await databaseService.getBots(GameDifficulty.Easy);
        expect(botList).to.be.empty;
    });

    it('should return the number of bots of the same name in each difficulty', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        for (let i = 0; i < 3; i++) {
            await databaseService.insertBot('Gridman', GameDifficulty.Hard);
        }
        for (let i = 0; i < 3; i++) {
            await databaseService.insertBot('Gridman', GameDifficulty.Easy);
        }
        const bots = await databaseService.countBots('Gridman');
        expect(bots).to.deep.equals([3, 3]);
    });

    it('should return the info of all dictionaries currently in the database when calling getDictionaryDescriptions', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDictionary(fakeDictionary.name, fakeDictionary.description, fakeDictionary.words);
        const dict = await databaseService.getDictionaryDescriptions();
        expect(dict).to.be.a('Array');
    });

    it('should return the dictionary identified with its id when calling getDictionary', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDictionary(fakeDictionary.name, fakeDictionary.description, fakeDictionary.words);
        const dict = await databaseService.getDictionaryDescriptions();
        const dictionary = await databaseService.getDictionary(dict[0]._id as string);
        expect(dictionary).to.not.be.undefined;
    });

    it('should add a dictionary to the database with the infos in parameter when calling insertDictionary', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDictionary(fakeDictionary.name, fakeDictionary.description, fakeDictionary.words);
        const dict = await databaseService.getDictionaryDescriptions();
        expect(dict).to.not.be.undefined;
    });

    it('should change the name and description of a dictionary in the database when calling editDictionary', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDictionary(fakeDictionary.name, fakeDictionary.description, fakeDictionary.words);
        let dict = await databaseService.getDictionaryDescriptions();
        await databaseService.editDictionary(dict[0]._id as string, 'bible', 'God sees all');
        dict = await databaseService.getDictionaryDescriptions();
        expect(dict[0].name).to.equal('bible');
        expect(dict[0].description).to.equal('God sees all');
    });

    it('should delete the dictionary identified with its id when calling deleteDictionaries', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        await databaseService.insertDictionary(fakeDictionary.name, fakeDictionary.description, fakeDictionary.words);
        let dict = await databaseService.getDictionaryDescriptions();
        expect(dict).to.not.be.empty;
        await databaseService.deleteDictionaries([dict[0]._id as string]);
        dict = await databaseService.getDictionaryDescriptions();
        expect(dict).to.be.empty;
    });

    it('should reset the database when calling resetDB', async () => {
        const mongoUri = await mongoServer.getUri();
        await databaseService.databaseConnect(mongoUri);
        setTimeout(() => {
            databaseService.insertDefaultScores();
        }, 5000);
        setTimeout(() => {
            databaseService.resetDB();
        }, 5000);
        const scoreLog2990 = await databaseService.getHighScores(GameMode.Log2990);
        expect(scoreLog2990).to.be.empty;
    });
});
