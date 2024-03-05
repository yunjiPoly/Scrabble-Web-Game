import { Service } from 'typedi';
import { Request, Response, Router } from 'express';
import { DatabaseService } from '@app/services/database.service';
import { DEFAULT_DICTIONARY } from '@app/classes/config';
import { StatusCodes } from 'http-status-codes';

@Service()
export class DictionaryController {
    router: Router;

    constructor(private dbService: DatabaseService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/', (req: Request, res: Response) => {
            // eslint-disable-next-line no-underscore-dangle
            const dictionaries = [{ id: DEFAULT_DICTIONARY._id, name: DEFAULT_DICTIONARY.name, description: DEFAULT_DICTIONARY.description }];
            this.dbService
                .getDictionaryDescriptions()
                .then((customDictionaries) => {
                    res.json(
                        dictionaries.concat(
                            customDictionaries.map((dictionary) => {
                                return {
                                    // eslint-disable-next-line no-underscore-dangle
                                    id: dictionary._id as string,
                                    name: dictionary.name as string,
                                    description: dictionary.description as string,
                                };
                            }),
                        ),
                    );
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });

        this.router.post('/', (req: Request, res: Response) => {
            const { name, description, words } = req.body;
            if (!name || !description || !words) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            this.dbService
                .countDictionaries(name)
                .then((count) => {
                    if (count > 0) {
                        res.sendStatus(StatusCodes.CONFLICT);
                        return;
                    }
                    this.dbService
                        .insertDictionary(name, description, words)
                        .then(() => res.sendStatus(StatusCodes.OK))
                        .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });

        this.router.put('/', (req: Request, res: Response) => {
            const { id, name, description } = req.body;
            if (!name || !description || !id) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            this.dbService
                .countDictionaries(name)
                .then((count) => {
                    if (count > 0) {
                        res.sendStatus(StatusCodes.CONFLICT);
                        return;
                    }
                    this.dbService
                        .editDictionary(id, name, description)
                        .then((updateResult) => {
                            res.sendStatus(updateResult.matchedCount ? StatusCodes.OK : StatusCodes.NOT_FOUND);
                        })
                        .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });

        this.router.delete('/', (req: Request, res: Response) => {
            const { ids } = req.body;
            if (!ids) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            this.dbService
                .deleteDictionaries(ids)
                .then((deleteResult) => {
                    res.sendStatus(deleteResult.deletedCount ? StatusCodes.OK : StatusCodes.NOT_FOUND);
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });

        this.router.get('/download', (req: Request, res: Response) => {
            const { id } = req.query;
            if (id === undefined) {
                res.sendStatus(StatusCodes.BAD_REQUEST);
                return;
            }
            // eslint-disable-next-line no-underscore-dangle
            if (id === DEFAULT_DICTIONARY._id) {
                res.json({
                    name: DEFAULT_DICTIONARY.name,
                    description: DEFAULT_DICTIONARY.description,
                    words: DEFAULT_DICTIONARY.words,
                });
                return;
            }
            this.dbService
                .getDictionary(id as string)
                .then((dictionary) => {
                    if (!dictionary) {
                        res.sendStatus(StatusCodes.NOT_FOUND);
                        return;
                    }
                    const { name, description, words } = dictionary;
                    res.json({
                        name,
                        description,
                        words,
                    });
                })
                .catch(() => res.sendStatus(StatusCodes.INTERNAL_SERVER_ERROR));
        });
    }
}
