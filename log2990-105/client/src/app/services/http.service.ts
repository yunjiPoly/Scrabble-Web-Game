import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { environment } from '@env/environment';
import { catchError, timeout } from 'rxjs/operators';
import { DEFAULT_TIMEOUT } from '@app/classes/config';
import { EMPTY, throwError, TimeoutError } from 'rxjs';
import { AlertService } from '@app/services/alert.service';

const basePath = `${environment.serverUrl}/api`;
const scorePath = `${basePath}/score`;
const botPath = `${basePath}/bot`;
const dictPath = `${basePath}/dict`;

@Injectable({
    providedIn: 'root',
})
export class HttpService {
    constructor(private alertService: AlertService, private http: HttpClient) {}

    getHighScores(gameMode: number) {
        return this.http.get(scorePath, { params: { gameMode }, responseType: 'json' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) => this.catchAnyHttpError(err)),
            catchError((err) => this.catchTimeoutError(err)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    getBots(difficulty: number) {
        return this.http.get(botPath, { params: { difficulty }, responseType: 'json' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) => this.catchAnyHttpError(err)),
            catchError((err) => this.catchTimeoutError(err)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    addBot(name: string, difficulty: number) {
        return this.http.post(botPath, { name, difficulty }, { responseType: 'text' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.Conflict, () => {
                    this.alertService.showAlert(`Un joueur virtuel avec le nom ${name} existe déjà`);
                }),
            ),
            catchError((err) => this.catchAnyHttpError(err, true)),
            catchError((err) => this.catchTimeoutError(err, true)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    deleteBots(ids: string[], difficulty: number) {
        return this.http.delete(botPath, { body: { ids, difficulty }, responseType: 'text' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.NotFound, () => {
                    this.alertService.showAlert(
                        `${ids.length > 1 ? 'Les joueurs virtuels' : 'Le joueur virtuel'} que vous voulez supprimer n'existe pas`,
                    );
                }),
            ),
            catchError((err) => this.catchAnyHttpError(err, true)),
            catchError((err) => this.catchTimeoutError(err, true)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    editBot(id: string, name: string, difficulty: number) {
        return this.http.put(botPath, { id, name, difficulty }, { responseType: 'text' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.Conflict, () => {
                    this.alertService.showAlert(`Un joueur virtuel avec le nom ${name} existe déjà`);
                }),
            ),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.NotFound, () => {
                    this.alertService.showAlert("Le joueur virtuel que vous voulez modifier n'existe pas");
                }),
            ),
            catchError((err) => this.catchAnyHttpError(err, true)),
            catchError((err) => this.catchTimeoutError(err, true)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    getDicts() {
        return this.http.get(dictPath, { responseType: 'json' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) => this.catchAnyHttpError(err)),
            catchError((err) => this.catchTimeoutError(err)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    addDict(name: string, description: string, words: string[]) {
        return this.http.post(dictPath, { name, description, words }, { responseType: 'text' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.PayloadTooLarge, () => {
                    this.alertService.showAlert('Le dictionnaire est trop large');
                }),
            ),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.Conflict, () => {
                    this.alertService.showAlert(`Un dictionnaire avec le nom ${name} existe déjà`);
                }),
            ),
            catchError((err) => this.catchAnyHttpError(err, true)),
            catchError((err) => this.catchTimeoutError(err, true)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    deleteDicts(ids: string[]) {
        return this.http.delete(dictPath, { body: { ids }, responseType: 'text' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.NotFound, () => {
                    this.alertService.showAlert(`${ids.length > 1 ? 'Les dictionnaires' : 'Le dictionnaire'} que vous voulez supprimer n'existe pas`);
                }),
            ),
            catchError((err) => this.catchAnyHttpError(err, true)),
            catchError((err) => this.catchTimeoutError(err, true)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    editDict(id: string, name: string, description: string) {
        return this.http.put(dictPath, { id, name, description }, { responseType: 'text' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.Conflict, () => {
                    this.alertService.showAlert(`Un dictionnaire le nom ${name} existe déjà`);
                }),
            ),
            catchError((err) =>
                this.catchHttpErrorWithStatus(err, HttpStatusCode.NotFound, () => {
                    this.alertService.showAlert("Le dictionnaire que vous voulez modifier n'existe pas");
                }),
            ),
            catchError((err) => this.catchAnyHttpError(err, true)),
            catchError((err) => this.catchTimeoutError(err, true)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    downloadDict(id: string) {
        return this.http.get(`${dictPath}/download`, { params: { id }, responseType: 'json' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) => this.catchAnyHttpError(err)),
            catchError((err) => this.catchTimeoutError(err)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    resetDB() {
        return this.http.delete(basePath, { responseType: 'text' }).pipe(
            timeout(DEFAULT_TIMEOUT),
            catchError((err) => this.catchAnyHttpError(err)),
            catchError((err) => this.catchTimeoutError(err)),
            catchError((err) => this.catchUnexpectedError(err, HttpErrorResponse, TimeoutError)),
        );
    }

    catchHttpErrorWithStatus(err: Error, status: number, callback?: (err: HttpErrorResponse) => void) {
        if (!(err instanceof HttpErrorResponse) || err.status !== status) {
            return throwError(err);
        }
        if (callback) callback(err);
        return EMPTY;
    }

    catchAnyHttpError(err: Error, propagate: boolean = false) {
        if (!(err instanceof HttpErrorResponse)) {
            return throwError(err);
        }
        this.alertService.showAlert('Le serveur est présentement inaccessible');
        return propagate ? throwError(err) : EMPTY;
    }

    catchTimeoutError(err: Error, propagate: boolean = false) {
        if (!(err instanceof TimeoutError)) {
            return throwError(err);
        }
        this.alertService.showAlert('Le serveur est présentement inaccessible');
        return propagate ? throwError(err) : EMPTY;
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    catchUnexpectedError(err: Error, ...expectedTypes: any[]) {
        if (expectedTypes.some((expectedType) => err instanceof expectedType)) {
            return throwError(err);
        }
        this.alertService.showGenericError();
        return EMPTY;
    }
}
