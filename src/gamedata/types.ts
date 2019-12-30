import * as components from '../state/components';

export type CharacterData = {
    readonly id: string;
    readonly name: string;
    readonly maxHp: number;
    readonly actionCards: readonly string[];
    readonly positionCards: readonly [readonly string[], readonly string[], readonly string[]];
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
};

export type ActionCardData = {
    readonly id: string;
    readonly name: string;
    readonly attackPrefab: readonly components.ComponentData[];
    readonly defendPrefab: readonly components.ComponentData[];
};

export type PositionCardData = {
    readonly id: string;
    readonly name: string;
    readonly attackPrefab: readonly components.ComponentData[];
    readonly defendPrefab: readonly components.ComponentData[];
};
