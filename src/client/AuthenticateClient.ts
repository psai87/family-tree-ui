import { host } from "../model/Constants.ts";
import type AuthenticateResponse from "../model/AuthenticateResponse.ts";
import BaseClient from "./BaseClient.ts";
import type { OtpRequest, OtpResponse } from "@/model/Otp.ts";

export default class AuthenticateClient extends BaseClient {
    private authUrl: string = host + "/family/authenticate";

    async authenticate(): Promise<AuthenticateResponse> {
        return await this.get<AuthenticateResponse>(this.authUrl);
    }

    async generateOTP(email: string): Promise<void> {
        return await this.post<void>(`${this.authUrl}/otp/generate`, { email }, true);
    }

    async verifyOTP(otpRequest: OtpRequest): Promise<OtpResponse> {
        return await this.post<OtpResponse>(`${this.authUrl}/otp/validate`, otpRequest, true);
    }
}