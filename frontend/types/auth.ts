export type UserRole =
    | "candidate"
    | "employer"
    | "admin";


export interface User {
    id: number;

    email: string;

    role: UserRole;

    is_active: boolean;

    is_verified: boolean;
}


export interface UserRegisterData {
    email: string;

    password: string;

    role: UserRole;
}


export interface UserLoginData {
    email: string;

    password: string;
}


export interface TokenResponse {
    access_token: string;

    token_type: string;
}