import {
    A_LOWER_CASE_ASCII,
    BOARD_WIDTH,
    BotMapWrapper,
    DEFAULT_BOT_BOARD,
    MINUS1,
    O_LOWER_CASE_ASCII,
    Placement,
    SHORTENED_HAND_LENGTH,
    TEN
} from '@app/classes/bot-config';
import { DEFAULT_BOT_NAMES, DEFAULT_HAND_SIZE, DEFAULT_SOCKET_TIMEOUT } from '@app/classes/config';
import { Game } from '@app/classes/game';
import { GameDifficulty } from '@app/classes/game-info';
import { DatabaseService } from '@app/services/database.service';
import EventEmitter from 'events';
import { Service } from 'typedi';
import { BotValidationService } from './bot-validation.service';

@Service()
export class BotService {
    readonly botEvents = new EventEmitter();

    // Key -- ID of the bot <br>
    // Value -- ID of the room the bot plays in
    readonly games = new Map<string, string>();

    // Key -- ID of the bot <br>
    // Value -- difficulty of the bot, 0 for beginner, 1 for expert
    botDifficulties = new Map<string, number>();

    // Key -- ID of the bot <br>
    // Value -- map bot uses for validation
    botMaps = new Map<string, BotMapWrapper>();

    lettersToBePlaced = new Map<string, string>();
    currentPlacementPoints: number = 0;
    currentRoomID: string = '';

    constructor(private dbService: DatabaseService, private botValidationService: BotValidationService) {}

    activate(botID: string, game: Game) {
        this.currentRoomID = this.games.get(botID) as string;
        if (this.botMaps.get(botID) === undefined) return;
        this.botMaps.set(botID, { map: new Map(DEFAULT_BOT_BOARD) });
        // on s'est deja assure que this.botMaps.get(botID) n'est pas undefined
        /* eslint-disable @typescript-eslint/no-non-null-assertion */
        const updatedBotBoard = this.botValidationService.updateBotBoard(this.botMaps.get(botID)!.map, game.board.letters);
        this.botMaps.set(botID, { map: updatedBotBoard });
        this.lettersToBePlaced.clear();
        this.currentPlacementPoints = 0;
        let timeElapsed = false;
        let exchangeLetters = '';
        const bot = game.players.get(botID);
        if (bot === undefined) return;

        setTimeout(() => {
            timeElapsed = true;
            if (this.botDifficulties.get(botID) === 0) {
                const random = this.getRandomInt(0, TEN);
                if (random === 1) {
                    if (game.reserve.size < DEFAULT_HAND_SIZE) {
                        this.botEvents.emit('skipTurn', this.games.get(botID));
                        return;
                    }
                    const quantity: number = this.getRandomInt(1, bot.hand.length + 1);
                    exchangeLetters = this.generateShortenedHand(bot.hand, quantity).join('');
                    this.botEvents.emit('exchange', this.games.get(botID), exchangeLetters, bot, game.reserve);
                    return;
                }
                if (random > 1) {
                    const shortenedHand = this.generateShortenedHand(bot.hand, SHORTENED_HAND_LENGTH);
                    this.placeLettersBeginner(shortenedHand, this.botMaps.get(botID)!.map);
                    if (this.lettersToBePlaced.size > 0) {
                        this.botEvents.emit('place', this.games.get(botID), this.lettersToBePlaced, game.board, bot, this.currentPlacementPoints);
                        return;
                    }
                }
                this.botEvents.emit('skipTurn', this.games.get(botID));
            } else {
                if (this.lettersToBePlaced.size !== 0) {
                    this.botEvents.emit('place', this.games.get(botID), this.lettersToBePlaced, game.board, bot, this.currentPlacementPoints);
                    return;
                }
                if (game.reserve.size >= DEFAULT_HAND_SIZE) {
                    exchangeLetters = bot.hand.join('');
                    this.botEvents.emit('exchange', this.games.get(botID), exchangeLetters, bot, game.reserve);
                    return;
                }
                this.botEvents.emit('skipTurn', this.games.get(botID));
            }
        }, DEFAULT_SOCKET_TIMEOUT);
        while (!timeElapsed) {
            if (this.botDifficulties.get(botID) === 0) {
                timeElapsed = true;
            } else {
                let placements: Placement[][] = [];
                if (this.botDifficulties.get(botID) === 1) {
                    placements = this.generateValidPlacements(
                        this.generateShortenedHand(bot.hand, SHORTENED_HAND_LENGTH),
                        this.botMaps.get(botID)!.map,
                    );
                }
                for (const pl of placements) this.updateBestPlacement(pl, this.botMaps.get(botID)!.map);
                timeElapsed = true;
                /* eslint-enable @typescript-eslint/no-non-null-assertion */
            }
        }
    }

    getHandCombinations(hand: string[]): string[] {
        const result: string[] = [];
        // La prochaine fonction est recursive, donc un arrow function n'est pas souhaitable
        // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
        const f = function (prefix: string, chars: string[]) {
            for (let i = 0; i < chars.length; i++) {
                result.push(prefix + chars[i]);
                f(prefix + chars[i], chars.slice(i + 1));
            }
        };
        f('', hand);
        return result;
    } // fonction inspire de https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

    permute(permutation: string[]): string[][] {
        const length = permutation.length;
        const result = [permutation.slice()];
        const c = new Array(length).fill(0);
        let i = 1;
        let k;
        let p;

        while (i < length) {
            if (c[i] < i) {
                k = i % 2 && c[i];
                p = permutation[i];
                permutation[i] = permutation[k];
                permutation[k] = p;
                ++c[i];
                i = 1;
                result.push(permutation.slice());
            } else {
                c[i] = 0;
                ++i;
            }
        }
        return result;
    } // fonction inspire de https://stackoverflow.com/questions/9960908/permutations-in-javascript

    getHandPermutationsOfCombinations(combinations: string[]): string[][] {
        const combinationsArray: string[][] = []; // separer chaque lettre d'une combinaison
        for (const combination of combinations) combinationsArray.push(combination.split(''));
        const result: string[][] = [];
        for (const combArr of combinationsArray) {
            const temp = this.permute(combArr);
            for (const comb of temp) {
                result.push(comb);
            }
        }
        return result;
    }

    getAllHorizontalPlacements(box: string, permutations: string[][], botBoard: Map<string, string>): Placement[][] {
        const array = Array.from(botBoard, ([coord, val]) => ({ coord, val }));
        const result: Placement[][] = [];
        const index = this.botValidationService.findIndexOfBox(box, botBoard);
        if (index === MINUS1 || array[index].val !== '0') return result;
        for (const permutation of permutations) {
            const temp: Placement[] = [];
            for (let i = 0, j = index; i < permutation.length; i++, j++) {
                if (array[j].val === '0') {
                    // si case est libre
                    temp.push(this.botValidationService.convertToPlacement(array[j].coord, permutation[i]));
                } else {
                    // si case deja occupee
                    temp.push(this.botValidationService.convertToPlacement(array[j].coord, array[j].val));
                    i--; // decrementer j car nous n'avons pas utilise de lettre venant de la main
                }
                if ((j + 1) % BOARD_WIDTH === 0)
                    // si on a atteint la limite a droite du board
                    break;
            }
            for (let i = index + temp.length; i % BOARD_WIDTH !== 0 && array[i].val !== '0'; i++) {
                // ajouter les lettres deja presentes a droite
                temp.push(this.botValidationService.convertToPlacement(array[i].coord, array[i].val));
            }
            for (let i = index - 1; i >= 0 && (i + 1) % BOARD_WIDTH !== 0 && array[i].val !== '0'; i--) {
                // ajouter les lettres deja presentes a gauche
                temp.push(this.botValidationService.convertToPlacement(array[i].coord, array[i].val));
            }
            result.push(temp);
        }
        return result;
    }

    getAllVerticalPlacements(box: string, permutations: string[][], botBoard: Map<string, string>): Placement[][] {
        const array = Array.from(botBoard, ([coord, val]) => ({ coord, val }));
        const result: Placement[][] = [];
        const index = this.botValidationService.findIndexOfBox(box, botBoard);
        if (index === MINUS1 || array[index].val !== '0') return result;
        for (const permutation of permutations) {
            const temp: Placement[] = [];
            for (let i = 0, j = index; i < permutation.length && j < array.length; i++, j += BOARD_WIDTH) {
                if (array[j].val === '0') {
                    // si case est libre
                    temp.push(this.botValidationService.convertToPlacement(array[j].coord, permutation[i]));
                } else {
                    // si case deja occupee
                    temp.push(this.botValidationService.convertToPlacement(array[j].coord, array[j].val));
                    i--; // decrementer j car nous n'avons pas utilise de lettre venant de la main
                }
            }
            for (let i = index + temp.length * BOARD_WIDTH; i < array.length && array[i].val !== '0'; i += BOARD_WIDTH) {
                // ajouter les lettres deja presentes en-bas
                temp.push(this.botValidationService.convertToPlacement(array[i].coord, array[i].val));
            }
            for (let i = index - BOARD_WIDTH; i >= 0 && array[i].val !== '0'; i -= BOARD_WIDTH) {
                // ajouter les lettres deja presentes en-haut
                temp.push(this.botValidationService.convertToPlacement(array[i].coord, array[i].val));
            }
            result.push(temp);
        }
        return result;
    }

    generateValidPlacements(hand: string[], botBoard: Map<string, string>): Placement[][] {
        const handCombinations = this.getHandCombinations(hand);
        const handPermutations = this.getHandPermutationsOfCombinations(handCombinations);
        let placements: Placement[][] = [];
        for (let row = A_LOWER_CASE_ASCII; row <= O_LOWER_CASE_ASCII; row++) {
            for (let i = 1; i <= BOARD_WIDTH; i++) {
                const box = String.fromCharCode(row) + i;
                placements = placements.concat(this.getAllHorizontalPlacements(box, handPermutations, botBoard));
                placements = placements.concat(this.getAllVerticalPlacements(box, handPermutations, botBoard));
            }
        }
        return this.botValidationService.filterPlacements(placements, this.currentRoomID, botBoard);
    }

    // Le placement de lettres se fait en combinant plusieurs fonctions, ce qui necessite une complexite elevee
    /* eslint-disable complexity */
    placeLettersBeginner(hand: string[], botBoard: Map<string, string>) {
        const placements: Placement[][] = this.generateValidPlacements(hand, botBoard);
        if (placements.length === 0) return;
        const sixPointsOrLower: Placement[][] = [];
        const sevenToTwelvePoints: Placement[][] = [];
        const thirteenToEighteenPoints: Placement[][] = [];
        /* eslint-disable @typescript-eslint/no-magic-numbers*/ // les nombres de points viennent des consignes, ils sont donc magiques par defaut
        for (const pl of placements) {
            if (this.botValidationService.calculatePoints(pl, botBoard) > 0 && this.botValidationService.calculatePoints(pl, botBoard) <= 6)
                sixPointsOrLower.push(pl);
            else if (this.botValidationService.calculatePoints(pl, botBoard) >= 7 && this.botValidationService.calculatePoints(pl, botBoard) <= 12)
                sevenToTwelvePoints.push(pl);
            else if (this.botValidationService.calculatePoints(pl, botBoard) >= 13 && this.botValidationService.calculatePoints(pl, botBoard) <= 18)
                thirteenToEighteenPoints.push(pl);
        }
        const random: number = this.getRandomInt(0, TEN);
        if (random <= 3 && sixPointsOrLower.length !== 0) {
            const rand: number = this.getRandomInt(0, sixPointsOrLower.length);
            for (const p of sixPointsOrLower[rand]) {
                this.lettersToBePlaced.set(p.coords, p.value);
            }
            this.currentPlacementPoints = this.botValidationService.calculatePoints(sixPointsOrLower[rand], botBoard);
        }
        if (random > 3 && random <= 6 && sevenToTwelvePoints.length !== 0) {
            const rand: number = this.getRandomInt(0, sevenToTwelvePoints.length);
            for (const p of sevenToTwelvePoints[rand]) {
                this.lettersToBePlaced.set(p.coords, p.value);
            }
            this.currentPlacementPoints = this.botValidationService.calculatePoints(sevenToTwelvePoints[rand], botBoard);
        }
        if (random > 6 && thirteenToEighteenPoints.length !== 0) {
            const rand: number = this.getRandomInt(0, thirteenToEighteenPoints.length);
            for (const p of thirteenToEighteenPoints[rand]) {
                this.lettersToBePlaced.set(p.coords, p.value);
            }
            this.currentPlacementPoints = this.botValidationService.calculatePoints(thirteenToEighteenPoints[rand], botBoard);
        }
        /* eslint-enable @typescript-eslint/no-magic-numbers*/
    }
    /* eslint-enable complexity */

    getRandomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    generateShortenedHand(hand: string[], quantity: number): string[] {
        if (hand.length <= quantity) return hand;
        const result: string[] = [];
        const randIndexes = new Set();
        while (randIndexes.size < quantity) randIndexes.add(this.getRandomInt(0, hand.length));
        for (const i of randIndexes) {
            result.push(hand[i as number]);
        }
        return result;
    }

    updateBestPlacement(placement: Placement[], botBoard: Map<string, string>) {
        const currentPlacementPoints: number = this.botValidationService.calculatePoints(placement, botBoard);
        if (currentPlacementPoints > this.currentPlacementPoints) {
            this.currentPlacementPoints = currentPlacementPoints;
            this.lettersToBePlaced.clear();
            for (const p of placement) {
                this.lettersToBePlaced.set(p.coords, p.value);
            }
        }
    }

    async getBotName(playerName: string, difficulty: number): Promise<string> {
        let names = difficulty === GameDifficulty.Easy ? DEFAULT_BOT_NAMES.easy : DEFAULT_BOT_NAMES.hard;
        try {
            names = names.concat(...(await this.dbService.getBots(difficulty)).map((bot) => bot.name));
        } catch (e) {
            void e;
        }
        const validBotNames = names.filter((name) => name !== playerName);
        return validBotNames[Math.floor(Math.random() * validBotNames.length)];
    }
}
