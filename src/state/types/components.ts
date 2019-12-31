import { ComponentRef, EntityRef, RefWithComponent } from './ref-types';
import * as types from './component-types';

export type CombatStatus = {
    readonly type: typeof types.COMBAT_STATUS,
    readonly state: 'setting up' | 'waiting for action' | 'waiting for defense'
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
        readonly ComponentRef<'action card'>[],
        readonly ComponentRef<'action card'>[],
        readonly ComponentRef<'action card'>[],
    ]
    readonly turnsInStage: number;
    readonly currentCardRef: ComponentRef<'action card'>;
};

export type Hand = {
    readonly type: typeof types.HAND;
    readonly cardRefs: ComponentRef<'action card'>[];
};

export type Attacker = {
    readonly type: typeof types.ATTACKER;
    readonly baseDamage: number;
};

export type ActionCard = {
    readonly type: typeof types.ACTION_CARD;
    readonly attackRef: EntityRef;
    readonly defendRef: EntityRef;
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

export type Union = CombatStatus | EnemyStatus | PlayerStatus | CharacterStatus | Health |
ActionDeck | Position | Hand | Attacker | ActionCard | BonusDamage | DamageReduction | CardOwner |
Threat | Taunt | Rage;

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
    T extends typeof types.ACTION_CARD ? ActionCard :
    T extends typeof types.BONUS_DAMAGE ? BonusDamage :
    T extends typeof types.DAMAGE_REDUCTION ? DamageReduction :
    T extends typeof types.CARD_OWNER ? CardOwner :
    T extends typeof types.THREAT ? Threat :
    T extends typeof types.TAUNT ? Taunt :
    T extends typeof types.RAGE ? Rage :
    never;
/* eslint-enable @typescript-eslint/indent */
