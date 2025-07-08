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


export default class PeopleRelationService {

    peopleClient: PeopleClient = new PeopleClient();
    relationClient: RelationClient = new RelationClient();

    async savePersons(persons: Person[], personRowDetails: Map<string, PersonRowDetail>): Promise<void> {
        const added: Person[] = persons.filter(data => RowState.Added === personRowDetails.get(data.id)?.state)
        const updated: Person[] = persons.filter(data => RowState.Edited === personRowDetails.get(data.id)?.state)
        const deleted: string[] = [...personRowDetails.entries()]
            .filter(([_, item]) => RowState.Deleted === item.state)
            .map(([key, _]) => key)
        let promiseArray: Promise<void>[] = []
        if (added) {
            console.log("added persons [size=" + added.length + "]");
            promiseArray.push(this.peopleClient.createPersons(added));
        }
        if (updated) {
            console.log("updates persons [size=" + updated.length + "]")
            promiseArray.push(this.peopleClient.updatePersons(updated));
        }
        if (deleted) {
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

    async getNodes(): Promise<Node[]> {
        return await this.relationClient.getNodes();
    }

    async getEdges(): Promise<Edge[]> {
        return await this.relationClient.getEdges();
    }

    async saveNodes(nodes: RNode<NodeData>[], nodesState: Map<string, RowState>): Promise<void> {
        const added: Node[] = nodes.filter(data => RowState.Added === nodesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    type: data.type,
                    personId: data.data.personId,
                    position: {x: data.position.x, y: data.position.y},
                } as Node
            })
        const updated: Node[] = nodes.filter(data => RowState.Edited === nodesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    type: data.type,
                    personId: data.data.personId,
                    position: {x: data.position.x, y: data.position.y},
                } as Node
            })
        const deleted: string[] = nodes.filter(data => RowState.Deleted === nodesState.get(data.id))
            .map(data => data.id)
        let promiseArray: Promise<void>[] = []
        if (added) {
            console.log("added nodes [size=" + added.length + "]");
            promiseArray.push(this.relationClient.createNodes(added));
        }
        if (updated) {
            console.log("updates nodes [size=" + updated.length + "]")
            promiseArray.push(this.relationClient.updateNodes(updated));
        }
        if (deleted) {
            console.log("deleted nodes [size=" + deleted.length + "]");
            promiseArray.push(this.relationClient.deleteNodes(deleted));
        }
        await Promise.all(promiseArray)
    }

    async saveEdges(edges: REdge<EdgeData>[], edgesState: Map<string, RowState>): Promise<void> {
        const added: Edge[] = edges.filter(data => RowState.Added === edgesState.get(data.id))
            .map(data => {
                return {
                    id: data.id,
                    source: data.source,
                    sourceHandler: data.sourceHandle,
                    target: data.target,
                    targetHandler: data.targetHandle,
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
                } as Edge
            })
        const deleted: string[] = edges.filter(data => RowState.Deleted === edgesState.get(data.id))
            .map(data => data.id)
        let promiseArray: Promise<void>[] = []
        if (added) {
            console.log("added edges [size=" + added.length + "]");
            promiseArray.push(this.relationClient.createEdges(added));
        }
        if (updated) {
            console.log("updates edges [size=" + updated.length + "]")
            promiseArray.push(this.relationClient.updateEdges(updated));
        }
        if (deleted) {
            console.log("deleted edges [size=" + deleted.length + "]");
            promiseArray.push(this.relationClient.deleteEdges(deleted));
        }
        await Promise.all(promiseArray)
    }
}