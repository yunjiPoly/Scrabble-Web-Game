import { Component, EventEmitter, Input, Output } from '@angular/core';
import { GameMode } from '@app/classes/game-info';
import { MenuButton } from '@app/classes/menu-button';

@Component({
    selector: 'app-main-menu',
    templateUrl: './main-menu.component.html',
    styleUrls: ['../../styles.scss', './main-menu.component.scss'],
})
export class MainMenuComponent {
    @Input() gameMode: number;
    @Input() gameType: number;
    @Output() readonly buttonClick = new EventEmitter<string>();

    readonly mainMenu: MenuButton[] = [
        { name: 'Classical', text: 'Scrabble Classique' },
        { name: 'Log2990', text: 'Scrabble LOG2990' },
        { name: 'Scoreboard', text: 'Meilleurs Scores' },
    ];
    readonly secondMenu: MenuButton[] = [
        { name: 'Single', text: 'Jouer Solo' },
        { name: 'Multi', text: 'Jouer Ensemble' },
        { name: 'Browse', text: 'Joindre une partie' },
        { name: 'Back' },
    ];

    getTitle(): string {
        return this.gameMode ? (this.gameMode === GameMode.Classical ? 'Mode Classique' : 'Mode LOG2990') : 'Scrabble';
    }

    getButtons(): MenuButton[] {
        return this.gameMode ? this.secondMenu : this.mainMenu;
    }
}
