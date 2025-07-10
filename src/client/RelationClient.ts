import {host} from "../model/Constants.ts";
import type {Edge} from "../model/Edge.ts";
import type {Node} from "../model/Node.ts";

export default class RelationClient {
    nodeUrl: string = host + "/family/persons/node";
    edgeUrl: string = host + "/family/persons/edge";

    async getNodes(): Promise<Node[]> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        };
        const response: Response = await fetch(this.nodeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`getNodes HTTP error! status: ${response.status}`);
        }
        return await response.json() as Node[];
    }

    async createNodes(nodes: Node[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(nodes)
        };
        const response: Response = await fetch(this.nodeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`createNodes HTTP error! status: ${response.status}`);
        }
    }

    async updateNodes(nodes: Node[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(nodes)
        };
        const response: Response = await fetch(this.nodeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`updateNodes HTTP error! status: ${response.status}`);
        }
    }

    async deleteNodes(nodes: string[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(nodes)
        };
        const response: Response = await fetch(this.nodeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`deleteNodes HTTP error! status: ${response.status}`);
        }
    }

    async getEdges(): Promise<Edge[]> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        };
        const response: Response = await fetch(this.edgeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`getEdges HTTP error! status: ${response.status}`);
        }
        return await response.json() as Edge[];
    }

    async createEdges(edges: Edge[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(edges)
        };
        const response: Response = await fetch(this.edgeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`createEdges HTTP error! status: ${response.status}`);
        }
    }

    async updateEdges(edges: Edge[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(edges)
        };
        const response: Response = await fetch(this.edgeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`updateEdges HTTP error! status: ${response.status}`);
        }
    }

    async deleteEdges(edges: string[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(edges)
        };
        const response: Response = await fetch(this.edgeUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`deleteEdges HTTP error! status: ${response.status}`);
        }
    }

}