export class Board {
    readonly letters: Map<string, string>;
    readonly bonuses: Map<string, string>;

    constructor(bonuses: Map<string, string>) {
        // Key -- Coords on the board <br>
        // Value -- Letter placed at the coords
        this.letters = new Map<string, string>();

        // Key -- Coords on the board <br>
        // Value -- Letter placed at the coords
        this.bonuses = new Map<string, string>(bonuses);
    }
    size(): number {
        return this.letters.size;
    }

    hasCoords(coords: string): boolean {
        return this.letters.has(coords);
    }

    placeLetter(coords: string, letter: string): void {
        if (!this.hasCoords(coords)) {
            this.letters.set(coords, letter);
        }
    }

    getLetter(coords: string): string | undefined {
        return this.letters.get(coords);
    }

    getBonus(coords: string): string | undefined {
        return this.bonuses.get(coords);
    }

    removeAt(coords: string): void {
        if (this.hasCoords(coords)) {
            this.letters.delete(coords);
        }
    }
}
