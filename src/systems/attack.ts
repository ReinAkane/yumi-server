import * as state from '../state';
import * as damage from './damage';

export function run(
    sessionId: string,
    attacker: state.Entity & state.WithComponent<'attacker'>,
    defender: state.Entity & state.WithComponent<'health'>,
    attackCard: state.Entity & state.WithComponent<'action card'>,
    defendCard?: state.Entity & state.WithComponent<'action card'>,
): void {
    const attack = state.getEntityByRef<never>(sessionId, state.getComponent(attackCard, 'action card').data.attackRef);
    const defense = defendCard ? state.getEntityByRef<never>(sessionId, state.getComponent(defendCard, 'action card').data.defendRef) : undefined;
    let remainingHp = state.getComponent(defender, 'health').data.hp;

    if (defense && state.getComponent(defense, state.CANCEL_ATTACKS) === null) {
        for (const _ of state.getComponents(attack, state.ATTACK)) {
            remainingHp = damage.run(sessionId, attacker, defender, attack, defense);

            if (remainingHp <= 0) {
                break;
            }
        }
    }

    if (remainingHp > 0 && defense && state.getComponent(attack, state.CANCEL_ATTACKS) === null) {
        const attackerHp = state.getComponent(attacker, 'health');
        const defenderAttack = state.getComponent(defender, 'attacker');

        if (attackerHp && defenderAttack) {
            for (const _ of state.getComponents(defense, state.ATTACK)) {
                damage.run(
                    sessionId,
                    state.getEntityByComponent(sessionId, defenderAttack),
                    state.getEntityByComponent(sessionId, attackerHp),
                    defense,
                    attack,
                );
            }
        }
    }
}
