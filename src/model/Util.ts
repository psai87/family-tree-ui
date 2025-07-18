export default class Util {

    arrayBufferToBase64(image: ArrayBuffer): string {
        const bytes = new Uint8Array(image);
        let binary = '';
        const chunkSize = 0x8000; // 32KB per chunk

        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode(...chunk);
        }

        return btoa(binary);
    }

    base64ToArrayBuffer(image: string): ArrayBuffer {
        const binaryString = atob(image);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    }
}