import { expect } from 'chai';
import proxyquire from 'proxyquire';
import Chance from 'chance';

describe('Randomizer', () => {
    it('Scenario: File loaded', () => {
        // when
        const { chance } = proxyquire('../../src/chance', {});

        // then
        expect(chance instanceof Chance, 'should export a chance instance').to.equal(true);
    });
});
