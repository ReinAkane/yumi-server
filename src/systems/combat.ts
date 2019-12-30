import * as state from '../state';
import * as database from '../database';
import * as gamedata from '../gamedata';
import * as decks from './decks';
import * as position from './position';
import * as damage from './damage';
import * as cards from './cards';

// the combat system is the overarching system to handle any session in combat
export function inCombat(sessionId: string): boolean {
    if (state.hasComponentOfType(sessionId, 'combat status')) {
        return true;
    }
    return false;
}

export function pendingInput(): null | string {
    return null;
}

export function isCardValid(sessionId: string, cardId: string): boolean {
    const playerHand = state.getEntityWithComponents(sessionId, 'hand', 'player status');

    if (playerHand === null) {
        throw new Error('Not in combat.');
    }

    const hand = state.getComponent(playerHand, 'hand').data.cardRefs;

    for (const cardRef of hand) {
        const card = state.getComponentByRef(sessionId, cardRef);

        if (card.id === cardId) {
            return true;
        }
    }

    return false;
}

export function beginCombat(
    sessionId: string,
    characterIds: readonly string[],
    enemyId: string,
): void {
    // verify not in combat
    if (inCombat(sessionId)) {
        throw new Error('Already in combat.');
    }
    // verify team is valid
    const accountId = state.getAccountForSession(sessionId);
    if (!database.hasCharacters(accountId, characterIds)) {
        throw new Error('Invalid characters selected for combat.');
    }
    // verify enemy is valid
    const enemyData = gamedata.getEnemy(enemyId);
    // create status entities
    const combatStatus = state.createEntity(
        sessionId,
        {
            type: 'combat status',
            state: 'setting up',
        },
    );

    const enemyCardRefs: state.ComponentRef<'action card'>[] = [];

    for (const cardDataId of enemyData.actionCards) {
        enemyCardRefs.push(state.getComponentRef(
            state.getComponent(cards.createCard(sessionId, cardDataId), 'action card'),
        ));
    }

    state.createEntity(
        sessionId,
        {
            type: 'enemy status',
            dataId: enemyId,
        },
        {
            type: 'health',
            hp: enemyData.maxHp,
        },
        {
            type: 'attacker',
            baseDamage: enemyData.baseDamage,
        },
        decks.createDeck(enemyCardRefs),
    );

    const playerActionCardRefs: state.ComponentRef<'action card'>[] = [];

    for (const characterId of characterIds) {
        const characterData = gamedata.getCharacter(characterId);
        const characterEntity = state.addComponents(
            sessionId,
            position.createPosition(
                sessionId,
                characterId,
            ),
            {
                type: 'character status',
                dataId: characterId,
            },
            {
                type: 'health',
                hp: characterData.maxHp,
            },
            {
                type: 'attacker',
                baseDamage: 1,
            },
        );

        for (const cardDataId of characterData.actionCards) {
            let cardEntity = cards.createCard(sessionId, cardDataId);

            cardEntity = state.addComponent(
                sessionId,
                cardEntity,
                {
                    type: state.CARD_OWNER,
                    owner: state.getEntityRef(characterEntity, 'health', 'attacker'),
                },
            );

            playerActionCardRefs.push(state.getComponentRef(
                state.getComponent(cardEntity, 'action card'),
            ));
        }
    }

    const player = state.createEntity(
        sessionId,
        decks.createDeck(playerActionCardRefs),
        {
            type: 'player status',
        },
        {
            type: 'hand',
            cardRefs: [],
        },
    );

    // draw starting hand
    decks.draw(
        state.getComponent(player, 'action deck'),
        state.getComponent(player, 'hand'),
        1,
    );
    // wait for player action input
    state.updateComponent(
        state.getComponent(combatStatus, 'combat status'),
        {
            state: 'waiting for action',
        },
    );
}

export function abortCombat(): boolean {
    // ???
    return false;
}

function endTurn(sessionId: string): void {
    // run movement system
    for (const character of state.getEntitiesWithComponents(sessionId, 'position')) {
        position.advancePosition(character);
    }

    // wait for player action input
    const combatStatus = state.getEntityWithComponents(sessionId, 'combat status');
    if (combatStatus === null) {
        throw new Error('Cannot end turn when not in combat.');
    }

    state.updateComponent(
        state.getComponent(combatStatus, 'combat status'),
        {
            state: 'waiting for action',
        },
    );
}

export function playerAttack(sessionId: string, cardId: string): string | null {
    // verify state
    const combatStatus = state.getEntityWithComponents(sessionId, 'combat status');
    if (combatStatus === null || state.getComponent(combatStatus, 'combat status').data.state !== 'waiting for action') {
        throw new Error('Cannot start player attack.');
    }

    // verify selected card is valid
    const card = state.getComponentByRef(
        sessionId,
        {
            id: cardId,
            type: 'action card',
        },
    );
    const attackCardEntity = state.getEntityByComponent(sessionId, card);
    const owner = state.getComponent(attackCardEntity, state.CARD_OWNER);

    if (owner === null) {
        throw new Error('Not a player card.');
    }

    if (!isCardValid(sessionId, cardId)) {
        throw new Error('Card not in player\'s hand.');
    }

    // select card for enemy defense
    const enemy = state.getEntityWithComponents(sessionId, 'enemy status', 'action deck', 'health');

    if (enemy === null) {
        throw new Error('Combat corrupted.');
    }

    const defenseCardRef = decks.peek(state.getComponent(enemy, 'action deck'), 1)[0];
    const defenseCard = defenseCardRef
        ? state.getEntityByComponent(sessionId, state.getComponentByRef(sessionId, defenseCardRef))
        : undefined;

    // run damage system
    const remainingHp = damage.run(
        sessionId,
        state.getEntityByRef<'health' | 'attacker'>(sessionId, owner.data.owner),
        enemy,
        attackCardEntity,
        defenseCard,
    );

    // check for player victory
    if (remainingHp <= 0) {
        // player wins
    }
    // run other related systems
    // discard selected card
    const player = state.getEntityWithComponents(sessionId, 'hand', 'player status', 'action deck');

    if (player === null) {
        throw new Error('Not in combat.');
    }

    decks.discard(
        state.getComponent(player, 'hand'),
        state.getComponent(player, 'action deck'),
        card,
    );

    // end turn
    endTurn(sessionId);

    if (defenseCardRef) {
        return defenseCardRef.id;
    }
    return null;
}

export function playerPrepare() {
    // verify selected cards are valid
    // discard all selected cards + draw that many + 2 new cards
    // select card for enemy to attack with
    // wait for defense input
}

export function playerDefend() {
    // verify selected card is valid
    // run targetting system
    // run damage system
    // check for player defeat
    // run other related systems
    // discard selected card (if card selected)

    // end turn
}
