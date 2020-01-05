import * as state from '../state';
import { chance } from '../chance';
import { eachRelevantEffect } from './combat-effects';

function calculatePriority(
    tauntMultiplier: number,
    effects: Iterable<state.Entity>,
): number {
    let priority = chance.floating({
        min: 0,
        max: 0.1,
    });

    for (const entity of effects) {
        for (const taunt of state.getComponents(entity, state.TAUNT)) {
            priority += taunt.data.modifier * tauntMultiplier;
        }

        for (const threat of state.getComponents(entity, state.THREAT)) {
            priority += threat.data.modifier;
        }
    }

    return priority;
}

function calculateRage(effects: Iterable<state.Entity>): number {
    let rage = 1;

    for (const entity of effects) {
        for (const rageComponent of state.getComponents(entity, state.RAGE)) {
            rage *= rageComponent.data.tauntMultiplier;
        }
    }

    return rage;
}

function sortByPriority(priorities: Map<state.Entity, number>) {
    return function by(a: state.Entity, b: state.Entity): number {
        return (priorities.get(b) || 0) - (priorities.get(a) || 0);
    };
}

export function selectTarget(
    sessionId: string,
    activeCard: state.Component<'action card'>,
    reactiveCard: state.Component<'action card'> | null,
): state.Entity & state.WithComponent<'character status' | 'health'> {
    const characters = state.getEntitiesWithComponents(sessionId, 'character status', 'health');
    const enemy = state.getEntityWithComponents(sessionId, 'enemy status', 'attacker');

    if (enemy === null) {
        throw new Error('No enemy that can attack found.');
    }

    if (characters.length === 0) {
        throw new Error('No potential targets found.');
    }

    const priorities: Map<state.Entity, number> = new Map();
    let owner: string | null | undefined = null;
    if (reactiveCard) {
        owner = state.getComponent(
            state.getEntityByComponent(sessionId, reactiveCard),
            state.CARD_OWNER,
        )?.data.owner.id;
    }

    const attackCard = state.getComponentByRef(sessionId, activeCard.data.activeEffectRef);
    const defendCard = reactiveCard
        ? state.getComponentByRef(sessionId, reactiveCard.data.reactiveEffectRef)
        : undefined;

    for (const character of characters) {
        const tauntMultiplier = calculateRage(eachRelevantEffect(sessionId, {
            attacker: enemy,
            attackCard,
            defender: character,
            defendCard,
        }));

        const priority = calculatePriority(tauntMultiplier, eachRelevantEffect(sessionId, {
            attacker: enemy,
            attackCard,
            defender: character,
            defendCard: owner === character.id ? defendCard : undefined,
        }));

        priorities.set(
            character,
            priority,
        );
    }

    const target = characters.sort(sortByPriority(priorities))[0];

    return target;
}
