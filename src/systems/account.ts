import * as gameData from '../gamedata';
import * as database from '../database';

export function createAccount(): string {
    return database.createAccount(
        gameData.getStarterCharacterIds(),
        gameData.getStarterDemonIds(),
    );
}
