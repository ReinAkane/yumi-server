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
    links?: {
        [entityId: string]: components.ComponentData[],
    }
}): Prefab<typeof components.ACTION_CARD> {
    let nextId = 0;

    const result: Prefab<typeof components.ACTION_CARD> = {
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

const actionCards: Map<string, ActionCardData> = mapFromObject<Omit<ActionCardData, 'id'>>({
    basic: {
        name: 'Blank Card',
        prefab: createActionCard('basic', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
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
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            activeDefendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 5,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 1,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }, {
                type: components.DAMAGE_REDUCTION,
                subtract: 5,
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
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },
    vengeance: {
        name: 'Retaliate',
        prefab: createActionCard('vengeance', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: -5,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 0.5,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },

    // -- Jeanne --
    'jeanne.double-swing': {
        name: 'Double Swing / Strike Back',
        prefab: createActionCard('jeanne.double-swing', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.ATTACK,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },
    'jeanne.tireless-assault': {
        name: 'Tireless Assault / Stall',
        prefab: createActionCard('jeanne.tireless-assault', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.DRAW_ACTION_CARD,
                mustMatch: 'attacker',
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 1,
            }, {
                type: components.DRAW_ACTION_CARD,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },
    'jeanne.shielded-strike': {
        name: 'Shielded Strike / Advancing Defense',
        prefab: createActionCard('jeanne.shielded-strike', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.APPLY_BUFF,
                applyTo: 'attacker',
                duration: 1,
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                defendRef: {
                    id: 'defenseBuff',
                    withComponents: {},
                },
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 5,
            }, {
                type: components.THREAT,
                modifier: 1,
            }, {
                type: components.TAUNT,
                modifier: 1,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveAttackEffects: createComponentData({
                type: components.MOVE_TO_POSITION,
                tags: new Set(['offensive']),
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            links: {
                defenseBuff: createComponentData({
                    type: components.DAMAGE_REDUCTION,
                    subtract: 5,
                }),
                emptyBuff: [],
            },
        }),
    },
    'jeanne.shield-bash': {
        name: 'Shield Bash / Stoic Defense',
        prefab: createActionCard('jeanne.shield-bash', {
            activeDefendEffects: createComponentData({
                type: components.CANCEL_ATTACKS,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 1,
            }, {
                type: components.DAMAGE_REDUCTION,
                subtract: 10,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },
    'jeanne.heavy-strike': {
        name: 'Heavy Strike / Dull',
        prefab: createActionCard('jeanne.heavy-strike', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: 5,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.TAUNT,
                modifier: 1,
            }, {
                type: components.APPLY_BUFF,
                applyTo: 'attacker',
                duration: 3,
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'damageDebuff',
                    withComponents: {},
                },
                defendRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            links: {
                emptyBuff: [],
                damageDebuff: createComponentData({
                    type: components.BONUS_DAMAGE,
                    add: -3,
                }),
            },
        }),
    },

    // -- shared --
    'shared.piercing-attack': {
        name: 'Piercing Attack / Brace',
        prefab: createActionCard('shared.piercing-attack', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.ARMOR_PENETRATION,
                multiplier: 0.25,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 4,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },

    // -- Elf --
    'elf.ignite-arrows': {
        name: 'Ignite Arrows / Chilling Arrows',
        prefab: createActionCard('elf.ignite-arrows', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: -3,
            }, {
                type: components.APPLY_BUFF,
                duration: 3,
                applyTo: 'attacker',
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'fireArrows',
                    withComponents: {},
                },
                defendRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.APPLY_BUFF,
                duration: 3,
                applyTo: 'owner',
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'chillArrows',
                    withComponents: {},
                },
                defendRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
            }, {
                type: components.LINK_EFFECT,
                ref: {
                    id: 'bonusArmor',
                    withComponents: {},
                },
            }),
            links: {
                fireArrows: createComponentData({
                    type: components.BONUS_DAMAGE,
                    add: 3,
                }),
                bonusArmor: createComponentData({
                    type: components.DAMAGE_REDUCTION,
                    subtract: 2,
                }, {
                    type: components.IF_OWNER,
                    shouldBeOwner: true,
                }),
                chillArrows: createComponentData({
                    type: components.APPLY_BUFF,
                    duration: 3,
                    applyTo: 'defender',
                    universalRef: {
                        id: 'emptyBuff',
                        withComponents: {},
                    },
                    attackRef: {
                        id: 'emptyBuff',
                        withComponents: {},
                    },
                    defendRef: {
                        id: 'chilled',
                        withComponents: {},
                    },
                }),
                chilled: createComponentData({
                    type: components.BONUS_DAMAGE,
                    add: -2,
                }),
                emptyBuff: [],
            },
        }),
    },
    'elf.triple-shot': {
        name: 'Triple Shot / Quick Shot',
        prefab: createActionCard('elf.triple-shot', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.ATTACK,
            }, {
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: -4,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: -2,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },
    'elf.stinging-shot': {
        name: 'Stinging Arrows / Make Scarce',
        prefab: createActionCard('elf.stinging-shot', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: -3,
            }, {
                type: components.APPLY_BUFF,
                duration: 3,
                applyTo: 'attacker',
                attackRef: {
                    id: 'stingingArrows',
                    withComponents: {},
                },
                defendRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.THREAT,
                modifier: -2,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            links: {
                emptyBuff: [],
                enrage: createComponentData({
                    type: components.RAGE,
                    tauntMultiplier: 1.3,
                }),
                stingingArrows: createComponentData({
                    type: components.APPLY_BUFF,
                    duration: 3,
                    applyTo: 'defender',
                    attackRef: {
                        id: 'enrage',
                        withComponents: {},
                    },
                    defendRef: {
                        id: 'emptyBuff',
                        withComponents: {},
                    },
                    universalRef: {
                        id: 'emptyBuff',
                        withComponents: {},
                    },
                }),
            },
        }),
    },
    'elf.double-shot': {
        name: 'Double Shot / Recycle',
        prefab: createActionCard('elf.double-shot', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.ATTACK,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.LINK_EFFECT,
                ref: {
                    id: 'armorReduction',
                    withComponents: {},
                },
            }, {
                type: components.DRAW_ACTION_CARD,
            }),
            links: {
                armorReduction: createComponentData({
                    type: components.DAMAGE_REDUCTION,
                    subtract: -3,
                }, {
                    type: components.IF_OWNER,
                    shouldBeOwner: true,
                }),
            },
        }),
    },

    // -- Medu --
    'medu.debilitating-poison': {
        name: 'Debilitating Poison / Evade',
        prefab: createActionCard('medu.debilitating-poison', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.APPLY_BUFF,
                duration: 1,
                applyTo: 'defender',
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'poison',
                    withComponents: {},
                },
                defendRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.THREAT,
                modifier: -1,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveAttackEffects: createComponentData({
                type: components.MOVE_TO_POSITION,
                tags: new Set(['defensive']),
            }),
            links: {
                emptyBuff: [],
                poison: createComponentData({
                    type: components.BONUS_DAMAGE,
                    add: -7,
                }),
            },
        }),
    },
    'medu.into-the-shadows': {
        name: 'Into the Shadows / Make Scarce',
        prefab: createActionCard('medu.into-the-shadows', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.APPLY_BUFF,
                duration: 1,
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
                    id: 'threatDown',
                    withComponents: {},
                },
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
                    id: 'threatDown',
                    withComponents: {},
                },
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.THREAT,
                modifier: -2,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            links: {
                emptyBuff: [],
                threatDown: createComponentData({
                    type: components.THREAT,
                    modifier: -1,
                }),
            },
        }),
    },
    'medu.planned-strike': {
        name: 'Planned Strike / Backstab',
        prefab: createActionCard('medu.planned-strike', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.REAPPLY_POSITION,
            }, {
                type: components.REAPPLY_POSITION,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
            reactiveAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.BONUS_DAMAGE,
                add: 10,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: false,
            }),
            reactiveDefendEffects: createComponentData({
                type: components.THREAT,
                modifier: 1,
            }, {
                type: components.IF_OWNER,
                shouldBeOwner: true,
            }),
        }),
    },
    'medu.forward-strike': {
        name: 'Forward Strike / Recycle',
        prefab: createActionCard('medu.forward-strike', {
            activeAttackEffects: createComponentData({
                type: components.ATTACK,
            }, {
                type: components.MOVE_TO_POSITION,
                tags: new Set(['offensive']),
            }, {
                type: components.APPLY_BUFF,
                applyTo: 'attacker',
                duration: 1,
                universalRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                attackRef: {
                    id: 'emptyBuff',
                    withComponents: {},
                },
                defendRef: {
                    id: 'threatGain',
                    withComponents: {},
                },
            }),
            reactiveDefendEffects: createComponentData({
                type: components.LINK_EFFECT,
                ref: {
                    id: 'armorReduction',
                    withComponents: {},
                },
            }, {
                type: components.DRAW_ACTION_CARD,
            }),
            links: {
                emptyBuff: [],
                threatGain: createComponentData({
                    type: components.THREAT,
                    modifier: 1,
                }),
                armorReduction: createComponentData({
                    type: components.DAMAGE_REDUCTION,
                    subtract: -3,
                }, {
                    type: components.IF_OWNER,
                    shouldBeOwner: true,
                }),
            },
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
