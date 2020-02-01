import { CharacterData } from '../types';
import { mapFromObject } from './map-from-object';
import * as components from '../../state/types';
import { Prefab } from '../../state';
import {
    createComponents, componentsToComponentMap, createComponentData, componentDataToComponentMap,
} from './prefab-helpers';

function createCharacter(
    dataId: string,
    options: {
        maxHp: number,
        armor: number,
        damage: number,
        passive?: components.ComponentData[],
        links?: {
            [entityId: string]: components.ComponentData[],
        }
    },
): Prefab<
        typeof components.CHARACTER_STATUS | typeof components.HEALTH | typeof components.ATTACKER
    > {
    let nextId = 0;

    const result:Prefab<
        typeof components.CHARACTER_STATUS | typeof components.HEALTH | typeof components.ATTACKER
    > = {
        root: {
            components: {
                [components.CHARACTER_STATUS]: createComponents<typeof components.CHARACTER_STATUS>(
                    {
                        id: 'characterStatus',
                        data: {
                            type: components.CHARACTER_STATUS,
                            dataId,
                        },
                    },
                ),
                [components.HEALTH]: createComponents<typeof components.HEALTH>({
                    id: 'health',
                    data: {
                        type: components.HEALTH,
                        hp: options.maxHp,
                        baseArmor: options.armor,
                    },
                }),
                [components.ATTACKER]: createComponents<typeof components.ATTACKER>({
                    id: 'attacker',
                    data: {
                        type: components.ATTACKER,
                        baseDamage: options.damage,
                    },
                }),
                [components.LINK_EFFECT]: createComponents<typeof components.LINK_EFFECT>({
                    id: 'passive',
                    data: {
                        type: components.LINK_EFFECT,
                        ref: {
                            id: 'passive',
                            withComponents: {},
                        },
                    },
                }),
            },
        },
        passive: {
            components: componentsToComponentMap(options?.passive?.map((data) => {
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

const characters: Map<string, CharacterData> = mapFromObject({
    elf: {
        name: 'Elf',
        actionCards: [
            'elf.ignite-arrows',
            'shared.piercing-attack',
            'elf.triple-shot',
            'elf.stinging-shot',
            'elf.double-shot',
        ],
        positionCards: [
            ['dps.initial'],
            ['dps.advancing-a', 'dps.advancing-b'],
            ['dps.idle', 'dps.attack-a', 'dps.attack-b', 'dps.all-in-a', 'dps.all-in-b'],
        ],
        prefab: createCharacter('elf', {
            maxHp: 30,
            damage: 5,
            armor: 0,
            passive: createComponentData({
                type: components.THREAT,
                modifier: -1,
            }, {
                type: components.COMBAT_EFFECT,
                on: 'before act',
            }, {
                type: components.IF_OWNER_IS,
                actorTag: 'reactive',
            }),
        }),
    },
    jeanne: {
        name: 'Jeanne',
        actionCards: [
            'jeanne.double-swing',
            'jeanne.tireless-assault',
            'jeanne.shielded-strike',
            'jeanne.shield-bash',
            'jeanne.heavy-strike',
        ],
        positionCards: [
            ['tank.initial'],
            ['tank.advancing-a', 'tank.advancing-b'],
            ['tank.taunt-a', 'tank.taunt-b', 'tank.bracing', 'tank.attack-a', 'tank.attack-b'],
        ],
        prefab: createCharacter('jeanne', {
            maxHp: 40,
            damage: 4,
            armor: 2,
            passive: createComponentData({
                type: components.APPLY_BUFF,
                duration: 1,
                applyTo: 'attacker',
                prefab: {
                    root: {
                        components: componentDataToComponentMap(createComponentData({
                            type: components.BONUS_DAMAGE,
                            add: 2,
                        }, {
                            type: components.COMBAT_EFFECT,
                            on: 'after attack',
                        }, {
                            type: components.IF_OWNER_IS,
                            actorTag: 'attacker',
                        })),
                    },
                },
            }, {
                type: components.COMBAT_EFFECT,
                on: 'after attack',
            }, {
                type: components.IF_OWNER_IS,
                actorTag: 'attacker',
            }),
        }),
    },
    medusa: {
        name: 'Medusa',
        actionCards: [
            'shared.piercing-attack',
            'medu.debilitating-poison',
            'medu.into-the-shadows',
            'medu.planned-strike',
            'medu.forward-strike',
        ],
        positionCards: [
            ['assassin.initial'],
            ['assassin.advancing-a', 'assassin.advancing-b'],
            ['assassin.sneaking-a', 'assassin.sneaking-b', 'assassin.stumble', 'assassin.in-position-a', 'assassin.in-position-b'],
        ],
        prefab: createCharacter('medusa', {
            maxHp: 30,
            damage: 5,
            armor: 0,
            passive: createComponentData({
                type: components.APPLY_BUFF,
                duration: 3,
                applyTo: 'attacker',
                prefab: {
                    root: {
                        components: componentDataToComponentMap(createComponentData(
                            {
                                type: components.THREAT,
                                modifier: -1,
                            }, {
                                type: components.COMBAT_EFFECT,
                                on: 'before act',
                            }, {
                                type: components.IF_OWNER_IS,
                                actorTag: 'reactive',
                            },
                        )),
                    },
                },
            }, {
                type: components.IF_POSTION,
                applyTo: 'attacker',
                tags: ['offensive'],
            }, {
                type: components.IF_OWNER_IS,
                actorTag: 'attacker',
            }, {
                type: components.COMBAT_EFFECT,
                on: 'after attack',
            }),
        }),
    },
});

export function getCharacter(characterId: string): CharacterData {
    const character = characters.get(characterId);

    if (undefined === character) {
        throw new Error('No such character.');
    }

    return character;
}
