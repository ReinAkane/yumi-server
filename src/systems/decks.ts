import * as state from '../state';
import { chance } from '../chance';


export function createDeck(
    cardRefs: readonly state.ComponentRef<'action card'>[],
): state.ActionDeck {
    return {
        type: 'action deck',
        cardRefs,
    };
}

export function draw(from: state.Component<'action deck'>, to: state.Component<'hand'>, numCards: number): void {
    const remainingCards = [...from.data.cardRefs];
    const drawnCards = [...to.data.cardRefs];

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
        cardRefs: drawnCards,
    });
    state.updateComponent(from, {
        cardRefs: remainingCards,
    });
}

export function peek(from: state.Component<'action deck'>, numCards: number): state.ComponentRef<'action card'>[] {
    const remainingCards = [...from.data.cardRefs];
    const peeked: state.ComponentRef<'action card'>[] = [];

    for (let i = 0; i < numCards; i += 1) {
        if (remainingCards.length === 0) {
            break;
        }

        const index = chance.natural({
            max: remainingCards.length - 1,
        });

        peeked.push(...remainingCards.splice(index, 1));
    }

    return peeked;
}

export function discard(from: state.Component<'hand'>, to: state.Component<'action deck'>, card: state.Component<'action card'>): void {
    const remainingCards = from.data.cardRefs.filter((ref) => ref.id !== card.id);

    state.updateComponent(from, {
        cardRefs: remainingCards,
    });

    const deckCards = [...to.data.cardRefs, state.getComponentRef(card)];

    state.updateComponent(to, {
        cardRefs: deckCards,
    });
}

export function remove(from: state.Component<'action deck'>, ...cardRefs: state.ComponentRef<'action card'>[]): void {
    const ids = new Set(cardRefs.map((ref) => ref.id));
    const remainingCards = from.data.cardRefs.filter(({ id }) => !ids.has(id));

    state.updateComponent(from, {
        cardRefs: remainingCards,
    });
}
