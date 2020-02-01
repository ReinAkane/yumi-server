import {
    Entity,
    EntityRef,
    Event,
    COMBAT_EFFECT,
    POSITION,
    LINK_EFFECT,
    REAPPLY_POSITION,
    getEntityByRef,
    getFreshComponent,
    getFreshComponents,
    getComponentByRef,
    getEntitiesWithComponents,
    getEntityRef,
} from '../../state';
import { matchConditions } from './conditionals';
import { CombatActors } from './combat-actors';

type CombatEffectSystem = {
    run: (sessionId: string, event: Event, actors: CombatActors, cards: Iterable<Entity>) => void
};

const systems: CombatEffectSystem[] = [];

export function registerSystems(...registered: CombatEffectSystem[]): void {
    systems.push(...registered);
}

function* eachLinkedEntity(
    sessionId: string,
    event: Event,
    ref: EntityRef,
    actors?: CombatActors,
    alreadyActive?: boolean,
): Generator<Entity> {
    const entity = getEntityByRef<never>(sessionId, ref);
    let active = alreadyActive;

    for (const combatEffect of getFreshComponents(sessionId, entity, COMBAT_EFFECT)) {
        if (combatEffect.data.on === event) {
            active = true;
        }
    }

    if (actors === undefined || matchConditions(sessionId, entity, actors)) {
        if (active) {
            yield entity;
        }

        for (const link of getFreshComponents(sessionId, entity, LINK_EFFECT)) {
            yield* eachLinkedEntity(sessionId, event, link.data.ref, actors, active);
        }
    }
}

export function* allEntities(
    sessionId: string,
    ref: EntityRef,
): Generator<Entity> {
    yield* eachLinkedEntity(sessionId, 'before act', ref, undefined, true);
}

export function* eachRelevantEffect(
    sessionId: string,
    event: Event,
    actors: CombatActors,
    cards: Iterable<Entity>,
): Generator<Entity> {
    const positionMultipliers = new Map<string, number>();
    // every player character
    for (const entity of getEntitiesWithComponents(sessionId, 'character status')) {
        let positionMultiplier = 1;

        for (const linked of eachLinkedEntity(sessionId, event, getEntityRef(entity), actors)) {
            yield linked;

            for (const _ of getFreshComponents(sessionId, linked, REAPPLY_POSITION)) {
                positionMultiplier += 1;
            }
        }

        positionMultipliers.set(entity.id, positionMultiplier);
    }
    // the enemy
    for (const entity of getEntitiesWithComponents(sessionId, 'enemy status')) {
        let positionMultiplier = 1;

        for (const linked of eachLinkedEntity(sessionId, event, getEntityRef(entity), actors)) {
            yield linked;

            for (const _ of getFreshComponents(sessionId, linked, REAPPLY_POSITION)) {
                positionMultiplier += 1;
            }
        }

        positionMultipliers.set(entity.id, positionMultiplier);
    }
    // the active card
    // the reactive card
    for (const entity of cards) {
        yield* eachLinkedEntity(sessionId, event, getEntityRef(entity), actors);
    }
    // every position
    for (const entity of getEntitiesWithComponents(sessionId, 'character status')) {
        const multiplier = positionMultipliers.get(entity.id) || 1;
        const position = getFreshComponent(sessionId, entity, POSITION);

        if (position) {
            for (let i = 0; i < multiplier; i += 1) {
                const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
                yield* eachLinkedEntity(sessionId, event, positionCard.data.effectRef, actors);
            }
        }
    }
    for (const entity of getEntitiesWithComponents(sessionId, 'enemy status')) {
        const multiplier = positionMultipliers.get(entity.id) || 1;
        const position = getFreshComponent(sessionId, entity, POSITION);

        if (position) {
            for (let i = 0; i < multiplier; i += 1) {
                const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
                yield* eachLinkedEntity(sessionId, event, positionCard.data.effectRef, actors);
            }
        }
    }
}

export function run(
    sessionId: string,
    event: Event,
    actors: CombatActors,
    cards: Iterable<Entity>,
): void {
    for (const system of systems) {
        system.run(sessionId, event, actors, cards);
    }
}
