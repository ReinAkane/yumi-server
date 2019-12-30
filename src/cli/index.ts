import * as rl from 'readline';
import * as state from '../state';
import * as gamedata from '../gamedata';
import * as combat from '../systems/combat';
import * as account from '../systems/account';
import * as session from '../systems/session';

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

        return ` currently ${gamedata.getActionCard(currentCard.data.dataId).positionDescription}`;
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

function render() {
    rl.cursorTo(process.stdout, 0, 0);
    rl.clearScreenDown(process.stdout);

    for (let i = 0; i < 3; i += 1) {
        const logMessage = actionLog[actionLog.length - 1 - i] || '';

        console.log(logMessage);
    }

    console.log('\n');

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
        const card = state.getComponentByRef(sessionId, cardRefs[i]);
        const cardData = gamedata.getActionCard(card.data.dataId);
        const ownerText = displayOwner(state.getEntityByComponent(sessionId, card));

        console.log(` (${i}) - ${ownerText}${cardData.name}`);
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
            inter.setPrompt('What do you want to do? > ');
            break;
        case 'waiting for defense':
            inter.setPrompt('What do you want to defend with? > ');
            break;
        default:
            inter.setPrompt('Something went wrong... > ');
            break;
    }

    inter.prompt(true);

    return nextLine;
}

function handleInput(input: string): boolean {
    const clean = input.toLowerCase();
    console.log(`Command: "${clean}"`);
    if (clean.startsWith('attack ')) {
        const cardIndex = Number(clean.split(' ').pop());
        const hand = state.getEntityWithComponents(sessionId, 'hand', 'player status');
        if (hand === null) {
            throw new Error('No player hand found.');
        }

        const ref = state.getComponent(hand, 'hand').data.cardRefs[cardIndex];
        if (!ref) {
            console.log(`No card at index ${cardIndex}. Try again.`);
            return false;
        }

        const defenderCard = combat.playerAttack(sessionId, ref.id);

        if (defenderCard === null) {
            actionLog.push('Enemy took the hit!');
        } else {
            const defenderCardName = gamedata.getActionCard(state.getComponentByRef(
                sessionId,
                {
                    id: defenderCard,
                    type: 'action card',
                },
            ).data.dataId).name;

            actionLog.push(`Enemy defended with ${defenderCardName}.`);
        }

        return true;
    }

    console.log('Unknown command. Try again.');
    return false;
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
