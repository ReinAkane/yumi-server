import * as components from '../state/types';
import { Prefab } from '../state';

export type CharacterData = {
    readonly id: string;
    readonly name: string;
    readonly actionCards: readonly string[];
    readonly positionCards: readonly [readonly string[], readonly string[], readonly string[]];
    readonly prefab: Prefab<
        typeof components.CHARACTER_STATUS | typeof components.HEALTH | typeof components.ATTACKER
    >;
};

export type DemonData = {
    readonly id: string;
    readonly name: string;
};

export type EnemyData = {
    readonly id: string;
    readonly name: string;
    readonly maxHp: number;
    readonly actionCards: readonly string[];
    readonly baseDamage: number;
    readonly baseArmor: number;
};

export type ActionCardData = {
    readonly id: string;
    readonly name: string;
    readonly prefab: Prefab<typeof components.ACTION_CARD>;
};

export type PositionCardData = {
    readonly id: string;
    readonly name: string;
    readonly prefab: Prefab<typeof components.POSITION_CARD>;
};
