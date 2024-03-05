import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { GameDifficulty } from '@app/classes/game-info';

@Component({
    selector: 'app-bot-config-select',
    template: `
        <mat-form-field appearance="outline">
            <mat-select [value]="difficulty" (valueChange)="difficultyChange.emit($event)">
                <mat-option [value]="gameDifficulty.Easy">Profil Novice</mat-option>
                <mat-option [value]="gameDifficulty.Hard">Profil Expert</mat-option>
            </mat-select>
        </mat-form-field>
    `,
    styles: [
        `
            app-bot-config-select .mat-form-field.mat-form-field {
                margin-bottom: 0 !important;
            }
            app-bot-config-select .mat-form-field-flex {
                margin-top: 0 !important;
            }
            app-bot-config-select .mat-form-field-infix {
                border-top: none;
                padding: 0.6em 0 !important;
            }
            app-bot-config-select .mat-form-field-outline {
                top: 0 !important;
            }
            app-bot-config-select .mat-form-field-wrapper {
                margin: 0 !important;
                padding: 0;
            }
            app-bot-config-select .mat-select-arrow-wrapper {
                transform: none !important;
            }
        `,
    ],
    styleUrls: ['../../styles.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BotConfigSelectComponent {
    @Input() difficulty: number;
    @Output() difficultyChange = new EventEmitter<number>();

    readonly gameDifficulty = GameDifficulty;
}
