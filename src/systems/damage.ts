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

function getActionCardFromPosition(sessionId: string, position: state.Component<'position'>): state.Component<'action card'> {
    return state.getComponentByRef(sessionId, position.data.currentCardRef);
}

function buildParticipatingCardList(
    sessionId: string,
    attacker: state.Entity & state.WithComponent<'attacker'>,
    defender: state.Entity & state.WithComponent<'health'>,
    attackCard: state.Entity & state.WithComponent<'action card'>,
    defendCard?: state.Entity & state.WithComponent<'action card'>,
): readonly state.Entity[] {
    const cards: state.Entity[] = [];

    const attackerPosition = state.getComponent(attacker, 'position');

    if (attackerPosition !== null) {
        const actionCard = getActionCardFromPosition(sessionId, attackerPosition);

        cards.push(state.getEntityByRef<never>(sessionId, actionCard.data.attackRef));
    }

    const defenderPosition = state.getComponent(defender, 'position');

    if (defenderPosition !== null) {
        const actionCard = getActionCardFromPosition(sessionId, defenderPosition);

        cards.push(state.getEntityByRef<never>(sessionId, actionCard.data.defendRef));
    }

    cards.push(state.getEntityByRef<never>(sessionId, state.getComponent(attackCard, 'action card').data.attackRef));
    if (defendCard !== undefined) {
        cards.push(state.getEntityByRef<never>(sessionId, state.getComponent(defendCard, 'action card').data.defendRef));
    }

    return cards;
}

export function run(
    sessionId: string,
    attacker: state.Entity & state.WithComponent<'attacker'>,
    defender: state.Entity & state.WithComponent<'health'>,
    attackCard: state.Entity & state.WithComponent<'action card'>,
    defendCard?: state.Entity & state.WithComponent<'action card'>,
): number {
    const cards = buildParticipatingCardList(
        sessionId,
        attacker,
        defender,
        attackCard,
        defendCard,
    );

    const maximumDamage = cards.reduce(
        applyBonusDamage,
        state.getComponent(attacker, 'attacker').data.baseDamage - state.getComponent(defender, 'health').data.baseArmor,
    );
    const netDamage = Math.max(0, cards.reduce(applyDamageReduction, maximumDamage));

    let health = state.getComponent(defender, 'health');

    health = state.updateComponent(
        health,
        {
            hp: Math.max(health.data.hp - netDamage, 0),
        },
    );

    return health.data.hp;
}
