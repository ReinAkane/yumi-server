import { Union } from './components';

export type Component = Readonly<Union & {id: string}>;

export type Entity = {
    readonly id: string;
    readonly components: Iterable<Component>;
};

export type SessionState = {
    accountId: string;
    sessionId: string;
};
