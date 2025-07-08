import type {Person} from "./Person.ts";

export interface Node {
    id: string,
    type: string,
    personId: string,
    position: Position
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