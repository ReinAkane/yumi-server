import { UnionType, Component, ComponentData } from '../../state/types';

export function createComponents<T extends UnionType>(
    ...items: Component<T>[]
): Component<T>[] {
    return items;
}

export function componentsToComponentMap(items: Component[] = []): {
    readonly [T in UnionType]?: readonly Component<T>[];
} {
    const result: {[T in UnionType]?: Component<T>[]} = {};

    for (const item of items) {
        const list = result[item.data.type];
        if (list === undefined) {
            result[item.data.type] = [item];
        } else {
            list.push(item);
        }
    }

    return result;
}

export function createComponentData<T extends UnionType>(
    ...items: ComponentData<T>[]
): ComponentData<T>[] {
    return items;
}


export function componentDataToComponentMap(items: ComponentData[] = []): {
    readonly [T in UnionType]?: readonly Component<T>[];
} {
    let nextId = 0;
    return componentsToComponentMap(items.map((data) => {
        nextId += 1;
        return {
            id: String(nextId),
            data,
        };
    }));
}
