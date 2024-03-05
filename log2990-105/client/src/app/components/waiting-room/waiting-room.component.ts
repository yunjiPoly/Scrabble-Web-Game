import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { WaitingRoomDialogComponent } from '@app/components/waiting-room-dialog/waiting-room-dialog.component';
import { GameInfo } from '@app/classes/game-info';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['../../styles.scss', './waiting-room.component.scss'],
})
export class WaitingRoomComponent {
    @Output() buttonClick = new EventEmitter<string>();
    @Output() convertGame = new EventEmitter<number>();
    @Input() configs: Partial<GameInfo>;

    constructor(public dialog: MatDialog) {}

    openDialog(): void {
        const dialogRef = this.dialog.open(WaitingRoomDialogComponent);
        dialogRef.afterClosed().subscribe((difficulty) => {
            if (difficulty === undefined) {
                return;
            }
            this.convertGame.emit(difficulty);
        });
    }
}
