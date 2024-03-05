import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NameControl } from '@app/classes/validators';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DialogAction, DialogResult } from '@app/components/dict-config/dict-config.component';
import { Dictionary } from '@app/classes/game-info';
import { MAX_DESCRIPTION_LENGTH, MAX_NAME_LENGTH } from '@app/classes/config';

@Component({
    selector: 'app-dict-config-dialog',
    templateUrl: './dict-config-dialog.component.html',
    styleUrls: ['../../styles.scss', './dict-config-dialog.component.scss'],
})
export class DictConfigDialogComponent {
    readonly formGroup: FormGroup;
    private nameControl: NameControl;

    constructor(
        public dialogRef: MatDialogRef<DictConfigDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { action: DialogAction; target?: Dictionary; params?: Dictionary[] },
        private formBuilder: FormBuilder,
    ) {
        this.nameControl = new NameControl(data.action === 'edit' ? data.params?.map((dict) => dict.name as string) : []);
        this.formGroup = this.formBuilder.group({
            name: [data.target?.name, [Validators.required, Validators.maxLength(MAX_NAME_LENGTH), this.nameControl.validator]],
            description: [data.target?.description, [Validators.maxLength(MAX_DESCRIPTION_LENGTH)]],
        });
    }

    confirm(confirmation: boolean): DialogResult {
        return { confirmation, name: this.name.value, description: this.description.value };
    }

    get title(): string {
        return this.data.action === 'delete'
            ? `Supprimer ${(this.data.params?.length as number) > 1 ? 'ces dictionnaires' : (this.data.params as Dictionary[])[0].name}?`
            : `Modifier ${this.data.target?.name}`;
    }

    get action(): string {
        return this.data.action === 'delete' ? 'Supprimer' : 'Modifier';
    }

    get name() {
        return this.formGroup.controls.name;
    }

    get nameLabel(): string {
        return 'Nom';
    }

    get nameError(): string {
        if (this.name.hasError('required')) {
            return `Entrez un nom de ${MAX_NAME_LENGTH} caractères ou moins`;
        }
        if (this.name.hasError('maxlength')) {
            return `Le nom ne peut dépasser ${MAX_NAME_LENGTH} caractères`;
        }
        if (this.name.hasError('forbiddenName')) {
            return 'Un dictionnaire avec ce nom existe déjà';
        }
        return '';
    }

    get description() {
        return this.formGroup.controls.description;
    }

    get descriptionLabel(): string {
        return 'Description';
    }

    get descriptionError(): string {
        if (this.description.hasError('maxlength')) {
            return `La description ne peut dépasser ${MAX_DESCRIPTION_LENGTH} caractères`;
        }
        return '';
    }
}
