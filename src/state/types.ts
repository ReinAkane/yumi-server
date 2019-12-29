import {
    UnionType, ComponentData,
} from './components';

export type Component<T extends UnionType = UnionType> = {
    id: string,
    data: ComponentData<T>
};

export type Entity = {
    readonly id: string;
    readonly components: {
        readonly [T in UnionType]?: readonly Component<T>[];
    }
};

export type WithComponent<T extends UnionType> = {
    readonly components: {
        readonly [U in T]: readonly Component<U>[]
    }
};

export type SessionState = {
    accountId: string;
    sessionId: string;
};
