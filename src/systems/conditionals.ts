import {
    Entity,
    IF_OWNER,
    CARD_OWNER,
    IF_POSTION,
    IF_ACTIVE,
    POSITION,
    getFreshComponents,
    getFreshComponent,
    getComponentByRef,
} from '../state';

export type MatchOptions = {
    actor?: Entity;
    activeActor?: Entity;
};

function matchOwner(
    sessionId: string,
    entity: Entity,
    options: MatchOptions,
): boolean {
    const { actor } = options;
    const owner = getFreshComponent(sessionId, entity, CARD_OWNER);
    for (const ifOwner of getFreshComponents(sessionId, entity, IF_OWNER)) {
        if (ifOwner.data.shouldBeOwner) {
            if (owner === null || actor === undefined || owner.data.owner.id !== actor.id) {
                return false;
            }
        } else if (owner !== null && actor !== undefined && owner.data.owner.id === actor.id) {
            return false;
        }
    }

    return true;
}

function matchActive(
    sessionId: string,
    entity: Entity,
    options: MatchOptions,
): boolean {
    const { actor, activeActor } = options;
    for (const ifActive of getFreshComponents(sessionId, entity, IF_ACTIVE)) {
        if (ifActive.data.shouldBeActive) {
            if (actor === undefined || activeActor === undefined || actor.id !== activeActor.id) {
                return false;
            }
        } else if (
            actor !== undefined
            && activeActor !== undefined
            && actor.id === activeActor.id
        ) {
            return false;
        }
    }

    return true;
}

function matchPosition(
    sessionId: string,
    entity: Entity,
    options: MatchOptions,
): boolean {
    const { actor } = options;
    const position = actor && getFreshComponent(sessionId, actor, POSITION);
    const currentPositionCard = position && getComponentByRef(
        sessionId,
        position.data.currentCardRef,
    );

    for (const ifPosition of getFreshComponents(sessionId, entity, IF_POSTION)) {
        if (
            !currentPositionCard
            || !ifPosition.data.tags.every((tag) => currentPositionCard.data.tags.has(tag))
        ) {
            return false;
        }
    }

    return true;
}

export function matchConditions(
    sessionId: string,
    entity: Entity,
    options: MatchOptions,
): boolean {
    return matchOwner(sessionId, entity, options) && matchPosition(sessionId, entity, options)
        && matchActive(sessionId, entity, options);
}
