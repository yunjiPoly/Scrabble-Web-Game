import { Component, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { HighScore } from '@app/classes/highscore';
import { GameMode } from '@app/classes/game-info';

@Component({
    selector: 'app-scoreboard',
    templateUrl: './scoreboard.component.html',
    styleUrls: ['./scoreboard.component.scss', '../../styles.scss'],
})
export class ScoreboardComponent implements AfterViewInit {
    @Output() readonly buttonClick = new EventEmitter<string>();
    highScoreClassic: HighScore[];
    highScoreLog2990: HighScore[];
    displayedColumns: string[] = ['position', 'name', 'score'];

    constructor(private httpService: HttpService) {}

    ngAfterViewInit() {
        this.httpService.getHighScores(GameMode.Classical).subscribe((res) => {
            this.highScoreClassic = res as HighScore[];
        });
        this.httpService.getHighScores(GameMode.Log2990).subscribe((res) => {
            this.highScoreLog2990 = res as HighScore[];
        });
    }
}
