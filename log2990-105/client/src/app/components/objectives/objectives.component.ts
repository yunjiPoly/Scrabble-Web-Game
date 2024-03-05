/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Component } from '@angular/core';
import { WebsocketService } from '@app/services/websocket.service';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent {
    isVisible: boolean;
    publicObj: [number, boolean][];
    privateObj: [number, boolean];
    objectivesDescription: Map<number, string[]>;

    constructor(private webSocketService: WebsocketService) {
        this.webSocketService.init.subscribe((initPayLoad) => {
            if (initPayLoad.gameMode === 2) this.webSocketService.fetchObjectives();
        });
        this.webSocketService.objective.subscribe((objectives) => {
            if (objectives.privateObj[0] !== 0) {
                this.isVisible = true;
                this.publicObj = objectives.publicObj;
                this.privateObj = objectives.privateObj;
            }
        });
        this.objectivesDescription = new Map<number, string[]>([
            [1, ['Double bonus', '10pts', 'Faire un placement qui utilise 2 bonus différents (Lx2 et Lx3)']],
            [
                2,
                [
                    'Sextuple validations',
                    '30pts',
                    'Faire un placement valide pendant 6 tours de suite, sans poser une autre action (pass, exchange,...)',
                ],
            ],
            [
                3,
                [
                    'Double lettres valides',
                    '10pts',
                    'Faire un placement valide contenant une double lettre ("ss", "ll", "mm",... lettre blanche acceptée)',
                ],
            ],
            [4, ['Triple voyelles', '20pts', 'Faire un placement valide contenant 3 voyelles ou plus']],
            [5, ['Triple bonus', '50pts', 'Faire un placement valide qui utilise 3 bonus sur le plateau de jeux']],
            [6, ['Formation triple mots', '30pts', 'Faire un placement valide qui forme au minimum 3 nouveaux mots']],
            [
                7,
                [
                    'Double lettres rares',
                    '50pts',
                    'Faire un placement qui contient au moins deux des lettres "k", "w", "x", "y", "z" (lettre blanche acceptée)',
                ],
            ],
            [8, ['Quintuple placements', '20pts', "Faire un placement de 5 lettres minimum qui n'utilise aucun bonus"]],
        ]);
    }

    obtainObjDescription(numberObj: number): string[] {
        const description = this.objectivesDescription.get(numberObj);
        if (description === undefined) return [];
        return description;
    }
}
