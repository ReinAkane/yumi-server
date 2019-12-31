import { expect } from 'chai';
import { chance } from '../helpers';
import * as state from '../../../src/state';

describe('Entities and Components entry', () => {
    it('Scenario: No session open', () => {
        // given
        const sessionId = chance.guid();

        // then
        expect(() => state.createEntity(sessionId)).to.throw();
        expect(() => state.hasComponentOfType(sessionId, 'health')).to.throw();
        expect(() => state.getAccountForSession(sessionId)).to.throw();
        expect(() => state.getEntitiesWithComponents(sessionId, 'health')).to.throw();
        expect(() => state.getEntityWithComponents(sessionId, 'health')).to.throw();
        expect(() => state.getComponentByRef(sessionId, { id: chance.guid(), type: 'health' })).to.throw();
        expect(
            () => state.getEntityByRef(sessionId, { id: chance.guid(), withComponents: {} }),
        ).to.throw();
    });

    it('Scenario: Session opened', () => {
        // given
        const accountId = chance.guid();

        // when
        const sessionId = state.openSession(accountId);

        // then
        expect(state.hasComponentOfType(sessionId, 'health')).to.equal(false);
        expect(state.getAccountForSession(sessionId)).to.equal(accountId);
        expect(state.getEntitiesWithComponents(sessionId, 'health')).to.deep.equal([]);
        expect(state.getEntityWithComponents(sessionId, 'health')).to.equal(null);
        expect(() => state.getComponentByRef(sessionId, { id: chance.guid(), type: 'health' })).to.throw();
        expect(
            () => state.getEntityByRef(sessionId, { id: chance.guid(), withComponents: {} }),
        ).to.throw();
    });

    it('Scenario: Entity created', () => {
        // given
        const accountId = chance.guid();
        const component: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);

        // when
        const entity = state.createEntity(sessionId, component);

        // then
        expect(state.hasComponentOfType(sessionId, 'health')).to.equal(true);
        expect(state.hasComponentOfType(sessionId, 'hand')).to.equal(false);

        expect(state.getEntitiesWithComponents(sessionId, 'health')).to.deep.equal([entity]);
        expect(state.getEntityWithComponents(sessionId, 'health')).to.deep.equal(entity);
        expect(state.getEntitiesWithComponents(sessionId, 'hand')).to.deep.equal([]);
        expect(state.getEntityWithComponents(sessionId, 'hand')).to.equal(null);

        expect(state.getComponent(entity, 'health')?.data).to.deep.equal(component);
        expect(state.getComponents(entity, 'health')).to.deep.equal([
            state.getComponent(entity, 'health'),
        ]);
        expect(state.getComponent(entity, 'hand')).to.equal(null);
        expect(state.getComponents(entity, 'hand')).to.deep.equal([]);

        expect(
            state.getEntityByComponent(sessionId, state.getComponent(entity, 'health')),
        ).to.deep.equal(entity);
    });

    it('Scenario: Components added', () => {
        // given
        const accountId = chance.guid();
        const component: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);
        const baseEntity = state.createEntity(sessionId);

        // when
        const entity = state.addComponents(sessionId, baseEntity, component);

        // then
        expect(state.hasComponentOfType(sessionId, 'health')).to.equal(true);
        expect(state.hasComponentOfType(sessionId, 'hand')).to.equal(false);

        expect(state.getEntitiesWithComponents(sessionId, 'health')).to.deep.equal([entity]);
        expect(state.getEntityWithComponents(sessionId, 'health')).to.deep.equal(entity);
        expect(state.getEntitiesWithComponents(sessionId, 'hand')).to.deep.equal([]);
        expect(state.getEntityWithComponents(sessionId, 'hand')).to.equal(null);

        expect(state.getComponent(entity, 'health')?.data).to.deep.equal(component);
        expect(state.getComponents(entity, 'health')).to.deep.equal([
            state.getComponent(entity, 'health'),
        ]);
        expect(state.getComponent(entity, 'hand')).to.equal(null);
        expect(state.getComponents(entity, 'hand')).to.deep.equal([]);

        expect(
            state.getEntityByComponent(sessionId, state.getComponent(entity, 'health')),
        ).to.deep.equal(entity);
    });

    it('Scenario: Get component by ref', () => {
        // given
        const accountId = chance.guid();
        const component: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);
        const entity = state.createEntity(sessionId, component);

        // when
        const ref = state.getComponentRef(state.getComponent(entity, 'health'));

        // then
        expect(state.getComponentByRef(sessionId, ref)).to.deep.equal(state.getComponent(entity, 'health'));
    });

    it('Scenario: Get component by bad ref', () => {
        // given
        const accountId = chance.guid();
        const component: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);
        const entity = state.createEntity(sessionId, component);

        // when
        const ref: state.ComponentRef<'hand'> = {
            id: state.getComponent(entity, 'health').id,
            type: 'hand',
        };

        // then
        expect(() => state.getComponentByRef(sessionId, ref)).to.throw();
    });

    it('Scenario: Get entity by ref', () => {
        // given
        const accountId = chance.guid();
        const component: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);
        const entity = state.createEntity(sessionId, component);

        // when
        const ref = state.getEntityRef(entity);

        // then
        expect(state.getEntityByRef<never>(sessionId, ref)).to.deep.equal(entity);
    });

    it('Scenario: Get entity by bad ref', () => {
        // given
        const accountId = chance.guid();
        const component: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);
        const entity = state.createEntity(sessionId, component);

        // when
        const ref: state.EntityRef = {
            id: entity.id,
            withComponents: {
                hand: true,
            },
        };

        // then
        expect(() => state.getEntityByRef<never>(sessionId, ref)).to.throw();
    });

    it('Scenario: Get bad ref', () => {
        // given
        const accountId = chance.guid();
        const component: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);
        const entity = state.createEntity(sessionId, component);

        // when
        const getRef = () => state.getEntityRef(entity as any, 'hand');

        // then
        expect(getRef).to.throw();
    });

    it('Scenario: update component', () => {
        // given
        const accountId = chance.guid();
        const componentData: state.ComponentData = { type: 'health', hp: chance.d4(), baseArmor: chance.d4() };
        const componentUpdate = { hp: chance.d4(), baseArmor: chance.d4() };
        const sessionId = state.openSession(accountId);
        const entity = state.createEntity(sessionId, componentData);
        const component = state.getComponent(entity, 'health');

        // when
        const result = state.updateComponent(component, componentUpdate);

        // then
        expect(result.data).to.deep.equal({
            ...componentData,
            ...componentUpdate,
        });
        expect(state.refreshComponent(sessionId, component).data).to.deep.equal({
            ...componentData,
            ...componentUpdate,
        });
    });
});
