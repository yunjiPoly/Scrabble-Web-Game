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

export type PlayerInfo = {
    socketID: string;
    username: string;
};

export type BotName = {
    _id: string;
    name: string;
};

export type Dictionary = {
    _id: string;
    name: string;
    description: string;
    words: string[];
};
