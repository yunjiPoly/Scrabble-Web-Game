import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { GameDifficulty } from '@app/classes/game-info';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-waiting-room-dialog',
    templateUrl: './waiting-room-dialog.component.html',
    styleUrls: ['../../styles.scss', './waiting-room-dialog.component.scss'],
})
export class WaitingRoomDialogComponent {
    readonly difficulties = GameDifficulty;
    readonly form: FormGroup;

    constructor(public dialogRef: MatDialogRef<WaitingRoomDialogComponent>, private formBuilder: FormBuilder) {
        this.form = this.formBuilder.group({
            difficulty: ['', Validators.required],
        });
    }
}
