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
    if (entity.components.health) {
        return ` - ${entity.components.health[0].data.hp} HP`;
    }

    return '';
}

function displayPosition(entity: state.Entity): string {
    if (entity.components.position) {
    }

    return '';
}

function render() {
    rl.cursorTo(process.stdout, 0, 0);
    rl.clearScreenDown(process.stdout);

    const enemyEntity = state.getEntitiesWithComponents(sessionId, 'enemy status')[0];
    const enemy = enemyEntity.components['enemy status'][0].data;
    const enemyName = gamedata.getEnemy(enemy.dataId).name;

    console.log(`Fighting "${enemyName}"${displayHp(enemyEntity)}`);

    const characters = state.getEntitiesWithComponents(sessionId, 'character status');

    console.log('\nParty:');

    for (const character of characters) {
        const characterName = gamedata.getCharacter(character.components['character status'][0].data.dataId).name;

        console.log(` - ${characterName}${displayHp(character)}${displayPosition(character)}`);
    }

    console.log('\n\nHand:');

    const playerHand = state.getEntitiesWithComponents(sessionId, 'player status', 'hand')[0];

    for (const cardId of playerHand.components.hand[0].data.cardIds) {
        const card = gamedata.getActionCard(cardId);

        console.log(` - ${card.name}`);
    }
}

function getInput(): Promise<string> {
    const combatStatus = state.getEntitiesWithComponents(sessionId, 'combat status')[0].components['combat status'][0];
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
