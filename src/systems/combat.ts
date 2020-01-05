import * as state from '../state';
import * as database from '../database';
import * as gamedata from '../gamedata';
import * as prefabs from '../state/prefabs';
import * as decks from './decks';
import * as position from './position';
import * as attack from './attack';
import * as cards from './cards';
import * as targetting from './targetting';
import * as buffs from './buffs';
import * as ownership from './ownership';

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
            pendingEnemyAttack: null,
        },
    );

    const enemyCardRefs: state.ComponentRef<'action card'>[] = [];

    for (const cardDataId of enemyData.actionCards) {
        enemyCardRefs.push(state.getComponentRef(
            state.getComponent(cards.createCard(sessionId, cardDataId), 'action card'),
        ));
    }

    const enemy = state.createEntity(
        sessionId,
        {
            type: 'enemy status',
            dataId: enemyId,
        },
        {
            type: 'health',
            hp: enemyData.maxHp,
            baseArmor: enemyData.baseArmor,
        },
        {
            type: 'attacker',
            baseDamage: enemyData.baseDamage,
        },
        decks.createDeck(enemyCardRefs),
    );

    ownership.applySelfOwnership(sessionId, enemy);

    const playerActionCardRefs: state.ComponentRef<'action card'>[] = [];

    for (const characterId of characterIds) {
        const characterData = gamedata.getCharacter(characterId);
        const characterEntity = state.addComponents(
            sessionId,
            prefabs.instantiate(sessionId, characterData.prefab),
            position.createPosition(
                sessionId,
                characterId,
            ),
        );

        ownership.applySelfOwnership(sessionId, characterEntity);

        for (const cardDataId of characterData.actionCards) {
            const cardEntity = cards.createCard(sessionId, cardDataId);

            ownership.applyCardOwnership(sessionId, characterEntity, cardEntity);

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

function killCharacter(sessionId: string, character: state.Entity): void {
    const player = state.getEntityWithComponents(sessionId, 'player status', 'action deck', 'hand');
    if (player === null) {
        throw new Error('Combat corrupted.');
    }

    // remove health component
    // remove attacker component
    // remove position component
    state.removeComponents(
        sessionId,
        character,
        state.getComponent(character, 'health'),
        state.getComponent(character, 'attacker'),
        state.getComponent(character, 'position'),
    );

    // discard all cards from that character
    for (const cardRef of state.getComponent(player, state.HAND).data.cardRefs) {
        const card = state.getComponentByRef(sessionId, cardRef);
        const owner = state.getComponent(
            state.getEntityByComponent(
                sessionId,
                card,
            ),
            state.CARD_OWNER,
        );

        if (owner && owner.data.owner.id === character.id) {
            decks.discard(
                state.getComponent(player, state.HAND),
                state.getComponent(player, state.ACTION_DECK),
                card,
            );
        }
    }

    // remove all cards from that character from the deck
    for (const cardRef of state.getComponent(player, state.ACTION_DECK).data.cardRefs) {
        const card = state.getComponentByRef(sessionId, cardRef);
        const owner = state.getComponent(
            state.getEntityByComponent(
                sessionId,
                card,
            ),
            state.CARD_OWNER,
        );

        if (owner && owner.data.owner.id === character.id) {
            decks.remove(
                state.getComponent(player, state.ACTION_DECK),
                cardRef,
            );
        }
    }
}

function endTurn(sessionId: string): void {
    const combatStatus = state.getEntityWithComponents(sessionId, 'combat status');
    if (combatStatus === null) {
        throw new Error('Cannot end turn when not in combat.');
    }

    for (const character of state.getEntitiesWithComponents(sessionId, 'character status', 'health')) {
        if (state.getComponent(character, 'health').data.hp <= 0) {
            killCharacter(sessionId, character);
        }
    }

    const enemy = state.getEntityWithComponents(sessionId, 'enemy status', 'health');

    if (enemy === null) {
        throw new Error('No enemy found.');
    }

    if (state.getEntitiesWithComponents(sessionId, 'character status', 'health').length === 0) {
        state.updateComponent(state.getComponent(combatStatus, state.COMBAT_STATUS), {
            state: 'defeat',
        });
    } else if (state.getComponent(enemy, state.HEALTH).data.hp <= 0) {
        state.updateComponent(state.getComponent(combatStatus, state.COMBAT_STATUS), {
            state: 'victory',
        });
    } else {
        // run movement system
        position.advancePositions(sessionId);

        // run buff system
        buffs.tickBuffs(sessionId);

        // wait for player action input
        state.updateComponent(
            state.getComponent(combatStatus, 'combat status'),
            {
                state: 'waiting for action',
                pendingEnemyAttack: null,
            },
        );
    }
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
    attack.run(
        sessionId,
        state.getEntityByRef<'health' | 'attacker'>(sessionId, owner.data.owner),
        enemy,
        attackCardEntity,
        defenseCard,
    );

    // check for player victory
    // player wins
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

export function playerPrepare(sessionId: string, cardIds: string[]): string | null {
    // verify selected cards are valid
    for (const cardId of cardIds) {
        if (!isCardValid(sessionId, cardId)) {
            throw new Error('Card not in player\'s hand.');
        }
    }
    // discard all selected cards + draw that many + 2 new cards
    const player = state.getEntityWithComponents(sessionId, 'player status', 'hand', 'action deck');

    if (player === null) {
        throw new Error('Not in combat.');
    }
    const hand = state.getComponent(player, 'hand');
    const playerDeck = state.getComponent(player, 'action deck');

    for (const cardId of cardIds) {
        decks.discard(
            state.refreshComponent(sessionId, hand),
            state.refreshComponent(sessionId, playerDeck),
            state.getComponentByRef(sessionId, {
                id: cardId,
                type: 'action card',
            }),
        );
    }

    decks.draw(
        state.refreshComponent(sessionId, playerDeck),
        state.refreshComponent(sessionId, hand),
        cardIds.length + 2,
    );

    // select card for enemy to attack with
    const enemy = state.getEntityWithComponents(sessionId, 'enemy status', 'action deck');

    if (enemy === null) {
        throw new Error('Combat corrupted.');
    }
    const attackRef = decks.peek(state.getComponent(enemy, 'action deck'), 1)[0];

    if (attackRef) {
        // wait for defense input
        const combatStatus = state.getEntityWithComponents(sessionId, 'combat status');

        if (combatStatus === null) {
            throw new Error('Combat corrupted.');
        }

        state.updateComponent(state.getComponent(combatStatus, 'combat status'), {
            state: 'waiting for defense',
            pendingEnemyAttack: attackRef,
        });

        return attackRef.id;
    }

    endTurn(sessionId);
    return null;
}

export function playerDefend(sessionId: string, defendCardId: string | null): string {
    const combatStatus = state.getEntityWithComponents(sessionId, 'combat status');

    if (combatStatus === null) {
        throw new Error('Not in combat.');
    }

    const attackCardRef = state.getComponent(combatStatus, 'combat status').data.pendingEnemyAttack;

    if (attackCardRef === null) {
        throw new Error('No pending enemy attack.');
    }

    // verify selected card is valid
    let defenseCard = null;

    if (defendCardId !== null) {
        defenseCard = state.getComponentByRef(sessionId, {
            id: defendCardId,
            type: 'action card',
        });
    }

    // run targetting system
    const attackCard = state.getComponentByRef(sessionId, attackCardRef);
    const target = targetting.selectTarget(sessionId, attackCard, defenseCard);

    // run damage system
    let defenseEntity: state.Entity & state.WithComponent<'action card'> | undefined;
    if (defenseCard) {
        defenseEntity = state.getEntityByComponent(sessionId, defenseCard);
    }

    const enemy = state.getEntityWithComponents(sessionId, 'enemy status', 'attacker');

    if (enemy === null) {
        throw new Error('Combat corrupted');
    }

    attack.run(
        sessionId,
        enemy,
        target,
        state.getEntityByComponent(sessionId, attackCard),
        defenseEntity,
    );

    // check for player defeat
    // check each player character with HP
    // run other related systems
    // discard selected card (if card selected)
    if (defenseCard) {
        const player = state.getEntityWithComponents(sessionId, 'player status', 'hand', 'action deck');

        if (player === null) {
            throw new Error('Combat corrupted.');
        }

        decks.discard(state.getComponent(player, 'hand'), state.getComponent(player, 'action deck'), defenseCard);
    }

    // end turn
    endTurn(sessionId);

    return state.getComponent(target, 'character status').id;
}
