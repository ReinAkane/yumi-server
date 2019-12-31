import v4 from 'uuid/v4';

type StoredCharacter = {
    readonly dataId: string;
    lives: number;
};

type StoredDemon = {
    readonly dataId: string;
    lives: number;
};

type StoredAccount = {
    readonly id: string;
    characters: Map<string, StoredCharacter>;
    demons: Map<string, StoredDemon>;
};

const accounts = new Map<string, StoredAccount>();

export function createAccount(): string {
    const id = v4();

    accounts.set(id, {
        id,
        characters: new Map(),
        demons: new Map(),
    });

    return id;
}

function getExistingAccount(accountId: string): StoredAccount {
    const account = accounts.get(accountId);

    if (undefined === account) {
        throw new Error('No such account.');
    }

    return account;
}

export function addCharacter(accountId: string, dataId: string): number {
    const account = getExistingAccount(accountId);
    const character = account.characters.get(dataId);

    if (undefined !== character) {
        character.lives += 1;
        return character.lives;
    }
    account.characters.set(dataId, {
        dataId,
        lives: 1,
    });

    return 1;
}

export function addDemon(accountId: string, dataId: string): number {
    const account = getExistingAccount(accountId);
    const demon = account.demons.get(dataId);

    if (undefined !== demon) {
        demon.lives += 1;
        return demon.lives;
    }
    account.demons.set(dataId, {
        dataId,
        lives: 1,
    });

    return 1;
}

export function accountExists(accountId: string): boolean {
    return accounts.has(accountId);
}

export function hasCharacter(accountId: string, characterDataId: string): boolean {
    return getExistingAccount(accountId).characters.has(characterDataId);
}

export function hasDemon(accountId: string, demonDataId: string): boolean {
    return getExistingAccount(accountId).demons.has(demonDataId);
}

export function reset(): void {
    accounts.clear();
}
