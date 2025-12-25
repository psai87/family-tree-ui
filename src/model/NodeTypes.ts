export const NODE_TYPES = {
    PEOPLE: 'peopleNode',
    FAMILY: 'familyNode'
} as const;

export type NodeType = typeof NODE_TYPES[keyof typeof NODE_TYPES];
