export function mapFromObject<T>(input: {[key: string]: T}): Map<string, T & {id: string}> {
    const result = new Map<string, T & {id: string}>();

    for (const id of Object.keys(input)) {
        result.set(id, { ...input[id], id });
    }

    return result;
}
