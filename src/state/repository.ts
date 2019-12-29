import v4 from 'uuid/v4';
import {
    Entity, Component, WithComponent,
} from './types';
import { ComponentData, UnionType } from './components';


type StoredComponent<T extends UnionType = UnionType> = {
    entityId: string;
    id: string;
    data: ComponentData<T>
};

type StoredEntity = {
    id: string;
    componentIds: Set<string>;
};

type StoredSession = {
    id: string;
    accountId: string;
    entityIds: Set<string>;
    componentIds: Set<string>;
    cached: {
        byComponentType: Map<UnionType, Set<string>>
    }
};

const sessions = new Map<string, StoredSession>();
const entities = new Map<string, StoredEntity>();
const components = new Map<string, StoredComponent>();
const accountToSession = new Map<string, string>();

function getExistingComponent(componentId: string): StoredComponent {
    const component = components.get(componentId);

    if (undefined === component) {
        throw new Error('No such component found.');
    }

    return component;
}

function getExistingSession(sessionId: string): StoredSession {
    const session = sessions.get(sessionId);

    if (undefined === session) {
        throw new Error('No such session found.');
    }

    return session;
}

export function createSession(accountId: string): string {
    if (accountToSession.has(accountId)) {
        throw new Error('Account already has an active session.');
    }

    const id = v4();

    accountToSession.set(accountId, id);

    sessions.set(id, {
        id,
        accountId,
        entityIds: new Set(),
        componentIds: new Set(),
        cached: {
            byComponentType: new Map(),
        },
    });

    return id;
}

export function createEntity(sessionId: string): string {
    const id = v4();

    const entity: StoredEntity = {
        id,
        componentIds: new Set(),
    };

    entities.set(id, entity);
    getExistingSession(sessionId).entityIds.add(id);

    return id;
}

function getComponentTypeCache(sessionId: string, type: UnionType): Set<string> {
    const cache = getExistingSession(sessionId).cached.byComponentType;
    const cached = cache.get(type);

    if (cached) {
        return cached;
    }

    const newCached = new Set<string>();

    cache.set(type, newCached);

    return newCached;
}

function getExistingEntity(sessionId: string, entityId: string): StoredEntity {
    if (!getExistingSession(sessionId).entityIds.has(entityId)) {
        throw new Error('No such entity in session.');
    }
    const entity = entities.get(entityId);

    if (!entity) {
        throw new Error('Entity missing.');
    }

    return entity;
}

function mapComponent<T extends UnionType>(input: StoredComponent<T>): Component<T> {
    return {
        id: input.id,
        data: input.data,
    };
}

function mapEntity(input: StoredEntity): Entity {
    let resultComponents: {
        [T in UnionType]?: Component<T>[]
    } = {};

    for (const componentId of input.componentIds) {
        const component = getExistingComponent(componentId);
        const list: Component<typeof component.data.type>[] | undefined = resultComponents[
            component.data.type
        ];

        if (undefined === list) {
            const newList: Component<typeof component.data.type>[] = [mapComponent(component)];

            resultComponents = {
                ...resultComponents,
                [component.data.type]: newList,
            };
        } else {
            list.push(mapComponent(component));
        }
    }

    const result: Entity = {
        id: input.id,
        components: resultComponents,
    };

    return result;
}

export function getEntity(sessionId: string, entityId: string): Entity {
    const stored = getExistingEntity(sessionId, entityId);

    return mapEntity(stored);
}

export function addComponent<T extends UnionType>(
    sessionId: string,
    entityId: string,
    newComponent: ComponentData<T>,
): void {
    const componentId = v4();
    const component: StoredComponent<T> = {
        data: newComponent,
        id: componentId,
        entityId,
    };
    components.set(componentId, component);
    getExistingSession(sessionId).componentIds.add(componentId);
    getExistingEntity(sessionId, entityId).componentIds.add(componentId);
    getComponentTypeCache(sessionId, newComponent.type).add(entityId);
}

export function hasComponentOfType(sessionId: string, type: UnionType): boolean {
    const cache = getComponentTypeCache(sessionId, type);

    return cache.size > 0;
}

export function getAccountForSession(sessionId: string): string {
    return getExistingSession(sessionId).accountId;
}

export function updateComponent<T extends UnionType>(
    component: Component<T>,
    data: Partial<ComponentData<T>>,
): Component<T> {
    const storedComponent = getExistingComponent(component.id);

    Object.assign(storedComponent.data, data);

    return mapComponent(storedComponent);
}

export function getEntitiesWithComponents(
    sessionId: string,
    types: UnionType[],
): Entity[] {
    const session = getExistingSession(sessionId);
    const result: Entity[] = [];

    for (const entityId of session.entityIds) {
        const entity = getExistingEntity(sessionId, entityId);
        const componentTypesOnEntity = new Set();

        for (const componentId of entity.componentIds) {
            const component = getExistingComponent(componentId);

            componentTypesOnEntity.add(component.data.type);
        }

        if (types.every((type) => componentTypesOnEntity.has(type))) {
            result.push(mapEntity(entity));
        }
    }

    return result;
}
