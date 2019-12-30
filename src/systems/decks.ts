import * as state from '../state';
import { chance } from '../chance';

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