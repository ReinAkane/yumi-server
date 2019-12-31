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
    const remainingHp = damage.run(sessionId, attacker, defender, attack, defense);

    if (remainingHp && defense) {
        if (state.getComponent(defense, state.RETALIATE)) {
            const attackerHp = state.getComponent(attacker, 'health');
            const defenderAttack = state.getComponent(defender, 'attacker');

            if (attackerHp && defenderAttack) {
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
