import { expect } from 'chai';
import { chance } from '../helpers';
import * as database from '../../../src/database';

describe('Database entry', () => {
    it('Scenario: account does not exist', () => {
        // then
        expect(database.accountExists(chance.guid())).to.equal(false);
        expect(
            () => database.hasCharacters(chance.guid(), chance.n(chance.guid, chance.d4())),
        ).to.throw();
    });

    it('Scenario: account created', () => {
        // given
        const characterIds = chance.n(chance.guid, chance.d4() + 3);
        const demonIds = chance.n(chance.guid, chance.d4());

        // when
        const accountId = database.createAccount(characterIds, demonIds);

        // then
        expect(database.accountExists(accountId)).to.equal(true);
        expect(
            database.hasCharacters(accountId, chance.pickset(characterIds, chance.d4())),
        ).to.equal(true);
        expect(
            database.hasCharacters(
                accountId,
                chance.shuffle([...chance.pickset(characterIds, chance.d4()), chance.guid()]),
            ),
        ).to.equal(false);
    });
});
