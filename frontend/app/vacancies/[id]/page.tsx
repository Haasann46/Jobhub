"use client";

import Link from "next/link";

import {
    useParams,
    useRouter,
} from "next/navigation";

import {
    useEffect,
    useState,
} from "react";

import {
    getVacancyById,
} from "@/services/vacancy";

import {
    createComplaint,
} from "@/services/complaint";

import {
    ComplaintReason,
} from "@/types/complaint";

import {
    Vacancy,
} from "@/types/vacancy";

import FavoriteButton from "@/components/vacancy/FavoriteButton";


function formatSalary(
    salaryFrom: number | null,
    salaryTo: number | null,
    currency: string,
): string {

    const symbols: Record<string, string> = {
        USD: "$",
        AZN: "₼",
        EUR: "€",
        GBP: "£",
        RUB: "₽",
    };

    const symbol =
        symbols[currency] ??
        currency;

    if (
        salaryFrom === null &&
        salaryTo === null
    ) {
        return "Не указана";
    }

    const formatter =
        new Intl.NumberFormat(
            "en-US",
        );

    if (
        salaryFrom !== null &&
        salaryTo !== null
    ) {
        return `${symbol}${formatter.format(
            salaryFrom,
        )} – ${symbol}${formatter.format(
            salaryTo,
        )}`;
    }

    if (
        salaryFrom !== null
    ) {
        return `От ${symbol}${formatter.format(
            salaryFrom,
        )}`;
    }

    return `До ${symbol}${formatter.format(
        salaryTo!,
    )}`;
}


function formatEmploymentType(
    value: string,
): string {

    const labels: Record<string, string> = {
        full_time:
            "Полный день",

        part_time:
            "Частичная занятость",

        contract:
            "Контракт",

        internship:
            "Стажировка",
    };

    return labels[value] ??
        value;
}


function formatExperience(
    value: string,
): string {

    const labels: Record<string, string> = {
        junior:
            "Junior",

        middle:
            "Middle",

        senior:
            "Senior",
    };

    return labels[value] ??
        value;
}


function formatPublishedDate(
    value: string,
): string {

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {
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


function renderList(
    text: string,
) {

    const items =
        text
            .split("\n")
            .map(
                (item) =>
                    item
                        .replace(
                            /^[•*-]\s*/,
                            "",
                        )
                        .trim(),
            )
            .filter(
                Boolean,
            );

    if (
        items.length === 0
    ) {
        return null;
    }

    return (
        <ul className="space-y-3">

            {items.map(
                (
                    item,
                    index,
                ) => (

                    <li
                        key={`${item}-${index}`}
                        className="
                            flex
                            items-start
                            gap-3
                            text-sm
                            leading-6
                            text-slate-600
                        "
                    >

                        <span
                            className="
                                mt-2
                                h-1.5
                                w-1.5
                                shrink-0
                                rounded-full
                                bg-brand-500
                            "
                        />

                        <span>
                            {item}
                        </span>

                    </li>
                ),
            )}

        </ul>
    );
}


function SectionTitle({
    children,
}: {
    children: React.ReactNode;
}) {

    return (
        <h2 className="mb-3 text-lg font-bold text-slate-900">
            {children}
        </h2>
    );
}


function getErrorMessage(
    error: any,
): string {

    const detail =
        error?.response?.data?.detail;

    if (
        typeof detail ===
        "string"
    ) {
        return detail;
    }

    if (
        Array.isArray(detail)
    ) {

        const messages =
            detail
                .map(
                    (item) =>
                        typeof item ===
                        "string"
                            ? item
                            : item?.msg,
                )
                .filter(
                    (
                        item,
                    ): item is string =>
                        Boolean(item),
                );

        if (
            messages.length > 0
        ) {
            return messages.join("\n");
        }
    }

    if (
        typeof error?.message ===
        "string"
    ) {
        return error.message;
    }

    return "Не удалось загрузить вакансию.";
}


export default function VacancyPage() {

    const params =
        useParams();

    const router =
        useRouter();

    const [
        vacancy,
        setVacancy,
    ] = useState<Vacancy | null>(
        null,
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

    const [
        isComplaintOpen,
        setIsComplaintOpen,
    ] = useState(false);

    const [
        complaintReason,
        setComplaintReason,
    ] = useState<ComplaintReason | "">("");

    const [
        complaintDescription,
        setComplaintDescription,
    ] = useState("");

    const [
        complaintSubmitting,
        setComplaintSubmitting,
    ] = useState(false);

    const [
        complaintError,
        setComplaintError,
    ] = useState<string | null>(
        null,
    );

    const [
        complaintSuccess,
        setComplaintSuccess,
    ] = useState(false);


    const vacancyId =
        typeof params.id ===
        "string"
            ? params.id
            : undefined;


    useEffect(() => {

        if (!vacancyId) {

            setError(
                "Некорректный ID вакансии.",
            );

            setLoading(false);

            return;
        }


        async function loadVacancy() {

            setLoading(true);

            setError(null);

            try {

                const response =
                    await getVacancyById(
                        vacancyId,
                    );

                setVacancy(
                    response,
                );

            } catch (error: any) {

                setVacancy(
                    null,
                );

                setError(
                    getErrorMessage(
                        error,
                    ),
                );

            } finally {

                setLoading(false);

            }
        }


        loadVacancy();

    }, [
        vacancyId,
    ]);


    if (loading) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">

                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />

                        <p className="mt-4 text-sm text-slate-500">
                            Загрузка вакансии...
                        </p>

                    </div>

                </div>

            </main>
        );
    }


    if (
        error ||
        !vacancy
    ) {

        return (
            <main className="min-h-screen bg-slate-50">

                <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">

                    <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">

                        <div className="text-4xl">
                            😕
                        </div>

                        <h1 className="mt-4 text-xl font-bold text-slate-900">
                            Вакансия не найдена
                        </h1>

                        <p className="mt-2 whitespace-pre-line text-sm text-red-600">
                            {
                                error ??
                                "Не удалось загрузить вакансию."
                            }
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                router.back()
                            }
                            className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                        >
                            Вернуться назад
                        </button>

                    </div>

                </div>

            </main>
        );
    }


    const salary =
        formatSalary(
            vacancy.salary_from,
            vacancy.salary_to,
            vacancy.currency,
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

    const complaintReasons: Array<{
        value: ComplaintReason;
        label: string;
    }> = [
        {
            value: "spam",
            label: "Спам",
        },
        {
            value: "scam",
            label: "Мошенничество",
        },
        {
            value: "false_information",
            label: "Ложная информация",
        },
        {
            value: "inappropriate_content",
            label: "Неподобающий контент",
        },
        {
            value: "other",
            label: "Другое",
        },
    ];

    function openComplaintModal() {
        setComplaintError(null);
        setComplaintSuccess(false);
        setComplaintReason("");
        setComplaintDescription("");
        setIsComplaintOpen(true);
    }

    function closeComplaintModal() {
        if (complaintSubmitting) {
            return;
        }

        setIsComplaintOpen(false);
        setComplaintError(null);
    }

    async function handleComplaintSubmit() {
        if (!complaintReason) {
            setComplaintError(
                "Выберите причину жалобы.",
            );
            return;
        }

        setComplaintSubmitting(true);
        setComplaintError(null);

        try {
            await createComplaint({
                vacancy_id: vacancy.id,
                reason: complaintReason,
                description:
                    complaintDescription.trim() || null,
            });

            setComplaintSuccess(true);
            setComplaintReason("");
            setComplaintDescription("");
        } catch (error: any) {
            setComplaintError(
                getErrorMessage(error),
            );
        } finally {
            setComplaintSubmitting(false);
        }
    }


    return (
        <main className="min-h-screen bg-slate-50">

            <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">

                <button
                    type="button"
                    onClick={() =>
                        router.back()
                    }
                    className="
                        mb-6
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
                    ← Назад к вакансиям
                </button>


                <article className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">

                    {/* ================================================== */}
                    {/* Header */}
                    {/* ================================================== */}

                    <div className="mb-6 flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-start gap-4">

                            {vacancy.company_logo ? (

                                <Link
                                    href={`/companies/${vacancy.company_id}`}
                                    className="
                                        flex
                                        h-16
                                        w-16
                                        shrink-0
                                        items-center
                                        justify-center
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                    "
                                >

                                    <img
                                        src={
                                            vacancy.company_logo
                                        }
                                        alt={
                                            vacancy.company_name
                                        }
                                        className="h-full w-full object-contain"
                                    />

                                </Link>

                            ) : (

                                <Link
                                    href={`/companies/${vacancy.company_id}`}
                                    className="
                                        flex
                                        h-16
                                        w-16
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        text-xl
                                        font-bold
                                        text-brand-600
                                    "
                                >

                                    {vacancy.company_name
                                        .charAt(0)
                                        .toUpperCase()}

                                </Link>

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


                                <div className="mt-2 flex flex-wrap items-center gap-x-1 text-sm text-slate-500">

                                    <Link
                                        href={`/companies/${vacancy.company_id}`}
                                        className="font-medium transition hover:text-brand-600"
                                    >
                                        {vacancy.company_name}
                                    </Link>


                                    <span>
                                        {" • "}
                                    </span>


                                    <span>
                                        {vacancy.location}
                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="shrink-0 pt-1">

                            <FavoriteButton
                                vacancyId={
                                    vacancy.id
                                }
                            />

                        </div>

                    </div>


                    {/* ================================================== */}
                    {/* Main information */}
                    {/* ================================================== */}

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


                    {/* ================================================== */}
                    {/* Remote */}
                    {/* ================================================== */}

                    {vacancy.is_remote && (

                        <div className="mb-7">

                            <span className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">

                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                Удаленная работа

                            </span>

                        </div>

                    )}


                    {/* ================================================== */}
                    {/* Description */}
                    {/* ================================================== */}

                    {vacancy.description && (

                        <section className="mb-9">

                            <SectionTitle>
                                Описание вакансии
                            </SectionTitle>

                            <div
                                className="
                                    max-w-2xl
                                    whitespace-pre-line
                                    text-sm
                                    leading-7
                                    text-slate-600
                                "
                            >
                                {vacancy.description}
                            </div>

                        </section>

                    )}


                    {/* ================================================== */}
                    {/* Responsibilities */}
                    {/* ================================================== */}

                    {vacancy.responsibilities && (

                        <section className="mb-9">

                            <SectionTitle>
                                Обязанности
                            </SectionTitle>

                            <div className="max-w-2xl">

                                {renderList(
                                    vacancy.responsibilities,
                                )}

                            </div>

                        </section>

                    )}


                    {/* ================================================== */}
                    {/* Requirements */}
                    {/* ================================================== */}

                    {vacancy.requirements && (

                        <section className="mb-9">

                            <SectionTitle>
                                Требования
                            </SectionTitle>

                            <div className="max-w-2xl">

                                {renderList(
                                    vacancy.requirements,
                                )}

                            </div>

                        </section>

                    )}


                    {/* ================================================== */}
                    {/* Technologies */}
                    {/* ================================================== */}

                    {vacancy.technologies.length > 0 && (

                        <section className="mb-8">

                            <SectionTitle>
                                Требуемые навыки
                            </SectionTitle>

                            <div className="flex flex-wrap gap-2">

                                {vacancy.technologies.map(
                                    (
                                        technology,
                                    ) => (

                                        <span
                                            key={
                                                technology.id
                                            }
                                            className="
                                                rounded-xl
                                                bg-brand-50
                                                px-3
                                                py-1.5
                                                text-xs
                                                font-semibold
                                                text-brand-700
                                            "
                                        >
                                            {
                                                technology.name
                                            }
                                        </span>

                                    ),
                                )}

                            </div>

                        </section>

                    )}


                    {/* ================================================== */}
                    {/* Company */}
                    {/* ================================================== */}

                    <section className="mb-8 border-t border-slate-100 pt-6">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>

                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                    Компания
                                </p>

                                <Link
                                    href={`/companies/${vacancy.company_id}`}
                                    className="
                                        mt-1
                                        inline-block
                                        text-base
                                        font-bold
                                        text-slate-900
                                        transition
                                        hover:text-brand-600
                                    "
                                >
                                    {vacancy.company_name}
                                </Link>

                                <p className="mt-1 text-sm text-slate-500">
                                    Подробнее о компании и открытых вакансиях
                                </p>

                            </div>


                            <Link
                                href={`/companies/${vacancy.company_id}`}
                                className="
                                    inline-flex
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                    transition
                                    hover:border-brand-300
                                    hover:bg-brand-50
                                    hover:text-brand-700
                                "
                            >
                                Посмотреть компанию

                                <span className="ml-2">
                                    →
                                </span>

                            </Link>

                        </div>

                    </section>


                    {/* ================================================== */}
                    {/* Actions */}
                    {/* ================================================== */}

                    <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">

                        <button
                            type="button"
                            onClick={openComplaintModal}
                            className="
                                rounded-xl
                                border
                                border-red-200
                                bg-white
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-red-600
                                transition
                                hover:border-red-300
                                hover:bg-red-50
                            "
                        >
                            🚩 Пожаловаться
                        </button>


                        <button
                            type="button"
                            className="
                                flex-1
                                rounded-xl
                                bg-brand-600
                                py-3
                                text-sm
                                font-semibold
                                text-white
                                shadow-lg
                                shadow-brand-500/20
                                transition
                                hover:bg-brand-700
                            "
                        >
                            Откликнуться прямо сейчас
                        </button>


                        <button
                            type="button"
                            onClick={() =>
                                router.back()
                            }
                            className="
                                rounded-xl
                                bg-slate-100
                                px-5
                                py-3
                                text-sm
                                font-semibold
                                text-slate-700
                                transition
                                hover:bg-slate-200
                            "
                        >
                            Назад
                        </button>

                    </div>

                </article>


                {/* ================================================== */}
                {/* Complaint modal */}
                {/* ================================================== */}

                {isComplaintOpen && (

                    <div
                        className="
                            fixed
                            inset-0
                            z-50
                            flex
                            items-center
                            justify-center
                            bg-slate-900/50
                            p-4
                        "
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="complaint-title"
                    >

                        <div
                            className="
                                w-full
                                max-w-lg
                                rounded-3xl
                                border
                                border-slate-200
                                bg-white
                                p-6
                                shadow-2xl
                                sm:p-7
                            "
                        >

                            <div className="flex items-start justify-between gap-4">

                                <div>

                                    <h2
                                        id="complaint-title"
                                        className="text-xl font-bold text-slate-900"
                                    >
                                        Пожаловаться на вакансию
                                    </h2>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Сообщите, что именно нарушает правила JobHub.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={closeComplaintModal}
                                    disabled={complaintSubmitting}
                                    aria-label="Закрыть"
                                    className="
                                        flex
                                        h-9
                                        w-9
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        text-xl
                                        text-slate-400
                                        transition
                                        hover:bg-slate-100
                                        hover:text-slate-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    ×
                                </button>

                            </div>


                            {complaintSuccess ? (

                                <div className="py-8 text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl">
                                        ✓
                                    </div>

                                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                                        Жалоба отправлена
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                        Спасибо. Мы рассмотрим жалобу и примем необходимые меры.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setIsComplaintOpen(false)}
                                        className="
                                            mt-6
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
                                        Закрыть
                                    </button>

                                </div>

                            ) : (

                                <div className="mt-6">

                                    <label
                                        htmlFor="complaint-reason"
                                        className="mb-2 block text-sm font-semibold text-slate-700"
                                    >
                                        Причина
                                    </label>

                                    <select
                                        id="complaint-reason"
                                        value={complaintReason}
                                        onChange={(event) =>
                                            setComplaintReason(
                                                event.target.value as ComplaintReason | "",
                                            )
                                        }
                                        disabled={complaintSubmitting}
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            text-slate-700
                                            outline-none
                                            transition
                                            focus:border-brand-400
                                            focus:ring-2
                                            focus:ring-brand-100
                                            disabled:cursor-not-allowed
                                            disabled:bg-slate-50
                                        "
                                    >
                                        <option value="">
                                            Выберите причину
                                        </option>

                                        {complaintReasons.map(
                                            (item) => (
                                                <option
                                                    key={item.value}
                                                    value={item.value}
                                                >
                                                    {item.label}
                                                </option>
                                            ),
                                        )}

                                    </select>


                                    <label
                                        htmlFor="complaint-description"
                                        className="mb-2 mt-5 block text-sm font-semibold text-slate-700"
                                    >
                                        Дополнительная информация
                                    </label>

                                    <textarea
                                        id="complaint-description"
                                        value={complaintDescription}
                                        onChange={(event) =>
                                            setComplaintDescription(
                                                event.target.value,
                                            )
                                        }
                                        disabled={complaintSubmitting}
                                        maxLength={2000}
                                        rows={5}
                                        placeholder="Опишите проблему, если хотите добавить подробности..."
                                        className="
                                            w-full
                                            resize-none
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-3
                                            text-sm
                                            leading-6
                                            text-slate-700
                                            outline-none
                                            transition
                                            placeholder:text-slate-400
                                            focus:border-brand-400
                                            focus:ring-2
                                            focus:ring-brand-100
                                            disabled:cursor-not-allowed
                                            disabled:bg-slate-50
                                        "
                                    />


                                    <div className="mt-2 flex justify-end">
                                        <span className="text-xs text-slate-400">
                                            {complaintDescription.length}/2000
                                        </span>
                                    </div>


                                    {complaintError && (

                                        <div
                                            className="
                                                mt-4
                                                rounded-xl
                                                border
                                                border-red-200
                                                bg-red-50
                                                px-4
                                                py-3
                                                text-sm
                                                leading-6
                                                text-red-600
                                            "
                                        >
                                            {complaintError}
                                        </div>

                                    )}


                                    <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                        <button
                                            type="button"
                                            onClick={closeComplaintModal}
                                            disabled={complaintSubmitting}
                                            className="
                                                rounded-xl
                                                bg-slate-100
                                                px-5
                                                py-3
                                                text-sm
                                                font-semibold
                                                text-slate-700
                                                transition
                                                hover:bg-slate-200
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >
                                            Отмена
                                        </button>


                                        <button
                                            type="button"
                                            onClick={handleComplaintSubmit}
                                            disabled={
                                                complaintSubmitting ||
                                                !complaintReason
                                            }
                                            className="
                                                rounded-xl
                                                bg-red-600
                                                px-5
                                                py-3
                                                text-sm
                                                font-semibold
                                                text-white
                                                shadow-lg
                                                shadow-red-500/20
                                                transition
                                                hover:bg-red-700
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >
                                            {complaintSubmitting
                                                ? "Отправка..."
                                                : "Отправить жалобу"}
                                        </button>

                                    </div>

                                </div>

                            )}

                        </div>

                    </div>

                )}

            </div>

        </main>
    );
}
