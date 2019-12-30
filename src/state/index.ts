import * as componentTypes from './components';
import * as repository from './repository';
import {
    Component, Entity, WithComponent, ComponentDataType,
} from './types';

// state is the module that holds active session state such as in progress combat

export function openSession(accountId: string): string {
    return repository.createSession(accountId);
}

export function createEntity<
    C1 extends componentTypes.ComponentData,
    C2 extends componentTypes.ComponentData,
    C3 extends componentTypes.ComponentData,
>(
    sessionId: string,
    component1: C1,
    component2: C2,
    component3: C3,
    ...components: componentTypes.ComponentData[]
): Entity & WithComponent<ComponentDataType<C1> | ComponentDataType<C2> | ComponentDataType<C3>>;
export function createEntity<
    C1 extends componentTypes.ComponentData,
    C2 extends componentTypes.ComponentData,
>(
    sessionId: string,
    component1: C1,
    component2: C2,
    ...components: componentTypes.ComponentData[]
): Entity & WithComponent<ComponentDataType<C1> | ComponentDataType<C2>>;
export function createEntity<C1 extends componentTypes.ComponentData>(
    sessionId: string,
    component1: C1,
    ...components: componentTypes.ComponentData[]
): Entity & WithComponent<ComponentDataType<C1>>;
export function createEntity(
    sessionId: string,
    ...components: readonly componentTypes.ComponentData[]
): Entity;
export function createEntity(
    sessionId: string,
    ...components: readonly componentTypes.ComponentData[]
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

export function addComponents<
    E extends Entity,
    C1 extends componentTypes.ComponentData,
    C2 extends componentTypes.ComponentData,
>(
    sessionId: string,
    entity: E,
    component1: C1,
    component2: C2,
    ...components: readonly componentTypes.ComponentData[]
): E & WithComponent<ComponentDataType<C1> | ComponentDataType<C2>>;
export function addComponents<
    E extends Entity,
    C1 extends componentTypes.ComponentData,
>(
    sessionId: string,
    entity: E,
    component1: C1,
    ...components: readonly componentTypes.ComponentData[]
): E & WithComponent<ComponentDataType<C1>>;
export function addComponents<E extends Entity>(
    sessionId: string,
    entity: E,
    ...components: readonly componentTypes.ComponentData[]
): E {
    return components.reduce(
        (result, component) => addComponent(sessionId, result, component),
        entity,
    );
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

export function getEntitiesWithComponents<T1 extends componentTypes.UnionType>(
    sessionId: string,
    type1: T1
): (Entity & WithComponent<T1>)[];
export function getEntitiesWithComponents<
    T1 extends componentTypes.UnionType,
    T2 extends componentTypes.UnionType
>(
    sessionId: string,
    type1: T1,
    type2: T2
): (Entity & WithComponent<T1 | T2>)[];
export function getEntitiesWithComponents(
    sessionId: string,
    ...types: componentTypes.UnionType[]
): Entity[];
export function getEntitiesWithComponents(
    sessionId: string,
    ...types: componentTypes.UnionType[]
): Entity[] {
    return repository.getEntitiesWithComponents(sessionId, types);
}

export function getEntityWithComponents<T1 extends componentTypes.UnionType>(
    sessionId: string,
    type1: T1,
): (Entity & WithComponent<T1>) | null;
export function getEntityWithComponents<
    T1 extends componentTypes.UnionType,
    T2 extends componentTypes.UnionType
>(
    sessionId: string,
    type1: T1,
    type2: T2
): (Entity & WithComponent<T1 | T2>) | null;
export function getEntityWithComponents(
    sessionId: string,
    ...types: componentTypes.UnionType[]
): Entity | null {
    return getEntitiesWithComponents(sessionId, ...types)[0] || null;
}

export function getComponents<T extends componentTypes.UnionType>(
    entity: Entity,
    type: T,
): readonly Component<T>[] {
    const componentList: readonly Component<T>[] | undefined = (
        entity.components[type] as readonly Component<T>[] | undefined
    );

    if (componentList === undefined) {
        return [];
    }

    return componentList;
}

export function getComponent<T extends componentTypes.UnionType>(
    entity: Entity & WithComponent<T>,
    type: T,
): Component<T>;
export function getComponent<T extends componentTypes.UnionType>(
    entity: Entity,
    type: T,
): Component<T> | null;
export function getComponent<T extends componentTypes.UnionType>(
    entity: Entity,
    type: T,
): Component<T> | null {
    return getComponents(entity, type)[0] || null;
}

export {
    componentTypes as components,
};

export * from './types';
