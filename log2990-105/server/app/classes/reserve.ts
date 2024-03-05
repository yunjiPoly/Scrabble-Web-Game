import { DEFAULT_RESERVE } from '@app/classes/config';

export class Reserve {
    readonly letters: string[];

    constructor() {
        this.letters = Object.assign([], DEFAULT_RESERVE);
    }

    drawOne(): string | undefined {
        if (this.size <= 0) {
            return undefined;
        }
        const index = Math.floor(Math.random() * this.size);
        return this.letters.splice(index, 1)[0];
    }

    draw(amount: number): string[] | undefined {
        const letters: string[] = [];
        for (let i = 0; i < amount; i++) {
            const letter = this.drawOne();
            if (letter !== undefined) {
                letters.push(letter);
            } else return undefined;
        }
        return letters;
    }

    receiveOne(word: string): void {
        this.letters.push(word);
    }

    get size() {
        return this.letters.length;
    }
}
