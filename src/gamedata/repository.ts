import { CharacterData, DemonData, EnemyData } from './types';

function mapFromObject<T>(input: {[key: string]: T}): Map<string, T & {id: string}> {
    const result = new Map<string, T & {id: string}>();

    for (const id of Object.keys(input)) {
        result.set(id, { ...input[id], id });
    }

    return result;
}

const characters: Map<string, CharacterData> = mapFromObject({
    elf: {
        name: 'Elf',
        maxHp: 3,
    },
    jeanne: {
        name: 'Jeanne',
        maxHp: 4,
    },
    medusa: {
        name: 'Medusa',
        maxHp: 3,
    },
});

const demons: Map<string, DemonData> = mapFromObject({
    chiyo: {
        name: 'Chiyo',
    },
    meru: {
        name: 'Meru',
    },
    miyu: {
        name: 'Miyu',
    },
});

const enemies: Map<string, EnemyData> = mapFromObject({
    jotun: {
        name: 'Jotun',
        maxHp: 10,
    },
});

const starterCharacters = ['elf', 'jeanne', 'medusa'];

const starterDemons = ['chiyo', 'meru', 'miyu'];

export function getStarterCharacterIds(): readonly string[] {
    return starterCharacters;
}

export function getStarterDemonIds(): readonly string[] {
    return starterDemons;
}

export function getEnemy(enemyId: string): EnemyData {
    const enemy = enemies.get(enemyId);

    if (undefined === enemy) {
        throw new Error('No such enemy.');
    }

    return enemy;
}

export function getCharacter(characterId: string): CharacterData {
    const character = characters.get(characterId);

    if (undefined === character) {
        throw new Error('No such character.');
    }

    return character;
}
