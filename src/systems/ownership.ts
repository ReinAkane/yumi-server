import {
    Entity,
    WithComponent,
    EntityRef,
    RefWithComponent,
    getFreshComponent,
    getFreshComponents,
    getEntityRef,
    addComponents,
    updateComponent,
    getComponentByRef,
    getEntityByComponent,
    CARD_OWNER,
    HEALTH,
    ATTACKER,
    POSITION,
    ACTION_DECK,
} from '../state';
import { allEntities } from './combat-effects/events';

function updateOwner(
    sessionId: string,
    target: Entity,
    ref: EntityRef & RefWithComponent<typeof HEALTH | typeof ATTACKER>,
): void {
    const existingOwner = getFreshComponent(sessionId, target, CARD_OWNER);

    if (existingOwner) {
        updateComponent(existingOwner, {
            owner: ref,
        });
    } else {
        addComponents(sessionId, target, {
            type: CARD_OWNER,
            owner: ref,
        });
    }
}

export function applyOwnership(
    sessionId: string,
    owner: Entity & WithComponent<typeof HEALTH | typeof ATTACKER>,
    target: Entity,
): void {
    const ref = getEntityRef(owner, HEALTH, ATTACKER);

    updateOwner(sessionId, target, ref);

    for (const entity of allEntities(sessionId, getEntityRef(target))) {
        updateOwner(sessionId, entity, ref);
    }
}

export function applySelfOwnership(
    sessionId: string,
    target: Entity & WithComponent<typeof HEALTH | typeof ATTACKER>,
): void {
    const ref = getEntityRef(target, HEALTH, ATTACKER);

    updateOwner(sessionId, target, ref);

    for (const entity of allEntities(sessionId, getEntityRef(target))) {
        updateOwner(sessionId, entity, ref);
    }

    const position = getFreshComponent(sessionId, target, POSITION);

    if (position !== null) {
        for (const stage of position.data.allCardRefs) {
            for (const cardRef of stage) {
                const card = getComponentByRef(sessionId, cardRef);

                for (const entity of allEntities(sessionId, card.data.effectRef)) {
                    updateOwner(sessionId, entity, ref);
                }
            }
        }
    }

    for (const deck of getFreshComponents(sessionId, target, ACTION_DECK)) {
        for (const cardRef of deck.data.cardRefs) {
            const card = getComponentByRef(sessionId, cardRef);

            applyOwnership(sessionId, target, getEntityByComponent(sessionId, card));
        }
    }
}
