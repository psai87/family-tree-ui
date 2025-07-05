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