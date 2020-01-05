import { ActionCardData } from '../types';
import * as components from '../../state/types';
import { Prefab } from '../../state/prefabs';
import { mapFromObject } from './map-from-object';
import { createComponents, componentsToComponentMap, createComponentData } from './prefab-helpers';

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

export function getActionCard(actionCardId: string): ActionCardData {
    const actionCard = actionCards.get(actionCardId);

    if (undefined === actionCard) {
        throw new Error('No such action card.');
    }

    return actionCard;
}
