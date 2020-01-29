import { EnemyData } from '../types';
import { mapFromObject } from './map-from-object';

const enemies: Map<string, EnemyData> = mapFromObject({
    jotun: {
        name: 'Jotun',
        maxHp: 100,
        actionCards: ['jotun.attack-a'],
        baseDamage: 10,
        baseArmor: 0,
    },
});

export function getEnemy(enemyId: string): EnemyData {
    const enemy = enemies.get(enemyId);

    if (undefined === enemy) {
        throw new Error('No such enemy.');
    }

    return enemy;
}
