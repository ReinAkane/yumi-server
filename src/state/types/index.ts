import { ComponentData } from './components';
import { UnionType } from './component-types';

export * from './component-types';
export * from './components';
export * from './ref-types';

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

export type ComponentDataType<T extends ComponentData> = T extends {type: infer U} ?
    U : never;

export type ComponentType<T extends Component> = T extends {data: {type: infer U}} ?
    U : never;

export type SessionState = {
    accountId: string;
    sessionId: string;
};
