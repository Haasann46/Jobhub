"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/store/auth";


export default function Header() {

    const router = useRouter();
    const pathname = usePathname();

    const user = useAuthStore(
        (state) => state.user,
    );

    const isAuthenticated = useAuthStore(
        (state) => state.isAuthenticated,
    );

    const initialized = useAuthStore(
        (state) => state.initialized,
    );

    const initialize = useAuthStore(
        (state) => state.initialize,
    );

    const logout = useAuthStore(
        (state) => state.logout,
    );


    const [authModalOpen, setAuthModalOpen] =
        useState(false);

    const [authMode, setAuthMode] =
        useState<"login" | "register">(
            "login",
        );


    useEffect(() => {

        if (!initialized) {
            initialize();
        }

    }, [
        initialized,
        initialize,
    ]);


    function openLogin() {

        setAuthMode("login");

        setAuthModalOpen(true);
    }


    function openRegister() {

        setAuthMode("register");

        setAuthModalOpen(true);
    }


    function handleCabinet() {

        if (!user) {
            openLogin();
            return;
        }


        if (user.role === "candidate") {

            router.push("/candidate");

            return;
        }


        if (user.role === "employer") {

            router.push("/employer");

            return;
        }


        if (user.role === "admin") {

            router.push("/admin");

            return;
        }
    }


    function handleLogout() {

        logout();

        router.push("/");
    }


    function isActive(
        path: string,
    ): boolean {

        return pathname === path;
    }


    return (
        <>

            <header
                className="
                    sticky
                    top-0
                    z-40
                    border-b
                    border-slate-200
                    bg-white/90
                    backdrop-blur-md
                "
            >

                <div
                    className="
                        mx-auto
                        flex
                        h-16
                        max-w-7xl
                        items-center
                        justify-between
                        px-4
                        sm:px-6
                        lg:px-8
                    "
                >

                    {/* Logo */}

                    <Link
                        href="/"
                        className="
                            flex
                            items-center
                            space-x-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-10
                                w-10
                                items-center
                                justify-center
                                rounded-xl
                                bg-gradient-to-tr
                                from-brand-600
                                to-indigo-600
                                text-xl
                                font-extrabold
                                text-white
                                shadow-md
                                shadow-brand-500/20
                            "
                        >
                            J
                        </div>


                        <span
                            className="
                                bg-gradient-to-r
                                from-slate-900
                                to-slate-700
                                bg-clip-text
                                text-xl
                                font-bold
                                text-transparent
                            "
                        >
                            JobHub
                        </span>

                    </Link>


                    {/* Desktop Navigation */}

                    <nav
                        className="
                            hidden
                            space-x-8
                            md:flex
                        "
                    >

                        <Link
                            href="/"
                            className={`
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-semibold
                                transition
                                ${
                                    isActive("/")
                                        ? "text-brand-600"
                                        : "text-slate-600 hover:text-brand-600"
                                }
                            `}
                        >
                            💼
                            <span>
                                Вакансии
                            </span>
                        </Link>


                        <Link
                            href="/?category=Backend"
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:text-brand-600
                            "
                        >
                            💻
                            <span>
                                Backend
                            </span>
                        </Link>


                        <Link
                            href="/?category=Frontend"
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:text-brand-600
                            "
                        >
                            🖥️
                            <span>
                                Frontend
                            </span>
                        </Link>


                        <Link
                            href="/?category=Design"
                            className="
                                flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-slate-600
                                transition
                                hover:text-brand-600
                            "
                        >
                            🎨
                            <span>
                                Дизайн
                            </span>
                        </Link>

                    </nav>


                    {/* Actions */}

                    <div
                        className="
                            flex
                            items-center
                            space-x-3
                        "
                    >

                        {!initialized ? (

                            <div
                                className="
                                    h-9
                                    w-24
                                    animate-pulse
                                    rounded-xl
                                    bg-slate-100
                                "
                            />

                        ) : isAuthenticated && user ? (

                            <>

                                {/* Post vacancy */}

                                {user.role === "employer" && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                "/employer/vacancies/new",
                                            )
                                        }
                                        className="
                                            hidden
                                            items-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-emerald-200/60
                                            bg-emerald-50
                                            px-4
                                            py-2
                                            text-xs
                                            font-semibold
                                            text-emerald-600
                                            transition
                                            hover:bg-emerald-100
                                            sm:inline-flex
                                        "
                                    >
                                        ➕

                                        <span>
                                            Разместить вакансию
                                        </span>

                                    </button>

                                )}


                                {/* Cabinet */}

                                <button
                                    type="button"
                                    onClick={
                                        handleCabinet
                                    }
                                    className="
                                        rounded-xl
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        transition
                                        hover:bg-slate-100
                                    "
                                >

                                    <span className="hidden sm:inline">
                                        Кабинет
                                    </span>

                                    <span className="sm:hidden">
                                        👤
                                    </span>

                                </button>


                                {/* Logout */}

                                <button
                                    type="button"
                                    onClick={
                                        handleLogout
                                    }
                                    className="
                                        rounded-xl
                                        bg-brand-600
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        shadow-md
                                        shadow-brand-500/20
                                        transition
                                        hover:bg-brand-700
                                    "
                                >
                                    Выйти
                                </button>

                            </>

                        ) : (

                            <>

                                <button
                                    type="button"
                                    onClick={
                                        openLogin
                                    }
                                    className="
                                        rounded-xl
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                        transition
                                        hover:bg-slate-100
                                    "
                                >
                                    Войти
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        openRegister
                                    }
                                    className="
                                        rounded-xl
                                        bg-brand-600
                                        px-4
                                        py-2
                                        text-sm
                                        font-semibold
                                        text-white
                                        shadow-md
                                        shadow-brand-500/20
                                        transition
                                        hover:bg-brand-700
                                    "
                                >
                                    Регистрация
                                </button>

                            </>

                        )}

                    </div>

                </div>

            </header>


            {/* Authentication modal */}

            <AuthModal
                isOpen={
                    authModalOpen
                }
                mode={
                    authMode
                }
                onClose={() =>
                    setAuthModalOpen(
                        false,
                    )
                }
            />

        </>
    );
}