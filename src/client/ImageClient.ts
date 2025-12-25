import type { Image } from "@/model/Image.ts";
import { host } from "../model/Constants.ts";
import BaseClient from "./BaseClient.ts";

export default class ImageClient extends BaseClient {
    private imageUrl: string = host + "/family/images";

    async getImage(personId: string): Promise<Image> {
        const url = `${this.imageUrl}/${personId}`;
        const data = await this.getArrayBuffer(url);
        return { personId: personId, imageData: data };
    }

    async createImage(personId: string, imageData: ArrayBuffer): Promise<void> {
        const url = `${this.imageUrl}/${personId}`;
        await this.post(url, imageData);
    }

    async updateImage(personId: string, imageData: ArrayBuffer): Promise<void> {
        const url = `${this.imageUrl}/${personId}`;
        await this.put(url, imageData);
    }

    async deleteImage(personId: string): Promise<void> {
        const url = `${this.imageUrl}/${personId}`;
        await this.delete(url);
    }

}
