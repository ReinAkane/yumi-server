import {
    CharacterData, EnemyData, ActionCardData, PositionCardData,
} from './types';
import * as components from '../state/types';
import { Prefab } from '../state/prefabs';


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
        baseArmor: 0,
    },
    jeanne: {
        name: 'Jeanne',
        maxHp: 40,
        actionCards: ['attack', 'defend', 'vengeance'],
        positionCards: [['advance'], ['advance', 'defend'], ['defend', 'defend', 'basic']],
        baseDamage: 3,
        baseArmor: 2,
    },
    medusa: {
        name: 'Medusa',
        maxHp: 30,
        actionCards: ['attack', 'attack', 'defend'],
        positionCards: [['advance'], ['advance', 'attack'], ['attack', 'attack', 'basic']],
        baseDamage: 5,
        baseArmor: 0,
    },
});

const enemies: Map<string, EnemyData> = mapFromObject({
    jotun: {
        name: 'Jotun',
        maxHp: 100,
        actionCards: ['basic', 'attack', 'defend', 'vengeance'],
        baseDamage: 10,
        baseArmor: 0,
    },
});

function createComponents<T extends components.UnionType>(
    ...items: components.Component<T>[]
): components.Component<T>[] {
    return items;
}

function componentsToComponentMap(items: components.Component[] = []): {
    readonly [T in components.UnionType]?: readonly components.Component<T>[];
} {
    const result: {[T in components.UnionType]?: components.Component<T>[]} = {};

    for (const item of items) {
        const list = result[item.data.type];
        if (list === undefined) {
            result[item.data.type] = [item];
        } else {
            list.push(item);
        }
    }

    return result;
}

function createActionCard(dataId: string, options: {
    activeAttackEffects?: components.ComponentData[],
    activeDefendEffects?: components.ComponentData[],
    activeUniversalEffects?: components.ComponentData[],
    reactiveAttackEffects?: components.ComponentData[],
    reactiveDefendEffects?: components.ComponentData[],
    reactiveUniversalEffects?: components.ComponentData[],
}): Prefab<typeof components.ACTION_CARD> {
    let nextId = 0;

    return {
        root: {
            components: {
                [components.ACTION_CARD]: createComponents<typeof components.ACTION_CARD>({
                    id: 'actionCard',
                    data: {
                        dataId,
                        type: components.ACTION_CARD,
                        activeEffectRef: {
                            id: 'activeEffect',
                            type: components.COMBAT_EFFECT,
                        },
                        reactiveEffectRef: {
                            id: 'reactiveEffect',
                            type: components.COMBAT_EFFECT,
                        },
                    },
                }),
                [components.COMBAT_EFFECT]: createComponents<typeof components.COMBAT_EFFECT>({
                    id: 'activeEffect',
                    data: {
                        type: components.COMBAT_EFFECT,
                        universalRef: {
                            id: 'activeUniversalEntity',
                            withComponents: {},
                        },
                        attackRef: {
                            id: 'activeAttackEntity',
                            withComponents: {},
                        },
                        defendRef: {
                            id: 'activeDefendEntity',
                            withComponents: {},
                        },
                    },
                }, {
                    id: 'reactiveEffect',
                    data: {
                        type: components.COMBAT_EFFECT,
                        universalRef: {
                            id: 'reactiveUniversalEntity',
                            withComponents: {},
                        },
                        attackRef: {
                            id: 'reactiveAttackEntity',
                            withComponents: {},
                        },
                        defendRef: {
                            id: 'reactiveDefendEntity',
                            withComponents: {},
                        },
                    },
                }),
            },
        },
        activeAttackEntity: {
            components: componentsToComponentMap(options?.activeAttackEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        activeDefendEntity: {
            components: componentsToComponentMap(options?.activeDefendEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        activeUniversalEntity: {
            components: componentsToComponentMap(options?.activeUniversalEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        reactiveAttackEntity: {
            components: componentsToComponentMap(options?.reactiveAttackEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        reactiveDefendEntity: {
            components: componentsToComponentMap(options?.reactiveDefendEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        reactiveUniversalEntity: {
            components: componentsToComponentMap(options?.reactiveUniversalEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
    };
}

function createComponentData<T extends components.UnionType>(
    ...items: components.ComponentData<T>[]
): components.ComponentData<T>[] {
    return items;
}

const actionCards: Map<string, ActionCardData> = mapFromObject<Omit<ActionCardData, 'id'>>({
    basic: {
        name: 'Blank Card',
        prefab: createActionCard('basic', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }),
        }),
    },
    defend: {
        name: 'Defend +5',
        prefab: createActionCard('defend', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.RAGE,
                tauntMultiplier: 0.5,
            }),
            activeDefendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 5,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 5,
            }, {
                type: components.TAUNT,
                modifier: 1,
            }),
        }),
    },
    attack: {
        name: 'Attack +5',
        prefab: createActionCard('attack', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: 5,
            }, {
                type: components.RAGE,
                tauntMultiplier: 1.5,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }),
        }),
    },
    vengeance: {
        name: 'Retaliate',
        prefab: createActionCard('vengeance', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }),
            reactiveAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: -5,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 0.5,
            }),
        }),
    },
});

function createPositionCard(dataId: string, options: {
    attackEffects?: components.ComponentData[],
    defendEffects?: components.ComponentData[],
    universalEffects?: components.ComponentData[],
}): Prefab<typeof components.POSITION_CARD> {
    let nextId = 0;

    return {
        root: {
            components: {
                [components.POSITION_CARD]: createComponents <typeof components.POSITION_CARD>({
                    id: 'actionCard',
                    data: {
                        dataId,
                        type: components.POSITION_CARD,
                        effectRef: {
                            id: 'effect',
                            type: components.COMBAT_EFFECT,
                        },
                    },
                }),
                [components.COMBAT_EFFECT]: createComponents<typeof components.COMBAT_EFFECT>({
                    id: 'effect',
                    data: {
                        type: components.COMBAT_EFFECT,
                        universalRef: {
                            id: 'universalEntity',
                            withComponents: {},
                        },
                        attackRef: {
                            id: 'attackEntity',
                            withComponents: {},
                        },
                        defendRef: {
                            id: 'defendEntity',
                            withComponents: {},
                        },
                    },
                }),
            },
        },
        attackEntity: {
            components: componentsToComponentMap(options?.attackEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        defendEntity: {
            components: componentsToComponentMap(options?.defendEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        universalEntity: {
            components: componentsToComponentMap(options?.universalEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
    };
}

const positionCards: Map<string, PositionCardData> = mapFromObject<Omit<PositionCardData, 'id'>>({
    basic: {
        name: 'idling',
        prefab: createPositionCard('basic', { }),
    },
    advance: {
        name: 'advancing',
        prefab: createPositionCard('advance', { }),
    },
    defend: {
        name: 'bracing for impact',
        prefab: createPositionCard('defend', {
            defendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 5,
            }, {
                type: components.TAUNT,
                modifier: 1,
            }),
        }),
    },
    attack: {
        name: 'in position to attack',
        prefab: createPositionCard('attack', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 5,
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }),
        }),
    },
    vengeance: {
        name: 'parrying',
        prefab: createPositionCard('vengeance', {
            defendEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.TAUNT,
                modifier: 0.5,
            }, {
                type: components.BONUS_DAMAGE,
                add: -5,
            }),
        }),
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
        throw new Error(`No such position card ${positionCardId}.`);
    }

    return positionCard;
}
