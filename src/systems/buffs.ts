import * as state from '../state';

function removeBuff(sessionId: string, buff: state.Component<typeof state.BUFF>): void {
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
): T & state.WithComponent<typeof state.BUFF> & state.WithComponent<typeof state.COMBAT_EFFECT> {
    const initialComponentIds = new Set(
        state.getComponents(target, state.COMBAT_EFFECT).map((component) => component.id),
    );
    const entityWithEffect = state.addComponents(
        sessionId,
        target,
        {
            type: state.COMBAT_EFFECT,
            universalRef: applyBuff.data.universalRef,
            attackRef: applyBuff.data.attackRef,
            defendRef: applyBuff.data.defendRef,
        },
    );
    const appliedComponent = state.getComponents(entityWithEffect, state.COMBAT_EFFECT).find(
        (component) => !initialComponentIds.has(component.id),
    );

    if (appliedComponent === undefined) {
        throw new Error('Failed to apply buff effect.');
    }

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

export function applyBuffs(
    sessionId: string,
    attacker: state.Entity,
    defender: state.Entity,
    effects: Iterable<state.Entity>,
): void {
    for (const entity of effects) {
        for (const applyBuff of state.getComponents(entity, state.APPLY_BUFF)) {
            addBuff(
                sessionId,
                applyBuff,
                applyBuff.data.applyTo === 'attacker' ? attacker : defender,
            );
        }
    }
}
