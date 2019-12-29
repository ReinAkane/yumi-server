import * as database from '../database';
import * as state from '../state';

export function openSession(accountId: string): string {
    if (!database.accountExists(accountId)) {
        throw new Error('Account does not exist.');
    }

    return state.openSession(accountId);
}
