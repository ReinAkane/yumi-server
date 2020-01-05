import * as state from '../state';

function applyBonusDamage(damage: number, card: state.Entity): number {
    let result = damage;

    for (const component of state.getComponents(card, state.BONUS_DAMAGE)) {
        result += component.data.add;
    }

    return result;
}

function applyDamageReduction(damage: number, card: state.Entity): number {
    let result = damage;

    for (const component of state.getComponents(card, state.DAMAGE_REDUCTION)) {
        result -= component.data.subtract;
    }

    return result;
}

function getArmorMultipier(cards: readonly state.Entity[]): number {
    let multiplier = 1;

    for (const card of cards) {
        for (const armorPenetration of state.getComponents(card, state.ARMOR_PENETRATION)) {
            multiplier *= armorPenetration.data.multiplier;
        }
    }

    return multiplier;
}

export function run(
    attacker: state.Entity & state.WithComponent<'attacker'>,
    defender: state.Entity & state.WithComponent<'health'>,
    effects: Iterable<state.Entity>,
): number {
    const effectsCache = [...effects];

    const maximumDamage = effectsCache.reduce(
        applyBonusDamage,
        state.getComponent(attacker, 'attacker').data.baseDamage - state.getComponent(defender, 'health').data.baseArmor,
    );
    const armorMultiplier = getArmorMultipier(effectsCache);
    const armor = Math.min(0, effectsCache.reduce(applyDamageReduction, 0));
    const netDamage = Math.max(1, maximumDamage + Math.ceil(armor * armorMultiplier));

    let health = state.getComponent(defender, 'health');

    health = state.updateComponent(
        health,
        {
            hp: Math.max(health.data.hp - netDamage, 0),
        },
    );

    return health.data.hp;
}
