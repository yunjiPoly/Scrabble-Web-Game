export class Player {
    readonly name: string;
    readonly hand: string[];
    privateObj: [number, boolean];
    score: number;

    constructor(name: string) {
        this.name = name;
        this.hand = [];
        this.score = 0;
        this.privateObj = [0, false];
    }

    completePrivate(): boolean {
        if (!this.privateObj[1]) {
            this.privateObj[1] = true;
            return true;
        }
        return false;
    }

    has(letter: string): boolean {
        return this.hand.includes(letter);
    }

    get(letter: string): number {
        return this.hand.filter((letterInHand) => letterInHand === letter).length;
    }

    add(letter: string): void {
        this.hand.push(letter);
    }

    addAll(letters: string[]): void {
        this.hand.push(...letters);
    }

    remove(letter: string): void {
        const index = this.hand.indexOf(letter);
        if (index >= 0) {
            this.hand.splice(index, 1);
        }
    }

    get size(): number {
        return this.hand.length;
    }
}
