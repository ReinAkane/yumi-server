import * as state from '../state';
import { log } from '../log';
import * as damage from './damage';
import * as buffs from './buffs';
import * as decks from './decks';
import { enqueueNextPosition } from './position';
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
}, attackerActive: boolean): number {
    let remainingHp = state.getComponent(attackInfo.defender, 'health').data.hp;

    if (!shouldCancelAttacks(eachRelevantEffect(sessionId, attackInfo, attackerActive))) {
        for (const entity of eachRelevantEffect(sessionId, attackInfo, attackerActive)) {
            for (const _ of state.getComponents(entity, state.ATTACK)) {
                remainingHp = damage.run(
                    attackInfo.attacker,
                    attackInfo.defender,
                    eachRelevantEffect(sessionId, attackInfo, attackerActive),
                );

                buffs.applyBuffs(
                    sessionId,
                    attackInfo.attacker,
                    attackInfo.defender,
                    eachRelevantEffect(sessionId, attackInfo, attackerActive),
                );

                if (remainingHp <= 0) {
                    break;
                }
            }
        }
    }

    for (const entity of eachRelevantEffect(sessionId, attackInfo, attackerActive)) {
        for (const move of state.getComponents(entity, state.MOVE_TO_POSITION)) {
            log(`Enqueueing position with tags ${[...move.data.tags].join(', ')}`);
            enqueueNextPosition(sessionId, attackInfo.attacker, move.data.tags);
        }

        for (const draw of state.getComponents(entity, state.DRAW_ACTION_CARD)) {
            const player = state.getEntityWithComponents(
                sessionId,
                state.HAND,
                state.ACTION_DECK,
                state.PLAYER_STATUS,
            );

            if (player !== null) {
                let owner: state.EntityRef | undefined;

                switch (draw.data.mustMatch) {
                    case 'attacker': owner = state.getEntityRef(attackInfo.attacker); break;
                    case 'defender': owner = state.getEntityRef(attackInfo.defender); break;
                    default: break;
                }

                decks.draw(
                    sessionId,
                    state.getComponent(player, state.ACTION_DECK),
                    state.getComponent(player, state.HAND),
                    1,
                    owner,
                );
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

    const remainingHp = runAttacks(sessionId, attackInfo, true);

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

            log('Running retaliation...');
            runAttacks(sessionId, retaliateInfo, false);
        }
    }
}
