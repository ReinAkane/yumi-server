import * as state from '../state';
import { chance } from '../chance';
import { eachRelevantEffect } from './combat-effects';
import { log } from '../log';

function calculateTaunt(effects: Iterable<state.Entity>): number {
    let taunt = 0;

    for (const entity of effects) {
        for (const component of state.getComponents(entity, state.TAUNT)) {
            taunt += component.data.modifier;
        }
    }

    return taunt;
}

function calculateThreat(effects: Iterable<state.Entity>): number {
    let threat = 0;

    for (const entity of effects) {
        for (const component of state.getComponents(entity, state.THREAT)) {
            threat += component.data.modifier;
        }
    }

    return threat;
}

function calculateRage(effects: Iterable<state.Entity>): number {
    let rage = 0.5;

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
    log('Selecting target...', 'targetting');
    const characters = state.getEntitiesWithComponents(sessionId, 'character status', 'health');
    const enemy = state.getEntityWithComponents(sessionId, 'enemy status', 'attacker');

    if (enemy === null) {
        throw new Error('No enemy that can attack found.');
    }

    if (characters.length === 0) {
        throw new Error('No potential targets found.');
    }

    const priorities: Map<state.Entity, number> = new Map();
    const attackCard = state.getComponentByRef(sessionId, activeCard.data.activeEffectRef);
    const defendCard = reactiveCard
        ? state.getComponentByRef(sessionId, reactiveCard.data.reactiveEffectRef)
        : undefined;

    for (const character of characters) {
        log(`Calculate priority for ${state.getComponent(character, 'character status').data.dataId}...`, 'targetting');
        const tauntMultiplier = calculateRage(eachRelevantEffect(sessionId, {
            attacker: enemy,
            attackCard,
            defender: character,
            defendCard,
        }, true));
        log(`    Rage: ${tauntMultiplier}`, 'targetting');
        const taunt = calculateTaunt(eachRelevantEffect(sessionId, {
            attacker: enemy,
            attackCard,
            defender: character,
            defendCard,
        }, true));
        log(`    Taunt: ${taunt}`, 'targetting');
        const threat = calculateThreat(eachRelevantEffect(sessionId, {
            attacker: enemy,
            attackCard,
            defender: character,
            defendCard,
        }, true));
        log(`    Threat: ${threat}`, 'targetting');
        const priority = chance.floating({
            min: 0,
            max: 0.1,
        });
        log(`    Random seed: ${priority}`, 'targetting');
        const result = priority + threat + taunt * tauntMultiplier;
        log(`    Final priority: ${result}`, 'targetting');

        priorities.set(
            character,
            result,
        );
    }

    const target = characters.sort(sortByPriority(priorities))[0];

    log(`Final target: ${state.getComponent(target, 'character status').data.dataId}`, 'targetting');

    return target;
}
