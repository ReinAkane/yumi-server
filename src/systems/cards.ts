import * as gamedata from '../gamedata';
import * as state from '../state';
import * as prefabs from '../state/prefabs';

export function createCard(
    sessionId: string,
    cardDataId: string,
): state.Entity & state.WithComponent<'action card'> {
    const cardData = gamedata.getActionCard(cardDataId);

    return prefabs.instantiate(sessionId, cardData.prefab);
}
