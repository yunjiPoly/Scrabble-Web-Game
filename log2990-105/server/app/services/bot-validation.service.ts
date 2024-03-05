import {
    A_LOWER_CASE_ASCII,
    BOARD_WIDTH,
    MINUS1,
    O_LOWER_CASE_ASCII,
    Placement,
    VALID_STAR_PLACEMENTS_CAP,
    Z_LOWER_CASE_ASCII
} from '@app/classes/bot-config';
import { DEFAULT_BONUSES, DEFAULT_POINTS } from '@app/classes/config';
import { Service } from 'typedi';
import { ValidationService } from './validation.service';

@Service()
export class BotValidationService {
    constructor(private validationService: ValidationService) {}

    updateBotBoard(boardToBeUpdated: Map<string, string>, board: Map<string, string>): Map<string, string> {
        const coords = board.keys();
        for (const c of coords) {
            const value = board.get(c);
            if (value) boardToBeUpdated.set(c, value);
        }
        return boardToBeUpdated;
    }

    convertToPlacement(coords: string, value: string): Placement {
        return { coords, value };
    }

    findIndexOfBox(box: string, board: Map<string, string>): number {
        const array = Array.from(board, ([coord, val]) => ({ coord, val }));
        for (let i = 0; i < array.length; i++) {
            if (array[i].coord === box) return i;
        }
        return MINUS1;
    }

    sortPlacementByBox(placements: Placement[]): Placement[] {
        placements.sort((a, b) => {
            const coordA = a.coords;
            const coordB = b.coords;
            if (coordA < coordB) {
                if (coordA[0] === coordB[0]) {
                    if (coordA.length > coordB.length) return 1;
                }
                return MINUS1;
            }
            return 1;
        });
        return placements;
    }

    getHorizontalNewWord(placement: Placement, botBoard: Map<string, string>): Placement[] {
        const result: Placement[] = [placement];
        const array = Array.from(botBoard, ([coord, val]) => ({ coord, val }));
        const index = this.findIndexOfBox(placement.coords, botBoard);
        for (let i = index + 1; i % BOARD_WIDTH !== 0 && array[i].val !== '0'; i++) {
            // ajouter les lettres deja presentes a droite
            result.push(this.convertToPlacement(array[i].coord, array[i].val));
        }
        for (let i = index - 1; (i + 1) % BOARD_WIDTH !== 0 && array[i].val !== '0'; i--) {
            // ajouter les lettres deja presentes a gauche
            result.push(this.convertToPlacement(array[i].coord, array[i].val));
        }
        return result;
    }

    getVerticalNewWord(placement: Placement, botBoard: Map<string, string>): Placement[] {
        const result: Placement[] = [placement];
        const array = Array.from(botBoard, ([coord, val]) => ({ coord, val }));
        const index = this.findIndexOfBox(placement.coords, botBoard);
        for (let i = index + BOARD_WIDTH; i < array.length && array[i].val !== '0'; i += BOARD_WIDTH) {
            // ajouter les lettres deja presentes en-bas
            result.push(this.convertToPlacement(array[i].coord, array[i].val));
        }
        for (let i = index - BOARD_WIDTH; i >= 0 && array[i].val !== '0'; i -= BOARD_WIDTH) {
            // ajouter les lettres deja presentes en-haut
            result.push(this.convertToPlacement(array[i].coord, array[i].val));
        }
        // result = this.sortPlacementByBox(result);
        return result;
    }

    isFirstPlacement(botBoard: Map<string, string>): boolean {
        const keys = [...botBoard.entries()].filter(({ 1: v }) => v !== '0').map(([k]) => k);
        return keys.length === 0;
    }

    isPlacedOnMiddle(placement: Placement[]): boolean {
        for (const p of placement) if (p.coords === 'h8') return true;
        return false;
    }

    isPlacingNewLetter(placement: Placement[], botBoard: Map<string, string>): boolean {
        for (const p of placement) if (botBoard.get(p.coords) === '0') return true;
        return false;
    }

    validateOneStarPlacements(words: string[], roomID: string): string {
        const oldValues: string[] = JSON.parse(JSON.stringify(words));
        for (let j = A_LOWER_CASE_ASCII; j <= Z_LOWER_CASE_ASCII; j++) {
            for (let k = 0; k < words.length; k++) {
                if (words[k].includes('*')) {
                    words[k] = words[k].replace('*', String.fromCharCode(j));
                }
            }
            if (this.validationService.findWord(roomID, words)) {
                return String.fromCharCode(j).toUpperCase();
            } else words = JSON.parse(JSON.stringify(oldValues));
        }
        return '';
    }

    validateTwoStarPlacements(words: string[], roomID: string): string[] {
        const oldValues: string[] = JSON.parse(JSON.stringify(words));
        const result: string[] = [];
        for (let j = A_LOWER_CASE_ASCII; j <= Z_LOWER_CASE_ASCII; j++) {
            for (let k = A_LOWER_CASE_ASCII; k <= Z_LOWER_CASE_ASCII; k++) {
                for (let l = 0; l < words.length; l++) {
                    words[l] = words[l].replace('*', String.fromCharCode(j)); // premiere etoile remplacee par valeur ASCII de j
                    words[l] = words[l].replace('*', String.fromCharCode(k)); // deuxieme etoile remplacee par valeur ASCII de k
                }
                if (this.validationService.findWord(roomID, words)) {
                    result.push(String.fromCharCode(j).toUpperCase());
                    result.push(String.fromCharCode(k).toUpperCase());
                    return result;
                } else words = JSON.parse(JSON.stringify(oldValues));
            }
        }
        return result;
    }

    // Le filtrage de combinaisons valides se fait en combinant plusieurs fonctions, ce qui necessite une complexite elevee
    /* eslint-disable complexity */
    filterPlacements(placements: Placement[][], roomID: string, botBoard: Map<string, string>): Placement[][] {
        const result: Placement[][] = [];
        let validStarPlacements = 0;
        for (let i = placements.length - 1; i >= 0; i--) {
            const wordsPlacements: Placement[][] = [];
            let currentWord: Placement[] = [];
            let isHorizontalPlacement = false;
            let isTouchingExistingLetter = false;
            if (placements[i].length > 1) if (placements[i][0].coords.slice(1) !== placements[i][1].coords.slice(1)) isHorizontalPlacement = true;
            const starIndexes: number[] = [];
            for (let j = 0; j < placements[i].length; j++) {
                if (placements[i][j].value === '*') starIndexes.push(j);
                currentWord.push(placements[i][j]);
                if (botBoard.get(placements[i][j].coords) !== '0') isTouchingExistingLetter = true;
                if (!isHorizontalPlacement) {
                    // un placement vertical forme des nouveaux mots horizontaux
                    if (this.getHorizontalNewWord(placements[i][j], botBoard).length > 1) {
                        const temp: Placement[] = [];
                        for (const pl of this.getHorizontalNewWord(placements[i][j], botBoard)) temp.push(pl);
                        wordsPlacements.push(temp);
                        isTouchingExistingLetter = true;
                    }
                } else if (this.getVerticalNewWord(placements[i][j], botBoard).length > 1) {
                    const temp: Placement[] = [];
                    for (const pl of this.getVerticalNewWord(placements[i][j], botBoard)) temp.push(pl);
                    wordsPlacements.push(temp);
                    isTouchingExistingLetter = true;
                }
            }
            currentWord = this.sortPlacementByBox(currentWord);
            const firstCoord: string = currentWord[0].coords;
            const lastCoord: string = currentWord[currentWord.length - 1].coords;
            if (isHorizontalPlacement) {
                // ajouter les lettres deja presentes a gauche
                let previous: string = firstCoord.substring(0, 1) + (parseInt(firstCoord.slice(1), 10) - 1);
                while (parseInt(previous.slice(1), 10) > 0 && botBoard.get(previous) !== '0') {
                    const val = botBoard.get(previous);
                    if (val) currentWord.push(this.convertToPlacement(previous, val));
                    previous = previous.substring(0, 1) + (parseInt(previous.slice(1), 10) - 1);
                }
                // ajouter les lettres deja presentes a droite
                let next: string = lastCoord.substring(0, 1) + (parseInt(lastCoord.slice(1), 10) + 1);
                while (parseInt(next.slice(1), 10) <= BOARD_WIDTH && botBoard.get(next) !== '0') {
                    const val = botBoard.get(next);
                    if (val) currentWord.push(this.convertToPlacement(next, val));
                    next = next.substring(0, 1) + (parseInt(next.slice(1), 10) + 1);
                }
            } else {
                // ajouter les lettres deja presentes en haut
                let previous: string = String.fromCharCode(firstCoord.charCodeAt(0) - 1) + firstCoord.substring(1);
                while (previous.charCodeAt(0) >= Z_LOWER_CASE_ASCII && botBoard.get(previous) !== '0') {
                    const val = botBoard.get(previous);
                    if (val) currentWord.push(this.convertToPlacement(previous, val));
                    previous = String.fromCharCode(previous.charCodeAt(0) - 1) + previous.substring(1);
                }
                // ajouter les lettres deja presentes en bas
                let next: string = String.fromCharCode(lastCoord.charCodeAt(0) + 1) + lastCoord.substring(1);
                while (next.charCodeAt(0) <= O_LOWER_CASE_ASCII && botBoard.get(next) !== '0') {
                    const val = botBoard.get(next);
                    if (val) currentWord.push(this.convertToPlacement(next, val));
                    next = String.fromCharCode(next.charCodeAt(0) + 1) + next.substring(1);
                }
            }
            wordsPlacements.push(currentWord);
            const words: string[] = [];
            for (let j = 0; j < wordsPlacements.length; j++) {
                wordsPlacements[j] = this.sortPlacementByBox(wordsPlacements[j]);
                let temp = '';
                for (const placement of wordsPlacements[j]) temp += placement.value;
                words.push(temp);
            }
            if (starIndexes.length === 0) {
                // pas d'etoile dans la tentative de placements courrante
                if (this.isFirstPlacement(botBoard)) {
                    if (this.isPlacedOnMiddle(placements[i]) && this.validationService.findWord(roomID, words)) result.push(placements[i]);
                } else if (
                    isTouchingExistingLetter &&
                    this.validationService.findWord(roomID, words) &&
                    this.isPlacingNewLetter(placements[i], botBoard)
                )
                    result.push(placements[i]);
            } else if (starIndexes.length === 1) {
                // la tentative de placements contient 1 '*'
                if (this.isFirstPlacement(botBoard)) {
                    if (this.isPlacedOnMiddle(placements[i])) {
                        const letter: string = this.validateOneStarPlacements(words, roomID);
                        if (letter !== '') {
                            placements[i][starIndexes[0]].value = letter;
                            result.push(placements[i]);
                            validStarPlacements++;
                            if (validStarPlacements === VALID_STAR_PLACEMENTS_CAP) return result;
                        }
                    }
                } else {
                    if (isTouchingExistingLetter && this.isPlacingNewLetter(placements[i], botBoard)) {
                        const letter: string = this.validateOneStarPlacements(words, roomID);
                        if (letter !== '') {
                            placements[i][starIndexes[0]].value = letter;
                            result.push(placements[i]);
                            validStarPlacements++;
                            if (validStarPlacements === VALID_STAR_PLACEMENTS_CAP) return result;
                        }
                    }
                }
            } else {
                // la tentative de placements contient 2 '*'
                if (this.isFirstPlacement(botBoard)) {
                    if (this.isPlacedOnMiddle(placements[i])) {
                        const letters: string[] = this.validateTwoStarPlacements(words, roomID);
                        if (letters.length !== 0) {
                            placements[i][starIndexes[0]].value = letters[0];
                            placements[i][starIndexes[1]].value = letters[1];
                            result.push(placements[i]);
                            validStarPlacements++;
                            if (validStarPlacements === VALID_STAR_PLACEMENTS_CAP) return result;
                        }
                    }
                } else {
                    if (isTouchingExistingLetter && this.isPlacingNewLetter(placements[i], botBoard)) {
                        const letters: string[] = this.validateTwoStarPlacements(words, roomID);
                        if (letters.length !== 0) {
                            placements[i][starIndexes[0]].value = letters[0];
                            placements[i][starIndexes[1]].value = letters[1];
                            result.push(placements[i]);
                            validStarPlacements++;
                            if (validStarPlacements === VALID_STAR_PLACEMENTS_CAP) return result;
                        }
                    }
                }
            }
        }
        return result;
    }
    /* eslint-enable complexity */

    // Le calcul de points se fait en combinant plusieurs fonctions, ce qui necessite une complexite elevee
    // De plus, la reutilisation des fonctions de calculs de pointage dans validation.service est impossible, car elles necessitent que
    // les lettres soient placees sur le board pour etre appelees. Ici, le JV debutant doit calculer les points avant d'avoir place les lettres.
    /* eslint-disable complexity */
    calculatePoints(placement: Placement[], botBoard: Map<string, string>): number {
        if (!placement) return 0;
        let total = 0;
        const lettersToBePlaced: Placement[] = [];

        for (const pl of placement) if (botBoard.get(pl.coords) === '0') lettersToBePlaced.push(pl);

        const newlyFormedWords: Placement[][] = [];
        if (lettersToBePlaced.length === 1) {
            if (this.getHorizontalNewWord(lettersToBePlaced[0], botBoard).length > 1)
                newlyFormedWords.push(this.getHorizontalNewWord(lettersToBePlaced[0], botBoard));
            if (this.getVerticalNewWord(lettersToBePlaced[0], botBoard).length > 1)
                newlyFormedWords.push(this.getVerticalNewWord(lettersToBePlaced[0], botBoard));
        } else {
            let isHorizontalPlacement = false;
            if (lettersToBePlaced[0].coords.slice(1) !== lettersToBePlaced[1].coords.slice(1)) isHorizontalPlacement = true;
            if (isHorizontalPlacement) {
                const temp: Placement[] = placement;
                newlyFormedWords.push(temp);
                for (const l of lettersToBePlaced)
                    if (this.getVerticalNewWord(l, botBoard).length > 1) newlyFormedWords.push(this.getVerticalNewWord(l, botBoard));
            } else {
                const temp: Placement[] = placement;
                newlyFormedWords.push(temp);
                for (const l of lettersToBePlaced)
                    if (this.getHorizontalNewWord(l, botBoard).length > 1) newlyFormedWords.push(this.getHorizontalNewWord(l, botBoard));
            }
        }
        for (const word of newlyFormedWords) {
            let temp = 0;
            let wx2Counter = 0;
            let wx3Counter = 0;
            for (const letter of word) {
                if (botBoard.get(letter.coords) !== '0' || DEFAULT_BONUSES.get(letter.coords) === undefined) {
                    // on s'est assure que DEFAULT_POINTS.get(letter.value) n'est pas undefined dans la condition du 'if'
                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                    if (DEFAULT_POINTS.get(letter.value) !== undefined) temp += DEFAULT_POINTS.get(letter.value)!;
                    else temp += 1; // le placement est une *, sa valeur dans letter.value est un majuscule
                } else if (DEFAULT_BONUSES.get(letter.coords) === 'Lx2') {
                    if (DEFAULT_POINTS.get(letter.value) !== undefined) temp += 2 * DEFAULT_POINTS.get(letter.value)!;
                    else temp += 2 * 1;
                } else if (DEFAULT_BONUSES.get(letter.coords) === 'Lx3') {
                    if (DEFAULT_POINTS.get(letter.value) !== undefined) temp += 3 * DEFAULT_POINTS.get(letter.value)!;
                    else temp += 3 * 1;
                } else if (DEFAULT_BONUSES.get(letter.coords) === 'Wx2') {
                    wx2Counter++;
                    if (DEFAULT_POINTS.get(letter.value) !== undefined) temp += DEFAULT_POINTS.get(letter.value)!;
                    else temp += 1;
                } else if (DEFAULT_BONUSES.get(letter.coords) === 'Wx3') {
                    wx3Counter++;
                    if (DEFAULT_POINTS.get(letter.value) !== undefined) temp += DEFAULT_POINTS.get(letter.value)!;
                    else temp += 1;
                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                }
            }
            for (let i = 0; i < wx2Counter; i++) temp *= 2;
            for (let i = 0; i < wx3Counter; i++) temp *= 3;
            total += temp;
        }
        return total;
    }
    /* eslint-enable complexity */
}
