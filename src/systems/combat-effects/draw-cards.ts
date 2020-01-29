import {
    getFreshComponents,
    getEntityWithComponents,
    getEntityRef,
    getComponent,
    Entity,
    DRAW_ACTION_CARD, HAND, ACTION_DECK, PLAYER_STATUS,
} from '../../state';
import * as decks from '../decks';
import { CombatActors } from './combat-actors';
import { eachRelevantEffect } from './events';

export function run(sessionId: string, event: 'act' | 'attack', actors: CombatActors, cards: Iterable<Entity>): void {
    for (const entity of eachRelevantEffect(sessionId, event, actors, cards)) {
        for (const draw of getFreshComponents(sessionId, entity, DRAW_ACTION_CARD)) {
            const player = getEntityWithComponents(
                sessionId,
                HAND,
                ACTION_DECK,
                PLAYER_STATUS,
            );

            if (player !== null) {
                const mustMatch = draw.data.mustMatch === undefined
                    ? undefined
                    : actors[draw.data.mustMatch];
                const owner = mustMatch === undefined ? undefined : getEntityRef(mustMatch);

                decks.draw(
                    sessionId,
                    getComponent(player, ACTION_DECK),
                    getComponent(player, HAND),
                    1,
                    owner,
                );
            }
        }
    }
}
