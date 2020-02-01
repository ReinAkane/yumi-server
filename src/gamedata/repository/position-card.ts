import { PositionCardData } from '../types';
import * as components from '../../state/types';
import { Prefab } from '../../state';
import { mapFromObject } from './map-from-object';
import {
    createComponents, componentsToComponentMap, createComponentData, componentDataToComponentMap,
} from './prefab-helpers';

function createPositionCard(dataId: string, options: {
    effects?: components.ComponentData[][],
    tags?: components.PositionCardTag[],
    links?: {
        [entityId: string]: components.ComponentData[],
    }
}): Prefab<typeof components.POSITION_CARD> {
    let nextId = 0;
    const linkEffects: components.Component<typeof components.LINK_EFFECT>[] = [];

    const result: Prefab<typeof components.POSITION_CARD> = {
        root: {
            components: {
                [components.POSITION_CARD]: createComponents <typeof components.POSITION_CARD>({
                    id: 'positionCard',
                    data: {
                        dataId,
                        type: components.POSITION_CARD,
                        effectRef: {
                            id: 'effect',
                            withComponents: {},
                        },
                        tags: new Set(options.tags),
                    },
                }),
            },
        },
        effect: {
            components: { [components.LINK_EFFECT]: linkEffects },
        },
    };

    const links = options?.links || {};

    for (const linkId of Object.keys(links)) {
        if (result[linkId] !== undefined) {
            throw new Error(`Cannot have duplicate ids in prefab. Problematic id: ${linkId}`);
        }

        result[linkId] = {
            components: componentsToComponentMap(links[linkId].map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        };
    }

    for (const effect of options?.effects || []) {
        nextId += 1;
        const effectId = String(nextId);

        result[effectId] = {
            components: componentsToComponentMap(effect.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        };

        nextId += 1;
        linkEffects.push({
            id: String(nextId),
            data: {
                type: components.LINK_EFFECT,
                ref: {
                    id: effectId,
                    withComponents: {},
                },
            },
        });
    }

    return result;
}

const asAttacker = createComponentData({
    type: components.IF_OWNER_IS,
    actorTag: 'attacker',
}, {
    type: components.COMBAT_EFFECT,
    on: 'after attack',
});
const asDefender = createComponentData({
    type: components.IF_OWNER_IS,
    actorTag: 'defender',
}, {
    type: components.COMBAT_EFFECT,
    on: 'after attack',
});
const asReactive = createComponentData({
    type: components.IF_OWNER_IS,
    actorTag: 'reactive',
}, {
    type: components.COMBAT_EFFECT,
    on: 'before act',
});

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
            effects: [
                createComponentData(...asReactive, {
                    type: components.TAUNT,
                    modifier: 1,
                }),
                createComponentData(...asDefender, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 5,
                }),
            ],
            tags: ['beneficial', 'defensive'],
        }),
    },
    attack: {
        name: 'in position to attack',
        prefab: createPositionCard('attack', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 5,
                }),
            ],
            tags: ['beneficial', 'offensive'],
        }),
    },
    vengeance: {
        name: 'parrying',
        prefab: createPositionCard('vengeance', {
            effects: [
                createComponentData(...asDefender, {
                    type: components.ATTACK,
                    actor: 'defender',
                    target: 'attacker',
                }, {
                    type: components.TAUNT,
                    modifier: 0.5,
                }, {
                    type: components.BONUS_DAMAGE,
                    add: -5,
                }),
            ],
            tags: ['beneficial', 'defensive'],
        }),
    },
    sneaking: {
        name: 'sneaking',
        prefab: createPositionCard('sneaking', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -1,
                }),
            ],
            tags: ['beneficial', 'defensive'],
        }),
    },

    // -- assassin --
    'assassin.initial': {
        name: 'quietly advancing',
        prefab: createPositionCard('assassin.initial', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -2,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -5,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'assassin.advancing-a': {
        name: 'quietly advancing',
        prefab: createPositionCard('assassin.advancing-a', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -2,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -3,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'assassin.advancing-b': {
        name: 'quietly advancing',
        prefab: createPositionCard('assassin.advancing-b', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -2,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -1,
                }),
            ],
            tags: ['offensive'],
        }),
    },
    'assassin.sneaking-a': {
        name: 'sneaking around',
        prefab: createPositionCard('assassin.sneaking-a', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -1,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -4,
                }, {
                    type: components.ARMOR_PENETRATION,
                    multiplier: 0.8,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'assassin.sneaking-b': {
        name: 'sneaking around',
        prefab: createPositionCard('assassin.sneaking-b', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -1,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -2,
                }, {
                    type: components.ARMOR_PENETRATION,
                    multiplier: 0.9,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'assassin.stumble': {
        name: 'stumbling',
        prefab: createPositionCard('assassin.stumble', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: +1,
                }),
                createComponentData(...asDefender, {
                    type: components.BONUS_DAMAGE,
                    add: 5,
                }, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: -5,
                }),
            ],
            tags: ['detrimental'],
        }),
    },
    'assassin.in-position-a': {
        name: 'in position to strike',
        prefab: createPositionCard('assassin.in-position-a', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 6,
                }, {
                    type: components.APPLY_BUFF,
                    duration: 2,
                    applyTo: 'attacker',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asReactive, {
                                    type: components.THREAT,
                                    modifier: 1,
                                },
                            ]),
                        },
                    },
                }),
            ],
            tags: ['offensive'],
        }),
    },
    'assassin.in-position-b': {
        name: 'in position to strike',
        prefab: createPositionCard('assassin.in-position-b', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 5,
                }, {
                    type: components.APPLY_BUFF,
                    duration: 2,
                    applyTo: 'attacker',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asReactive, {
                                    type: components.THREAT,
                                    modifier: 1,
                                },
                            ]),
                        },
                    },
                }),
            ],
            tags: ['offensive'],
        }),
    },

    // -- tank --
    'tank.initial': {
        name: 'advancing',
        prefab: createPositionCard('tank.initial', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -1,
                }),
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -4,
                }),
            ],
        }),
    },
    'tank.advancing-a': {
        name: 'cautiously advancing',
        prefab: createPositionCard('tank.advancing-a', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -1,
                }),
                createComponentData(...asDefender, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 2,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'tank.advancing-b': {
        name: 'cautiously advancing',
        prefab: createPositionCard('tank.advancing-b', {
            effects: [
                createComponentData(...asDefender, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 1,
                }),
            ],
            tags: ['defensive', 'beneficial'],
        }),
    },
    'tank.taunt-a': {
        name: 'pressuring the enemy',
        prefab: createPositionCard('tank.taunt-a', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.TAUNT,
                    modifier: 1,
                }),
                createComponentData(...asDefender, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 3,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'tank.taunt-b': {
        name: 'pressuring the enemy',
        prefab: createPositionCard('tank.taunt-b', {
            effects: [
                createComponentData(...asReactive, {
                    type: components.TAUNT,
                    modifier: 0.5,
                }),
                createComponentData(...asDefender, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 6,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'tank.bracing': {
        name: 'bracing for impact',
        prefab: createPositionCard('tank.bracing', {
            effects: [
                createComponentData(...asDefender, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 8,
                }),
            ],
            tags: ['defensive'],
        }),
    },
    'tank.attack-a': {
        name: 'ready to attack',
        prefab: createPositionCard('tank.attack-a', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 1,
                }),
                createComponentData(...asDefender, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 2,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 0.5,
                }),
            ],
            tags: ['offensive'],
        }),
    },
    'tank.attack-b': {
        name: 'ready to attack',
        prefab: createPositionCard('tank.attack-b', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 2,
                }, {
                    type: components.APPLY_BUFF,
                    duration: 2,
                    applyTo: 'attacker',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asReactive, {
                                    type: components.THREAT,
                                    modifier: 0.25,
                                },
                            ]),
                        },
                    },
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 0.5,
                }),
            ],
            tags: ['offensive'],
        }),
    },

    // -- DPS --
    'dps.initial': {
        name: 'advancing',
        prefab: createPositionCard('dps.initial', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: -1,
                }),
                createComponentData(...asDefender, {
                    type: components.THREAT,
                    modifier: -1,
                }),
            ],
        }),
    },
    'dps.advancing-a': {
        name: 'advancing',
        prefab: createPositionCard('dps.advancing-a', {
        }),
    },
    'dps.advancing-b': {
        name: 'aggressively advancing',
        prefab: createPositionCard('dps.advancing-b', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 2,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
            ],
        }),
    },
    'dps.idle': {
        name: 'ready for combat',
        prefab: createPositionCard('dps.idle', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 1,
                }),
            ],
        }),
    },
    'dps.attack-a': {
        name: 'in position to attack',
        prefab: createPositionCard('dps.attack-a', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 3,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
            ],
        }),
    },
    'dps.attack-b': {
        name: 'in position to attack',
        prefab: createPositionCard('dps.attack-b', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 4,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
            ],
        }),
    },
    'dps.all-in-a': {
        name: 'going all in',
        prefab: createPositionCard('dps.all-in-a', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 5,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 2,
                }),
            ],
        }),
    },
    'dps.all-in-b': {
        name: 'going all in',
        prefab: createPositionCard('dps.all-in-b', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.BONUS_DAMAGE,
                    add: 3,
                }, {
                    type: components.ARMOR_PENETRATION,
                    multiplier: 0.5,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 2,
                }),
            ],
        }),
    },
});

export function getPositionCard(positionCardId: string): PositionCardData {
    const positionCard = positionCards.get(positionCardId);

    if (undefined === positionCard) {
        throw new Error(`No such position card ${positionCardId}.`);
    }

    return positionCard;
}
