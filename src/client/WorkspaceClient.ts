import { host } from "../model/Constants.ts";
import type { Workspace } from "../model/Workspace.ts";
import BaseClient from "./BaseClient.ts";

export default class WorkspaceClient extends BaseClient {
    private workspaceUrl: string = host + "/family/workspaces";

    async getWorkspaces(): Promise<Workspace[]> {
        return await this.get<Workspace[]>(this.workspaceUrl);
    }

    async createWorkspaces(workspaces: Workspace[]): Promise<void> {
        await this.post(this.workspaceUrl, workspaces);
    }

    async updateWorkspaces(workspaces: Workspace[]): Promise<void> {
        await this.put(this.workspaceUrl, workspaces);
    }

    async deleteWorkspaces(workspaces: string[]): Promise<void> {
        await this.delete(this.workspaceUrl, workspaces);
    }
}