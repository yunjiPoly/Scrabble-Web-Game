import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export type DialogText = { title: string; action: string; cancel: string };

@Component({
    selector: 'app-database-reset-dialog',
    templateUrl: './basic-action-dialog.component.html',
    styleUrls: ['../../styles.scss', './basic-action-dialog.component.scss'],
})
export class BasicActionDialogComponent {
    constructor(public dialogRef: MatDialogRef<BasicActionDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: DialogText) {}
}
