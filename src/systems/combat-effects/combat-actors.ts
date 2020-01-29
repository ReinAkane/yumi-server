import { Entity, ActorTag } from '../../state';

export type CombatActors = {
    [T in ActorTag]?: Entity | undefined;
};
