import { expect } from 'chai';
import { chance } from '../helpers';
import * as repository from '../../../src/database/repository';

describe('User Database Repository', () => {
    it('Scenario: nothing created', () => {
        // then
        expect(repository.accountExists(chance.guid())).to.equal(false);
        expect(() => repository.addCharacter(chance.guid(), chance.guid())).to.throw();
        expect(() => repository.addDemon(chance.guid(), chance.guid())).to.throw();
        expect(() => repository.hasCharacter(chance.guid(), chance.guid())).to.throw();
        expect(() => repository.hasDemon(chance.guid(), chance.guid())).to.throw();
    });

    it('Scenario: account created', () => {
        // when
        const accountId = repository.createAccount();

        // then
        expect(repository.accountExists(accountId)).to.equal(true);
        expect(repository.hasCharacter(accountId, chance.guid())).to.equal(false);
        expect(repository.hasDemon(accountId, chance.guid())).to.equal(false);
    });

    it('Scenario: character added', () => {
        // given
        const accountId = repository.createAccount();
        const characterId = chance.guid();

        // when
        repository.addCharacter(accountId, characterId);

        // then
        expect(repository.hasCharacter(accountId, characterId)).to.equal(true);
        expect(repository.hasCharacter(accountId, chance.guid())).to.equal(false);
        expect(repository.hasDemon(accountId, chance.guid())).to.equal(false);
    });

    it('Scenario: demon added', () => {
        // given
        const accountId = repository.createAccount();
        const demonId = chance.guid();

        // when
        repository.addDemon(accountId, demonId);

        // then
        expect(repository.hasDemon(accountId, demonId)).to.equal(true);
        expect(repository.hasCharacter(accountId, chance.guid())).to.equal(false);
        expect(repository.hasDemon(accountId, chance.guid())).to.equal(false);
    });
});
