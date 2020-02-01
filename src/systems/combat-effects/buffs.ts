import { instantiate } from '../../state/prefabs';
import * as state from '../../state';
import { log } from '../../log';
import { CombatActors } from './combat-actors';
import { eachRelevantEffect } from './events';
import { applyOwnership } from '../ownership';

function removeBuff(sessionId: string, buff: state.Component<typeof state.BUFF>): void {
    log(`Del buff (fx id: ${buff.data.effectRef.id})`);
    const effect = state.getComponentByRef(sessionId, buff.data.effectRef);

    state.removeComponents(sessionId, state.getEntityByComponent(sessionId, buff), buff, effect);
}

export function tickBuffs(sessionId: string): void {
    for (const entity of state.getEntitiesWithComponents(sessionId, state.BUFF)) {
        for (const buff of state.getComponents(entity, state.BUFF)) {
            const remainingTurns = buff.data.remainingTurns - 1;

            if (remainingTurns < 0) {
                removeBuff(sessionId, buff);
            } else {
                state.updateComponent(buff, {
                    remainingTurns,
                });
            }
        }
    }
}

function addBuff<T extends state.Entity>(
    sessionId: string,
    applyBuff: state.Component<typeof state.APPLY_BUFF>,
    target: T,
): T & state.WithComponent<typeof state.BUFF> & state.WithComponent<typeof state.LINK_EFFECT> {
    const initialComponentIds = new Set(
        [...state.getFreshComponents(sessionId, target, state.LINK_EFFECT)].map(
            (component) => component.id,
        ),
    );
    const effectEntity = instantiate(sessionId, applyBuff.data.prefab);

    const owner = state.getFreshComponent(sessionId, target, state.CARD_OWNER);

    if (owner) {
        applyOwnership(
            sessionId,
            state.getEntityByRef<'health' | 'attacker'>(sessionId, owner.data.owner),
            effectEntity,
        );
    }

    const entityWithEffect = state.addComponents(
        sessionId,
        target,
        {
            type: state.LINK_EFFECT,
            ref: state.getEntityRef(effectEntity),
        },
    );
    const appliedComponent = [
        ...state.getFreshComponents(sessionId, entityWithEffect, state.LINK_EFFECT),
    ].find(
        (component) => !initialComponentIds.has(component.id),
    );

    if (appliedComponent === undefined) {
        throw new Error('Failed to apply buff effect.');
    }

    log(`Add buff (fx id: ${appliedComponent.id})`);

    return state.addComponents(
        sessionId,
        entityWithEffect,
        {
            type: state.BUFF,
            effectRef: state.getComponentRef(appliedComponent),
            remainingTurns: applyBuff.data.duration,
        },
    );
}

function getApplyTarget(
    sessionId: string,
    actors: CombatActors,
    applyBuff: state.Component<typeof state.APPLY_BUFF>,
): state.Entity | undefined {
    if (applyBuff.data.applyTo === 'owner') {
        const owner = state.getComponent(
            state.getEntityByComponent(sessionId, applyBuff),
            state.CARD_OWNER,
        );

        return owner ? state.getEntityByRef<never>(sessionId, owner.data.owner) : undefined;
    }

    return actors[applyBuff.data.applyTo];
}

export function run(
    sessionId: string,
    event: state.Event,
    actors: CombatActors,
    cards: Iterable<state.Entity>,
): void {
    for (const entity of eachRelevantEffect(sessionId, event, actors, cards)) {
        for (const applyBuff of state.getFreshComponents(sessionId, entity, state.APPLY_BUFF)) {
            const target = getApplyTarget(sessionId, actors, applyBuff);

            if (target !== undefined) {
                addBuff(
                    sessionId,
                    applyBuff,
                    target,
                );
            } else {
                log('Skipping buff application because no target was found.');
            }
        }
    }
}
