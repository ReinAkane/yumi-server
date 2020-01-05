import { ComponentRef, EntityRef, RefWithComponent } from './ref-types';
import * as types from './component-types';

export type CombatStatus = {
    readonly type: typeof types.COMBAT_STATUS;
    readonly state: 'setting up' | 'waiting for action' | 'waiting for defense' | 'defeat' | 'victory';
    readonly pendingEnemyAttack: ComponentRef<'action card'> | null;
};

export type EnemyStatus = {
    readonly type: typeof types.ENEMY_STATUS;
    readonly dataId: string;
};

export type PlayerStatus = {
    readonly type: typeof types.PLAYER_STATUS;
};

export type CharacterStatus = {
    readonly type: typeof types.CHARACTER_STATUS;
    readonly dataId: string;
};

export type Health = {
    readonly type: typeof types.HEALTH;
    readonly hp: number;
    readonly baseArmor: number;
};

export type ActionDeck = {
    readonly type: typeof types.ACTION_DECK;
    readonly cardRefs: readonly ComponentRef<'action card'>[];
};

export type Position = {
    readonly type: typeof types.POSITION;
    readonly stage: 0 | 1 | 2;
    readonly allCardRefs: readonly [
        readonly ComponentRef<'position card'>[],
        readonly ComponentRef<'position card'>[],
        readonly ComponentRef<'position card'>[],
    ]
    readonly turnsInStage: number;
    readonly currentCardRef: ComponentRef<'position card'>;
    readonly nextCardTags: readonly Set<PositionCardTag>[];
};

export type Hand = {
    readonly type: typeof types.HAND;
    readonly cardRefs: ComponentRef<'action card'>[];
};

export type Attacker = {
    readonly type: typeof types.ATTACKER;
    readonly baseDamage: number;
};

export type CombatEffect = {
    readonly type: typeof types.COMBAT_EFFECT;
    readonly universalRef: EntityRef;
    readonly attackRef: EntityRef;
    readonly defendRef: EntityRef;
};

export type ActionCard = {
    readonly type: typeof types.ACTION_CARD;
    readonly activeEffectRef: ComponentRef<typeof types.COMBAT_EFFECT>;
    readonly reactiveEffectRef: ComponentRef<typeof types.COMBAT_EFFECT>;
    readonly dataId: string;
};

export type BonusDamage = {
    readonly type: typeof types.BONUS_DAMAGE;
    readonly add: number;
};

export type DamageReduction = {
    readonly type: typeof types.DAMAGE_REDUCTION;
    readonly subtract: number;
};

export type CardOwner = {
    readonly type: typeof types.CARD_OWNER;
    readonly owner: EntityRef & RefWithComponent<'health' | 'attacker'>;
};

export type Threat = {
    readonly type: typeof types.THREAT;
    readonly modifier: number;
};

export type Taunt = {
    readonly type: typeof types.TAUNT;
    readonly modifier: number;
};

export type Rage = {
    readonly type: typeof types.RAGE;
    readonly tauntMultiplier: number;
};

export type Attack = {
    readonly type: typeof types.ATTACK;
};

export type CancelAttacks = {
    readonly type: typeof types.CANCEL_ATTACKS;
};

export type ArmorPenetration = {
    readonly type: typeof types.ARMOR_PENETRATION;
    readonly multiplier: number;
};

export type PositionCardTag = 'beneficial' | 'detrimental' | 'defensive' | 'offensive';
export type PositionCard = {
    readonly type: typeof types.POSITION_CARD;
    readonly dataId: string;
    readonly effectRef: ComponentRef<typeof types.COMBAT_EFFECT>;
    readonly tags: Set<PositionCardTag>;
};

export type Buff = {
    readonly type: typeof types.BUFF;
    readonly effectRef: ComponentRef<typeof types.COMBAT_EFFECT>;
    readonly remainingTurns: number;
};

export type ApplyBuff = {
    readonly type: typeof types.APPLY_BUFF;
    readonly universalRef: EntityRef;
    readonly attackRef: EntityRef;
    readonly defendRef: EntityRef;
    readonly duration: number;
    readonly applyTo: 'attacker' | 'defender';
};

export type LinkEffect = {
    readonly type: typeof types.LINK_EFFECT;
    readonly ref: EntityRef;
};

export type IfOwner = {
    readonly type: typeof types.IF_OWNER;
    readonly shouldBeOwner: boolean;
};

export type ReapplyPosition = {
    readonly type: typeof types.REAPPLY_POSITION;
};

export type MoveToPosition = {
    readonly type: typeof types.MOVE_TO_POSITION;
    readonly tags: Set<PositionCardTag>;
};

export type IfPosition = {
    readonly type: typeof types.IF_POSTION;
    readonly tags: readonly PositionCardTag[];
};

export type DrawActionCard = {
    readonly type: typeof types.DRAW_ACTION_CARD;
    readonly mustMatch?: 'attacker' | 'defender';
};

/* eslint-disable @typescript-eslint/indent */
export type ComponentData<T extends types.UnionType = types.UnionType> =
    T extends typeof types.COMBAT_STATUS ? CombatStatus :
    T extends typeof types.ENEMY_STATUS ? EnemyStatus :
    T extends typeof types.PLAYER_STATUS ? PlayerStatus :
    T extends typeof types.CHARACTER_STATUS ? CharacterStatus :
    T extends typeof types.HEALTH ? Health :
    T extends typeof types.ACTION_DECK ? ActionDeck :
    T extends typeof types.POSITION ? Position :
    T extends typeof types.HAND ? Hand :
    T extends typeof types.ATTACKER ? Attacker :
    T extends typeof types.COMBAT_EFFECT ? CombatEffect :
    T extends typeof types.ACTION_CARD ? ActionCard :
    T extends typeof types.BONUS_DAMAGE ? BonusDamage :
    T extends typeof types.DAMAGE_REDUCTION ? DamageReduction :
    T extends typeof types.CARD_OWNER ? CardOwner :
    T extends typeof types.THREAT ? Threat :
    T extends typeof types.TAUNT ? Taunt :
    T extends typeof types.RAGE ? Rage :
    T extends typeof types.ATTACK ? Attack :
    T extends typeof types.CANCEL_ATTACKS ? CancelAttacks :
    T extends typeof types.ARMOR_PENETRATION ? ArmorPenetration :
    T extends typeof types.POSITION_CARD ? PositionCard :
    T extends typeof types.BUFF ? Buff :
    T extends typeof types.APPLY_BUFF ? ApplyBuff :
    T extends typeof types.LINK_EFFECT ? LinkEffect :
    T extends typeof types.IF_OWNER ? IfOwner :
    T extends typeof types.REAPPLY_POSITION ? ReapplyPosition :
    T extends typeof types.MOVE_TO_POSITION ? MoveToPosition :
    T extends typeof types.IF_POSTION ? IfPosition :
    T extends typeof types.DRAW_ACTION_CARD ? DrawActionCard :
    never;
/* eslint-enable @typescript-eslint/indent */
