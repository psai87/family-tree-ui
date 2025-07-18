import {AuthState, host} from "../model/Constants.ts";
import type {Workspace} from "../model/Workspace.ts";

export default class WorkspaceClient {
    workspaceUrl: string = host + "/family/workspaces";

    async getWorkspaces(): Promise<Workspace[]> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`}
        };
        const response: Response = await fetch(this.workspaceUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`getWorkspaces HTTP error! status: ${response.status}`);
        }
        return await response.json() as Workspace[];
    }

    async createWorkspaces(workspaces: Workspace[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`},
            body: JSON.stringify(workspaces)
        };
        const response: Response = await fetch(this.workspaceUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`createWorkspaces HTTP error! status: ${response.status}`);
        }
    }

    async updateWorkspaces(workspaces: Workspace[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`},
            body: JSON.stringify(workspaces)
        };
        const response: Response = await fetch(this.workspaceUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`updateWorkspaces HTTP error! status: ${response.status}`);
        }
    }

    async deleteWorkspaces(workspaces: string[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`},
            body: JSON.stringify(workspaces)
        };
        const response: Response = await fetch(this.workspaceUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`deleteWorkspaces HTTP error! status: ${response.status}`);
        }
    }

}