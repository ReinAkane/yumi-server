import * as componentTypes from './components';
import * as repository from './repository';

// state is the module that holds active session state such as in progress combat

export function openSession(accountId: string): string {
    return repository.createSession(accountId);
}

export function createEntity(sessionId: string, components: repository.NewComponent[]): string {
    const id = repository.createEntity(sessionId);

    for (const component of components) {
        repository.addComponent(sessionId, id, component);
    }

    return id;
}

export function hasComponentOfType(sessionId: string, type: componentTypes.UnionType): boolean {
    return repository.hasComponentOfType(sessionId, type);
}

export {
    componentTypes as components,
};
