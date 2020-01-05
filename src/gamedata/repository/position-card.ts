import { PositionCardData } from '../types';
import * as components from '../../state/types';
import { Prefab } from '../../state/prefabs';
import { mapFromObject } from './map-from-object';
import { createComponents, componentsToComponentMap, createComponentData } from './prefab-helpers';

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

export function getPositionCard(positionCardId: string): PositionCardData {
    const positionCard = positionCards.get(positionCardId);

    if (undefined === positionCard) {
        throw new Error(`No such position card ${positionCardId}.`);
    }

    return positionCard;
}
