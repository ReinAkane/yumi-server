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

    for (const cardRef of state.getComponent(playerHand, 'hand').data.cardRefs) {
        const card = state.getComponentByRef(sessionId, cardRef);
        const cardData = gamedata.getActionCard(card.data.dataId);
        const ownerText = displayOwner(state.getEntityByComponent(sessionId, card));

        console.log(` - ${ownerText}${cardData.name}`);
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

async function play() {
    let input;

    do {
        render();
        input = await getInput(); // eslint-disable-line no-await-in-loop
    } while (input !== 'q');

    inter.close();
}

play();
