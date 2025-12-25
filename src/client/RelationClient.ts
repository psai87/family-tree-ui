import { host } from "../model/Constants.ts";
import type { Edge } from "../model/Edge.ts";
import type { Node } from "../model/Node.ts";
import BaseClient from "./BaseClient.ts";

export default class RelationClient extends BaseClient {
    private nodeUrl: string = host + "/family/workspaces/node";
    private getNodeUrl: string = host + "/family/workspaces/{workspace_id}/node";
    private edgeUrl: string = host + "/family/workspaces/edge";
    private getEdgeUrl: string = host + "/family/workspaces/{workspace_id}/edge";

    async getNodes(workspaceId: string): Promise<Node[]> {
        const url = this.getNodeUrl.replace("{workspace_id}", workspaceId);
        return await this.get<Node[]>(url);
    }

    async createNodes(nodes: Node[]): Promise<void> {
        await this.post(this.nodeUrl, nodes);
    }

    async updateNodes(nodes: Node[]): Promise<void> {
        await this.put(this.nodeUrl, nodes);
    }

    async deleteNodes(nodes: string[]): Promise<void> {
        await this.delete(this.nodeUrl, nodes);
    }

    async getEdges(workspaceId: string): Promise<Edge[]> {
        const url = this.getEdgeUrl.replace("{workspace_id}", workspaceId);
        return await this.get<Edge[]>(url);
    }

    async createEdges(edges: Edge[]): Promise<void> {
        await this.post(this.edgeUrl, edges);
    }

    async updateEdges(edges: Edge[]): Promise<void> {
        await this.put(this.edgeUrl, edges);
    }

    async deleteEdges(edges: string[]): Promise<void> {
        await this.delete(this.edgeUrl, edges);
    }
}