import { HttpException } from '@app/classes/http.exception';
import { BotController } from '@app/controllers/bot.controller';
import { ScoreController } from '@app/controllers/score.controller';
import { DictionaryController } from '@app/controllers/dictionary.controller';
import { DateController } from '@app/controllers/date.controller';
import { ExampleController } from '@app/controllers/example.controller';
import { DatabaseService } from '@app/services/database.service';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import { StatusCodes } from 'http-status-codes';
import logger from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Service } from 'typedi';
import { MongoServerError } from 'mongodb';

@Service()
export class Application {
    app: express.Application;
    private readonly internalError: number = StatusCodes.INTERNAL_SERVER_ERROR;
    private readonly swaggerOptions: swaggerJSDoc.Options;

    constructor(
        private readonly dbService: DatabaseService,
        private readonly botController: BotController,
        private readonly scoreController: ScoreController,
        private readonly dictController: DictionaryController,
        private readonly exampleController: ExampleController,
        private readonly dateController: DateController,
    ) {
        this.app = express();

        this.swaggerOptions = {
            swaggerDefinition: {
                openapi: '3.0.0',
                info: {
                    title: 'Cadriciel Serveur',
                    version: '1.0.0',
                },
            },
            apis: ['**/*.ts'],
        };

        this.config();

        this.bindRoutes();
    }

    bindRoutes(): void {
        this.app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerJSDoc(this.swaggerOptions)));
        this.app.use('/api/bot', this.botController.router);
        this.app.use('/api/score', this.scoreController.router);
        this.app.use('/api/dict', this.dictController.router);
        this.app.use('/api/example', this.exampleController.router);
        this.app.use('/api/date', this.dateController.router);
        /* eslint-disable @typescript-eslint/no-magic-numbers */
        this.app.delete('/api', (req, res) => {
            this.dbService
                .resetDB()
                .then((collections) => {
                    if (!collections.every((dropped) => dropped)) {
                        res.sendStatus(500);
                        return;
                    }
                    this.dbService.insertDefaultScores().finally(() => res.sendStatus(200));
                })
                .catch((err) => {
                    if (err instanceof MongoServerError && err.code === 26) {
                        this.dbService.insertDefaultScores().finally(() => res.sendStatus(200));
                        return;
                    }
                    res.sendStatus(500);
                });
        });
        /* eslint-enable @typescript-eslint/no-magic-numbers */
        this.errorHandling();
    }

    private config(): void {
        // Middlewares configuration
        this.app.use(logger('dev'));
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());
        this.app.use(cors());
    }

    private errorHandling(): void {
        // When previous handlers have not served a request: path wasn't found
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const err: HttpException = new HttpException('Not Found');
            next(err);
        });

        // development error handler
        // will print stacktrace
        if (this.app.get('env') === 'development') {
            this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
                res.status(err.status || this.internalError);
                res.send({
                    message: err.message,
                    error: err,
                });
            });
        }

        // production error handler
        // no stacktraces leaked to user (in production env only)
        this.app.use((err: HttpException, req: express.Request, res: express.Response) => {
            res.status(err.status || this.internalError);
            res.send({
                message: err.message,
                error: {},
            });
        });
    }
}
