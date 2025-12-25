import { AuthState } from "../model/Constants.ts";

export default class BaseClient {

    protected async fetchWithAuth(
        url: string,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        body?: unknown,
        isBinary: boolean = false,
        skipAuth: boolean = false
    ): Promise<Response> {
        const headers: HeadersInit = skipAuth ? {} : {
            'Authorization': `Bearer ${AuthState.token}`
        };

        if (isBinary) {
            headers['Content-Type'] = 'application/octet-stream';
        } else {
            headers['Content-Type'] = 'application/json';
        }

        const options: RequestInit = {
            method,
            headers
        };

        if (body !== undefined) {
            options.body = isBinary ? (body as any) : JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response;
    }

    protected async get<T>(url: string): Promise<T> {
        const response = await this.fetchWithAuth(url, 'GET');
        return await response.json() as T;
    }

    protected async getArrayBuffer(url: string): Promise<ArrayBuffer> {
        const response = await this.fetchWithAuth(url, 'GET');
        return await response.arrayBuffer();
    }

    protected async post<T = void>(url: string, body: unknown, skipAuth: boolean = false): Promise<T> {
        const isBinary = body instanceof ArrayBuffer || body instanceof Blob;
        const response = await this.fetchWithAuth(url, 'POST', body, isBinary, skipAuth);
        if (response.status === 204 || response.headers.get('content-length') === '0') {
            return undefined as T;
        }
        return await response.json() as T;
    }

    protected async put(url: string, body: unknown): Promise<void> {
        const isBinary = body instanceof ArrayBuffer || body instanceof Blob;
        await this.fetchWithAuth(url, 'PUT', body, isBinary);
    }

    protected async delete(url: string, body?: unknown): Promise<void> {
        await this.fetchWithAuth(url, 'DELETE', body);
    }
}
