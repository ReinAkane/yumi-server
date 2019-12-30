export const COMBAT_STATUS = 'combat status';
export const ENEMY_STATUS = 'enemy status';
export const PLAYER_STATUS = 'player status';
export const CHARACTER_STATUS = 'character status';
export const HEALTH = 'health';
export const ACTION_DECK = 'action deck';
export const POSITION = 'position';
export const HAND = 'hand';
export const ATTACKER = 'attacker';
export const ACTION_CARD = 'action card';
export const BONUS_DAMAGE = 'action - bonus damage';
export const DAMAGE_REDUCTION = 'action - reduce damage';
export const CARD_OWNER = 'card owner';

export type UnionType = typeof COMBAT_STATUS | typeof ENEMY_STATUS | typeof PLAYER_STATUS |
    typeof CHARACTER_STATUS | typeof HEALTH | typeof ACTION_DECK | typeof POSITION |
    typeof HAND | typeof ATTACKER | typeof ACTION_CARD | typeof BONUS_DAMAGE |
    typeof DAMAGE_REDUCTION | typeof CARD_OWNER;

export const ALL_TYPES: UnionType[] = [
    COMBAT_STATUS,
    ENEMY_STATUS,
    PLAYER_STATUS,
    CHARACTER_STATUS,
    HEALTH,
    ACTION_DECK,
    POSITION,
    HAND,
    ATTACKER,
    ACTION_CARD,
    BONUS_DAMAGE,
    DAMAGE_REDUCTION,
    CARD_OWNER,
];
