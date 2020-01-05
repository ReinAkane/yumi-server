import { expect } from 'chai';
import * as componentTypes from '../../../../src/state/types/component-types';

describe('Component types', () => {
    it('Scenario: file imported', () => {
        // then
        const nonTypeExports = new Set(['ALL_TYPES']);
        const actualTypes = Object.keys(componentTypes)
            .filter((key) => !nonTypeExports.has(key));

        for (const type of actualTypes) {
            expect(componentTypes.ALL_TYPES).to.include((componentTypes as any)[type]);
        }

        expect(componentTypes.ALL_TYPES.length, 'no extra types').to.equal(actualTypes.length);
    });
});
