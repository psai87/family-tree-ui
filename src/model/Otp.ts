export interface OtpRequest {
    email: string;
    otp: string;
}

export interface OtpResponse {
    token: string;
}