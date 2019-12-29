import v4 from 'uuid/v4';
import { Entity, Component } from './types';
import { UnionType } from './components';

export type NewComponent = Omit<Component, 'id'>;

type StoredEntity = {
    id: string;
    components: Component[]
};

type StoredSession = {
    id: string;
    accountId: string;
    entities: Map<string, StoredEntity>;
    cached: {
        byComponentType: Map<UnionType, Set<string>>
    }
};

const database = new Map<string, StoredSession>();
const accountToSession = new Map<string, string>();

function getExistingSession(sessionId: string): StoredSession {
    const session = database.get(sessionId);

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

    database.set(id, {
        id,
        accountId,
        entities: new Map(),
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
        components: [],
    };

    getExistingSession(sessionId).entities.set(id, entity);

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

export function addComponent(
    sessionId: string,
    entityId: string,
    newComponent: NewComponent,
): void {
    const entity = getExistingSession(sessionId).entities.get(entityId);

    if (!entity) {
        throw new Error('No such entity in session.');
    }

    const id = v4();

    const component = {
        id,
        ...newComponent,
    };

    entity.components.push(component);
    getComponentTypeCache(sessionId, component.type).add(entityId);
}

export function getEntity(sessionId: string, entityId: string): Entity {
    const entity = getExistingSession(sessionId).entities.get(entityId);

    if (!entity) {
        throw new Error('No such entity in session.');
    }

    return entity;
}

export function hasComponentOfType(sessionId: string, type: UnionType): boolean {
    const cache = getComponentTypeCache(sessionId, type);

    return cache.size > 0;
}

export function getAccountForSession(sessionId: string): string {
    return getExistingSession(sessionId).accountId;
}
