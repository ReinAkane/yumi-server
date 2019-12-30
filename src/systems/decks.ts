import * as state from '../state';
import * as gamedata from '../gamedata';
import { chance } from '../chance';

export function createDeck(sessionId: string, cardDataIds: readonly string[]): state.Entity & state.WithComponent<'action deck'> {
    const cardIds: string[] = [];

    for (const cardDataId of cardDataIds) {
        const cardData = gamedata.getActionCard(cardDataId);
        const card = state.createEntity(
            sessionId,
            {
                type: 'action card',
            },
            ...cardData.prefab,
        );

        cardIds.push(card.id);
    }

    return state.createEntity(
        sessionId,
        {
            type: 'action deck',
            cardIds,
        },
    );
}

export function draw(from: state.Component<'action deck'>, to: state.Component<'hand'>, numCards: number): void {
    const remainingCards = [...from.data.cardIds];
    const drawnCards: string[] = [...to.data.cardIds];

    for (let i = 0; i < numCards; i += 1) {
        if (remainingCards.length === 0) {
            break;
        }

        const index = chance.natural({
            max: remainingCards.length - 1,
        });

        drawnCards.push(remainingCards.splice(index, 1)[0]);
    }

    state.updateComponent(to, {
        cardIds: drawnCards,
    });
    state.updateComponent(from, {
        cardIds: remainingCards,
    });
}

export function peek(from: state.Component<'action deck'>, numCards: number): string[] {
    const remainingCards = [...from.data.cardIds];
    const peeked: string[] = [];

    for (let i = 0; i < numCards; i += 1) {
        if (remainingCards.length === 0) {
            break;
        }

        const index = chance.natural({
            max: remainingCards.length - 1,
        });

        peeked.push(remainingCards.splice(index, 1)[0]);
    }

    return peeked;
}
