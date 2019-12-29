export const combatStatusType = 'combat status';
export type CombatStatus = {
    readonly type: typeof combatStatusType,
    readonly state: 'setting up' | 'waiting for action' | 'waiting for defense'
};

export const enemyStatusType = 'enemy status';
export type EnemyStatus = {
    readonly type: typeof enemyStatusType;
    readonly dataId: string;
};

export const playerStatusType = 'player status';
export type PlayerStatus = {
    readonly type: typeof playerStatusType;
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

export const actionDeckType = 'action deck';
export type ActionDeck = {
    readonly type: typeof actionDeckType;
    readonly cardIds: readonly string[];
};

export const positionType = 'position';
export type Position = {
    readonly type: typeof positionType;
    readonly stage: 0 | 1 | 2;
    readonly allCardIds: readonly [readonly string[], readonly string[], readonly string[]]
};

export const handType = 'hand';
export type Hand = {
    readonly type: typeof handType;
    readonly cardIds: string[];
};

export type Union = CombatStatus | EnemyStatus | PlayerStatus | CharacterStatus | Health |
ActionDeck | Position | Hand;

export type UnionType = typeof combatStatusType | typeof enemyStatusType | typeof playerStatusType |
    typeof characterStatusType | typeof healthType | typeof actionDeckType | typeof positionType |
    typeof handType;

export type ComponentData<T extends UnionType = UnionType> =
    T extends typeof combatStatusType ? CombatStatus :
        T extends typeof enemyStatusType ? EnemyStatus :
            T extends typeof playerStatusType ? PlayerStatus :
                T extends typeof characterStatusType ? CharacterStatus :
                    T extends typeof healthType ? Health :
                        T extends typeof actionDeckType ? ActionDeck :
                            T extends typeof positionType ? Position :
                                T extends typeof handType ? Hand :
                                    never;
