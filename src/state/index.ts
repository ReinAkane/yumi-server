import * as repository from './repository';
import {
    Component,
    Entity,
    WithComponent,
    ComponentDataType,
    ComponentData,
    ComponentRef,
    ComponentRefType,
    ComponentType,
    UnionType,
    EntityRef,
    ALL_TYPES,
    RefWithComponent,
} from './types';

// state is the module that holds active session state such as in progress combat

export function openSession(accountId: string): string {
    return repository.createSession(accountId);
}

export function createEntity<
    C1 extends ComponentData,
    C2 extends ComponentData,
    C3 extends ComponentData,
>(
    sessionId: string,
    component1: C1,
    component2: C2,
    component3: C3,
    ...components: ComponentData[]
): Entity & WithComponent<ComponentDataType<C1> | ComponentDataType<C2> | ComponentDataType<C3>>;
export function createEntity<
    C1 extends ComponentData,
    C2 extends ComponentData,
>(
    sessionId: string,
    component1: C1,
    component2: C2,
    ...components: ComponentData[]
): Entity & WithComponent<ComponentDataType<C1> | ComponentDataType<C2>>;
export function createEntity<C1 extends ComponentData>(
    sessionId: string,
    component1: C1,
    ...components: ComponentData[]
): Entity & WithComponent<ComponentDataType<C1>>;
export function createEntity(
    sessionId: string,
    ...components: readonly ComponentData[]
): Entity;
export function createEntity(
    sessionId: string,
    ...components: readonly ComponentData[]
): Entity {
    const id = repository.createEntity(sessionId);

    for (const component of components) {
        repository.addComponent(sessionId, id, component);
    }

    return repository.getEntity(sessionId, id);
}

export function addComponent<T extends UnionType, E extends Entity>(
    sessionId: string,
    entity: E,
    component: ComponentData<T>,
): E & WithComponent<T> {
    repository.addComponent(sessionId, entity.id, component);

    return repository.getEntity(sessionId, entity.id) as E & WithComponent<T>;
}

export function addComponents<
    E extends Entity,
    C1 extends ComponentData,
    C2 extends ComponentData,
    C3 extends ComponentData
>(
    sessionId: string,
    entity: E,
    component1: C1,
    component2: C2,
    component3: C3,
    ...components: readonly ComponentData[]
): E & WithComponent<ComponentDataType<C1> | ComponentDataType<C2> | ComponentDataType<C3>>;
export function addComponents<
    E extends Entity,
    C1 extends ComponentData,
    C2 extends ComponentData,
>(
    sessionId: string,
    entity: E,
    component1: C1,
    component2: C2,
    ...components: readonly ComponentData[]
): E & WithComponent<ComponentDataType<C1> | ComponentDataType<C2>>;
export function addComponents<
    E extends Entity,
    C1 extends ComponentData,
>(
    sessionId: string,
    entity: E,
    component1: C1,
    ...components: readonly ComponentData[]
): E & WithComponent<ComponentDataType<C1>>;
export function addComponents<E extends Entity>(
    sessionId: string,
    entity: E,
    ...components: readonly ComponentData[]
): E {
    return components.reduce(
        (result, component) => addComponent(sessionId, result, component),
        entity,
    );
}

export function hasComponentOfType(sessionId: string, type: UnionType): boolean {
    return repository.hasComponentOfType(sessionId, type);
}

export function getAccountForSession(sessionId: string): string {
    return repository.getAccountForSession(sessionId);
}

export function updateComponent<T extends UnionType>(
    component: Component<T>,
    data: Partial<ComponentData<T>>,
): Component<T> {
    return repository.updateComponent(component, data);
}

export function getEntitiesWithComponents<T1 extends UnionType>(
    sessionId: string,
    type1: T1
): (Entity & WithComponent<T1>)[];
export function getEntitiesWithComponents<
    T1 extends UnionType,
    T2 extends UnionType
>(
    sessionId: string,
    type1: T1,
    type2: T2
): (Entity & WithComponent<T1 | T2>)[];
export function getEntitiesWithComponents(
    sessionId: string,
    ...types: UnionType[]
): Entity[];
export function getEntitiesWithComponents(
    sessionId: string,
    ...types: UnionType[]
): Entity[] {
    return repository.getEntitiesWithComponents(sessionId, types);
}

export function getEntityWithComponents<T1 extends UnionType>(
    sessionId: string,
    type1: T1,
): (Entity & WithComponent<T1>) | null;
export function getEntityWithComponents<
    T1 extends UnionType,
    T2 extends UnionType
>(
    sessionId: string,
    type1: T1,
    type2: T2
): (Entity & WithComponent<T1 | T2>) | null;
export function getEntityWithComponents<
    T1 extends UnionType,
    T2 extends UnionType,
    T3 extends UnionType
>(
    sessionId: string,
    type1: T1,
    type2: T2,
    type3: T3
): (Entity & WithComponent<T1 | T2 | T3>) | null;
export function getEntityWithComponents(
    sessionId: string,
    ...types: UnionType[]
): Entity | null;
export function getEntityWithComponents(
    sessionId: string,
    ...types: UnionType[]
): Entity | null {
    return getEntitiesWithComponents(sessionId, ...types)[0] || null;
}

export function getComponents<T extends UnionType>(
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

export function getComponent<T extends UnionType>(
    entity: Entity & WithComponent<T>,
    type: T,
): Component<T>;
export function getComponent<T extends UnionType>(
    entity: Entity,
    type: T,
): Component<T> | null;
export function getComponent<T extends UnionType>(
    entity: Entity,
    type: T,
): Component<T> | null {
    return getComponents(entity, type)[0] || null;
}

export function getComponentByRef<T extends ComponentRef>(
    sessionId: string,
    ref: T,
): Component<ComponentRefType<T>> {
    const component = repository.getComponent(sessionId, ref.id);

    if (component.data.type !== ref.type) {
        throw new Error('Component ref type is corrupted.');
    }

    return component;
}

export function getComponentRef<T extends Component>(component: T): ComponentRef<ComponentType<T>> {
    return {
        id: component.id,
        type: component.data.type as ComponentType<T>,
    };
}

export function getEntityByRef<T extends UnionType = never>(
    sessionId: string,
    ref: EntityRef & RefWithComponent<T>,
): (Entity & WithComponent<T>) {
    const entity = repository.getEntity(sessionId, ref.id);

    for (const type of ALL_TYPES) {
        if (ref.withComponents[type] && getComponent(entity, type) === null) {
            throw new Error('Entity ref has become corrupted.');
        }
    }

    return entity as Entity & WithComponent<T>;
}

export function getEntityRef<T1 extends UnionType, T2 extends UnionType>(
    entity: Entity & WithComponent<T1 | T2>,
    type1: T1,
    type2: T2
): EntityRef & RefWithComponent<T1 | T2>;
export function getEntityRef<T1 extends UnionType>(
    entity: Entity & WithComponent<T1>,
    type1: T1
): EntityRef & RefWithComponent<T1>;
export function getEntityRef(
    entity: Entity
): EntityRef;
export function getEntityRef(
    entity: Entity,
    ...types: readonly UnionType[]
): EntityRef {
    const withComponents: {[T in UnionType]?: true} = {};

    for (const type of types) {
        if (getComponent(entity, type) === null) {
            throw new Error('Cannot make ref of entity missing one of the requested types.');
        }

        withComponents[type] = true;
    }

    return {
        id: entity.id,
        withComponents,
    };
}

export function getEntityByComponent<T extends Component>(
    sessionId: string,
    component: T,
): Entity & WithComponent<ComponentType<T>> {
    return repository.getEntityByComponent(
        sessionId,
        component.id,
    ) as Entity & WithComponent<ComponentType<T>>;
}

export * from './types';
