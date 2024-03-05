import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { GameInfo, GameMode } from '@app/classes/game-info';
import { GameBrowserDialogComponent } from '@app/components/game-browser-dialog/game-browser-dialog.component';

@Component({
    selector: 'app-game-browser[gameList]',
    templateUrl: './game-browser.component.html',
    styleUrls: ['../../styles.scss', './game-browser.component.scss'],
})
export class GameBrowserComponent implements OnInit {
    @Input() gameMode: number;
    @Input() gameList: Observable<GameInfo[]>;
    @Output() readonly buttonClick = new EventEmitter<string>();
    @Output() readonly joinRoom = new EventEmitter<Partial<GameInfo>>();
    @ViewChild(MatTable) table: MatTable<GameInfo>;

    readonly tableColumns: string[] = ['username', 'turnLength', 'randomized', 'roomID'];
    tableData: MatTableDataSource<GameInfo>;

    constructor(public dialog: MatDialog) {}

    ngOnInit(): void {
        this.tableData = new MatTableDataSource();
        this.gameList.subscribe((gameList) => {
            this.tableData.data = gameList.filter((game) => game.gameMode === this.gameMode);
        });
    }

    formatTime(time: number): string {
        return `${Math.floor(time / MINUTE)}:${time % MINUTE === 0 ? '00' : time % MINUTE}`;
    }

    selectRoom(gameInfo?: GameInfo): void {
        if (gameInfo === undefined) {
            const games = this.tableData.data;
            gameInfo = games[Math.floor(Math.random() * games.length)];
        }
        const dialogRef = this.dialog.open(GameBrowserDialogComponent, {
            data: gameInfo,
        });
        dialogRef.afterClosed().subscribe((username) => {
            if (username !== undefined) {
                this.joinRoom.emit({ username, roomID: gameInfo?.roomID });
            }
        });
    }

    getTitle(): string {
        return this.gameMode === GameMode.Classical ? 'Mode Classique' : 'Mode LOG2990';
    }
}

const MINUTE = 60;
