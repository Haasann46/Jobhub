"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import { useAuthStore } from "@/store/auth";
import { UserRole } from "@/types/auth";


interface AuthModalProps {
    isOpen: boolean;

    mode: "login" | "register";

    onClose: () => void;
}


export default function AuthModal({
    isOpen,
    mode,
    onClose,
}: AuthModalProps) {

    const [currentMode, setCurrentMode] =
        useState<"login" | "register">(
            mode,
        );

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [role, setRole] =
        useState<UserRole>(
            "candidate",
        );


    const login = useAuthStore(
        (state) => state.login,
    );

    const register = useAuthStore(
        (state) => state.register,
    );

    const loading = useAuthStore(
        (state) => state.loading,
    );

    const error = useAuthStore(
        (state) => state.error,
    );

    const clearError = useAuthStore(
        (state) => state.clearError,
    );


    useEffect(() => {

        setCurrentMode(mode);

        clearError();

    }, [
        mode,
        clearError,
    ]);


    useEffect(() => {

        if (!isOpen) {
            return;
        }

        clearError();

    }, [
        isOpen,
        clearError,
    ]);


    if (!isOpen) {
        return null;
    }


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {

        event.preventDefault();

        clearError();

        try {

            if (
                currentMode ===
                "login"
            ) {

                await login({
                    email,
                    password,
                });

            } else {

                await register({
                    email,
                    password,
                    role,
                });

            }


            setEmail("");

            setPassword("");

            setRole("candidate");

            onClose();

        } catch {
            // Ошибка уже хранится в auth store.
        }
    }


    function switchMode() {

        clearError();

        setCurrentMode(
            currentMode === "login"
                ? "register"
                : "login",
        );
    }


    return (
        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-950/50
                px-4
                backdrop-blur-sm
            "
            onMouseDown={(event) => {

                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }

            }}
        >

            <div
                className="
                    w-full
                    max-w-md
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    p-6
                    shadow-2xl
                "
            >

                {/* Header */}

                <div
                    className="
                        mb-6
                        flex
                        items-start
                        justify-between
                    "
                >

                    <div>

                        <h2
                            className="
                                text-2xl
                                font-bold
                                text-slate-900
                            "
                        >
                            {currentMode === "login"
                                ? "Вход"
                                : "Регистрация"}
                        </h2>


                        <p
                            className="
                                mt-1
                                text-sm
                                text-slate-500
                            "
                        >
                            {currentMode === "login"
                                ? "Войдите в свой аккаунт JobHub."
                                : "Создайте аккаунт JobHub."}
                        </p>

                    </div>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg
                            px-2
                            py-1
                            text-xl
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-700
                        "
                    >
                        ×
                    </button>

                </div>


                {/* Tabs */}

                <div
                    className="
                        mb-6
                        flex
                        rounded-xl
                        bg-slate-100
                        p-1
                    "
                >

                    <button
                        type="button"
                        onClick={() => {

                            clearError();

                            setCurrentMode(
                                "login",
                            );

                        }}
                        className={`
                            flex-1
                            rounded-lg
                            py-2
                            text-sm
                            font-semibold
                            transition
                            ${
                                currentMode ===
                                "login"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }
                        `}
                    >
                        Вход
                    </button>


                    <button
                        type="button"
                        onClick={() => {

                            clearError();

                            setCurrentMode(
                                "register",
                            );

                        }}
                        className={`
                            flex-1
                            rounded-lg
                            py-2
                            text-sm
                            font-semibold
                            transition
                            ${
                                currentMode ===
                                "register"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500 hover:text-slate-700"
                            }
                        `}
                    >
                        Регистрация
                    </button>

                </div>


                {/* Form */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    {/* Email */}

                    <div>

                        <label
                            htmlFor="auth-email"
                            className="
                                mb-1.5
                                block
                                text-sm
                                font-medium
                                text-slate-700
                            "
                        >
                            Email
                        </label>


                        <input
                            id="auth-email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value,
                                )
                            }
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-3
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                placeholder:text-slate-400
                                focus:border-brand-500
                                focus:ring-2
                                focus:ring-brand-500/10
                            "
                        />

                    </div>


                    {/* Password */}

                    <div>

                        <label
                            htmlFor="auth-password"
                            className="
                                mb-1.5
                                block
                                text-sm
                                font-medium
                                text-slate-700
                            "
                        >
                            Пароль
                        </label>


                        <input
                            id="auth-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value,
                                )
                            }
                            placeholder="Минимум 8 символов"
                            required
                            minLength={8}
                            autoComplete={
                                currentMode ===
                                "login"
                                    ? "current-password"
                                    : "new-password"
                            }
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-4
                                py-3
                                text-sm
                                text-slate-900
                                outline-none
                                transition
                                placeholder:text-slate-400
                                focus:border-brand-500
                                focus:ring-2
                                focus:ring-brand-500/10
                            "
                        />

                    </div>


                    {/* Role */}

                    {currentMode ===
                        "register" && (

                        <div>

                            <label
                                className="
                                    mb-1.5
                                    block
                                    text-sm
                                    font-medium
                                    text-slate-700
                                "
                            >
                                Тип аккаунта
                            </label>


                            <div
                                className="
                                    grid
                                    grid-cols-2
                                    gap-3
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        setRole(
                                            "candidate",
                                        )
                                    }
                                    className={`
                                        rounded-xl
                                        border
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                        transition
                                        ${
                                            role ===
                                            "candidate"
                                                ? "border-brand-500 bg-brand-50 text-brand-600"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                        }
                                    `}
                                >
                                    👤 Кандидат
                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        setRole(
                                            "employer",
                                        )
                                    }
                                    className={`
                                        rounded-xl
                                        border
                                        px-4
                                        py-3
                                        text-sm
                                        font-medium
                                        transition
                                        ${
                                            role ===
                                            "employer"
                                                ? "border-brand-500 bg-brand-50 text-brand-600"
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                        }
                                    `}
                                >
                                    🏢 Работодатель
                                </button>

                            </div>

                        </div>

                    )}


                    {/* Error */}

                    {error && (

                        <div
                            className="
                                rounded-xl
                                border
                                border-red-200
                                bg-red-50
                                px-4
                                py-3
                                text-sm
                                text-red-600
                            "
                        >
                            {error}
                        </div>

                    )}


                    {/* Submit */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="
                            w-full
                            rounded-xl
                            bg-brand-600
                            px-4
                            py-3
                            text-sm
                            font-semibold
                            text-white
                            shadow-md
                            shadow-brand-500/20
                            transition
                            hover:bg-brand-700
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        {loading
                            ? "Загрузка..."
                            : currentMode ===
                                "login"
                                ? "Войти"
                                : "Создать аккаунт"}
                    </button>

                </form>


                {/* Bottom switch */}

                <div
                    className="
                        mt-6
                        border-t
                        border-slate-100
                        pt-5
                        text-center
                    "
                >

                    <p
                        className="
                            text-sm
                            text-slate-500
                        "
                    >

                        {currentMode ===
                        "login"
                            ? "Нет аккаунта?"
                            : "Уже есть аккаунт?"}

                        {" "}

                        <button
                            type="button"
                            onClick={
                                switchMode
                            }
                            className="
                                font-semibold
                                text-brand-600
                                hover:text-brand-700
                            "
                        >
                            {currentMode ===
                            "login"
                                ? "Зарегистрироваться"
                                : "Войти"}
                        </button>

                    </p>

                </div>

            </div>

        </div>
    );
}