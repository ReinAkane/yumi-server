import { CharacterData } from '../types';
import { mapFromObject } from './map-from-object';

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

export function getCharacter(characterId: string): CharacterData {
    const character = characters.get(characterId);

    if (undefined === character) {
        throw new Error('No such character.');
    }

    return character;
}
