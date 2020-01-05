import {
    Entity,
    IF_OWNER,
    CARD_OWNER,
    getFreshComponents,
    getFreshComponent,
} from '../state';

export type MatchOptions = {
    actor?: Entity
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

export function matchConditions(
    sessionId: string,
    entity: Entity,
    options: MatchOptions,
): boolean {
    return matchOwner(sessionId, entity, options);
}
