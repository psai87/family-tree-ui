import type { Person } from "../model/Person.ts";
import { host } from "../model/Constants.ts";
import BaseClient from "./BaseClient.ts";

export default class PeopleClient extends BaseClient {
    private personUrl: string = host + "/family/persons";

    async getPersons(): Promise<Person[]> {
        return await this.get<Person[]>(this.personUrl);
    }

    async createPersons(persons: Person[]): Promise<void> {
        await this.post(this.personUrl, persons);
    }

    async updatePersons(persons: Person[]): Promise<void> {
        await this.put(this.personUrl, persons);
    }

    async deletePersons(persons: string[]): Promise<void> {
        await this.delete(this.personUrl, persons);
    }
}