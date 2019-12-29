export const combatStatusType = 'combat status';
export type CombatStatus = {
    readonly type: typeof combatStatusType,
};

export const enemyStatusType = 'enemy status';
export type EnemyStatus = {
    readonly type: typeof enemyStatusType;
    readonly dataId: string;
};

export const characterStatusType = 'character status';
export type CharacterStatus = {
    readonly type: typeof characterStatusType;
    readonly dataId: string;
};

export const healthType = 'health';
export type Health = {
    readonly type: typeof healthType;
    readonly hp: number;
};

export type Union = CombatStatus | EnemyStatus | CharacterStatus | Health;
export type UnionType = typeof combatStatusType | typeof enemyStatusType |
    typeof characterStatusType | typeof healthType;
