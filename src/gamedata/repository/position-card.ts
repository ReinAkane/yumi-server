import { PositionCardData } from '../types';
import * as components from '../../state/types';
import { Prefab } from '../../state/prefabs';
import { mapFromObject } from './map-from-object';
import { createComponents, componentsToComponentMap, createComponentData } from './prefab-helpers';

function createPositionCard(dataId: string, options: {
    attackEffects?: components.ComponentData[],
    defendEffects?: components.ComponentData[],
    universalEffects?: components.ComponentData[],
    tags?: components.PositionCardTag[],
    links?: {
        [entityId: string]: components.ComponentData[],
    }
}): Prefab<typeof components.POSITION_CARD> {
    let nextId = 0;

    const result: Prefab<typeof components.POSITION_CARD> = {
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
                        tags: new Set(options.tags),
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

    return result;
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
            tags: ['beneficial', 'defensive'],
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
            tags: ['beneficial', 'offensive'],
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
            tags: ['beneficial', 'defensive'],
        }),
    },
    sneaking: {
        name: 'sneaking',
        prefab: createPositionCard('sneaking', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -1,
            }),
            tags: ['beneficial', 'defensive'],
        }),
    },

    // -- assassin --
    'assassin.initial': {
        name: 'quietly advancing',
        prefab: createPositionCard('assassin.initial', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -2,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: -5,
            }),
            tags: ['defensive'],
        }),
    },
    'assassin.advancing-a': {
        name: 'quietly advancing',
        prefab: createPositionCard('assassin.advancing-a', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -2,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: -3,
            }),
            tags: ['defensive'],
        }),
    },
    'assassin.advancing-b': {
        name: 'quietly advancing',
        prefab: createPositionCard('assassin.advancing-b', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -2,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: -1,
            }),
            tags: ['offensive'],
        }),
    },
    'assassin.sneaking-a': {
        name: 'sneaking around',
        prefab: createPositionCard('assassin.sneaking-a', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -1,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: -4,
            }, {
                type: components.ARMOR_PENETRATION,
                multiplier: 0.8,
            }),
            tags: ['defensive'],
        }),
    },
    'assassin.sneaking-b': {
        name: 'sneaking around',
        prefab: createPositionCard('assassin.sneaking-b', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -1,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: -2,
            }, {
                type: components.ARMOR_PENETRATION,
                multiplier: 0.9,
            }),
            tags: ['defensive'],
        }),
    },
    'assassin.stumble': {
        name: 'stumbling',
        prefab: createPositionCard('assassin.stumble', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: +1,
            }, {
                type: components.BONUS_DAMAGE,
                add: 5,
            }, {
                type: components.DAMAGE_REDUCTION,
                subtract: -5,
            }),
            tags: ['detrimental'],
        }),
    },
    'assassin.in-position-a': {
        name: 'in position to strike',
        prefab: createPositionCard('assassin.in-position-a', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 6,
            }, {
                type: components.APPLY_BUFF,
                duration: 2,
                applyTo: 'attacker',
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                defendRef: {
                    id: 'threatDebuff',
                    withComponents: {},
                },
            }),
            tags: ['offensive'],
            links: {
                threatDebuff: createComponentData({
                    type: components.THREAT,
                    modifier: 1,
                }),
                emptyBuff: [],
            },
        }),
    },
    'assassin.in-position-b': {
        name: 'in position to strike',
        prefab: createPositionCard('assassin.in-position-b', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 5,
            }, {
                type: components.APPLY_BUFF,
                duration: 2,
                applyTo: 'attacker',
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                defendRef: {
                    id: 'threatDebuff',
                    withComponents: {},
                },
            }),
            tags: ['offensive'],
            links: {
                threatDebuff: createComponentData({
                    type: components.THREAT,
                    modifier: 1,
                }),
                emptyBuff: [],
            },
        }),
    },

    // -- tank --
    'tank.initial': {
        name: 'advancing',
        prefab: createPositionCard('tank.initial', {
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -1,
            }),
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: -4,
            }),
        }),
    },
    'tank.advancing-a': {
        name: 'cautiously advancing',
        prefab: createPositionCard('tank.advancing-a', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: -1,
            }),
            defendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 2,
            }),
            tags: ['defensive'],
        }),
    },
    'tank.advancing-b': {
        name: 'cautiously advancing',
        prefab: createPositionCard('tank.advancing-b', {
            defendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 1,
            }),
            tags: ['defensive', 'beneficial'],
        }),
    },
    'tank.taunt-a': {
        name: 'pressuring the enemy',
        prefab: createPositionCard('tank.taunt-a', {
            defendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 1,
            }, {
                type: components.DAMAGE_REDUCTION,
                subtract: 3,
            }),
            tags: ['defensive'],
        }),
    },
    'tank.taunt-b': {
        name: 'pressuring the enemy',
        prefab: createPositionCard('tank.taunt-b', {
            defendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 0.5,
            }, {
                type: components.DAMAGE_REDUCTION,
                subtract: 6,
            }),
            tags: ['defensive'],
        }),
    },
    'tank.bracing': {
        name: 'bracing for impact',
        prefab: createPositionCard('tank.bracing', {
            defendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 8,
            }),
            tags: ['defensive'],
        }),
    },
    'tank.attack-a': {
        name: 'ready to attack',
        prefab: createPositionCard('tank.attack-a', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 1,
            }),
            defendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 2,
            }, {
                type: components.THREAT,
                modifier: 0.5,
            }),
            tags: ['offensive'],
        }),
    },
    'tank.attack-b': {
        name: 'ready to attack',
        prefab: createPositionCard('tank.attack-b', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 2,
            }, {
                type: components.APPLY_BUFF,
                duration: 2,
                applyTo: 'attacker',
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                defendRef: {
                    id: 'threatDebuff',
                    withComponents: {},
                },
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 0.5,
            }),
            links: {
                emptyBuff: [],
                threatDebuff: createComponentData({
                    type: components.THREAT,
                    modifier: 0.25,
                }),
            },
            tags: ['offensive'],
        }),
    },

    // -- DPS --
    'dps.initial': {
        name: 'advancing',
        prefab: createPositionCard('dps.initial', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 1,
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: -1,
            }),
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
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 2,
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }),
        }),
    },
    'dps.idle': {
        name: 'ready for combat',
        prefab: createPositionCard('dps.idle', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 1,
            }),
        }),
    },
    'dps.attack-a': {
        name: 'in position to attack',
        prefab: createPositionCard('dps.attack-a', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 3,
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }),
        }),
    },
    'dps.attack-b': {
        name: 'in position to attack',
        prefab: createPositionCard('dps.attack-b', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 4,
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }),
        }),
    },
    'dps.all-in-a': {
        name: 'going all in',
        prefab: createPositionCard('dps.all-in-a', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 5,
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 2,
            }),
        }),
    },
    'dps.all-in-b': {
        name: 'going all in',
        prefab: createPositionCard('dps.all-in-b', {
            attackEffects: createComponentData({
                type: components.BONUS_DAMAGE,
                add: 3,
            }, {
                type: components.ARMOR_PENETRATION,
                multiplier: 0.5,
            }),
            defendEffects: createComponentData({
                type: components.THREAT,
                modifier: 2,
            }),
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
