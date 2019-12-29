import * as state from '../state';

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

export function beginCombat(sessionId: string): void {
    // verify not in combat
    if (inCombat(sessionId)) {
        throw new Error('Already in combat.');
    }
    // verify team is valid
    // verify enemy is valid
    // create status entities
    const combatStatusComponent: state.components.CombatStatus = {
        type: 'combat status',
    };
    state.createEntity(sessionId, [combatStatusComponent]);
    // create player, enemy, and position decks
    // draw starting hand
    // wait for player action input
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
