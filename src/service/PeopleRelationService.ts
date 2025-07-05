import type {Person} from "../model/Person.ts";
import type {PersonRowDetail} from "../model/PersonRowDetail.ts";
import PeopleClient from "../client/PeopleClient.ts";
import {RowState} from "../model/Constants.ts";


export default class PeopleRelationService {

    peopleClient: PeopleClient = new PeopleClient();

    async savePersons(persons: Person[], personRowDetails: Map<string, PersonRowDetail>): Promise<void> {
        console.log("aall"+JSON.stringify(persons))
        console.log(personRowDetails)
        const added: Person[] = persons.filter(data => RowState.Added === personRowDetails.get(data.id)?.state)
        const updated: Person[] = persons.filter(data => RowState.Edited === personRowDetails.get(data.id)?.state)
        const deleted: string[] = [...personRowDetails.entries()]
            .filter(([_, item]) => RowState.Deleted === item.state)
            .map(([key, _]) => key)
        let promiseArray: Promise<void>[] = []
        if (added) {
            console.log("added"+JSON.stringify(added))
            promiseArray.push(this.peopleClient.createPersons(added));
        }
        if (updated) {
            console.log("updates"+JSON.stringify(updated))
            promiseArray.push(this.peopleClient.updatePersons(updated));
        }
        if (deleted) {
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
}