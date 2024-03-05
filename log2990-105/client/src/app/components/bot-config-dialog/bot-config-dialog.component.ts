import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BotName } from '@app/classes/game-info';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/classes/config';
import { NameControl } from '@app/classes/validators';
import { DialogAction, DialogResult } from '@app/components/bot-config/bot-config.component';

@Component({
    selector: 'app-bot-config-dialog',
    templateUrl: './bot-config-dialog.component.html',
    styleUrls: ['../../styles.scss', './bot-config-dialog.component.scss'],
})
export class BotConfigDialogComponent {
    readonly formGroup: FormGroup;
    private nameControl: NameControl;

    constructor(
        public dialogRef: MatDialogRef<BotConfigDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { action: DialogAction; target?: Partial<BotName>; params?: Partial<BotName>[] },
        private formBuilder: FormBuilder,
    ) {
        this.nameControl = new NameControl(data.action !== 'delete' ? data.params?.map((bot) => bot.name as string) : []);
        this.formGroup = this.formBuilder.group({
            name: [
                '',
                [Validators.required, Validators.minLength(MIN_NAME_LENGTH), Validators.maxLength(MAX_NAME_LENGTH), this.nameControl.validator],
            ],
        });
    }

    confirm(confirmation: boolean): DialogResult {
        return { confirmation, value: this.field.value };
    }

    get title(): string {
        return this.data.action === 'delete'
            ? `Supprimer ${(this.data.params?.length as number) > 1 ? 'ces noms' : (this.data.params as BotName[])[0].name}?`
            : this.data.action === 'edit'
            ? `Modifier ${this.data.target?.name}`
            : 'Ajouter un joueur virtuel';
    }

    get action(): string {
        return this.data.action === 'delete' ? 'Supprimer' : this.data.action === 'edit' ? 'Modifier' : 'Ajouter';
    }

    get field() {
        return this.formGroup.controls.name;
    }

    get label(): string {
        return `Entrez un ${this.data.action === 'edit' ? 'nouveau nom' : 'nom'}`;
    }

    get hint(): string {
        return this.formGroup.touched ? '' : `Entre ${MIN_NAME_LENGTH} et ${MAX_NAME_LENGTH} caractères`;
    }

    get error(): string {
        if (this.field.hasError('required')) {
            return `Entre ${MIN_NAME_LENGTH} et ${MAX_NAME_LENGTH} caractères`;
        }
        if (this.field.hasError('minlength')) {
            return `Le nom doit contenir au moins ${MIN_NAME_LENGTH} caractères`;
        }
        if (this.field.hasError('maxlength')) {
            return `Le nom peut contenir au plus ${MAX_NAME_LENGTH} caractères`;
        }
        if (this.field.hasError('forbiddenName')) {
            return 'Ce nom existe déjà';
        }
        return '';
    }
}
