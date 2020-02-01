import * as state from '../../state';
import * as damage from '../damage';
import { CombatActors } from './combat-actors';
import * as events from './events';
import { log } from '../../log';

function shouldCancelAttacks(effects: Iterable<state.Entity>): boolean {
    for (const entity of effects) {
        if (state.getComponent(entity, state.CANCEL_ATTACKS) !== null) {
            log('Cancelling attacks', 'attack');
            return true;
        }
    }

    return false;
}

function getActor(
    sessionId: string,
    tag: state.ActorTag | 'owner',
    actors: CombatActors,
    entity: state.Entity,
): state.Entity | undefined {
    if (tag === 'owner') {
        const owner = state.getFreshComponent(sessionId, entity, state.CARD_OWNER);

        if (owner) {
            return state.getEntityByRef<never>(sessionId, owner.data.owner);
        }

        return undefined;
    }

    return actors[tag];
}

export function run(
    sessionId: string,
    event: state.Event,
    actors: CombatActors,
    cards: Iterable<state.Entity>,
): void {
    log('Starting attack system...', 'attack');
    // for each eachRelevantEffect
    for (const entity of events.eachRelevantEffect(sessionId, event, actors, cards)) {
        for (const attack of state.getFreshComponents(sessionId, entity, state.ATTACK)) {
            // run attack if needed
            const attacker = getActor(sessionId, attack.data.actor, actors, entity);
            const defender = actors[attack.data.target];

            log('Attack component found...', 'attack');
            if (attacker && defender) {
                const attackerComponent = state.getComponent(attacker, state.ATTACKER);
                const defenderComponent = state.getComponent(defender, state.HEALTH);

                if (attackerComponent && defenderComponent) {
                    const attackActors = {
                        ...actors,
                        attacker,
                        defender,
                    };
                    if (!shouldCancelAttacks(
                        events.eachRelevantEffect(sessionId, 'after attack', attackActors, cards),
                    )) {
                        log('Running damage system!', 'attack');
                        damage.run(
                            state.getEntityByComponent(sessionId, attackerComponent),
                            state.getEntityByComponent(sessionId, defenderComponent),
                            events.eachRelevantEffect(sessionId, 'after attack', attackActors, cards),
                        );
                    }

                    events.run(sessionId, 'after attack', attackActors, cards);
                }
            }
        }
    }
}
