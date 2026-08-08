"use client";

import { useState } from "react";

import AuthModal from "@/components/modal/AuthModal";
import { useAuthStore } from "@/store/auth";

type AuthMode = "login" | "register";

export default function Header() {
    const [authModalOpen, setAuthModalOpen] =
        useState(false);

    const [authMode, setAuthMode] =
        useState<AuthMode>("login");

    const user = useAuthStore(
        (state) => state.user,
    );

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated,
    );

    const logout = useAuthStore(
        (state) => state.logout,
    );

    const openAuthModal = (mode: AuthMode) => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    return (
        <>
            <header>

                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* Logo */}

                    <div className="flex cursor-pointer items-center space-x-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-xl font-extrabold text-white shadow-md shadow-brand-500/20">
                            J
                        </div>

                        <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-xl font-bold text-transparent">
                            JobHub
                        </span>

                    </div>


                    {/* Desktop Navigation */}

                    <nav className="hidden space-x-8 md:flex">

                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                        >
                            💼

                            <span>
                                Вакансии
                            </span>
                        </button>

                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
                        >
                            💻

                            <span>
                                Backend
                            </span>
                        </button>

                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
                        >
                            🖥️

                            <span>
                                Frontend
                            </span>
                        </button>

                        <button
                            type="button"
                            className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-brand-600"
                        >
                            🎨

                            <span>
                                Дизайн
                            </span>
                        </button>

                    </nav>


                    {/* Actions */}

                    <div className="flex items-center space-x-3">

                        {!isAuthenticated ? (
                            <>
                                {/* Разместить вакансию */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        openAuthModal("login")
                                    }
                                    className="hidden items-center gap-2 rounded-xl border border-emerald-200/60 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-100 sm:inline-flex"
                                >
                                    ➕

                                    <span>
                                        Разместить вакансию
                                    </span>
                                </button>


                                {/* Войти */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        openAuthModal("login")
                                    }
                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Войти
                                </button>


                                {/* Регистрация */}

                                <button
                                    type="button"
                                    onClick={() =>
                                        openAuthModal("register")
                                    }
                                    className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 transition hover:bg-brand-700"
                                >
                                    Регистрация
                                </button>
                            </>
                        ) : (
                            <>
                                {/* User */}

                                <div className="hidden text-right sm:block">

                                    <div className="text-sm font-semibold text-slate-800">
                                        {user?.email}
                                    </div>

                                    <div className="text-xs text-slate-400">
                                        {user?.role === "candidate"
                                            ? "Кандидат"
                                            : user?.role === "employer"
                                                ? "Работодатель"
                                                : "Администратор"}
                                    </div>

                                </div>


                                {/* Logout */}

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                                >
                                    Выйти
                                </button>
                            </>
                        )}

                    </div>

                </div>

            </header>


            {/* Auth Modal */}

            <AuthModal
                isOpen={authModalOpen}
                mode={authMode}
                onClose={() =>
                    setAuthModalOpen(false)
                }
            />

        </>
    );
}