import {
    getFreshComponents,
    getFreshComponent,
    getEntityByRef,
    Entity,
    Component,
    Event,
    MOVE_TO_POSITION,
    CARD_OWNER,
} from '../../state';
import { log } from '../../log';
import { CombatActors } from './combat-actors';
import { enqueueNextPosition } from '../position';
import { eachRelevantEffect } from './events';

function getTarget(
    sessionId: string,
    move: Component<typeof MOVE_TO_POSITION>,
    actors: CombatActors,
    entity: Entity,
): Entity | undefined {
    if (move.data.applyTo === 'owner') {
        const owner = getFreshComponent(sessionId, entity, CARD_OWNER);

        if (owner) {
            return getEntityByRef<never>(sessionId, owner.data.owner);
        }

        return undefined;
    }

    return actors[move.data.applyTo];
}

export function run(
    sessionId: string,
    event: Event,
    actors: CombatActors,
    cards: Iterable<Entity>,
): void {
    for (const entity of eachRelevantEffect(sessionId, event, actors, cards)) {
        for (const move of getFreshComponents(sessionId, entity, MOVE_TO_POSITION)) {
            const target = getTarget(sessionId, move, actors, entity);

            if (target !== undefined) {
                log(`Enqueueing position with tags ${[...move.data.tags].join(', ')}`);
                enqueueNextPosition(sessionId, target, move.data.tags);
            }
        }
    }
}
