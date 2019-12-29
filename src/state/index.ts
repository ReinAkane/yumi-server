import * as componentTypes from './components';
import * as repository from './repository';
import { Component, Entity, WithComponent } from './types';

// state is the module that holds active session state such as in progress combat

export function openSession(accountId: string): string {
    return repository.createSession(accountId);
}

export function createEntity(
    sessionId: string,
    components: readonly componentTypes.ComponentData[],
): Entity {
    const id = repository.createEntity(sessionId);

    for (const component of components) {
        repository.addComponent(sessionId, id, component);
    }

    return repository.getEntity(sessionId, id);
}

export function addComponent<T extends componentTypes.UnionType, E extends Entity>(
    sessionId: string,
    entity: E,
    component: componentTypes.ComponentData<T>,
): E & WithComponent<T> {
    repository.addComponent(sessionId, entity.id, component);

    return repository.getEntity(sessionId, entity.id) as E & WithComponent<T>;
}

export function hasComponentOfType(sessionId: string, type: componentTypes.UnionType): boolean {
    return repository.hasComponentOfType(sessionId, type);
}

export function getAccountForSession(sessionId: string): string {
    return repository.getAccountForSession(sessionId);
}

export function updateComponent<T extends componentTypes.UnionType>(
    component: Component<T>,
    data: Partial<componentTypes.ComponentData<T>>,
): Component<T> {
    return repository.updateComponent(component, data);
}

export {
    componentTypes as components,
};

export * from './types';
