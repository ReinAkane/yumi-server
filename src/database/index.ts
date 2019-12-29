// the database module exists to access the long term dynamic data, such as accounts and characters
import * as repository from './repository';

export function createAccount(
    characterIds: readonly string[],
    demonIds: readonly string[],
): string {
    const accountId = repository.createAccount();

    for (const characterId of characterIds) {
        repository.addCharacter(accountId, characterId);
    }

    for (const demonId of demonIds) {
        repository.addDemon(accountId, demonId);
    }

    return accountId;
}

export function accountExists(accountId: string): boolean {
    return repository.accountExists(accountId);
}

export function hasCharacters(accountId: string, characterDataIds: readonly string[]): boolean {
    for (const dataId of characterDataIds) {
        if (!repository.hasCharacter(accountId, dataId)) {
            return false;
        }
    }

    return true;
}
