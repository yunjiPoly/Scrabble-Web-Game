import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { BasicActionDialogComponent } from '@app/components/basic-action-dialog/basic-action-dialog.component';
import { AlertService } from '@app/services/alert.service';
import { HttpService } from '@app/services/http.service';
import { BotName, Dictionary, GameDifficulty } from '@app/classes/game-info';
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '@app/classes/config';

type Page = 'dict' | 'bot';

@Component({
    selector: 'app-admin-page',
    templateUrl: './admin-page.component.html',
    styleUrls: ['../../styles.scss', './admin-page.component.scss'],
})
export class AdminPageComponent {
    @ViewChild('upload') private upload: ElementRef;
    @ViewChild('download') private download: ElementRef;

    page: Page = 'dict';
    dictData: Dictionary[];
    botData: BotName[];
    botDifficulty = GameDifficulty.Easy;

    constructor(public dialog: MatDialog, private alertService: AlertService, private httpService: HttpService, private router: Router) {}

    openResetDialog(): void {
        const dialogRef = this.dialog.open(BasicActionDialogComponent, {
            data: { title: 'Réinitialiser le système?', action: 'Réinitialiser', cancel: 'Annuler' },
        });
        dialogRef.afterClosed().subscribe((reset) => {
            if (reset) {
                this.httpService.resetDB().subscribe({
                    next: () => this.alertService.showAlert('Le système a été réinitialisé'),
                    complete: () => {
                        this.getBots();
                        this.getDicts();
                    },
                });
            }
        });
    }

    showHomePage(): void {
        this.router.navigateByUrl('/home');
    }

    getBots(): void {
        this.httpService.getBots(this.botDifficulty).subscribe((res) => {
            this.botData = res as BotName[];
        });
    }

    addBot(name: string): void {
        this.httpService.addBot(name, this.botDifficulty).subscribe({
            complete: () => this.getBots(),
        });
    }

    deleteBots(ids: string[]): void {
        this.httpService.deleteBots(ids, this.botDifficulty).subscribe({
            complete: () => this.getBots(),
        });
    }

    editBot(bot: Partial<BotName>): void {
        this.httpService.editBot(bot.id as string, bot.name as string, this.botDifficulty).subscribe({
            complete: () => this.getBots(),
        });
    }

    getDicts(): void {
        this.httpService.getDicts().subscribe((res) => {
            this.dictData = res as Dictionary[];
        });
    }

    addDict(name: string, description: string, words: string[]): void {
        this.httpService.addDict(name, description, words).subscribe({
            complete: () => this.getDicts(),
        });
    }

    deleteDicts(ids: string[]): void {
        this.httpService.deleteDicts(ids).subscribe({
            complete: () => this.getDicts(),
        });
    }

    editDict(dict: Partial<Dictionary>): void {
        this.httpService.editDict(dict.id as string, dict.name as string, dict.description as string).subscribe({
            complete: () => this.getDicts(),
        });
    }

    downloadDict(id: string) {
        this.httpService.downloadDict(id).subscribe((res) => {
            const name = (res as Dictionary).name;
            const blob = new Blob([JSON.stringify(res, null, JSON_INDENT)], { type: 'application/json' });
            const objectURL = URL.createObjectURL(blob);
            this.download.nativeElement.href = objectURL;
            this.download.nativeElement.download = name;
            this.download.nativeElement.click();
            URL.revokeObjectURL(objectURL);
        });
    }

    handleFile() {
        this.getDicts();
        const file: File = this.upload.nativeElement.files?.item(0);
        if (!file) {
            this.alertService.showGenericError();
            return;
        }
        if (file.type !== 'application/json') {
            this.alertService.showAlert('Le dictionnaire doit être un fichier de format JSON');
            return;
        }
        file.text()
            .then((fileText) => {
                this.parseFile(JSON.parse(fileText));
            })
            .catch(() => {
                this.alertService.showGenericError();
            });
    }

    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    private parseFile(file: any) {
        if (!file.name) {
            this.alertService.showAlert("Le dictionnaire n'a pas de nom");
            return;
        }
        if (file.name.length > MAX_NAME_LENGTH) {
            this.alertService.showAlert(`Le nom du dictionnaire ne peut dépasser ${MAX_NAME_LENGTH} caractères`);
            return;
        }
        if (this.dictData.some((dictionary) => dictionary.name === file.name)) {
            this.alertService.showAlert(`Un dictionnaire avec le nom ${file.name} existe déjà`);
            return;
        }
        if (!file.description) {
            this.alertService.showAlert("Le dictionnaire n'a pas de description");
            return;
        }
        if (file.description.length > MAX_DESCRIPTION_LENGTH) {
            this.alertService.showAlert(`La description du dictionnaire ne peut dépasser ${MAX_DESCRIPTION_LENGTH} caractères`);
            return;
        }
        if (file.words.length === 0) {
            this.alertService.showAlert('Le dictionnaire ne contient aucun mot');
            return;
        }
        this.addDict(file.name, file.description, file.words);
    }
}

const JSON_INDENT = 4;
