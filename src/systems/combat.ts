import * as state from '../state';
import * as database from '../database';
import * as gamedata from '../gamedata';
import * as decks from './decks';

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

    return state.getComponent(playerHand, 'hand').data.cardIds.includes(cardId);
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

    state.addComponents(
        sessionId,
        decks.createDeck(
            sessionId,
            enemyData.actionCards,
        ),
        {
            type: 'enemy status',
            dataId: enemyId,
        },
        {
            type: 'health',
            hp: enemyData.maxHp,
        },
    );

    const playerActionCards: string[] = [];

    for (const characterId of characterIds) {
        const characterData = gamedata.getCharacter(characterId);
        state.createEntity(
            sessionId,
            {
                type: 'character status',
                dataId: characterId,
            },
            {
                type: 'health',
                hp: characterData.maxHp,
            },
            {
                type: 'position',
                stage: 0,
                allCardIds: characterData.positionCards,
            },
        );
        playerActionCards.push(...characterData.actionCards);
    }

    const player = state.addComponents(
        sessionId,
        decks.createDeck(sessionId, []),
        {
            type: 'player status',
        },
        {
            type: 'hand',
            cardIds: [],
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

export function playerAttack(sessionId: string, cardId: string): void {
    // verify selected card is valid
    if (!isCardValid(sessionId, cardId)) {
        throw new Error('Card not in player\'s hand.');
    }
    // select card for enemy defense
    const enemyDeck = state.getEntitiesWithComponents(sessionId, 'enemy status', 'action deck');

    if (enemyDeck.length !== 1) {
        throw new Error('Combat corrupted.');
    }

    decks.peek(enemyDeck[0].components['action deck'][0], 1);

    // run damage system
    // check for player victory
    // run other related systems
    // discard selected card

    // end turn
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

export function endTurn() {
    // run movement system
    // wait for player action input
}
