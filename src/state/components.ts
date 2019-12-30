export const COMBAT_STATUS = 'combat status';
export type CombatStatus = {
    readonly type: typeof COMBAT_STATUS,
    readonly state: 'setting up' | 'waiting for action' | 'waiting for defense'
};

export const ENEMY_STATUS = 'enemy status';
export type EnemyStatus = {
    readonly type: typeof ENEMY_STATUS;
    readonly dataId: string;
};

export const PLAYER_STATUS = 'player status';
export type PlayerStatus = {
    readonly type: typeof PLAYER_STATUS;
};

export const CHARACTER_STATUS = 'character status';
export type CharacterStatus = {
    readonly type: typeof CHARACTER_STATUS;
    readonly dataId: string;
};

export const HEALTH = 'health';
export type Health = {
    readonly type: typeof HEALTH;
    readonly hp: number;
};

export const ACTION_DECK = 'action deck';
export type ActionDeck = {
    readonly type: typeof ACTION_DECK;
    readonly cardIds: readonly string[];
};

export const POSITION = 'position';
export type Position = {
    readonly type: typeof POSITION;
    readonly stage: 0 | 1 | 2;
    readonly allCardIds: readonly [readonly string[], readonly string[], readonly string[]]
};

export const HAND = 'hand';
export type Hand = {
    readonly type: typeof HAND;
    readonly cardIds: string[];
};

export const ATTACKER = 'attacker';
export type Attacker = {
    readonly type: typeof ATTACKER;
    readonly baseDamage: number;
};

export const ACTION_CARD = 'action card';
export type ActionCard = {
    readonly type: typeof ACTION_CARD;
};

export type Union = CombatStatus | EnemyStatus | PlayerStatus | CharacterStatus | Health |
ActionDeck | Position | Hand | Attacker | ActionCard;

export type UnionType = typeof COMBAT_STATUS | typeof ENEMY_STATUS | typeof PLAYER_STATUS |
    typeof CHARACTER_STATUS | typeof HEALTH | typeof ACTION_DECK | typeof POSITION |
    typeof HAND | typeof ATTACKER | typeof ACTION_CARD;

export type ComponentData<T extends UnionType = UnionType> =
    T extends typeof COMBAT_STATUS ? CombatStatus :
        T extends typeof ENEMY_STATUS ? EnemyStatus :
            T extends typeof PLAYER_STATUS ? PlayerStatus :
                T extends typeof CHARACTER_STATUS ? CharacterStatus :
                    T extends typeof HEALTH ? Health :
                        T extends typeof ACTION_DECK ? ActionDeck :
                            T extends typeof POSITION ? Position :
                                T extends typeof HAND ? Hand :
                                    T extends typeof ATTACKER ? Attacker :
                                        T extends typeof ACTION_CARD ? ActionCard :
                                            never;
