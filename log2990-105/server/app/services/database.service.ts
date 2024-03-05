import { Service } from 'typedi';
import { MongoClient, Db, Document, ObjectId } from 'mongodb';
import { HighScore } from '@app/classes/highscore';
import { DATABASE, DEFAULT_HIGH_SCORES } from '@app/classes/config';
import { BotName, Dictionary, GameDifficulty, GameMode } from '@app/classes/game-info';

@Service()
export class DatabaseService {
    private client: MongoClient;

    private highScoreDB: Db;
    private botDB: Db;
    private dictDB: Db;

    async databaseConnect(url: string): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url);
            this.client = client;
            this.highScoreDB = client.db(DATABASE.highScore.name);
            this.botDB = client.db(DATABASE.bot.name);
            this.dictDB = client.db(DATABASE.dict.name);
        } catch {
            throw new Error('Database connection error');
        }
        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async getHighScores(gameMode: number): Promise<HighScore[]> {
        return this.highScoreDB
            .collection(DATABASE.highScore.collections[gameMode === GameMode.Classical ? 'classical' : 'log2990'])
            .find({})
            .sort({ score: -1 })
            .toArray()
            .then((score: HighScore[]) => {
                return score;
            });
    }

    async insertDefaultScores(): Promise<void> {
        await Promise.all([
            this.highScoreDB.collection(DATABASE.highScore.collections.classical).insertMany(DEFAULT_HIGH_SCORES.classical),
            this.highScoreDB.collection(DATABASE.highScore.collections.log2990).insertMany(DEFAULT_HIGH_SCORES.log2990),
        ]);
    }

    async updateHighScore(highScore: HighScore, gameMode: number): Promise<void> {
        const collection = DATABASE.highScore.collections[gameMode === GameMode.Classical ? 'classical' : 'log2990'];
        const lowestScore = await this.highScoreDB.collection(collection).find({}).sort({ score: 1 }).limit(1).toArray();
        if (highScore.score > lowestScore[0].score) {
            this.highScoreDB.collection(collection).insertOne(highScore);
            // eslint-disable-next-line no-underscore-dangle
            this.highScoreDB.collection(collection).deleteOne({ _id: (lowestScore[0] as Document)._id });
        }
    }

    async getBots(difficulty: number): Promise<BotName[]> {
        return this.botDB
            .collection(DATABASE.bot.collections[difficulty === GameDifficulty.Easy ? 'easy' : 'hard'])
            .find({})
            .toArray();
    }

    async insertBot(name: string, difficulty: number) {
        return this.botDB.collection(DATABASE.bot.collections[difficulty === GameDifficulty.Easy ? 'easy' : 'hard']).insertOne({ name });
    }

    async editBot(id: string, name: string, difficulty: number) {
        return this.botDB
            .collection(DATABASE.bot.collections[difficulty === GameDifficulty.Easy ? 'easy' : 'hard'])
            .updateOne({ _id: new ObjectId(id) }, { $set: { name } });
    }

    async deleteBots(ids: string[], difficulty: number) {
        return this.botDB
            .collection(DATABASE.bot.collections[difficulty === GameDifficulty.Easy ? 'easy' : 'hard'])
            .deleteMany({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    async countBots(name: string): Promise<[number, number]> {
        return Promise.all([
            this.botDB.collection(DATABASE.bot.collections.easy).countDocuments({ name }),
            this.botDB.collection(DATABASE.bot.collections.hard).countDocuments({ name }),
        ]);
    }

    async getDictionaryDescriptions(): Promise<Partial<Dictionary>[]> {
        return this.dictDB.collection(DATABASE.dict.collection).find().project({ name: 1, description: 1 }).toArray();
    }

    async getDictionary(id: string) {
        return this.dictDB.collection(DATABASE.dict.collection).findOne({ _id: new ObjectId(id) });
    }

    async insertDictionary(name: string, description: string, words: string[]) {
        return this.dictDB.collection(DATABASE.dict.collection).insertOne({ name, description, words });
    }

    async editDictionary(id: string, name: string, description: string) {
        return this.dictDB.collection(DATABASE.dict.collection).updateOne({ _id: new ObjectId(id) }, { $set: { name, description } });
    }

    async deleteDictionaries(ids: string[]) {
        return this.dictDB.collection(DATABASE.dict.collection).deleteMany({ _id: { $in: ids.map((id) => new ObjectId(id)) } });
    }

    async countDictionaries(name: string, id?: string) {
        return this.dictDB.collection(DATABASE.dict.collection).countDocuments({ _id: id ? { $ne: new ObjectId(id) } : {}, name });
    }

    async resetDB() {
        return Promise.all([
            this.botDB.dropCollection(DATABASE.bot.collections.easy),
            this.botDB.dropCollection(DATABASE.bot.collections.hard),
            this.highScoreDB.dropCollection(DATABASE.highScore.collections.classical),
            this.highScoreDB.dropCollection(DATABASE.highScore.collections.log2990),
            this.dictDB.dropCollection(DATABASE.dict.collection),
        ]);
    }
}
