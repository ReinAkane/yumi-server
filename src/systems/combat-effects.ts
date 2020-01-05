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
    REAPPLY_POSITION,
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

function* eachNonPositionAttackerEffect(
    sessionId: string,
    participants: {
        attacker?: Entity & WithComponent<typeof ATTACKER>,
        attackCard?: Component<typeof COMBAT_EFFECT>,
    },
): Generator<Entity> {
    const {
        attacker,
        attackCard,
    } = participants;

    const attackerMatchOptions: MatchOptions = {
        actor: attacker,
    };

    if (undefined !== attacker) {
        for (const passive of getFreshComponents(sessionId, attacker, COMBAT_EFFECT)) {
            yield* attackerEntities(sessionId, passive, attackerMatchOptions);
        }
    }

    if (undefined !== attackCard) {
        yield* attackerEntities(sessionId, attackCard, attackerMatchOptions);
    }
}

function* eachNonPositionDefenderEffect(
    sessionId: string,
    participants: {
        defender?: Entity & WithComponent<typeof HEALTH>,
        defendCard?: Component<typeof COMBAT_EFFECT>,
    },
): Generator<Entity> {
    const {
        defender,
        defendCard,
    } = participants;

    const defenderMatchOptions: MatchOptions = {
        actor: defender,
    };

    if (undefined !== defender) {
        for (const passive of getFreshComponents(sessionId, defender, COMBAT_EFFECT)) {
            yield* defenderEntities(sessionId, passive, defenderMatchOptions);
        }
    }

    if (undefined !== defendCard) {
        yield* defenderEntities(sessionId, defendCard, defenderMatchOptions);
    }
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
    let defendPositionMultiplier = 1;
    let attackPositionMultiplier = 1;
    const {
        attacker,
        defender,
    } = participants;

    for (const entity of eachNonPositionAttackerEffect(sessionId, participants)) {
        yield entity;

        for (const _ of getFreshComponents(sessionId, entity, REAPPLY_POSITION)) {
            attackPositionMultiplier += 1;
        }
    }

    if (undefined !== attacker) {
        const attackerMatchOptions: MatchOptions = {
            actor: attacker,
        };

        for (let i = 0; i < attackPositionMultiplier; i += 1) {
            const position = getFreshComponent(sessionId, attacker, POSITION);

            if (position !== null) {
                const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
                const positionEffect = getComponentByRef(sessionId, positionCard.data.effectRef);

                yield* attackerEntities(sessionId, positionEffect, attackerMatchOptions);
            }
        }
    }

    for (const entity of eachNonPositionDefenderEffect(sessionId, participants)) {
        yield entity;

        for (const _ of getFreshComponents(sessionId, entity, REAPPLY_POSITION)) {
            defendPositionMultiplier += 1;
        }
    }

    if (undefined !== defender) {
        const defenderMatchOptions: MatchOptions = {
            actor: defender,
        };

        for (let i = 0; i < defendPositionMultiplier; i += 1) {
            const position = getFreshComponent(sessionId, defender, POSITION);

            if (position !== null) {
                const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
                const positionEffect = getComponentByRef(sessionId, positionCard.data.effectRef);

                yield* defenderEntities(sessionId, positionEffect, defenderMatchOptions);
            }
        }
    }
}
