import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { GameInfo } from '@app/classes/game-info';
import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '@app/classes/config';

@Component({
    selector: 'app-game-browser-dialog',
    templateUrl: './game-browser-dialog.component.html',
    styleUrls: ['../../styles.scss', './game-browser-dialog.component.scss'],
})
export class GameBrowserDialogComponent {
    readonly form: FormGroup;

    constructor(
        public dialogRef: MatDialogRef<GameBrowserDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: GameInfo,
        private formBuilder: FormBuilder,
    ) {
        this.form = this.formBuilder.group({
            username: [
                '',
                [
                    Validators.required,
                    Validators.minLength(MIN_NAME_LENGTH),
                    Validators.maxLength(MAX_NAME_LENGTH),
                    this.forbiddenNameValidator(this.data.username),
                ],
            ],
        });
    }

    forbiddenNameValidator(forbiddenName: string): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const forbidden = control.value === forbiddenName;
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        };
    }

    get nameHint(): string {
        return `Entrer un nom entre ${MIN_NAME_LENGTH} et ${MAX_NAME_LENGTH} caractères`;
    }

    get nameError(): string {
        if (this.username.hasError('required')) {
            return 'Veuillez entrer un nom';
        }
        if (this.username.hasError('minlength')) {
            return `Le nom doit contenir au moins ${MIN_NAME_LENGTH} caractères`;
        }
        if (this.username.hasError('maxlength')) {
            return `Le nom ne peut dépasser ${MAX_NAME_LENGTH} caractères`;
        }
        if (this.username.hasError('forbiddenName')) {
            return "Le nom doit être différent de celui de l'adversaire";
        }
        return '';
    }

    get username() {
        return this.form.controls.username;
    }
}
