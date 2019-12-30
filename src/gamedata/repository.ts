import {
    CharacterData, EnemyData, ActionCardData, PositionCardData,
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
        positionCards: [['basic'], ['basic'], ['basic']],
    },
    jeanne: {
        name: 'Jeanne',
        maxHp: 40,
        actionCards: ['attack', 'defend', 'defend'],
        positionCards: [['basic'], ['basic'], ['basic']],
    },
    medusa: {
        name: 'Medusa',
        maxHp: 30,
        actionCards: ['attack', 'attack', 'defend'],
        positionCards: [['basic'], ['basic'], ['basic']],
    },
});

const enemies: Map<string, EnemyData> = mapFromObject({
    jotun: {
        name: 'Jotun',
        maxHp: 100,
        actionCards: [],
        baseDamage: 10,
    },
});

const actionCards: Map<string, ActionCardData> = mapFromObject<Omit<ActionCardData, 'id'>>({
    basic: {
        name: 'Blank Card',
        attackPrefab: [],
        defendPrefab: [],
    },
    defend: {
        name: 'Defend 5',
        attackPrefab: [],
        defendPrefab: [{
            type: components.DAMAGE_REDUCTION,
            subtract: 5,
        }],
    },
    attack: {
        name: 'Attack 5',
        attackPrefab: [{
            type: components.BONUS_DAMAGE,
            add: 5,
        }],
        defendPrefab: [],
    },
});

const positionCards: Map<string, PositionCardData> = mapFromObject({
    basic: {
        name: 'Blank Position',
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

export function getPositionCard(positionCardId: string): PositionCardData {
    const positionCard = positionCards.get(positionCardId);

    if (undefined === positionCard) {
        throw new Error('No such position card.');
    }

    return positionCard;
}
