import type { Person } from "../model/Person.ts";
import type { PersonRowDetail } from "../model/PersonRowDetail.ts";
import type { Node, NodeData } from "../model/Node.ts";
import { RowState } from "../model/Constants.ts";
import type { Edge, EdgeData } from "../model/Edge.ts";
import {
    type Edge as REdge,
    type Node as RNode,
} from '@xyflow/react';
import type { Workspace } from "../model/Workspace.ts";
import type AuthenticateResponse from "../model/AuthenticateResponse.ts";
import ServiceFactory from "./ServiceFactory.ts";
import type { Otp, OtpRequest, OtpResponse } from "@/model/Otp.ts";


export default class PeopleRelationService {

    async loadImagesForPersons(persons: Person[]): Promise<Map<string, ArrayBuffer>> {
        const imagePromises = persons.map(person =>
            ServiceFactory.getImageClient().getImage(person.id)
                .then(imageData => (imageData))
                .catch(() => ({ personId: person.id, imageData: new ArrayBuffer(0) }))
        );

        const results = await Promise.all(imagePromises);
        const imageMap = new Map<string, ArrayBuffer>();

        results.forEach(result => {
            if (result.imageData) {
                imageMap.set(result.personId, result.imageData);
            }
        });

        return imageMap;
    }

    async savePersons(persons: Person[], personRowDetails: Map<string, PersonRowDetail>, imageMap: Map<string, ArrayBuffer>): Promise<void> {
        const added: Person[] = persons.filter(data => RowState.Added === personRowDetails.get(data.id)?.state)
        const updated: Person[] = persons.filter(data => RowState.Edited === personRowDetails.get(data.id)?.state)
        const deleted: string[] = [...personRowDetails.entries()]
            .filter(([_, item]) => RowState.Deleted === item.state)
            .map(([key, _]) => key)
        let promiseArray: Promise<void>[] = []
        let imagePromiseArray: Promise<void>[] = [];
        if (added?.length > 0) {
            console.log("added persons [size=" + added.length + "]");
            promiseArray.push(ServiceFactory.getPeopleClient().createPersons(added));
            added.forEach((person) => {
                const imageData = imageMap.get(person.id);
                if (imageData) {
                    imagePromiseArray.push(ServiceFactory.getImageClient().createImage(person.id, imageData));
                }
            });
        }
        if (updated?.length > 0) {
            console.log("updates persons [size=" + updated.length + "]")
            promiseArray.push(ServiceFactory.getPeopleClient().updatePersons(updated));
            updated.forEach((person) => {
                const imageData = imageMap.get(person.id);
                if (imageData) {
                    imagePromiseArray.push(ServiceFactory.getImageClient().updateImage(person.id, imageData));
                }
            });
        }
        if (deleted?.length > 0) {
            console.log("deleted persons [size=" + deleted.length + "]");
            promiseArray.push(ServiceFactory.getPeopleClient().deletePersons(deleted));
            deleted.forEach((personId) => {
                imagePromiseArray.push(ServiceFactory.getImageClient().deleteImage(personId));
            });
        }
        await Promise.all([...promiseArray, ...imagePromiseArray])
    }

    async getPersons(): Promise<[Person[], Map<string, PersonRowDetail>]> {
        return await ServiceFactory.getPeopleClient()
            .getPersons()
            .then((persons: Person[]) =>
                [persons, new Map(persons.map(data => [data.id as string, {
                    editable: false,
                    state: RowState.Original
                } as PersonRowDetail]))]);
    }

    async getNodes(workspaceId: string): Promise<Node[]> {
        return await ServiceFactory.getRelationClient().getNodes(workspaceId);
    }

    async getEdges(workspaceId: string): Promise<Edge[]> {
        return await ServiceFactory.getRelationClient().getEdges(workspaceId);
    }

    async saveNodes(nodes: RNode<NodeData>[], nodesState: Map<string, RowState>, workspaceId: string): Promise<void> {
        const added: Node[] = nodes.filter(data => RowState.Added === nodesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    type: data.type,
                    personId: data.data.personId,
                    position: { x: data.position.x, y: data.position.y },
                    workspaceId: workspaceId,
                } as Node
            })
        const updated: Node[] = nodes.filter(data => RowState.Edited === nodesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    type: data.type,
                    personId: data.data.personId,
                    position: { x: data.position.x, y: data.position.y },
                    workspaceId: workspaceId,
                } as Node
            })
        const deleted: string[] = [...nodesState.entries()]
            .filter(([_, item]) => RowState.Deleted === item)
            .map(([key, _]) => key)

        let promiseArray: Promise<void>[] = []
        if (added?.length > 0) {
            console.log("added nodes [size=" + added.length + "]");
            promiseArray.push(ServiceFactory.getRelationClient().createNodes(added));
        }
        if (updated?.length > 0) {
            console.log("updates nodes [size=" + updated.length + "]")
            promiseArray.push(ServiceFactory.getRelationClient().updateNodes(updated));
        }
        if (deleted?.length > 0) {
            console.log("deleted nodes [size=" + deleted.length + "]");
            promiseArray.push(ServiceFactory.getRelationClient().deleteNodes(deleted));
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
            promiseArray.push(ServiceFactory.getRelationClient().createEdges(added));
        }
        if (updated?.length > 0) {
            console.log("updates edges [size=" + updated.length + "]")
            promiseArray.push(ServiceFactory.getRelationClient().updateEdges(updated));
        }
        if (deleted?.length > 0) {
            console.log("deleted edges [size=" + deleted.length + "]");
            promiseArray.push(ServiceFactory.getRelationClient().deleteEdges(deleted));
        }
        await Promise.all(promiseArray)
    }

    async getWorkspaces(): Promise<[Workspace[], Map<string, PersonRowDetail>]> {
        return await ServiceFactory.getWorkspaceClient().getWorkspaces()
            .then((workspaces: Workspace[]) =>
                [workspaces, new Map(workspaces.map(data => [data.id as string, {
                    editable: false,
                    state: RowState.Original
                } as PersonRowDetail]))]);
    }

    async authenticate(): Promise<AuthenticateResponse> {
        return await ServiceFactory.getAuthenticateClient().authenticate();
    }

    async generateOTP(email: string): Promise<void> {
        return await ServiceFactory.getAuthenticateClient().generateOTP(email);
    }

    async verifyOTP(otpRequest: OtpRequest): Promise<OtpResponse> {
        return await ServiceFactory.getAuthenticateClient().verifyOTP(otpRequest);
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
            promiseArray.push(ServiceFactory.getWorkspaceClient().createWorkspaces(added));
        }
        if (updated?.length > 0) {
            console.log("updates workspaces [size=" + updated.length + "]")
            promiseArray.push(ServiceFactory.getWorkspaceClient().updateWorkspaces(updated));
        }
        if (deleted?.length > 0) {
            console.log("deleted workspaces [size=" + deleted.length + "]");
            promiseArray.push(ServiceFactory.getWorkspaceClient().deleteWorkspaces(deleted));
        }
        await Promise.all(promiseArray)
    }
}