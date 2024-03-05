export enum GameMode {
    None,
    Classical,
    Log2990,
}

export enum GameType {
    None,
    Single,
    Multi,
}

export enum GameDifficulty {
    Easy,
    Hard,
}

export type GameInfo = {
    username: string;
    turnLength: number;
    randomized: boolean;
    gameMode: number;
    gameType: number;
    difficulty: number;
    roomID: string;
    dictID: string;
};

export type GameInit = {
    self: string;
    opponent: string;
    bonuses: [string, string][];
    reserve: string[];
    hand: string[];
    gameMode: number;
    turnState?: boolean;
};

export type BotName = {
    id: string;
    name: string;
    default: boolean;
};

export type Dictionary = {
    id: string;
    name: string;
    description: string;
};
