/* eslint-disable @typescript-eslint/no-magic-numbers */
// For the sake of numbering the objectives
import { Service } from 'typedi';
import { ValidationService } from '@app/services/validation.service';
import { Game } from '@app/classes/game';

const RANDOMIZER = 0.5;
const OBJECTIVE_TURN_CONDITION = 6;

@Service()
export class ObjectivesService {
    objectives: number[] = [1, 2, 3, 4, 5, 6, 7, 8];

    private verifications: Map<number, (letters: Map<string, string>, game: Game) => boolean>;
    private objectivesPts: Map<number, number>;

    constructor(private validationService: ValidationService) {
        this.verifications = new Map<number, (letters: Map<string, string>, game: Game) => boolean>([
            [
                // Faire un placement qui utilise 2 bonus différents (Lx2 et Lx3)
                1,
                (letters: Map<string, string>, game: Game): boolean => {
                    const bonuses: string[] = [];
                    for (const char of letters) {
                        if (game.board.bonuses.has(char[0])) bonuses.push(game.board.getBonus(char[0]) as string);
                    }
                    return new Set(bonuses).size >= 2;
                },
            ],
            [
                // Faire un placement valide pendant 6 tours de suite, sans poser une autre action (pass, exchange,...)
                2,
                (_, game: Game): boolean => {
                    game.validTurnCounter++;
                    return game.validTurnCounter >= OBJECTIVE_TURN_CONDITION;
                },
            ],
            [
                // Faire un placement valide contenant une double lettre ("ss", "ll", "mm",... lettre blanche acceptée)
                3,
                (letters: Map<string, string>): boolean => {
                    let wordContainer = '';
                    for (const char of letters) {
                        wordContainer += char[1];
                    }
                    const regex = /([a-zA-Z])\1/gi;
                    const result = wordContainer.match(regex);
                    return !!result;
                },
            ],
            [
                // Faire un placement valide contenant 3 voyelles ou plus
                4,
                (letters: Map<string, string>): boolean => {
                    let wordContainer = '';
                    for (const char of letters) {
                        wordContainer += char[1].toLowerCase();
                    }
                    const regex = /[aeiou]/gi;
                    const result = wordContainer.match(regex);
                    if (!result) return false;
                    return result.length >= 3;
                },
            ],
            [
                // Faire un placement valide qui utilise 3 bonus sur le plateau de jeux
                5,
                (letters: Map<string, string>, game: Game): boolean => {
                    let bonusCounter = 0;
                    for (const char of letters) {
                        if (game.board.bonuses.has(char[0])) bonusCounter++;
                    }
                    return bonusCounter >= 3;
                },
            ],
            [
                // Faire un placement valide qui forme au minimum 3 nouveaux mots
                6,
                (): boolean => {
                    const words = this.validationService.fetchWords();
                    const arr = words
                        .filter((word) => word.length >= 2 && !word.includes('-') && !word.includes("'") && word !== '')
                        .map((word) => word.toLowerCase());
                    return arr.length >= 3;
                },
            ],
            [
                // Faire un placement qui contient au moins deux des lettres "k", "w", "x", "y", "z" (lettre blanche acceptée)
                7,
                (letters: Map<string, string>): boolean => {
                    let wordContainer = '';
                    // eslint-disable-next-line guard-for-in
                    for (const char of letters) {
                        wordContainer += char[1].toLowerCase();
                    }
                    const regex = /[kwxyz]/gi;
                    const result = wordContainer.match(regex);
                    if (!result) return false;
                    return new Set(result).size >= 2;
                },
            ],
            [
                // Faire un placement de 5 lettres minimum qui n'utilise aucun bonus
                8,
                (letters: Map<string, string>, game: Game): boolean => {
                    let containsBonus = false;
                    for (const char of letters) {
                        if (game.board.bonuses.has(char[0])) {
                            containsBonus = true;
                            break;
                        }
                    }
                    return letters.size >= 5 && !containsBonus;
                },
            ],
        ]);

        this.objectivesPts = new Map<number, number>([
            [1, 10],
            [2, 30],
            [3, 10],
            [4, 20],
            [5, 50],
            [6, 30],
            [7, 50],
            [8, 20],
        ]);
    }

    getPublicObjectives(): number[] {
        this.objectives.sort(() => Math.random() - RANDOMIZER);
        const element1 = this.objectives.pop();
        const element2 = this.objectives.pop();
        if (element1 === undefined && element2 === undefined) return [0, 0];
        return [element1 as number, element2 as number];
    }

    getPrivateObjectives(): number {
        this.objectives.sort(() => Math.random() - RANDOMIZER);
        const element = this.objectives.pop();
        if (element === undefined) return 0;
        return element;
    }

    checkObjective(objective: number, letters: Map<string, string>, game: Game): boolean {
        const exec: ((letters: Map<string, string>, game: Game) => boolean) | undefined = this.verifications.get(objective);
        if (!exec) return false;
        return exec(letters, game);
    }

    getPoints(objective: number): number {
        if (!this.objectivesPts.has(objective)) return 0;
        return this.objectivesPts.get(objective) as number;
    }

    resetObjArray(): void {
        this.objectives = [1, 2, 3, 4, 5, 6, 7, 8];
    }
}
