import type {Person} from "../model/Person.ts";
import type {PersonRowDetail} from "../model/PersonRowDetail.ts";
import type {Node, NodeData} from "../model/Node.ts";
import PeopleClient from "../client/PeopleClient.ts";
import {RowState} from "../model/Constants.ts";
import RelationClient from "../client/RelationClient.ts";
import type {Edge, EdgeData} from "../model/Edge.ts";
import {
    type Edge as REdge,
    type Node as RNode,
} from '@xyflow/react';
import type {Workspace} from "../model/Workspace.ts";
import WorkspaceClient from "../client/WorkspaceClient.ts";
import AuthenticateClient from "../client/AuthenticateClient.ts";
import type AuthenticateResponse from "../model/AuthenticateResponse.ts";


export default class PeopleRelationService {

    peopleClient: PeopleClient = new PeopleClient();
    relationClient: RelationClient = new RelationClient();
    workspaceClient: WorkspaceClient = new WorkspaceClient();
    authenticateClient: AuthenticateClient = new AuthenticateClient();

    async savePersons(persons: Person[], personRowDetails: Map<string, PersonRowDetail>): Promise<void> {
        const added: Person[] = persons.filter(data => RowState.Added === personRowDetails.get(data.id)?.state)
        const updated: Person[] = persons.filter(data => RowState.Edited === personRowDetails.get(data.id)?.state)
        const deleted: string[] = [...personRowDetails.entries()]
            .filter(([_, item]) => RowState.Deleted === item.state)
            .map(([key, _]) => key)
        let promiseArray: Promise<void>[] = []
        if (added?.length > 0) {
            console.log("added persons [size=" + added.length + "]");
            promiseArray.push(this.peopleClient.createPersons(added));
        }
        if (updated?.length > 0) {
            console.log("updates persons [size=" + updated.length + "]")
            promiseArray.push(this.peopleClient.updatePersons(updated));
        }
        if (deleted?.length > 0) {
            console.log("deleted persons [size=" + deleted.length + "]");
            promiseArray.push(this.peopleClient.deletePersons(deleted));
        }
        await Promise.all(promiseArray)
    }

    async getPersons(): Promise<[Person[], Map<string, PersonRowDetail>]> {
        return await this.peopleClient
            .getPersons()
            .then((persons: Person[]) =>
                [persons, new Map(persons.map(data => [data.id as string, {
                    editable: false,
                    state: RowState.Original
                } as PersonRowDetail]))]);
    }

    async getNodes(workspaceId: string): Promise<Node[]> {
        return await this.relationClient.getNodes(workspaceId);
    }

    async getEdges(workspaceId: string): Promise<Edge[]> {
        return await this.relationClient.getEdges(workspaceId);
    }

    async saveNodes(nodes: RNode<NodeData>[], nodesState: Map<string, RowState>, workspaceId: string): Promise<void> {
        const added: Node[] = nodes.filter(data => RowState.Added === nodesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    type: data.type,
                    personId: data.data.personId,
                    position: {x: data.position.x, y: data.position.y},
                    workspaceId: workspaceId,
                } as Node
            })
        const updated: Node[] = nodes.filter(data => RowState.Edited === nodesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    type: data.type,
                    personId: data.data.personId,
                    position: {x: data.position.x, y: data.position.y},
                    workspaceId: workspaceId,
                } as Node
            })
        const deleted: string[] = [...nodesState.entries()]
            .filter(([_, item]) => RowState.Deleted === item)
            .map(([key, _]) => key)

        let promiseArray: Promise<void>[] = []
        if (added?.length > 0) {
            console.log("added nodes [size=" + added.length + "]");
            promiseArray.push(this.relationClient.createNodes(added));
        }
        if (updated?.length > 0) {
            console.log("updates nodes [size=" + updated.length + "]")
            promiseArray.push(this.relationClient.updateNodes(updated));
        }
        if (deleted?.length > 0) {
            console.log("deleted nodes [size=" + deleted.length + "]");
            promiseArray.push(this.relationClient.deleteNodes(deleted));
        }
        await Promise.all(promiseArray)
    }

    async saveEdges(edges: REdge<EdgeData>[], edgesState: Map<string, RowState>, workspaceId: string): Promise<void> {
        const added: Edge[] = edges.filter(data => RowState.Added === edgesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    source: data.source,
                    sourceHandler: data.sourceHandle,
                    target: data.target,
                    targetHandler: data.targetHandle,
                    workspaceId: workspaceId,
                } as Edge
            })
        const updated: Edge[] = edges.filter(data => RowState.Edited === edgesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    source: data.source,
                    sourceHandler: data.sourceHandle,
                    target: data.target,
                    targetHandler: data.targetHandle,
                    workspaceId: workspaceId,
                } as Edge
            })
        const deleted: string[] = [...edgesState.entries()]
            .filter(([_, item]) => RowState.Deleted === item)
            .map(([key, _]) => key)
        let promiseArray: Promise<void>[] = []
        if (added?.length > 0) {
            console.log("added edges [size=" + added.length + "]");
            promiseArray.push(this.relationClient.createEdges(added));
        }
        if (updated?.length > 0) {
            console.log("updates edges [size=" + updated.length + "]")
            promiseArray.push(this.relationClient.updateEdges(updated));
        }
        if (deleted?.length > 0) {
            console.log("deleted edges [size=" + deleted.length + "]");
            promiseArray.push(this.relationClient.deleteEdges(deleted));
        }
        await Promise.all(promiseArray)
    }

    async getWorkspaces(): Promise<[Workspace[], Map<string, PersonRowDetail>]> {
        return await this.workspaceClient.getWorkspaces()
            .then((workspaces: Workspace[]) =>
                [workspaces, new Map(workspaces.map(data => [data.id as string, {
                    editable: false,
                    state: RowState.Original
                } as PersonRowDetail]))]);
    }

    async authenticate(): Promise<AuthenticateResponse> {
        return await this.authenticateClient.authenticate();
    }

    async saveWorkspaces(workspaces: Workspace[], personRowDetails: Map<string, PersonRowDetail>): Promise<void> {
        const added: Workspace[] = workspaces.filter(data => RowState.Added === personRowDetails.get(data.id)?.state)
        const updated: Workspace[] = workspaces.filter(data => RowState.Edited === personRowDetails.get(data.id)?.state)
        const deleted: string[] = [...personRowDetails.entries()]
            .filter(([_, item]) => RowState.Deleted === item.state)
            .map(([key, _]) => key)
        let promiseArray: Promise<void>[] = []
        if (added?.length > 0) {
            console.log("added workspaces [size=" + added.length + "]");
            promiseArray.push(this.workspaceClient.createWorkspaces(added));
        }
        if (updated?.length > 0) {
            console.log("updates workspaces [size=" + updated.length + "]")
            promiseArray.push(this.workspaceClient.updateWorkspaces(updated));
        }
        if (deleted?.length > 0) {
            console.log("deleted workspaces [size=" + deleted.length + "]");
            promiseArray.push(this.workspaceClient.deleteWorkspaces(deleted));
        }
        await Promise.all(promiseArray)
    }
}