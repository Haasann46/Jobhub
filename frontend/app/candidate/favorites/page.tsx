"use client";

import {
    useEffect,
    useState,
} from "react";

import Link from "next/link";

import {
    getMyFavorites,
} from "@/services/favorite";

import {
    useAuthStore,
} from "@/store/auth";

import {
    FavoriteVacancy,
} from "@/types/favorite";

import VacancyCard from "@/components/vacancy/VacancyCard";


export default function CandidateFavoritesPage() {

    const user = useAuthStore(
        (state) => state.user,
    );

    const initialized =
        useAuthStore(
            (state) => state.initialized,
        );


    const [
        vacancies,
        setVacancies,
    ] = useState<FavoriteVacancy[]>(
        [],
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );


    useEffect(() => {

        if (!initialized) {
            return;
        }


        if (
            !user
            ||
            user.role !== "candidate"
        ) {

            setLoading(false);

            return;
        }


        let cancelled = false;


        async function loadFavorites() {

            try {

                setLoading(true);

                setError(null);


                const data =
                    await getMyFavorites();


                if (!cancelled) {

                    setVacancies(
                        data,
                    );

                }

            } catch (error: any) {

                if (!cancelled) {

                    setError(
                        error?.response?.data?.detail ??
                        "Не удалось загрузить избранные вакансии.",
                    );

                }

            } finally {

                if (!cancelled) {

                    setLoading(false);

                }

            }

        }


        loadFavorites();


        return () => {

            cancelled = true;

        };

    }, [
        initialized,
        user,
    ]);


    /*
     * Loading
     */

    if (
        !initialized
        ||
        loading
    ) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                    <div className="mb-8">

                        <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

                        <div className="mt-3 h-9 w-64 animate-pulse rounded bg-slate-200" />

                        <div className="mt-2 h-4 w-80 animate-pulse rounded bg-slate-200" />

                    </div>


                    <div className="space-y-4">

                        {[1, 2, 3].map(
                            (item) => (

                                <div
                                    key={item}
                                    className="
                                        h-36
                                        animate-pulse
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                    "
                                />

                            ),
                        )}

                    </div>

                </div>

            </main>
        );
    }


    /*
     * Access
     */

    if (
        !user
        ||
        user.role !== "candidate"
    ) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">

                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

                            <span className="text-2xl">
                                🔐
                            </span>

                        </div>


                        <h1 className="text-xl font-bold text-slate-900">
                            Избранное доступно кандидатам
                        </h1>


                        <p className="mt-2 text-sm text-slate-500">
                            Войдите в аккаунт кандидата,
                            чтобы открыть сохранённые вакансии.
                        </p>


                        <Link
                            href="/"
                            className="
                                mt-6
                                inline-flex
                                rounded-xl
                                bg-brand-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-brand-700
                            "
                        >
                            Вернуться к вакансиям
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    /*
     * Page
     */

    return (
        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                {/* Header */}

                <div className="mb-8">

                    <Link
                        href="/candidate"
                        className="
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-medium
                            text-slate-500
                            transition
                            hover:text-brand-600
                        "
                    >

                        ← Кабинет кандидата

                    </Link>


                    <div className="mt-6">

                        <div className="flex items-center gap-3">

                            <span className="text-3xl text-red-500">
                                ♥
                            </span>


                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                                Избранные вакансии
                            </h1>

                        </div>


                        <p className="mt-2 text-sm text-slate-500">
                            Вакансии, которые вы сохранили,
                            чтобы вернуться к ним позже.
                        </p>

                    </div>

                </div>


                {/* Error */}

                {error && (

                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>

                )}


                {/* Empty */}

                {vacancies.length === 0 ? (

                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">

                            <span className="text-3xl text-red-500">
                                ♡
                            </span>

                        </div>


                        <h2 className="mt-5 text-xl font-bold text-slate-900">
                            Пока нет избранных вакансий
                        </h2>


                        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500">
                            Сохраняйте интересные вакансии
                            с помощью сердечка, чтобы быстро
                            найти их позже.
                        </p>


                        <Link
                            href="/"
                            className="
                                mt-6
                                inline-flex
                                rounded-xl
                                bg-brand-600
                                px-5
                                py-2.5
                                text-sm
                                font-semibold
                                text-white
                                transition
                                hover:bg-brand-700
                            "
                        >
                            Смотреть вакансии
                        </Link>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {vacancies.map(
                            (vacancy) => (

                                <VacancyCard
                                    key={vacancy.id}
                                    vacancy={vacancy}
                                    initialIsFavorite={true}
                                    onFavoriteChange={(
                                        isFavorite,
                                    ) => {

                                        if (
                                            !isFavorite
                                        ) {

                                            setVacancies(
                                                (current) =>
                                                    current.filter(
                                                        (item) =>
                                                            item.id !==
                                                            vacancy.id,
                                                    ),
                                            );

                                        }

                                    }}
                                />

                            ),
                        )}

                    </div>

                )}

            </div>

        </main>
    );
}