import {
    getFreshComponents,
    getEntityWithComponents,
    getComponentByRef,
    getComponent,
    getEntityByComponent,
    Entity,
    Event,
    Component,
    ComponentRef,
    ActorTag,
    DISCARD_PLAYER_CARDS,
    ACTION_DECK,
    ACTION_CARD,
    HAND,
    PLAYER_STATUS,
    CARD_OWNER,
} from '../../state';
import * as decks from '../decks';
import { CombatActors } from './combat-actors';
import { eachRelevantEffect } from './events';
import { chance } from '../../chance';

function pickCard(
    sessionId: string,
    playerHand: Component<typeof HAND>,
    match: ActorTag,
    actors: CombatActors,
): Component<typeof ACTION_CARD> {
    let possibleCards: ComponentRef<typeof ACTION_CARD>[] = [];
    const target = actors[match];

    if (target) {
        for (const ref of playerHand.data.cardRefs) {
            const component = getComponentByRef(sessionId, ref);
            const ownerComponent = getComponent(
                getEntityByComponent(sessionId, component),
                CARD_OWNER,
            );

            if (ownerComponent?.data.owner.id === target.id) {
                possibleCards.push(ref);
            }
        }
    }

    if (possibleCards.length === 0) {
        possibleCards = playerHand.data.cardRefs;
    }

    const card = chance.pickone(playerHand.data.cardRefs);

    return getComponentByRef(sessionId, card);
}

export function run(
    sessionId: string,
    event: Event,
    actors: CombatActors,
    cards: Iterable<Entity>,
): void {
    for (const entity of eachRelevantEffect(sessionId, event, actors, cards)) {
        for (
            const discardPlayerCards of getFreshComponents(sessionId, entity, DISCARD_PLAYER_CARDS)
        ) {
            const player = getEntityWithComponents(sessionId, HAND, ACTION_DECK, PLAYER_STATUS);

            if (player === null) {
                throw new Error('Cannot find player hand!');
            }

            const playerHand = getComponent(player, HAND);
            const playerDeck = getComponent(player, ACTION_DECK);

            decks.discard(
                playerHand,
                playerDeck,
                pickCard(sessionId, playerHand, discardPlayerCards.data.match, actors),
            );
        }
    }
}
