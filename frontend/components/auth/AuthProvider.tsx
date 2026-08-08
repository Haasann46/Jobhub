"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth";


interface AuthProviderProps {
    children: React.ReactNode;
}


export default function AuthProvider({
    children,
}: AuthProviderProps) {

    const initialize = useAuthStore(
        (state) => state.initialize,
    );

    useEffect(() => {
        initialize();
    }, [initialize]);


    return children;
}