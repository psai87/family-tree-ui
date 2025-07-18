import type {Person} from "./Person.ts";

export interface Node {
    id: string,
    type: string,
    personId: string,
    position: Position,
    workspaceId: string,
}

export interface Position {
    x: number,
    y: number
}

export type NodeData = {
    personId: string,
    persons: Map<string, Person>
    editable: boolean
}