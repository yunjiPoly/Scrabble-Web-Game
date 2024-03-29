// For the value of each letter sometimes they value 10 or 8

import { Dictionary } from '@app/classes/game-info';
import { HighScore } from '@app/classes/highscore';
// eslint-disable-next-line no-restricted-imports
import * as data from '@app/config/dictionary.json';

/* eslint-disable @typescript-eslint/no-magic-numbers*/

export const DEFAULT_POINTS: Map<string, number> = new Map([
    ['a', 1],
    ['b', 3],
    ['c', 3],
    ['d', 2],
    ['e', 1],
    ['f', 4],
    ['g', 2],
    ['h', 4],
    ['i', 1],
    ['j', 8],
    ['k', 10],
    ['l', 1],
    ['m', 2],
    ['n', 1],
    ['o', 1],
    ['p', 3],
    ['q', 8],
    ['r', 1],
    ['s', 1],
    ['t', 1],
    ['u', 1],
    ['v', 4],
    ['w', 10],
    ['x', 10],
    ['y', 10],
    ['z', 10],
]);
/* eslint-enable @typescript-eslint/no-magic-numbers*/

export const DEFAULT_BONUSES: Map<string, string> = new Map([
    ['a1', 'Wx3'],
    ['a4', 'Lx2'],
    ['a8', 'Wx3'],
    ['a12', 'Lx2'],
    ['a15', 'Wx3'],
    ['b2', 'Wx2'],
    ['b6', 'Lx3'],
    ['b10', 'Lx3'],
    ['b14', 'Wx2'],
    ['c3', 'Wx2'],
    ['c7', 'Lx2'],
    ['c9', 'Lx2'],
    ['c13', 'Wx2'],
    ['d1', 'Lx2'],
    ['d4', 'Wx2'],
    ['d8', 'Lx2'],
    ['d12', 'Wx2'],
    ['d15', 'Lx2'],
    ['e5', 'Wx2'],
    ['e11', 'Wx2'],
    ['f2', 'Lx3'],
    ['f6', 'Lx3'],
    ['f10', 'Lx3'],
    ['f14', 'Lx3'],
    ['g3', 'Lx2'],
    ['g7', 'Lx2'],
    ['g9', 'Lx2'],
    ['g13', 'Lx2'],
    ['h1', 'Wx3'],
    ['h4', 'Lx2'],
    ['h8', 'Wx2'],
    ['h12', 'Lx2'],
    ['h15', 'Wx3'],
    ['i3', 'Lx2'],
    ['i7', 'Lx2'],
    ['i9', 'Lx2'],
    ['i13', 'Lx2'],
    ['j2', 'Lx3'],
    ['j6', 'Lx3'],
    ['j10', 'Lx3'],
    ['j14', 'Lx3'],
    ['k5', 'Wx2'],
    ['k11', 'Wx2'],
    ['l1', 'Lx2'],
    ['l4', 'Wx2'],
    ['l8', 'Lx2'],
    ['l12', 'Wx2'],
    ['l15', 'Lx2'],
    ['m3', 'Wx2'],
    ['m7', 'Lx2'],
    ['m9', 'Lx2'],
    ['m13', 'Wx2'],
    ['n2', 'Wx2'],
    ['n6', 'Lx3'],
    ['n10', 'Lx3'],
    ['n14', 'Wx2'],
    ['o1', 'Wx3'],
    ['o4', 'Lx2'],
    ['o8', 'Wx3'],
    ['o12', 'Lx2'],
    ['o15', 'Wx3'],
]);

export const DEFAULT_RESERVE: string[] = [
    'a',
    'a',
    'a',
    'a',
    'a',
    'a',
    'a',
    'a',
    'a',
    'b',
    'b',
    'c',
    'c',
    'd',
    'd',
    'd',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'e',
    'f',
    'f',
    'g',
    'g',
    'h',
    'h',
    'i',
    'i',
    'i',
    'i',
    'i',
    'i',
    'i',
    'i',
    'j',
    'k',
    'l',
    'l',
    'l',
    'l',
    'l',
    'm',
    'm',
    'm',
    'n',
    'n',
    'n',
    'n',
    'n',
    'n',
    'o',
    'o',
    'o',
    'o',
    'o',
    'o',
    'p',
    'p',
    'q',
    'r',
    'r',
    'r',
    'r',
    'r',
    'r',
    's',
    's',
    's',
    's',
    's',
    's',
    't',
    't',
    't',
    't',
    't',
    't',
    'u',
    'u',
    'u',
    'u',
    'u',
    'u',
    'v',
    'v',
    'w',
    'x',
    'y',
    'z',
    '*',
    '*',
];

export const DEFAULT_HIGH_SCORES = {
    classical: [
        { name: 'TheLegend27', score: 50 },
        { name: 'Kevin Nguyen', score: 48 },
        { name: '105mm APFSDS rnd', score: 42 },
        { name: 'ฅ^•ﻌ•^ฅ', score: 35 },
        { name: 'Иосиф Сталин', score: 27 },
    ] as HighScore[],
    log2990: [
        { name: '孙悟空', score: 64 },
        { name: 'MoistCr1TiKaL', score: 60 },
        { name: 'ショタコン', score: 53 },
        { name: 'Nigerian Prince', score: 39 },
        { name: 'tyler1', score: 8 },
    ] as HighScore[],
};

export const DEFAULT_BOT_NAMES = {
    easy: ['tyler1', '< your ad here >', 'Kirikou'],
    hard: ['Kevin Nguyen', '孙悟空', 'DIO'],
};

export const DEFAULT_HAND_SIZE = 7;
export const DEFAULT_TURN_TIMEOUT = 3000;
export const DEFAULT_SOCKET_TIMEOUT = 5000;

export const BOT_MARKER = '*';
export const ROOM_MARKER = '_';

export const MAX_TURN_SKIP_COUNT = 6;

export const HALF = 0.5;

export const DATABASE = {
    url: 'mongodb+srv://equipe105:giornogiovanna@cluster0.9flzh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
    highScore: {
        name: 'HighScore',
        collections: {
            classical: 'ScoreClassic',
            log2990: 'ScoreLog2990',
        },
    },
    bot: {
        name: 'botNameDB',
        collections: {
            easy: 'easy',
            hard: 'hard',
        },
    },
    dict: {
        name: 'dictionaryDB',
        collection: 'custom',
    },
};

export const DEFAULT_DICTIONARY = { _id: '$default', ...JSON.parse(JSON.stringify(data)) } as Dictionary;
