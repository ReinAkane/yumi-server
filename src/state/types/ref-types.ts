import { UnionType } from './component-types';


export type ComponentRef<T extends UnionType = UnionType> = {
    id: string;
    type: T;
};

export type ComponentRefType<T extends ComponentRef> = T extends {type: infer U} ? U : never;

export type EntityRef = {
    readonly id: string;
    readonly withComponents: {
        readonly[T in UnionType]?: true;
    }
};

export type RefWithComponent<T extends UnionType> = {
    readonly withComponents: {
        readonly[U in T]: true;
    }
};
