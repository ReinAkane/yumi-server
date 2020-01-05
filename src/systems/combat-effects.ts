import {
    Entity,
    WithComponent,
    EntityRef,
    Component,
    ATTACKER,
    COMBAT_EFFECT,
    HEALTH,
    POSITION,
    LINK_EFFECT,
    getEntityByRef,
    getFreshComponent,
    getFreshComponents,
    getComponentByRef,
} from '../state';
import { matchConditions, MatchOptions } from './conditionals';

function* eachLinkedEntity(
    sessionId: string,
    ref: EntityRef,
    matchOptions?: MatchOptions,
): Generator<Entity> {
    const entity = getEntityByRef<never>(sessionId, ref);

    if (matchOptions === undefined || matchConditions(sessionId, entity, matchOptions)) {
        yield entity;

        for (const link of getFreshComponents(sessionId, entity, LINK_EFFECT)) {
            yield* eachLinkedEntity(sessionId, link.data.ref, matchOptions);
        }
    }
}

export function* allEntities(
    sessionId: string,
    effect: Component<typeof COMBAT_EFFECT>,
): Generator<Entity> {
    yield* eachLinkedEntity(sessionId, effect.data.attackRef);
    yield* eachLinkedEntity(sessionId, effect.data.defendRef);
    yield* eachLinkedEntity(sessionId, effect.data.universalRef);
}

function* attackerEntities(
    sessionId: string,
    effect: Component<typeof COMBAT_EFFECT>,
    matchOptions: MatchOptions,
): Generator<Entity> {
    yield* eachLinkedEntity(sessionId, effect.data.attackRef, matchOptions);
    yield* eachLinkedEntity(sessionId, effect.data.universalRef, matchOptions);
}

function* defenderEntities(
    sessionId: string,
    effect: Component<typeof COMBAT_EFFECT>,
    matchOptions: MatchOptions,
): Generator<Entity> {
    yield* eachLinkedEntity(sessionId, effect.data.defendRef, matchOptions);
    yield* eachLinkedEntity(sessionId, effect.data.universalRef, matchOptions);
}

export function* eachRelevantEffect(
    sessionId: string,
    participants: {
        attacker?: Entity & WithComponent<typeof ATTACKER>,
        attackCard?: Component<typeof COMBAT_EFFECT>,
        defender?: Entity & WithComponent<typeof HEALTH>,
        defendCard?: Component<typeof COMBAT_EFFECT>,
    },
): Generator<Entity> {
    const {
        attacker,
        attackCard,
        defender,
        defendCard,
    } = participants;

    const attackerMatchOptions: MatchOptions = {
        actor: attacker,
    };
    const defenderMatchOptions: MatchOptions = {
        actor: defender,
    };

    if (undefined !== attacker) {
        const position = getFreshComponent(sessionId, attacker, POSITION);

        if (position !== null) {
            const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
            const positionEffect = getComponentByRef(sessionId, positionCard.data.effectRef);

            yield* attackerEntities(sessionId, positionEffect, attackerMatchOptions);
        }

        for (const passive of getFreshComponents(sessionId, attacker, COMBAT_EFFECT)) {
            yield* attackerEntities(sessionId, passive, attackerMatchOptions);
        }
    }

    if (undefined !== defender) {
        const position = getFreshComponent(sessionId, defender, POSITION);

        if (position !== null) {
            const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
            const positionEffect = getComponentByRef(sessionId, positionCard.data.effectRef);

            yield* defenderEntities(sessionId, positionEffect, defenderMatchOptions);
        }

        for (const passive of getFreshComponents(sessionId, defender, COMBAT_EFFECT)) {
            yield* defenderEntities(sessionId, passive, defenderMatchOptions);
        }
    }

    if (undefined !== attackCard) {
        yield* attackerEntities(sessionId, attackCard, attackerMatchOptions);
    }

    if (undefined !== defendCard) {
        yield* defenderEntities(sessionId, defendCard, attackerMatchOptions);
    }
}
