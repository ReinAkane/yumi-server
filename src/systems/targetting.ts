import * as state from '../state';
import { chance } from '../chance';

function addCardPriority(
    tauntMultiplier: number,
    priority: number,
    cardEntity: state.Entity,
) {
    let result = priority;

    for (const taunt of state.getComponents(cardEntity, state.TAUNT)) {
        result += taunt.data.modifier * tauntMultiplier;
    }

    for (const threat of state.getComponents(cardEntity, state.THREAT)) {
        result += threat.data.modifier;
    }

    return result;
}

function calculatePriority(
    sessionId: string,
    tauntMultiplier: number,
    character: state.Entity,
    defenseCard: state.Component<'action card'> | null,
): number {
    let priority = chance.floating({
        min: 0,
        max: 0.1,
    });

    const position = state.getComponent(character, 'position');

    if (position) {
        const positionCard = state.getComponentByRef(sessionId, position.data.currentCardRef);
        const positionEntity = state.getEntityByRef<never>(sessionId, positionCard.data.defendRef);

        priority = addCardPriority(tauntMultiplier, priority, positionEntity);
    }

    if (defenseCard) {
        const defenseEntity = state.getEntityByRef<never>(sessionId, defenseCard.data.defendRef);

        priority = addCardPriority(tauntMultiplier, priority, defenseEntity);
    }

    return priority;
}

function calculateRage(sessionId: string, attackCard: state.Component<'action card'>): number {
    const attackEntity = state.getEntityByRef<never>(sessionId, attackCard.data.attackRef);
    let rage = 1;

    for (const rageComponent of state.getComponents(attackEntity, state.RAGE)) {
        rage *= rageComponent.data.tauntMultiplier;
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
    attackCard: state.Component<'action card'>,
    defenseCard: state.Component<'action card'> | null,
): state.Entity & state.WithComponent<'character status' | 'health'> {
    const characters = state.getEntitiesWithComponents(sessionId, 'character status', 'health');

    if (characters.length === 0) {
        throw new Error('No potential targets found.');
    }

    const tauntMultiplier = calculateRage(sessionId, attackCard);
    const priorities: Map<state.Entity, number> = new Map();
    let owner: string | null | undefined = null;
    if (defenseCard) {
        owner = state.getComponent(
            state.getEntityByComponent(sessionId, defenseCard),
            state.CARD_OWNER,
        )?.data.owner.id;
    }

    for (const character of characters) {
        const priority = owner === character.id
            ? calculatePriority(sessionId, tauntMultiplier, character, defenseCard)
            : calculatePriority(sessionId, tauntMultiplier, character, null);

        priorities.set(
            character,
            priority,
        );
    }

    const target = characters.sort(sortByPriority(priorities))[0];

    return target;
}
