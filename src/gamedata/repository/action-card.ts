import { ActionCardData } from '../types';
import * as components from '../../state/types';
import { Prefab } from '../../state';
import { mapFromObject } from './map-from-object';
import {
    createComponents, componentsToComponentMap, createComponentData, componentDataToComponentMap,
} from './prefab-helpers';

function createActionCard(dataId: string, options: {
    effects?: components.ComponentData[][],
    links?: {
        [entityId: string]: components.ComponentData[],
    }
}): Prefab<typeof components.ACTION_CARD> {
    let nextId = 0;
    const linkEffects: components.Component<typeof components.LINK_EFFECT>[] = [];

    const result: Prefab<typeof components.ACTION_CARD> = {
        root: {
            components: {
                [components.ACTION_CARD]: createComponents<typeof components.ACTION_CARD>({
                    id: 'actionCard',
                    data: {
                        dataId,
                        type: components.ACTION_CARD,
                    },
                }),
                [components.LINK_EFFECT]: linkEffects,
            },
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
const asActive = createComponentData({
    type: components.IF_OWNER_IS,
    actorTag: 'active',
}, {
    type: components.COMBAT_EFFECT,
    on: 'before act',
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
const asReactiveTeam = createComponentData({
    type: components.IF_TEAM_IS,
    tag: 'reactive',
}, {
    type: components.COMBAT_EFFECT,
    on: 'before act',
});

const actionCards: Map<string, ActionCardData> = mapFromObject<Omit<ActionCardData, 'id'>>({
    // -- Jeanne --
    'jeanne.double-swing': {
        name: 'Double Swing / Strike Back',
        prefab: createActionCard('jeanne.double-swing', {
            effects: [
                createComponentData(
                    ...asActive, {
                        type: components.ATTACK,
                        actor: 'active',
                        target: 'reactive',
                    }, {
                        type: components.ATTACK,
                        actor: 'active',
                        target: 'reactive',
                    },
                ),
                createComponentData(
                    ...asReactive, {
                        type: components.ATTACK,
                        actor: 'reactive',
                        target: 'active',
                    }, {
                        type: components.THREAT,
                        modifier: 1,
                    },
                ),
            ],
        }),
    },
    'jeanne.tireless-assault': {
        name: 'Tireless Assault / Stall',
        prefab: createActionCard('jeanne.tireless-assault', {
            effects: [
                createComponentData(
                    ...asActive, {
                        type: components.ATTACK,
                        actor: 'active',
                        target: 'reactive',
                    }, {
                        type: components.DRAW_ACTION_CARD,
                        mustMatch: 'attacker',
                    },
                ),
                createComponentData(
                    ...asReactive, {
                        type: components.TAUNT,
                        modifier: 1,
                    },
                ),
                createComponentData(
                    ...asDefender, {
                        type: components.DRAW_ACTION_CARD,
                    }, {
                        type: components.IF_OWNER_IS,
                        actorTag: 'reactive',
                    },
                ),
            ],
        }),
    },
    'jeanne.shielded-strike': {
        name: 'Shielded Strike / Advancing Defense',
        prefab: createActionCard('jeanne.shielded-strike', {
            effects: [
                createComponentData(
                    ...asActive, {
                        type: components.ATTACK,
                        actor: 'active',
                        target: 'reactive',
                    }, {
                        type: components.APPLY_BUFF,
                        duration: 1,
                        applyTo: 'active',
                        prefab: {
                            root: {
                                components: componentDataToComponentMap([
                                    ...asDefender, {
                                        type: components.DAMAGE_REDUCTION,
                                        subtract: 5,
                                    },
                                ]),
                            },
                        },
                    },
                ),
                createComponentData(
                    ...asReactive, {
                        type: components.THREAT,
                        modifier: 1,
                    }, {
                        type: components.TAUNT,
                        modifier: 1,
                    }, {
                        type: components.MOVE_TO_POSITION,
                        tags: new Set(['offensive']),
                        applyTo: 'reactive',
                    },
                ),
                createComponentData(
                    ...asDefender, {
                        type: components.IF_OWNER_IS,
                        actorTag: 'reactive',
                    }, {
                        type: components.DAMAGE_REDUCTION,
                        subtract: 5,
                    },
                ),
            ],
        }),
    },
    'jeanne.shield-bash': {
        name: 'Shield Bash / Stoic Defense',
        prefab: createActionCard('jeanne.shield-bash', {
            effects: [
                createComponentData(
                    ...asDefender, {
                        type: components.IF_OWNER_IS,
                        actorTag: 'active',
                    }, {
                        type: components.CANCEL_ATTACKS,
                    },
                ),
                createComponentData(
                    ...asActive, {
                        type: components.ATTACK,
                        actor: 'active',
                        target: 'reactive',
                    },
                ),
                createComponentData(
                    ...asReactive, {
                        type: components.TAUNT,
                        modifier: 1,
                    },
                ),
                createComponentData(
                    ...asDefender, {
                        type: components.IF_OWNER_IS,
                        actorTag: 'reactive',
                    }, {
                        type: components.DAMAGE_REDUCTION,
                        subtract: 10,
                    },
                ),
            ],
        }),
    },
    'jeanne.heavy-strike': {
        name: 'Heavy Strike / Dull',
        prefab: createActionCard('jeanne.heavy-strike', {
            effects: [
                createComponentData(
                    ...asActive, {
                        type: components.ATTACK,
                        actor: 'active',
                        target: 'reactive',
                    },
                ),
                createComponentData(
                    ...asAttacker, {
                        type: components.IF_OWNER_IS,
                        actorTag: 'active',
                    }, {
                        type: components.BONUS_DAMAGE,
                        add: 5,
                    },
                ),
                createComponentData(
                    ...asReactive, {
                        type: components.TAUNT,
                        modifier: 1,
                    }, {
                        type: components.APPLY_BUFF,
                        applyTo: 'active',
                        duration: 3,
                        prefab: {
                            root: {
                                components: componentDataToComponentMap([
                                    ...asAttacker, {
                                        type: components.BONUS_DAMAGE,
                                        add: -3,
                                    },
                                ]),
                            },
                        },
                    },
                ),
            ],
        }),
    },

    // -- shared --
    'shared.piercing-attack': {
        name: 'Piercing Attack / Brace',
        prefab: createActionCard('shared.piercing-attack', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'active',
                }, {
                    type: components.ARMOR_PENETRATION,
                    multiplier: 0.25,
                }),
                createComponentData(...asDefender, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'reactive',
                }, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 4,
                }),
            ],
        }),
    },

    // -- Elf --
    'elf.ignite-arrows': {
        name: 'Ignite Arrows / Chilling Arrows',
        prefab: createActionCard('elf.ignite-arrows', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }, {
                    type: components.APPLY_BUFF,
                    duration: 3,
                    applyTo: 'active',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asAttacker, {
                                    type: components.BONUS_DAMAGE,
                                    add: 3,
                                },
                            ]),
                        },
                    },
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'active',
                }, {
                    type: components.BONUS_DAMAGE,
                    add: -3,
                }),
                createComponentData(...asReactive, {
                    type: components.APPLY_BUFF,
                    duration: 3,
                    applyTo: 'reactive',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asAttacker, {
                                    type: components.APPLY_BUFF,
                                    duration: 3,
                                    applyTo: 'defender',
                                    prefab: {
                                        root: {
                                            components: componentDataToComponentMap([
                                                ...asAttacker, {
                                                    type: components.BONUS_DAMAGE,
                                                    add: -2,
                                                },
                                            ]),
                                        },
                                    },
                                },
                            ]),
                        },
                    },
                }),
                createComponentData(...asDefender, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'reactive',
                }, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: 2,
                }),
            ],
        }),
    },
    'elf.triple-shot': {
        name: 'Triple Shot / Quick Shot',
        prefab: createActionCard('elf.triple-shot', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'active',
                }, {
                    type: components.BONUS_DAMAGE,
                    add: -4,
                }),
                createComponentData(...asReactive, {
                    type: components.ATTACK,
                    actor: 'reactive',
                    target: 'active',
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'reactive',
                }, {
                    type: components.BONUS_DAMAGE,
                    add: -2,
                }),
            ],
        }),
    },
    'elf.stinging-shot': {
        name: 'Stinging Arrows / Make Scarce',
        prefab: createActionCard('elf.stinging-shot', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }, {
                    type: components.APPLY_BUFF,
                    duration: 3,
                    applyTo: 'active',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asAttacker, {
                                    type: components.APPLY_BUFF,
                                    duration: 3,
                                    applyTo: 'defender',
                                    prefab: {
                                        root: {
                                            components: componentDataToComponentMap([
                                                ...asActive, {
                                                    type: components.RAGE,
                                                    tauntMultiplier: 1.3,
                                                },
                                            ]),
                                        },
                                    },
                                },
                            ]),
                        },
                    },
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'active',
                }, {
                    type: components.BONUS_DAMAGE,
                    add: -3,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -2,
                }),
            ],
        }),
    },
    'elf.double-shot': {
        name: 'Double Shot / Recycle',
        prefab: createActionCard('elf.double-shot', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }),
                createComponentData(...asDefender, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'reactive',
                }, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: -3,
                }),
                createComponentData(...asReactiveTeam, {
                    type: components.DRAW_ACTION_CARD,
                }),
            ],
        }),
    },

    // -- Medu --
    'medu.debilitating-poison': {
        name: 'Debilitating Poison / Evade',
        prefab: createActionCard('medu.debilitating-poison', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'active',
                }, {
                    type: components.APPLY_BUFF,
                    duration: 1,
                    applyTo: 'defender',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asAttacker, {
                                    type: components.BONUS_DAMAGE,
                                    add: -7,
                                },
                            ]),
                        },
                    },
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -1,
                }),
                createComponentData(...asReactiveTeam, {
                    type: components.MOVE_TO_POSITION,
                    tags: new Set(['defensive']),
                    applyTo: 'owner',
                }),
            ],
        }),
    },
    'medu.into-the-shadows': {
        name: 'Into the Shadows / Make Scarce',
        prefab: createActionCard('medu.into-the-shadows', {
            effects: [
                createComponentData(...asAttacker, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }, {
                    type: components.APPLY_BUFF,
                    duration: 1,
                    applyTo: 'active',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asReactive, {
                                    type: components.THREAT,
                                    modifier: -1,
                                },
                            ]),
                        },
                    },
                }, {
                    type: components.APPLY_BUFF,
                    duration: 2,
                    applyTo: 'active',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asReactive, {
                                    type: components.THREAT,
                                    modifier: -1,
                                },
                            ]),
                        },
                    },
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: -2,
                }),
            ],
        }),
    },
    'medu.planned-strike': {
        name: 'Planned Strike / Backstab',
        prefab: createActionCard('medu.planned-strike', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'active',
                }, {
                    type: components.REAPPLY_POSITION,
                    applyTo: 'attacker',
                }, {
                    type: components.REAPPLY_POSITION,
                    applyTo: 'attacker',
                }),
                createComponentData(...asReactiveTeam, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'inactive',
                }, {
                    type: components.ATTACK,
                    actor: 'owner',
                    target: 'active',
                }),
                createComponentData(...asAttacker, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'reactive',
                }, {
                    type: components.BONUS_DAMAGE,
                    add: 10,
                }, {
                    type: components.ARMOR_PENETRATION,
                    multiplier: 0.25,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
            ],
        }),
    },
    'medu.forward-strike': {
        name: 'Forward Strike / Recycle',
        prefab: createActionCard('medu.forward-strike', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }, {
                    type: components.MOVE_TO_POSITION,
                    tags: new Set(['offensive']),
                    applyTo: 'active',
                }, {
                    type: components.APPLY_BUFF,
                    duration: 1,
                    applyTo: 'active',
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
                createComponentData(...asReactiveTeam, {
                    type: components.DRAW_ACTION_CARD,
                }),
                createComponentData(...asReactive, {
                    type: components.THREAT,
                    modifier: 1,
                }),
                createComponentData(...asDefender, {
                    type: components.IF_OWNER_IS,
                    actorTag: 'reactive',
                }, {
                    type: components.DAMAGE_REDUCTION,
                    subtract: -3,
                }),
            ],
        }),
    },

    // -- Jotun --
    'jotun.attack-a': {
        name: 'Smash / Hunker Down',
        prefab: createActionCard('jotun.attack-a', {
            effects: [
                createComponentData(...asActive, {
                    type: components.ATTACK,
                    actor: 'active',
                    target: 'reactive',
                }),
                createComponentData(...asReactive, {
                    type: components.APPLY_BUFF,
                    duration: 1,
                    applyTo: 'reactive',
                    prefab: {
                        root: {
                            components: componentDataToComponentMap([
                                ...asDefender, {
                                    type: components.DAMAGE_REDUCTION,
                                    subtract: 5,
                                },
                            ]),
                        },
                    },
                }),
            ],
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
