"use client";

import { create } from "zustand";

import {
    getCurrentUser,
    login as loginRequest,
    register as registerRequest,
} from "@/services/auth";

import {
    User,
    UserLoginData,
    UserRegisterData,
} from "@/types/auth";


interface AuthStore {

    user: User | null;

    token: string | null;

    isAuthenticated: boolean;

    loading: boolean;

    initialized: boolean;

    error: string | null;

    login: (
        data: UserLoginData,
    ) => Promise<void>;

    register: (
        data: UserRegisterData,
    ) => Promise<void>;

    initialize: () => Promise<void>;

    logout: () => void;

    clearError: () => void;
}


export const useAuthStore =
    create<AuthStore>((set) => ({

        user: null,

        token: null,

        isAuthenticated: false,

        loading: false,

        initialized: false,

        error: null,


        login: async (data) => {

            set({
                loading: true,
                error: null,
            });

            try {

                const response =
                    await loginRequest(data);

                localStorage.setItem(
                    "access_token",
                    response.access_token,
                );

                const user =
                    await getCurrentUser();

                set({
                    user,

                    token:
                        response.access_token,

                    isAuthenticated: true,

                    loading: false,

                    initialized: true,

                    error: null,
                });

            } catch (error: any) {

                const message =
                    error?.response?.data?.detail ??
                    "Не удалось войти.";

                localStorage.removeItem(
                    "access_token",
                );

                set({
                    user: null,

                    token: null,

                    isAuthenticated: false,

                    loading: false,

                    error: message,
                });

                throw error;
            }
        },


        register: async (data) => {

            set({
                loading: true,
                error: null,
            });

            try {

                await registerRequest(data);

                const response =
                    await loginRequest({
                        email: data.email,
                        password: data.password,
                    });

                localStorage.setItem(
                    "access_token",
                    response.access_token,
                );

                const user =
                    await getCurrentUser();

                set({
                    user,

                    token:
                        response.access_token,

                    isAuthenticated: true,

                    loading: false,

                    initialized: true,

                    error: null,
                });

            } catch (error: any) {

                const message =
                    error?.response?.data?.detail ??
                    "Не удалось зарегистрироваться.";

                set({
                    loading: false,
                    error: message,
                });

                throw error;
            }
        },


        initialize: async () => {

            if (
                typeof window ===
                "undefined"
            ) {
                return;
            }

            const token =
                localStorage.getItem(
                    "access_token",
                );

            if (!token) {

                set({
                    initialized: true,
                });

                return;
            }

            set({
                token,
                loading: true,
            });

            try {

                const user =
                    await getCurrentUser();

                set({
                    user,

                    token,

                    isAuthenticated: true,

                    loading: false,

                    initialized: true,

                    error: null,
                });

            } catch {

                localStorage.removeItem(
                    "access_token",
                );

                set({
                    user: null,

                    token: null,

                    isAuthenticated: false,

                    loading: false,

                    initialized: true,
                });
            }
        },


        logout: () => {

            localStorage.removeItem(
                "access_token",
            );

            set({
                user: null,

                token: null,

                isAuthenticated: false,

                error: null,
            });
        },


        clearError: () => {

            set({
                error: null,
            });
        },
    }));