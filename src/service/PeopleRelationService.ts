import type {Person} from "../model/Person.ts";
import type {PersonRowDetail} from "../model/PersonRowDetail.ts";
import type {Node} from "../model/Node.ts";
import PeopleClient from "../client/PeopleClient.ts";
import {RowState} from "../model/Constants.ts";
import RelationClient from "../client/RelationClient.ts";
import type {Edge} from "../model/Edge.ts";


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
}