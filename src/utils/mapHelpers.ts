/**
 * Helper functions for immutable Map operations
 */

export function updateMapEntry<K, V>(
    map: Map<K, V>,
    key: K,
    value: V
): Map<K, V> {
    const newMap = new Map(map);
    newMap.set(key, value);
    return newMap;
}


export function deleteMapEntry<K, V>(
    map: Map<K, V>,
    key: K
): Map<K, V> {
    const newMap = new Map(map);
    newMap.delete(key);
    return newMap;
}
