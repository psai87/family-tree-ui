import Cookies from 'js-cookie';

export const host: string = "https://sai-space.ddns.net";

export enum RowState {
    Original,
    Added,
    Edited,
    Deleted,
    Unknown
}

export const AuthState = {
    get token(): string | undefined {
        return Cookies.get('auth_token');
    },
    set token(value: string | undefined) {
        if (value) {
            Cookies.set('auth_token', value, { expires: 23 / 24, sameSite: 'strict', path: '/' });
        } else {
            Cookies.remove('auth_token', { path: '/' });
        }
    }
};