import * as rl from 'readline';
import * as state from '../state';
import * as gamedata from '../gamedata';
import * as combat from '../systems/combat';
import * as account from '../systems/account';
import * as session from '../systems/session';
import { log } from '../log';

log('new game\n\n');

const accountId = account.createAccount();
const sessionId = session.openSession(accountId);

combat.beginCombat(sessionId, ['elf', 'jeanne', 'medusa'], 'jotun');

const inter = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ' > ',
});

const actionLog: string[] = [];

let resolveNextLine: (line: string) => void = () => {};
let nextLine: Promise<string> = new Promise((resolve) => {
    resolveNextLine = resolve;
});

inter.on('line', (line) => {
    resolveNextLine(line);
    nextLine = new Promise((resolve) => {
        resolveNextLine = resolve;
    });
});

function displayHp(entity: state.Entity): string {
    const health = state.getComponent(entity, 'health');
    if (health !== null) {
        return ` - ${health.data.hp} HP`;
    }

    return '';
}

function displayPosition(entity: state.Entity): string {
    const position = state.getComponent(entity, 'position');
    if (position !== null) {
        const currentCard = state.getComponentByRef(sessionId, position.data.currentCardRef);

        return ` currently ${gamedata.getPositionCard(currentCard.data.dataId).name}`;
        // nothing yet
    }

    return '';
}

function displayOwner(entity: state.Entity): string {
    const owner = state.getComponent(entity, state.CARD_OWNER);

    if (owner !== null) {
        const ownerEnt = state.getEntityByRef<never>(sessionId, owner.data.owner);

        const owningCharacter = state.getComponent(ownerEnt, state.CHARACTER_STATUS);
        if (owningCharacter !== null) {
            return `${gamedata.getCharacter(owningCharacter.data.dataId).name}: `;
        }
    }

    return '';
}

function displayCardName(cardRef: state.ComponentRef<'action card'>): string {
    const card = state.getComponentByRef(sessionId, cardRef);
    const cardData = gamedata.getActionCard(card.data.dataId);
    const ownerText = displayOwner(state.getEntityByComponent(sessionId, card));

    return `${ownerText}${cardData.name}`;
}

function render() {
    rl.cursorTo(process.stdout, 0, 0);
    rl.clearScreenDown(process.stdout);

    for (let i = 3; i >= 0; i -= 1) {
        const index = actionLog.length - 1 - i;
        const logMessage = actionLog[index];

        if (logMessage) {
            console.log(`${(`0${index + 1}`).slice(-2)}: ${logMessage}`);
        } else {
            console.log('');
        }
    }

    console.log('');

    const enemyEntity = state.getEntityWithComponents(sessionId, 'enemy status');

    if (enemyEntity === null) {
        throw new Error('Missing enemy, how did this happen?');
    }

    const enemyName = gamedata.getEnemy(state.getComponent(enemyEntity, 'enemy status').data.dataId).name;

    console.log(`Fighting "${enemyName}"${displayHp(enemyEntity)}`);

    const characters = state.getEntitiesWithComponents(sessionId, 'character status');

    console.log('\nParty:');

    for (const character of characters) {
        const characterName = gamedata.getCharacter(state.getComponent(character, 'character status').data.dataId).name;

        console.log(` - ${characterName}${displayHp(character)}${displayPosition(character)}`);
    }

    console.log('\n\nHand:');

    const playerHand = state.getEntityWithComponents(sessionId, 'player status', 'hand');

    if (playerHand === null) {
        throw new Error('Missing player hand, how did this happen?');
    }

    const { cardRefs } = state.getComponent(playerHand, 'hand').data;
    for (let i = 0; i < cardRefs.length; i += 1) {
        console.log(` (${i}) - ${displayCardName(cardRefs[i])}`);
    }
}

function getInput(): Promise<string> {
    const combatStatusEntity = state.getEntityWithComponents(sessionId, 'combat status');

    if (combatStatusEntity === null) {
        throw new Error('Missing combat status, how did this happen?');
    }

    const combatStatus = state.getComponent(combatStatusEntity, 'combat status');
    switch (combatStatus.data.state) {
        case 'setting up':
            inter.setPrompt('Still setting up... > ');
            break;
        case 'waiting for action':
            inter.setPrompt('What do you want to do?\n  (\n    "attack <card to attack with>" or \n    "prepare <card to discard, card to discard, card to discard...>"\n  ) > ');
            break;
        case 'waiting for defense':
            inter.setPrompt('What do you want to defend with?\n  ("none" or "defend <card to defend with>") > ');
            break;
        case 'defeat':
            inter.setPrompt('You lost! Enter "quit" to quit. > ');
            break;
        case 'victory':
            inter.setPrompt('You won! Enter "quit" to quit. > ');
            break;
        default:
            inter.setPrompt('Something went wrong... > ');
            break;
    }

    inter.prompt(true);

    return nextLine;
}

function getCardByIndex(input: number): state.ComponentRef<'action card'> | null {
    const hand = state.getEntityWithComponents(sessionId, 'hand', 'player status');
    if (hand === null) {
        throw new Error('No player hand found.');
    }

    const ref = state.getComponent(hand, 'hand').data.cardRefs[input];
    if (!ref) {
        console.log(`No card at index ${input}. Try again.`);
        return null;
    }
    return ref;
}

function handleAttackInput(input: string): boolean {
    const cardIndex = Number(input.split(' ').pop());
    const ref = getCardByIndex(cardIndex);

    if (ref === null) {
        return false;
    }

    const logStart = `Player attacked with "${displayCardName(ref)}" and the enemy`;
    const defenderCard = combat.playerAttack(sessionId, ref.id);

    if (defenderCard === null) {
        actionLog.push(`${logStart} took the hit!`);
    } else {
        const defenderRef: state.ComponentRef<'action card'> = {
            id: defenderCard,
            type: 'action card',
        };

        actionLog.push(`${logStart} defended with "${displayCardName(defenderRef)}".`);
    }

    return true;
}

function handleActionInput(input: string): boolean {
    const clean = input.toLowerCase();
    if (clean.startsWith('attack ')) {
        return handleAttackInput(input);
    }
    if (clean.startsWith('prepare')) {
        const cardsToDiscard = input.split(/,? /g).slice(1);
        actionLog.push(`Player took time to prepare, recycling ${cardsToDiscard.length} cards.`);
        const cardIdsToDiscard: string[] = [];

        for (const index of cardsToDiscard) {
            const cardRef = getCardByIndex(Number(index));

            if (cardRef === null) {
                return false;
            }

            cardIdsToDiscard.push(cardRef.id);
        }
        const enemyAttack = combat.playerPrepare(sessionId, cardIdsToDiscard);
        if (enemyAttack !== null) {
            const enemyAttackRef: state.ComponentRef<'action card'> = {
                id: enemyAttack,
                type: 'action card',
            };

            actionLog.push(`The enemy took this opportunity to attack with ${displayCardName(enemyAttackRef)}!`);
        }
        return true;
    }

    console.log('Unknown command. Try again.');
    return false;
}

function handleDefenseInput(input: string): boolean {
    const clean = input.toLowerCase();

    if (clean.startsWith('none')) {
        const defenderId = combat.playerDefend(sessionId, null);
        const defender = state.getComponentByRef(sessionId, {
            id: defenderId,
            type: 'character status',
        });
        actionLog.push(`${gamedata.getCharacter(defender.data.dataId).name} took the hit!`);

        return true;
    }
    if (clean.startsWith('defend ')) {
        const cardIndex = Number(input.split(' ').pop());
        const ref = getCardByIndex(cardIndex);

        if (ref === null) {
            return false;
        }

        const defenderId = combat.playerDefend(sessionId, ref.id);

        const owner = state.getComponent(
            state.getEntityByComponent(
                sessionId,
                state.getComponentByRef(sessionId, ref),
            ),
            state.CARD_OWNER,
        );

        let ownerId: string | null | undefined = null;

        if (owner) {
            ownerId = state.getComponent(
                state.getEntityByRef<never>(sessionId, owner.data.owner),
                'character status',
            )?.id;
        }

        const defender = state.getComponentByRef(sessionId, {
            id: defenderId,
            type: 'character status',
        });

        if (!ownerId || defenderId === ownerId) {
            actionLog.push(`${gamedata.getCharacter(defender.data.dataId).name} defended with ${displayCardName(ref)}.`);
        } else {
            actionLog.push(`${gamedata.getCharacter(defender.data.dataId).name} took the hit!`);
        }

        return true;
    }

    console.log('Unknown command. Try again.');
    return false;
}

function handleInput(input: string): boolean {
    const combatStatus = state.getEntityWithComponents(sessionId, 'combat status');

    if (combatStatus === null) {
        throw new Error('Combat corrupted.');
    }

    switch (state.getComponent(combatStatus, 'combat status').data.state) {
        case 'waiting for action': return handleActionInput(input);
        case 'waiting for defense': return handleDefenseInput(input);
        default: return true;
    }
}

async function play() {
    render();
    let input = await getInput(); // eslint-disable-line no-await-in-loop

    while (input !== 'q') {
        const success = handleInput(input);

        if (success) {
            render();
        }
        input = await getInput(); // eslint-disable-line no-await-in-loop
    }

    inter.close();
}

play();
