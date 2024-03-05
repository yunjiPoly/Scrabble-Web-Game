import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { DEFAULT_BOT_NAMES } from '@app/classes/config';
import { GameDifficulty } from '@app/classes/game-info';
import { DatabaseService } from '@app/services/database.service';
import { StatusCodes } from 'http-status-codes';

@Service()
export class BotController {
    router: Router;

    constructor(private dbService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', (req: Request, res: Response) => {
            const { difficulty } = req.query;
            if (difficulty === undefined) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            const names = (difficulty === String(GameDifficulty.Easy) ? DEFAULT_BOT_NAMES.easy : DEFAULT_BOT_NAMES.hard).map((name, id) => {
                return { id: String(id), name, default: true };
            });
            this.dbService
                .getBots(Number(difficulty))
                .then((customNames) => {
                    res.json(
                        names.concat(
                            customNames.map((bot) => {
                                // eslint-disable-next-line no-underscore-dangle
                                return { id: bot._id, name: bot.name, default: false };
                            }),
                        ),
                    );
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });

        this.router.post('/', (req: Request, res: Response) => {
            const { name, difficulty } = req.body;
            if (name === undefined || difficulty === undefined) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            this.dbService
                .countBots(name)
                .then(([easyCount, hardCount]) => {
                    if (easyCount + hardCount > 0 || [...DEFAULT_BOT_NAMES.easy, ...DEFAULT_BOT_NAMES.hard].some((botName) => botName === name)) {
                        res.sendStatus(StatusCodes.CONFLICT);
                        return;
                    }
                    this.dbService
                        .insertBot(name, difficulty)
                        .then(() => res.sendStatus(StatusCodes.OK))
                        .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });

        this.router.put('/', (req: Request, res: Response) => {
            const { id, name, difficulty } = req.body;
            if (id === undefined || name === undefined || difficulty === undefined) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            this.dbService
                .countBots(name)
                .then(([easyCount, hardCount]) => {
                    if (easyCount + hardCount > 0 || [...DEFAULT_BOT_NAMES.easy, ...DEFAULT_BOT_NAMES.hard].some((botName) => botName === name)) {
                        res.status(StatusCodes.CONFLICT).json();
                    } else {
                        this.dbService
                            .editBot(id, name, difficulty)
                            .then((updateResult) => {
                                res.sendStatus(updateResult.matchedCount ? StatusCodes.OK : StatusCodes.NOT_FOUND);
                            })
                            .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
                    }
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });

        this.router.delete('/', (req: Request, res: Response) => {
            const { ids, difficulty } = req.body;
            if (!ids || difficulty === undefined) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            this.dbService
                .deleteBots(ids, difficulty)
                .then((deleteResult) => {
                    res.sendStatus(deleteResult.deletedCount ? StatusCodes.OK : StatusCodes.NOT_FOUND);
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });
    }
}
