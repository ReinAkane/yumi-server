import {
    CharacterData, EnemyData, ActionCardData,
} from './types';
import * as components from '../state/types';

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
        maxHp: 30,
        actionCards: ['attack', 'attack', 'defend'],
        positionCards: [['advance'], ['advance', 'attack'], ['attack', 'attack', 'basic']],
        baseDamage: 5,
    },
    jeanne: {
        name: 'Jeanne',
        maxHp: 40,
        actionCards: ['attack', 'defend', 'defend'],
        positionCards: [['advance'], ['advance', 'defend'], ['defend', 'defend', 'basic']],
        baseDamage: 3,
    },
    medusa: {
        name: 'Medusa',
        maxHp: 30,
        actionCards: ['attack', 'attack', 'defend'],
        positionCards: [['advance'], ['advance', 'attack'], ['attack', 'attack', 'basic']],
        baseDamage: 5,
    },
});

const enemies: Map<string, EnemyData> = mapFromObject({
    jotun: {
        name: 'Jotun',
        maxHp: 100,
        actionCards: ['basic', 'attack', 'defend'],
        baseDamage: 10,
    },
});

const actionCards: Map<string, ActionCardData> = mapFromObject<Omit<ActionCardData, 'id'>>({
    basic: {
        name: 'Blank Card',
        positionDescription: 'idling',
        attackPrefab: [],
        defendPrefab: [],
    },
    defend: {
        name: 'Defend +5',
        positionDescription: 'bracing for impact',
        attackPrefab: [{
            type: components.RAGE,
            tauntMultiplier: 0.5,
        }],
        defendPrefab: [
            {
                type: components.DAMAGE_REDUCTION,
                subtract: 5,
            },
            {
                type: components.TAUNT,
                modifier: 1,
            },
        ],
    },
    attack: {
        name: 'Attack +5',
        positionDescription: 'in position to attack',
        attackPrefab: [
            {
                type: components.BONUS_DAMAGE,
                add: 5,
            },
            {
                type: components.RAGE,
                tauntMultiplier: 1.5,
            },
        ],
        defendPrefab: [{
            type: components.THREAT,
            modifier: 1,
        }],
    },
    advance: {
        name: 'Blank Card',
        positionDescription: 'advancing',
        attackPrefab: [],
        defendPrefab: [],
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

export function getActionCard(actionCardId: string): ActionCardData {
    const actionCard = actionCards.get(actionCardId);

    if (undefined === actionCard) {
        throw new Error('No such action card.');
    }

    return actionCard;
}
