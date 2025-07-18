export const host: string = "https://sai-space.ddns.net";

export enum RowState {
    Original,
    Added,
    Edited,
    Deleted,
    Unknown
}

export const AuthState = {
    token: undefined as string | undefined,
};