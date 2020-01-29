export const COMBAT_STATUS = 'combat status';
export const ENEMY_STATUS = 'enemy status';
export const PLAYER_STATUS = 'player status';
export const CHARACTER_STATUS = 'character status';
export const HEALTH = 'health';
export const ACTION_DECK = 'action deck';
export const POSITION = 'position';
export const HAND = 'hand';
export const ATTACKER = 'attacker';
export const COMBAT_EFFECT = 'combat effect';
export const ACTION_CARD = 'action card';
export const BONUS_DAMAGE = 'action - bonus damage';
export const DAMAGE_REDUCTION = 'action - reduce damage';
export const CARD_OWNER = 'card owner';
export const THREAT = 'action - threat';
export const TAUNT = 'action - taunt';
export const RAGE = 'action - rage';
export const ATTACK = 'action - attack';
export const CANCEL_ATTACKS = 'action - cancel attacks';
export const ARMOR_PENETRATION = 'action - armor penetration';
export const POSITION_CARD = 'position card';
export const BUFF = 'buff';
export const APPLY_BUFF = 'action - apply buff';
export const LINK_EFFECT = 'action - link effect';
export const REAPPLY_POSITION = 'action - reapply position';
export const MOVE_TO_POSITION = 'action - move to position';
export const IF_POSTION = 'condition - position';
export const DRAW_ACTION_CARD = 'action - draw action card';
export const IF_OWNER_IS = 'condition - owner matches';
export const IF_TEAM_IS = 'condition - team matches';

export type UnionType = typeof COMBAT_STATUS | typeof ENEMY_STATUS | typeof PLAYER_STATUS |
    typeof CHARACTER_STATUS | typeof HEALTH | typeof ACTION_DECK | typeof POSITION |
    typeof HAND | typeof ATTACKER | typeof COMBAT_EFFECT | typeof ACTION_CARD |
    typeof BONUS_DAMAGE | typeof DAMAGE_REDUCTION | typeof CARD_OWNER | typeof THREAT |
    typeof TAUNT | typeof RAGE | typeof ATTACK | typeof CANCEL_ATTACKS | typeof ARMOR_PENETRATION |
    typeof POSITION_CARD | typeof BUFF | typeof APPLY_BUFF | typeof LINK_EFFECT |
    typeof REAPPLY_POSITION | typeof MOVE_TO_POSITION | typeof IF_POSTION |
    typeof DRAW_ACTION_CARD | typeof IF_OWNER_IS | typeof IF_TEAM_IS;

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
    COMBAT_EFFECT,
    ACTION_CARD,
    BONUS_DAMAGE,
    DAMAGE_REDUCTION,
    CARD_OWNER,
    THREAT,
    TAUNT,
    RAGE,
    ATTACK,
    CANCEL_ATTACKS,
    ARMOR_PENETRATION,
    POSITION_CARD,
    BUFF,
    APPLY_BUFF,
    LINK_EFFECT,
    REAPPLY_POSITION,
    MOVE_TO_POSITION,
    IF_POSTION,
    DRAW_ACTION_CARD,
    IF_OWNER_IS,
    IF_TEAM_IS,
];
