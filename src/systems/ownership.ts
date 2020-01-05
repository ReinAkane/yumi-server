import {
    Entity,
    WithComponent,
    EntityRef,
    RefWithComponent,
    getComponent,
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
    COMBAT_EFFECT,
    POSITION,
    ACTION_CARD,
    ACTION_DECK,
} from '../state';
import { allEntities } from './combat-effects';

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

export function applyCardOwnership(
    sessionId: string,
    owner: Entity & WithComponent<typeof HEALTH | typeof ATTACKER>,
    cardEntity: Entity & WithComponent<typeof ACTION_CARD>,
): void {
    const ref = getEntityRef(owner, HEALTH, ATTACKER);

    updateOwner(sessionId, cardEntity, ref);

    const card = getComponent(cardEntity, ACTION_CARD);
    const activeEffect = getComponentByRef(sessionId, card.data.activeEffectRef);

    for (const entity of allEntities(sessionId, activeEffect)) {
        updateOwner(sessionId, entity, ref);
    }

    const reactiveEffect = getComponentByRef(sessionId, card.data.reactiveEffectRef);

    for (const entity of allEntities(sessionId, reactiveEffect)) {
        updateOwner(sessionId, entity, ref);
    }
}

export function applySelfOwnership(
    sessionId: string,
    target: Entity & WithComponent<typeof HEALTH | typeof ATTACKER>,
): void {
    const ref = getEntityRef(target, HEALTH, ATTACKER);

    updateOwner(sessionId, target, ref);

    for (const effect of getFreshComponents(sessionId, target, COMBAT_EFFECT)) {
        for (const entity of allEntities(sessionId, effect)) {
            updateOwner(sessionId, entity, ref);
        }
    }

    const position = getFreshComponent(sessionId, target, POSITION);

    if (position !== null) {
        for (const stage of position.data.allCardRefs) {
            for (const cardRef of stage) {
                const card = getComponentByRef(sessionId, cardRef);
                const effect = getComponentByRef(sessionId, card.data.effectRef);

                for (const entity of allEntities(sessionId, effect)) {
                    updateOwner(sessionId, entity, ref);
                }
            }
        }
    }

    for (const deck of getFreshComponents(sessionId, target, ACTION_DECK)) {
        for (const cardRef of deck.data.cardRefs) {
            const card = getComponentByRef(sessionId, cardRef);

            applyCardOwnership(sessionId, target, getEntityByComponent(sessionId, card));
        }
    }
}
