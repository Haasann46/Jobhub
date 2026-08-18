"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import { useVacancy } from "@/hooks/use-vacancy";

import FavoriteButton from "@/components/vacancy/FavoriteButton";


function formatSalary(
    salaryFrom: number | null,
    salaryTo: number | null,
): string {

    if (
        salaryFrom === null &&
        salaryTo === null
    ) {
        return "Не указана";
    }


    const formatter = new Intl.NumberFormat(
        "en-US",
    );


    if (
        salaryFrom !== null &&
        salaryTo !== null
    ) {
        return `$${formatter.format(
            salaryFrom,
        )} – $${formatter.format(
            salaryTo,
        )}`;
    }


    if (salaryFrom !== null) {
        return `От $${formatter.format(
            salaryFrom,
        )}`;
    }


    return `До $${formatter.format(
        salaryTo!,
    )}`;
}


function formatEmploymentType(
    value: string,
): string {

    const labels: Record<string, string> = {

        full_time: "Полный день",

        part_time: "Частичная занятость",

        contract: "Контракт",

        internship: "Стажировка",

    };


    return labels[value] ?? value;
}


function formatExperience(
    value: string,
): string {

    const labels: Record<string, string> = {

        junior: "Junior",

        middle: "Middle",

        senior: "Senior",

    };


    return labels[value] ?? value;
}


function formatPublishedDate(
    value: string,
): string {

    const date = new Date(value);


    if (Number.isNaN(date.getTime())) {
        return "";
    }


    return new Intl.DateTimeFormat(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    ).format(date);
}


export default function VacancyPage() {

    const params = useParams();
    const router = useRouter();


    const vacancyId =
        typeof params.id === "string"
            ? params.id
            : undefined;


    const {
        vacancy,
        loading,
        error,
    } = useVacancy(vacancyId);


    /*
     * Loading
     */

    if (loading) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">

                    <div className="mb-6 h-4 w-28 animate-pulse rounded bg-slate-200" />


                    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">

                        <div className="flex items-start gap-4">

                            <div className="h-16 w-16 shrink-0 animate-pulse rounded-2xl bg-slate-200" />

                            <div className="flex-1 space-y-3">

                                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />

                                <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />

                                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />

                            </div>

                        </div>


                        <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 sm:grid-cols-3">

                            <div className="space-y-2">

                                <div className="h-3 w-16 animate-pulse rounded bg-slate-200" />

                                <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />

                            </div>


                            <div className="space-y-2">

                                <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />

                                <div className="h-5 w-24 animate-pulse rounded bg-slate-200" />

                            </div>


                            <div className="space-y-2">

                                <div className="h-3 w-12 animate-pulse rounded bg-slate-200" />

                                <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />

                            </div>

                        </div>


                        <div className="mt-8 space-y-3">

                            <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />

                            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                            <div className="h-4 w-full animate-pulse rounded bg-slate-200" />

                            <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />

                        </div>

                    </div>

                </div>

            </main>
        );
    }


    /*
     * Error / 404
     */

    if (error || !vacancy) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

                    <div className="rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">

                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">

                            <span className="text-2xl text-slate-500">
                                !
                            </span>

                        </div>


                        <h1 className="text-xl font-bold text-slate-900">
                            {error ?? "Вакансия не найдена"}
                        </h1>


                        <p className="mt-2 text-sm text-slate-500">
                            Возможно, вакансия была удалена
                            или больше недоступна.
                        </p>


                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                            Вернуться назад
                        </button>

                    </div>

                </div>

            </main>
        );
    }


    /*
     * Formatting
     */

    const salary = formatSalary(
        vacancy.salary_from,
        vacancy.salary_to,
    );


    const employmentType =
        formatEmploymentType(
            vacancy.employment_type,
        );


    const experience =
        formatExperience(
            vacancy.experience_level,
        );


    const publishedDate =
        formatPublishedDate(
            vacancy.published_at,
        );


    /*
     * Vacancy page
     */

    return (
        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">

                {/* Back */}

                <div className="mb-5">

                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-brand-600"
                    >

                        <span>
                            ←
                        </span>

                        Все вакансии

                    </Link>

                </div>


                {/* Main card */}

                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">

                    {/* Header */}

                    <div className="mb-6 flex items-start justify-between gap-5">

                        <div className="flex min-w-0 items-start gap-4">

                            {vacancy.company_logo ? (

                                <img
                                    src={vacancy.company_logo}
                                    alt={vacancy.company_name}
                                    className="h-16 w-16 shrink-0 rounded-2xl border border-slate-100 object-cover"
                                />

                            ) : (

                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-xl font-bold text-white">

                                    {vacancy.company_name
                                        .charAt(0)
                                        .toUpperCase()}

                                </div>

                            )}


                            <div className="min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                    <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">

                                        {vacancy.category}

                                    </span>


                                    {publishedDate && (

                                        <span className="text-xs text-slate-400">

                                            {publishedDate}

                                        </span>

                                    )}

                                </div>


                                <h1 className="mt-2 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">

                                    {vacancy.title}

                                </h1>


                                <p className="mt-2 text-sm text-slate-500">

                                    {vacancy.company_name}

                                    {" • "}

                                    {vacancy.location}

                                </p>

                            </div>

                        </div>


                        {/* Favorite */}

                        <div className="shrink-0 pt-1">

                            <FavoriteButton
                                vacancyId={vacancy.id}
                            />

                        </div>

                    </div>


                    {/* Main information */}

                    <div className="mb-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">

                        <div>

                            <span className="mb-1 block text-xs text-slate-400">
                                Зарплата
                            </span>

                            <span className="text-sm font-extrabold text-slate-800">
                                {salary}
                            </span>

                        </div>


                        <div>

                            <span className="mb-1 block text-xs text-slate-400">
                                Тип занятости
                            </span>

                            <span className="text-sm font-semibold text-slate-800">
                                {employmentType}
                            </span>

                        </div>


                        <div>

                            <span className="mb-1 block text-xs text-slate-400">
                                Опыт
                            </span>

                            <span className="text-sm font-semibold text-slate-800">
                                {experience}
                            </span>

                        </div>

                    </div>


                    {/* Remote */}

                    {vacancy.is_remote && (

                        <div className="mb-6">

                            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                Удаленная работа

                            </span>

                        </div>

                    )}


                    {/* Description */}

                    <section className="mb-8">

                        <h2 className="mb-3 text-base font-bold text-slate-800">
                            Описание вакансии
                        </h2>


                        <div className="whitespace-pre-line text-sm leading-relaxed text-slate-600">

                            {vacancy.description}

                        </div>

                    </section>


                    {/* Technologies */}

                    {vacancy.technologies.length > 0 && (

                        <section className="mb-8">

                            <h2 className="mb-3 text-base font-bold text-slate-800">
                                Требуемые навыки
                            </h2>


                            <div className="flex flex-wrap gap-2">

                                {vacancy.technologies.map(
                                    (technology) => (

                                        <span
                                            key={technology.id}
                                            className="rounded-xl bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700"
                                        >
                                            {technology.name}
                                        </span>

                                    ),
                                )}

                            </div>

                        </section>

                    )}


                    {/* Actions */}

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                        <button
                            type="button"
                            className="flex-1 rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700"
                        >
                            Откликнуться прямо сейчас
                        </button>


                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                        >
                            Закрыть
                        </button>

                    </div>

                </article>

            </div>

        </main>
    );
}