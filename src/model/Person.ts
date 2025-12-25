export interface Person {
    id: `${string}-${string}-${string}-${string}-${string}`,
    firstName: string,
    lastName: string,
    occupation: string,
    email: string | undefined,
    yearOfBirth: number,
    yearOfDeath: number
}