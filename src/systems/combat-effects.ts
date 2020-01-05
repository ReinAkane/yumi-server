import {
    Entity,
    WithComponent,
    Component,
    ATTACKER,
    COMBAT_EFFECT,
    HEALTH,
    POSITION,
    getEntityByRef,
    getComponent,
    getComponentByRef,
} from '../state';

export function* eachRelevantEffect(
    sessionId: string,
    participants: {
        attacker?: Entity & WithComponent<typeof ATTACKER>,
        attackCard?: Component<typeof COMBAT_EFFECT>,
        defender?: Entity & WithComponent<typeof HEALTH>,
        defendCard?: Component<typeof COMBAT_EFFECT>,
    },
): Generator<Entity> {
    const {
        attacker,
        attackCard,
        defender,
        defendCard,
    } = participants;

    if (undefined !== attacker) {
        const position = getComponent(attacker, POSITION);

        if (position !== null) {
            const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
            const positionEffect = getComponentByRef(sessionId, positionCard.data.effectRef);

            yield getEntityByRef<never>(sessionId, positionEffect.data.attackRef);
            yield getEntityByRef<never>(sessionId, positionEffect.data.universalRef);
        }
    }

    if (undefined !== defender) {
        const position = getComponent(defender, POSITION);

        if (position !== null) {
            const positionCard = getComponentByRef(sessionId, position.data.currentCardRef);
            const positionEffect = getComponentByRef(sessionId, positionCard.data.effectRef);

            yield getEntityByRef<never>(sessionId, positionEffect.data.defendRef);
            yield getEntityByRef<never>(sessionId, positionEffect.data.universalRef);
        }
    }

    if (undefined !== attackCard) {
        yield getEntityByRef<never>(sessionId, attackCard.data.attackRef);
        yield getEntityByRef<never>(sessionId, attackCard.data.universalRef);
    }

    if (undefined !== defendCard) {
        yield getEntityByRef<never>(sessionId, defendCard.data.defendRef);
        yield getEntityByRef<never>(sessionId, defendCard.data.universalRef);
    }
}
