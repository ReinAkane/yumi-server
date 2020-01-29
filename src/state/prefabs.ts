import cloneDeep from 'clone-deep';
import {
    Entity, EntityRef, ALL_TYPES, Component, ComponentRef, UnionType, WithComponent, Prefab,
} from './types';
import * as state from '.';

const ALL_TYPES_CACHE: Set<string> = new Set(ALL_TYPES);

function isObject(item: unknown): item is {[key: string]: unknown} {
    return item instanceof Object;
}

function isEntityRef(item: unknown): item is EntityRef {
    return isObject(item) && 'id' in item && 'withComponents' in item && typeof item.id === 'string'
    && isObject(item.withComponents) && Object.keys(item.withComponents).every(
        (key) => ALL_TYPES_CACHE.has(key) && (item[key] === undefined || item[key] === true),
    );
}

function isComponentRef(item: unknown): item is ComponentRef {
    return isObject(item) && 'id' in item && 'type' in item && typeof item.id === 'string'
        && typeof item.type === 'string' && ALL_TYPES_CACHE.has(item.type);
}

function* eachRef<T extends ComponentRef | EntityRef>(
    isRef: (item: unknown) => item is T,
    item: unknown,
): Generator<T> {
    if (isObject(item)) {
        if (isRef(item)) {
            yield item;
        } else {
            for (const value of Object.values(item)) {
                yield* eachRef(isRef, value);
            }
        }
    }
}

function* eachComponent(entity: Omit<Entity, 'id'>): Generator<Component> {
    for (const type of ALL_TYPES) {
        for (const component of state.getComponents(entity, type)) {
            yield component;
        }
    }
}

export function instantiate<T extends UnionType = never>(
    sessionId: string,
    prefab: Prefab<T>,
): Entity & WithComponent<T> {
    const idsCache = new Set(Object.keys(prefab));
    const prefabIdToEntity: {[id: string]: Entity} = {};

    for (const id of idsCache) {
        prefabIdToEntity[id] = state.createEntity(sessionId);
    }

    const prefabComponents: {[id: string]: Component} = {};
    const componentIdToEntity: {[id: string]: Entity} = {};
    const componentIdToEntityRefs: {[id: string]: EntityRef[]} = {};
    const componentIdToComponentRefs: {[id: string]: ComponentRef[]} = {};

    for (const entityId of idsCache) {
        for (const component of eachComponent(prefab[entityId])) {
            if (component.id in prefabComponents) {
                throw new Error(`Duplicate component ids in prefab. Component id: ${component.id}`);
            }

            prefabComponents[component.id] = component;
            componentIdToEntity[component.id] = prefabIdToEntity[entityId];
            componentIdToEntityRefs[component.id] = [...eachRef(isEntityRef, component)];
            componentIdToComponentRefs[component.id] = [...eachRef(isComponentRef, component)];
        }
    }

    const remainingComponentIds = new Set(Object.keys(prefabComponents));
    const prefabIdToComponent: {[id: string]: Component} = {};

    while (remainingComponentIds.size > 0) {
        const initialSize = remainingComponentIds.size;
        const toAttemptToCreate = [...remainingComponentIds];

        for (const componentId of toAttemptToCreate) {
            if (componentIdToComponentRefs[componentId].every(
                (ref) => !remainingComponentIds.has(ref.id),
            ) && componentIdToEntityRefs[componentId].every(
                (ref) => {
                    const requiredComponentTypes = Object.keys(ref.withComponents) as UnionType[];
                    return requiredComponentTypes.every(
                        (type) => state.getComponent(prefabIdToEntity[ref.id], type) !== null,
                    );
                },
            )) {
                const component = prefabComponents[componentId];
                const entity = componentIdToEntity[componentId];
                const existingComponentIds = new Set(
                    state.getComponents(entity, component.data.type).map((item) => item.id),
                );

                const newData = cloneDeep(component.data);

                for (const ref of eachRef(isEntityRef, newData)) {
                    Object.assign(
                        ref,
                        state.getEntityRef(
                            prefabIdToEntity[ref.id],
                            ...Object.keys(ref.withComponents) as UnionType[],
                        ),
                    );
                }

                for (const ref of eachRef(isComponentRef, newData)) {
                    const targetComponent = prefabIdToComponent[ref.id];

                    if (ref.type !== targetComponent.data.type) {
                        throw new Error(`Component ref type incorrect on component with id ${component.id} for ref with id ${ref.id}`);
                    }

                    Object.assign(
                        ref,
                        state.getComponentRef(targetComponent),
                    );
                }

                const updatedEntity = state.addComponents(sessionId, entity, newData);

                Object.assign(componentIdToEntity[componentId], updatedEntity);

                const newComponent = state.getComponents(updatedEntity, newData.type).find(
                    (item) => !existingComponentIds.has(item.id),
                );

                if (newComponent === undefined) {
                    throw new Error('Component creation failed.');
                }

                prefabIdToComponent[componentId] = newComponent;

                remainingComponentIds.delete(componentId);
            }
        }

        if (initialSize <= remainingComponentIds.size) {
            throw new Error(`Illegal refs in prefab. Problematic component ids: ${[...remainingComponentIds].join(', ')}`);
        }
    }

    return prefabIdToEntity.root as Entity & WithComponent<T>;
}
