import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-end-game',
    templateUrl: './end-game.component.html',
    styleUrls: ['./end-game.component.scss', '../panneau-info/panneau-info.component.scss'],
})
export class EndGameComponent {
    @Input() winnerMessage: string = '';

    redirectTo() {
        window.location.reload();
    }
}
