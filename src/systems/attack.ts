import * as state from '../state';
import * as damage from './damage';
import { eachRelevantEffect } from './combat-effects';

function shouldCancelAttacks(effects: Iterable<state.Entity>): boolean {
    for (const entity of effects) {
        if (state.getComponent(entity, state.CANCEL_ATTACKS) !== null) {
            return true;
        }
    }

    return false;
}

function runAttacks(sessionId: string, attackInfo: {
    attacker: state.Entity & state.WithComponent<'attacker'>,
    defender: state.Entity & state.WithComponent<'health'>,
    attackCard?: state.Component<'combat effect'>,
    defendCard?: state.Component<'combat effect'>,
}): number {
    let remainingHp = state.getComponent(attackInfo.defender, 'health').data.hp;

    if (!shouldCancelAttacks(eachRelevantEffect(sessionId, attackInfo))) {
        for (const entity of eachRelevantEffect(sessionId, attackInfo)) {
            for (const _ of state.getComponents(entity, state.ATTACK)) {
                remainingHp = damage.run(
                    attackInfo.attacker,
                    attackInfo.defender,
                    eachRelevantEffect(sessionId, attackInfo),
                );

                if (remainingHp <= 0) {
                    break;
                }
            }
        }
    }

    return remainingHp;
}

export function run(
    sessionId: string,
    attacker: state.Entity & state.WithComponent<'attacker'>,
    defender: state.Entity & state.WithComponent<'health'>,
    activeCard: state.Entity & state.WithComponent<'action card'>,
    reactiveCard?: state.Entity & state.WithComponent<'action card'>,
): void {
    const activeCardEffect = state.getComponentByRef(sessionId, state.getComponent(activeCard, 'action card').data.activeEffectRef);
    const reactiveCardEffect = reactiveCard ? state.getComponentByRef(sessionId, state.getComponent(reactiveCard, 'action card').data.reactiveEffectRef) : undefined;

    const attackInfo = {
        attacker,
        defender,
        attackCard: activeCardEffect,
        defendCard: reactiveCardEffect,
    };

    const remainingHp = runAttacks(sessionId, attackInfo);

    if (remainingHp > 0) {
        const retaliateAttacker = state.getComponent(defender, 'attacker');
        const retaliateDefender = state.getComponent(attacker, 'health');

        if (retaliateAttacker && retaliateDefender) {
            const retaliateInfo = {
                attacker: state.getEntityByComponent(sessionId, retaliateAttacker),
                defender: state.getEntityByComponent(sessionId, retaliateDefender),
                attackCard: reactiveCardEffect,
                defendCard: activeCardEffect,
            };

            runAttacks(sessionId, retaliateInfo);
        }
    }
}
