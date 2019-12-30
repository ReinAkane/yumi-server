import * as gamedata from '../gamedata';
import * as state from '../state';

export function createCard(
    sessionId: string,
    cardDataId: string,
): state.Entity & state.WithComponent<'action card'> {
    const cardData = gamedata.getActionCard(cardDataId);
    const attack = state.createEntity(
        sessionId,
        ...cardData.attackPrefab,
    );
    const defend = state.createEntity(
        sessionId,
        ...cardData.defendPrefab,
    );

    return state.createEntity(
        sessionId,
        {
            type: 'action card',
            attackRef: state.getEntityRef(attack),
            defendRef: state.getEntityRef(defend),
            dataId: cardDataId,
        },
    );
}
