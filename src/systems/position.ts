import * as gamedata from '../gamedata';
import * as state from '../state';
import * as cards from './cards';
import { chance } from '../chance';

function getRandomCardFromStage(
    allCardIds: readonly [
        readonly state.ComponentRef<'action card'>[],
        readonly state.ComponentRef<'action card'>[],
        readonly state.ComponentRef<'action card'>[],
    ],
    stage: 0 | 1 | 2,
): state.ComponentRef<'action card'> {
    return allCardIds[stage][chance.natural({ max: allCardIds[stage].length - 1 })];
}

export function createPosition(
    sessionId: string,
    characterDataId: string,
): state.Entity & state.WithComponent<'position'> {
    const allCardRefs: [
        state.ComponentRef<'action card'>[],
        state.ComponentRef<'action card'>[],
        state.ComponentRef<'action card'>[],
    ] = [[], [], []];
    const characterData = gamedata.getCharacter(characterDataId);

    for (let i = 0; i < allCardRefs.length; i += 1) {
        for (const cardDataId of characterData.positionCards[i]) {
            const card = cards.createCard(sessionId, cardDataId);

            allCardRefs[i].push(state.getComponentRef(state.getComponent(card, 'action card')));
        }
    }

    return state.createEntity(
        sessionId,
        {
            type: 'position',
            stage: 0,
            allCardRefs,
            turnsInStage: 0,
            currentCardRef: getRandomCardFromStage(allCardRefs, 0),
        },
    );
}

export function advancePosition(entity: state.Entity & state.WithComponent<'position'>): void {
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

    state.updateComponent(
        position,
        {
            currentCardRef: getRandomCardFromStage(position.data.allCardRefs, position.data.stage),
        },
    );
}
