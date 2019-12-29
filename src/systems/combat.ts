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

export function pendingInput(sessionId: string): null | string {
    return null;
}

export function isCardValid(sessionId: string): boolean {
    // verify card is in hand
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
    const combatStatus = state.addComponent(
        sessionId,
        state.createEntity(sessionId, []),
        {
            type: 'combat status',
            state: 'setting up',
        },
    );

    state.createEntity(sessionId, [
        {
            type: 'enemy status',
            dataId: enemyId,
        },
        {
            type: 'health',
            hp: enemyData.maxHp,
        },
        {
            type: 'action deck',
            cardIds: enemyData.actionCards,
        },
    ]);

    const playerActionCards: string[] = [];

    for (const characterId of characterIds) {
        const characterData = gamedata.getCharacter(characterId);
        state.createEntity(sessionId, [
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
        ]);
        playerActionCards.push(...characterData.actionCards);
    }

    const player = state.addComponent(
        sessionId,
        state.addComponent(
            sessionId,
            state.createEntity(sessionId, [
                {
                    type: 'player status',
                },
            ]),
            {
                type: 'action deck',
                cardIds: playerActionCards,
            },
        ),
        {
            type: 'hand',
            cardIds: [],
        },
    );
    // draw starting hand
    decks.draw(
        player.components['action deck'][0],
        player.components.hand[0],
        1,
    );
    // wait for player action input
    state.updateComponent(
        combatStatus.components['combat status'][0],
        {
            state: 'waiting for action',
        },
    );
}

export function abortCombat(sessionId: string): boolean {
    // ???
    return false;
}

export function playerAttack(sessionId: string) {
    // verify selected card is valid
    // select card for enemy defense
    // run damage system
    // check for player victory
    // run other related systems
    // discard selected card

    // end turn
}

export function playerPrepare(sessionId: string) {
    // verify selected cards are valid
    // discard all selected cards + draw that many + 2 new cards
    // select card for enemy to attack with
    // wait for defense input
}

export function playerDefend(sessionId: string) {
    // verify selected card is valid
    // run targetting system
    // run damage system
    // check for player defeat
    // run other related systems
    // discard selected card (if card selected)

    // end turn
}

function endTurn(sessionId: string) {
    // run movement system
    // wait for player action input
}
