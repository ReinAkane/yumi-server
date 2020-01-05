import * as gamedata from '../gamedata';
import * as state from '../state';
import * as prefabs from '../state/prefabs';
import { chance } from '../chance';
import { log } from '../log';

type PositionCardDeck = readonly [
    readonly state.ComponentRef<'position card'>[],
    readonly state.ComponentRef<'position card'>[],
    readonly state.ComponentRef<'position card'>[],
];

function getRandomCardFromArray<T>(array: readonly T[]): T {
    return array[chance.natural({ max: array.length - 1 })];
}

function getRandomCardFromStage(
    allCardIds: PositionCardDeck,
    stage: 0 | 1 | 2,
): state.ComponentRef<'position card'> {
    return getRandomCardFromArray(allCardIds[stage]);
}

function* getAllCardsMatchingTags(
    sessionId: string,
    allCardRefs: PositionCardDeck,
    stage: 0 | 1 | 2,
    tags: Set<state.PositionCardTag>,
): Iterable<state.ComponentRef<'position card'>> {
    const cache = [...tags];

    for (const ref of allCardRefs[stage]) {
        const component = state.getComponentByRef(sessionId, ref);
        const cardTags = new Set(component.data.tags);

        if (cache.every((tag) => cardTags.has(tag))) {
            yield ref;
        }
    }
}

export function createPosition(
    sessionId: string,
    characterDataId: string,
): state.ComponentData<'position'> {
    const allCardRefs: [
        state.ComponentRef<'position card'>[],
        state.ComponentRef<'position card'>[],
        state.ComponentRef<'position card'>[],
    ] = [[], [], []];
    const characterData = gamedata.getCharacter(characterDataId);

    for (let i = 0; i < allCardRefs.length; i += 1) {
        for (const cardDataId of characterData.positionCards[i]) {
            const card = prefabs.instantiate(
                sessionId,
                gamedata.getPositionCard(cardDataId).prefab,
            );

            allCardRefs[i].push(state.getComponentRef(state.getComponent(card, 'position card')));
        }
    }

    return {
        type: 'position',
        stage: 0,
        allCardRefs,
        turnsInStage: 0,
        currentCardRef: getRandomCardFromStage(allCardRefs, 0),
        nextCardTags: [],
    };
}

function advancePosition(sessionId: string, entity: state.Entity & state.WithComponent<'position'>): void {
    let position = state.getComponent(entity, 'position');
    const { stage, turnsInStage } = position.data;

    if (stage < 2) {
        if (turnsInStage >= stage) {
            position = state.updateComponent(
                position,
                {
                    turnsInStage: 0,
                    stage: stage + 1 as 1 | 2,
                },
            );
        } else {
            position = state.updateComponent(
                position,
                {
                    turnsInStage: turnsInStage + 1,
                },
            );
        }
    }

    const nextTags = position.data.nextCardTags[0] || new Set();
    if (position.data.nextCardTags[0]) {
        log(`Moving to position with tags ${[...nextTags].join(', ')}`);
    }
    const possibleNextCards = [...getAllCardsMatchingTags(
        sessionId,
        position.data.allCardRefs,
        position.data.stage,
        nextTags,
    )];
    if (possibleNextCards.length === 0) {
        log('No cards matching tags found!');
    }
    const nextCard: state.ComponentRef<'position card'> = possibleNextCards.length === 0
        ? getRandomCardFromStage(position.data.allCardRefs, position.data.stage)
        : getRandomCardFromArray(possibleNextCards);

    state.updateComponent(
        position,
        {
            currentCardRef: nextCard,
            nextCardTags: position.data.nextCardTags.slice(1),
        },
    );
}

export function advancePositions(sessionId: string): void {
    for (const entity of state.getEntitiesWithComponents(sessionId, 'position')) {
        advancePosition(sessionId, entity);
    }
}

export function enqueueNextPosition(
    sessionId: string,
    entity: state.Entity,
    tags: Set<state.PositionCardTag>,
): void {
    const position = state.getFreshComponent(sessionId, entity, state.POSITION);

    if (position) {
        state.updateComponent(position, {
            nextCardTags: [...position.data.nextCardTags, tags],
        });
    } else {
        log('No position found when trying to move.');
    }
}
