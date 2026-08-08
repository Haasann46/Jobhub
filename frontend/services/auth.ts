import api from "@/services/api";

import {
    TokenResponse,
    User,
    UserLoginData,
    UserRegisterData,
} from "@/types/auth";


export async function register(
    data: UserRegisterData,
): Promise<User> {

    const response = await api.post<User>(
        "/auth/register",
        data,
    );

    return response.data;
}


export async function login(
    data: UserLoginData,
): Promise<TokenResponse> {

    const body = new URLSearchParams();

    body.append(
        "username",
        data.email,
    );

    body.append(
        "password",
        data.password,
    );

    const response = await api.post<TokenResponse>(
        "/auth/login",
        body,
        {
            headers: {
                "Content-Type":
                    "application/x-www-form-urlencoded",
            },
        },
    );

    return response.data;
}


export async function getCurrentUser(): Promise<User> {

    const response = await api.get<User>(
        "/users/me",
    );

    return response.data;
}