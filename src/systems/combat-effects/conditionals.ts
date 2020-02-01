import {
    Entity,
    CARD_OWNER,
    IF_POSTION,
    IF_OWNER_IS,
    POSITION,
    IF_TEAM_IS,
    CHARACTER_STATUS,
    ENEMY_STATUS,
    getFreshComponents,
    getFreshComponent,
    getComponentByRef,
    getEntityByRef,
} from '../../state';
import { CombatActors } from './combat-actors';

export type MatchOptions = {
    actor?: Entity;
    activeActor?: Entity;
};

function matchOwner(
    sessionId: string,
    entity: Entity,
    actors: CombatActors,
): boolean {
    const owner = getFreshComponent(sessionId, entity, CARD_OWNER);

    if (!owner) {
        return false;
    }

    for (const ifOwner of getFreshComponents(sessionId, entity, IF_OWNER_IS)) {
        if (ifOwner.data.actorTag === 'inactive') {
            if (owner.data.owner.id === actors?.active?.id
                || owner.data.owner.id === actors?.active?.id) {
                return false;
            }
        } else {
            const target = actors[ifOwner.data.actorTag];

            if (!target || target.id !== owner.data.owner.id) {
                return false;
            }
        }
    }

    return true;
}

function matchPosition(
    sessionId: string,
    entity: Entity,
    actors: CombatActors,
): boolean {
    for (const ifPosition of getFreshComponents(sessionId, entity, IF_POSTION)) {
        const target = actors[ifPosition.data.applyTo];
        const position = target && getFreshComponent(sessionId, target, POSITION);
        const currentPositionCard = position && getComponentByRef(
            sessionId,
            position.data.currentCardRef,
        );

        if (
            !currentPositionCard
            || !ifPosition.data.tags.every((tag) => currentPositionCard.data.tags.has(tag))
        ) {
            return false;
        }
    }

    return true;
}

function matchTeam(
    sessionId: string,
    entity: Entity,
    actors: CombatActors,
): boolean {
    const owner = getFreshComponent(sessionId, entity, CARD_OWNER);

    if (owner === null) {
        return false;
    }

    const ownerTeam = getFreshComponent(
        sessionId,
        getEntityByRef<never>(sessionId, owner.data.owner),
        CHARACTER_STATUS,
    ) === null ? ENEMY_STATUS : CHARACTER_STATUS;
    let activeTeam = CHARACTER_STATUS;

    if (actors.active) {
        activeTeam = getFreshComponent(sessionId, actors.active, CHARACTER_STATUS) === null
            ? ENEMY_STATUS
            : CHARACTER_STATUS;
    } else if (actors.reactive) {
        activeTeam = getFreshComponent(sessionId, actors.reactive, CHARACTER_STATUS) !== null
            ? ENEMY_STATUS
            : CHARACTER_STATUS;
    }

    for (const ifTeam of getFreshComponents(sessionId, entity, IF_TEAM_IS)) {
        if (ifTeam.data.tag === 'active' && activeTeam !== ownerTeam) {
            return false;
        }
        if (ifTeam.data.tag === 'reactive' && activeTeam === ownerTeam) {
            return false;
        }
    }

    return true;
}

export function matchConditions(
    sessionId: string,
    entity: Entity,
    actors: CombatActors,
): boolean {
    return matchOwner(sessionId, entity, actors) && matchPosition(sessionId, entity, actors)
        && matchTeam(sessionId, entity, actors);
}
