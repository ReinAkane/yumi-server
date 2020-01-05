import { CharacterData } from '../types';
import { mapFromObject } from './map-from-object';
import * as components from '../../state/types';
import { Prefab } from '../../state/prefabs';
import { createComponents, componentsToComponentMap, createComponentData } from './prefab-helpers';

function createCharacter(
    dataId: string,
    options: {
        maxHp: number,
        armor: number,
        damage: number,
        passiveAttackEffects?: components.ComponentData[],
        passiveDefendEffects?: components.ComponentData[],
        passiveUniversalEffects?: components.ComponentData[],
    },
): Prefab<
        typeof components.CHARACTER_STATUS | typeof components.HEALTH | typeof components.ATTACKER
    > {
    let nextId = 0;

    return {
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
                [components.COMBAT_EFFECT]: createComponents<typeof components.COMBAT_EFFECT>({
                    id: 'passive',
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
            components: componentsToComponentMap(options?.passiveAttackEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        defendEntity: {
            components: componentsToComponentMap(options?.passiveDefendEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
        universalEntity: {
            components: componentsToComponentMap(options?.passiveUniversalEffects?.map((data) => {
                nextId += 1;
                return {
                    id: String(nextId),
                    data,
                };
            })),
        },
    };
}

const characters: Map<string, CharacterData> = mapFromObject({
    elf: {
        name: 'Elf',
        actionCards: ['attack', 'attack', 'defend'],
        positionCards: [['advance'], ['advance', 'attack'], ['attack', 'attack', 'basic']],
        prefab: createCharacter('elf', {
            maxHp: 30,
            damage: 5,
            armor: 0,
        }),
    },
    jeanne: {
        name: 'Jeanne',
        actionCards: ['attack', 'defend', 'vengeance'],
        positionCards: [['advance'], ['advance', 'defend'], ['defend', 'defend', 'basic']],
        prefab: createCharacter('jeanne', {
            maxHp: 40,
            damage: 3,
            armor: 0,
            passiveDefendEffects: createComponentData({
                type: components.DAMAGE_REDUCTION,
                subtract: 2,
            }),
        }),
    },
    medusa: {
        name: 'Medusa',
        actionCards: ['attack', 'attack', 'defend'],
        positionCards: [['advance'], ['advance', 'attack'], ['attack', 'attack', 'basic']],
        prefab: createCharacter('medusa', {
            maxHp: 30,
            damage: 5,
            armor: 0,
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
