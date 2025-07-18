import type {Person} from "../model/Person.ts"
import {AuthState, host} from "../model/Constants.ts";

export default class PeopleClient {
    personUrl: string = host + "/family/persons";

    async getPersons(): Promise<Person[]> {
        const requestOptions: RequestInit = {
            method: 'GET',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`}
        };
        const response: Response = await fetch(this.personUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`getPersons HTTP error! status: ${response.status}`);
        }
        return await response.json() as Person[];
    }

    async createPersons(persons: Person[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'POST',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`},
            body: JSON.stringify(persons)
        };
        const response: Response = await fetch(this.personUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`createPersons HTTP error! status: ${response.status}`);
        }
    }

    async updatePersons(persons: Person[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`},
            body: JSON.stringify(persons)
        };
        const response: Response = await fetch(this.personUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`updatePersons HTTP error! status: ${response.status}`);
        }
    }

    async deletePersons(persons: string[]): Promise<void> {
        const requestOptions: RequestInit = {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json', 'Authorization': `Bearer ${AuthState.token}`},
            body: JSON.stringify(persons)
        };
        const response: Response = await fetch(this.personUrl, requestOptions);
        if (!response.ok) {
            throw new Error(`deletePersons HTTP error! status: ${response.status}`);
        }
    }
    
}