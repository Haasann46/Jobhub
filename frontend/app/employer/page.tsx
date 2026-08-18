"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    useSearchParams,
    useRouter,
} from "next/navigation";

import {
    getVacancyApplications,
    getMyEmployerApplicationCount,
    updateApplicationStatus,
} from "@/services/application";

import {
    getMyVacancies,
    deleteVacancy,
} from "@/services/vacancy";

import {
    getConversationByApplication,
} from "@/services/conversation";

import {
    getConversationMessages,
} from "@/services/message";

import {
    useAuthStore,
} from "@/store/auth";

import {
    ApplicationStatus,
    EmployerApplication,
} from "@/types/application";

import {
    Vacancy,
} from "@/types/vacancy";

import {
    getMyCompany,
} from "@/services/company";

import {
    Company,
} from "@/types/company";

import CompanyCard from "@/components/company/CompanyCard";

import CompanyForm from "@/components/company/CompanyForm";

import ChatPanel from "@/components/chat/ChatPanel";


function formatDate(
    value: string,
): string {

    return new Date(
        value,
    ).toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "long",
            year: "numeric",
        },
    );
}


function getStatusLabel(
    status: ApplicationStatus,
): string {

    switch (status) {

        case "new":
            return "Новый";

        case "reviewing":
            return "На рассмотрении";

        case "interview":
            return "Собеседование";

        case "rejected":
            return "Отклонён";

        case "hired":
            return "Принят";

        default:
            return status;
    }
}


function getStatusClass(
    status: ApplicationStatus,
): string {

    switch (status) {

        case "new":
            return "bg-blue-50 text-blue-600";

        case "reviewing":
            return "bg-amber-50 text-amber-600";

        case "interview":
            return "bg-violet-50 text-violet-600";

        case "rejected":
            return "bg-red-50 text-red-600";

        case "hired":
            return "bg-emerald-50 text-emerald-600";

        default:
            return "bg-slate-100 text-slate-600";
    }
}


function formatSalary(
    salary: number | null,
): string {

    if (salary === null) {
        return "Не указана";
    }

    return `${salary.toLocaleString("ru-RU")} $`;
}


function getApiErrorMessage(
    error: any,
    fallback: string,
): string {

    const detail =
        error?.response?.data?.detail;


    if (typeof detail === "string") {
        return detail;
    }


    if (Array.isArray(detail)) {

        const messages =
            detail
                .map((item) => {

                    if (
                        typeof item ===
                        "string"
                    ) {
                        return item;
                    }

                    if (
                        item &&
                        typeof item.msg ===
                        "string"
                    ) {
                        return item.msg;
                    }

                    return null;

                })
                .filter(
                    (
                        message,
                    ): message is string =>
                        Boolean(message),
                );


        if (messages.length > 0) {
            return messages.join("\n");
        }
    }


    if (
        typeof error?.message ===
        "string"
    ) {
        return error.message;
    }


    return fallback;
}


export default function EmployerPage() {

    const searchParams =
        useSearchParams();

    const router =
        useRouter();


    const user =
        useAuthStore(
            (state) => state.user,
        );


    const initialized =
        useAuthStore(
            (state) => state.initialized,
        );


    const initialize =
        useAuthStore(
            (state) => state.initialize,
        );


    /*
     * ============================================================
     * Conversation из notification
     * ============================================================
     */

    const conversationParam =
        searchParams.get(
            "conversation",
        );


    const parsedConversationId =
        conversationParam
            ? Number(
                conversationParam,
            )
            : null;


    const notificationConversationId =
        parsedConversationId !== null
        &&
        Number.isInteger(
            parsedConversationId,
        )
        &&
        parsedConversationId > 0
            ? parsedConversationId
            : null;


    /*
     * ============================================================
     * State
     * ============================================================
     */

    const [
        vacancies,
        setVacancies,
    ] = useState<Vacancy[]>([]);


    const [
        selectedVacancy,
        setSelectedVacancy,
    ] = useState<Vacancy | null>(
        null,
    );

    const [
        company,
        setCompany,
    ] = useState<Company | null>(
        null,
    );


    const [
        companyLoading,
        setCompanyLoading,
    ] = useState(true);


    const [
        companyFormOpen,
        setCompanyFormOpen,
    ] = useState(false);


    const [
        companyError,
        setCompanyError,
    ] = useState<string | null>(
        null,
    );

    const [
        applications,
        setApplications,
    ] = useState<
        EmployerApplication[]
    >([]);


    const [
        applicationsCount,
        setApplicationsCount,
    ] = useState(0);


    const [
        selectedChatApplicationId,
        setSelectedChatApplicationId,
    ] = useState<number | null>(
        null,
    );


    const [
        applicationHasMessages,
        setApplicationHasMessages,
    ] = useState<
        Record<number, boolean>
    >({});


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        applicationsLoading,
        setApplicationsLoading,
    ] = useState(false);


    const [
        statusUpdating,
        setStatusUpdating,
    ] = useState<number | null>(
        null,
    );


    const [
        error,
        setError,
    ] = useState<string | null>(
        null,
    );


    /*
     * ============================================================
     * Авторизация
     * ============================================================
     */

    useEffect(() => {

        if (!initialized) {

            initialize();

        }

    }, [
        initialized,
        initialize,
    ]);


    /*
     * ============================================================
     * Загружаем вакансии работодателя
     * ============================================================
     */

    useEffect(() => {

        if (!initialized) {
            return;
        }


        if (!user) {

            setLoading(false);

            return;
        }


        if (
            user.role !==
            "employer"
        ) {

            setLoading(false);

            return;
        }


        async function load() {

            setLoading(true);
            setError(null);


            try {

                const [
                    vacanciesResponse,
                    applicationsCountResponse,
                ] = await Promise.all([
                    getMyVacancies(),
                    getMyEmployerApplicationCount(),
                ]);


                setVacancies(
                    vacanciesResponse,
                );


                setApplicationsCount(
                    applicationsCountResponse,
                );

            } catch (error: any) {

                const message =
                    getApiErrorMessage(
                        error,
                        "Не удалось загрузить данные кабинета.",
                    );


                setError(
                    message,
                );

            } finally {

                setLoading(false);

            }
        }


        load();

    }, [
        initialized,
        user,
    ]);

    useEffect(() => {

        if (!initialized) {
            return;
        }


        if (
            !user
            ||
            user.role !== "employer"
        ) {

            setCompanyLoading(false);

            return;
        }


        async function loadCompany() {

            setCompanyLoading(true);
            setCompanyError(null);


            try {

                const response =
                    await getMyCompany();


                setCompany(
                    response,
                );

            } catch (error: any) {

                const status =
                    error?.response?.status;


                if (status === 404) {

                    setCompany(
                        null,
                    );

                } else {

                    setCompanyError(
                        getApiErrorMessage(
                            error,
                            "Не удалось загрузить данные компании.",
                        ),
                    );

                }

            } finally {

                setCompanyLoading(false);

            }

        }


        loadCompany();

    }, [
        initialized,
        user,
    ]);

    /*
     * ============================================================
     * Загружаем отклики выбранной вакансии
     * ============================================================
     */

    useEffect(() => {

        if (!selectedVacancy) {

            setApplications([]);

            setSelectedChatApplicationId(
                null,
            );

            setApplicationHasMessages(
                {},
            );

            return;
        }


        async function loadApplications() {

            setApplicationsLoading(
                true,
            );

            setError(null);


            try {

                const response =
                    await getVacancyApplications(
                        selectedVacancy.id,
                    );


                setApplications(
                    response,
                );


                const messageStates:
                    Record<number, boolean> = {};


                await Promise.all(
                    response.map(
                        async (
                            application,
                        ) => {

                            try {

                                const conversation =
                                    await getConversationByApplication(
                                        application.id,
                                    );


                                const messages =
                                    await getConversationMessages(
                                        conversation.id,
                                    );


                                messageStates[
                                    application.id
                                ] =
                                    messages.length >
                                    0;

                            } catch {

                                messageStates[
                                    application.id
                                ] = false;

                            }

                        },
                    ),
                );


                setApplicationHasMessages(
                    messageStates,
                );

            } catch (error: any) {

                const message =
                    getApiErrorMessage(
                        error,
                        "Не удалось загрузить отклики.",
                    );


                setError(
                    message,
                );


                setApplications(
                    [],
                );


                setApplicationHasMessages(
                    {},
                );

            } finally {

                setApplicationsLoading(
                    false,
                );

            }
        }


        loadApplications();

    }, [
        selectedVacancy,
    ]);


    /*
     * ============================================================
     * Если открыли employer через notification,
     * находим вакансию, которой принадлежит conversation.
     *
     * Для этого нам пока не нужен отдельный backend endpoint:
     * ChatPanel сам умеет открыть conversation напрямую.
     *
     * Поэтому selectedVacancy здесь НЕ обязателен.
     * ============================================================
     */


    /*
     * ============================================================
     * Изменение статуса
     * ============================================================
     */

    async function handleStatusChange(
        applicationId: number,
        status: ApplicationStatus,
    ) {

        if (!selectedVacancy) {
            return;
        }


        setStatusUpdating(
            applicationId,
        );


        setError(null);


        try {

            await updateApplicationStatus(
                applicationId,
                status,
            );


            /*
             * После PATCH заново загружаем
             * весь список откликов.
             *
             * Это гарантирует, что frontend
             * получает актуальный status
             * непосредственно из базы данных.
             */

            const refreshed =
                await getVacancyApplications(
                    selectedVacancy.id,
                );


            setApplications(
                refreshed,
            );

        } catch (error: any) {

            setError(
                getApiErrorMessage(
                    error,
                    "Не удалось изменить статус отклика.",
                ),
            );

        } finally {

            setStatusUpdating(
                null,
            );

        }
    }

    /*
     * ============================================================
     * Обычное открытие чата работодателем
     * ============================================================
     */

    function handleOpenChat(
        applicationId: number,
    ) {

        setSelectedChatApplicationId(
            applicationId,
        );


        window.setTimeout(
            () => {

                document
                    .getElementById(
                        "employer-chat",
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });

            },
            100,
        );
    }


    /*
     * ============================================================
     * Переход к чату из notification
     * ============================================================
     *
     * Главный фикс.
     *
     * Мы НЕ пытаемся угадать,
     * когда ChatPanel появится.
     *
     * Проверяем DOM каждые 150ms.
     *
     * Как только ChatPanel появился —
     * прокручиваем к нему.
     * ============================================================
     */

    useEffect(() => {

        if (
            notificationConversationId ===
            null
        ) {
            return;
        }


        if (
            !initialized
            ||
            !user
        ) {
            return;
        }


        if (
            user.role !==
            "employer"
        ) {
            return;
        }


        let attempts = 0;

        const maxAttempts = 40;


        const scrollToChat =
            () => {

                const chatElement =
                    document.getElementById(
                        "employer-chat",
                    );


                if (chatElement) {

                    chatElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                    });

                    return;
                }


                attempts += 1;


                if (
                    attempts <
                    maxAttempts
                ) {

                    window.setTimeout(
                        scrollToChat,
                        150,
                    );

                }
            };


        const timer =
            window.setTimeout(
                scrollToChat,
                100,
            );


        return () => {

            window.clearTimeout(
                timer,
            );

        };

    }, [
        notificationConversationId,
        initialized,
        user,
        loading,
    ]);


    /*
     * ============================================================
     * Loading
     * ============================================================
     */

    if (
        !initialized
        ||
        loading
    ) {

        return (
            <main className="flex flex-1 items-center justify-center px-4 py-16">

                <div className="rounded-2xl border border-slate-200 bg-white px-8 py-6 text-sm text-slate-500 shadow-sm">

                    Загрузка кабинета...

                </div>

            </main>
        );
    }


    /*
     * ============================================================
     * Не авторизован
     * ============================================================
     */

    if (!user) {

        return (
            <main className="mx-auto w-full max-w-3xl px-4 py-16">

                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <div className="mb-4 text-4xl">
                        🔐
                    </div>


                    <h1 className="text-xl font-bold text-slate-900">
                        Требуется авторизация
                    </h1>


                    <p className="mt-2 text-sm text-slate-500">
                        Войдите в аккаунт, чтобы открыть кабинет.
                    </p>

                </div>

            </main>
        );
    }


    /*
     * ============================================================
     * Не работодатель
     * ============================================================
     */

    if (
        user.role !==
        "employer"
    ) {

        return (
            <main className="mx-auto w-full max-w-3xl px-4 py-16">

                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <div className="mb-4 text-4xl">
                        👤
                    </div>


                    <h1 className="text-xl font-bold text-slate-900">
                        Кабинет работодателя
                    </h1>


                    <p className="mt-2 text-sm text-slate-500">
                        Этот раздел доступен только работодателям.
                    </p>

                </div>

            </main>
        );
    }


    return (

        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

            <div className="mb-8">

                <p className="text-sm font-medium text-brand-600">
                    Личный кабинет
                </p>


                <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                    Кабинет работодателя
                </h1>


                <p className="mt-2 text-sm text-slate-500">
                    Управляйте вакансиями и откликами кандидатов.
                </p>

            </div>


            {error && (

                <div
                    className="
                        mb-6
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


            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">

                <aside>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-xl font-bold text-white">

                            {user.email
                                .charAt(0)
                                .toUpperCase()}

                        </div>


                        <h2 className="mt-4 font-bold text-slate-900">
                            Работодатель
                        </h2>


                        <p className="mt-1 break-all text-sm text-slate-500">
                            {user.email}
                        </p>


                        <div className="mt-5 border-t border-slate-100 pt-5">

                            <div className="flex items-center justify-between text-sm">

                                <span className="text-slate-500">
                                    Вакансии
                                </span>


                                <span className="font-bold text-slate-900">
                                    {vacancies.length}
                                </span>

                            </div>


                            <div className="mt-3 flex items-center justify-between text-sm">

                                <span className="text-slate-500">
                                    Отклики
                                </span>


                                <span className="font-bold text-slate-900">
                                    {applicationsCount}
                                </span>

                            </div>

                        </div>

                    </div>

                </aside>


                <div className="space-y-8">

                    {/* ================================================== */}
                    {/* Vacancies */}
                    {/* ================================================== */}

                    <section>

                        {/* ================================================== */}
                        {/* Company */}
                        {/* ================================================== */}

                        <section>

                            <div className="mb-4">

                                <h2 className="text-xl font-bold text-slate-900">
                                    Моя компания
                                </h2>

                                <p className="mt-1 text-sm text-slate-500">
                                    Информация о компании, которая отображается работодателем.
                                </p>

                            </div>


                            {companyLoading ? (

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                    <div className="animate-pulse">

                                        <div className="flex items-center gap-4">

                                            <div className="h-16 w-16 rounded-2xl bg-slate-200" />

                                            <div className="space-y-2">

                                                <div className="h-5 w-48 rounded bg-slate-200" />

                                                <div className="h-4 w-32 rounded bg-slate-200" />

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            ) : companyFormOpen ? (

                                <CompanyForm

                                    company={company}

                                    onSaved={(savedCompany) => {

                                        setCompany(
                                            savedCompany,
                                        );

                                        setCompanyFormOpen(
                                            false,
                                        );

                                    }}

                                    onCancel={() =>
                                        setCompanyFormOpen(
                                            false,
                                        )
                                    }

                                />

                            ) : company ? (

                                <CompanyCard

                                    company={company}

                                    onEdit={() =>
                                        setCompanyFormOpen(
                                            true,
                                        )
                                    }

                                />

                            ) : (

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">

                                        <span className="text-2xl">
                                            🏢
                                        </span>

                                    </div>


                                    <h3 className="mt-4 text-lg font-bold text-slate-900">
                                        Компания ещё не создана
                                    </h3>


                                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                        Создайте профиль компании, чтобы добавить информацию о работодателе.
                                    </p>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setCompanyFormOpen(
                                                true,
                                            )
                                        }
                                        className="
                                            mt-5
                                            rounded-xl
                                            bg-brand-600
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-semibold
                                            text-white
                                            shadow-lg
                                            shadow-brand-500/20
                                            transition
                                            hover:bg-brand-700
                                        "
                                    >
                                        Создать компанию
                                    </button>

                                </div>

                            )}

                        </section>

                        <div className="mb-4">

                            <h2 className="text-xl font-bold text-slate-900">
                                Мои вакансии
                            </h2>


                            <p className="mt-1 text-sm text-slate-500">
                                Выберите вакансию, чтобы посмотреть отклики кандидатов.
                            </p>

                        </div>


                        {vacancies.length === 0 ? (

                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                                <div className="text-4xl">
                                    💼
                                </div>


                                <h3 className="mt-3 font-bold text-slate-800">
                                    У вас пока нет вакансий
                                </h3>


                                <p className="mt-1 text-sm text-slate-500">
                                    Создайте вакансию, чтобы начать получать отклики.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-4">

                                {vacancies.map(
                                    (
                                        vacancy,
                                    ) => {

                                        const isSelected =
                                            selectedVacancy?.id ===
                                            vacancy.id;


                                        return (

                                            <article
                                                key={
                                                    vacancy.id
                                                }
                                                className={`
                                                    w-full
                                                    rounded-2xl
                                                    border
                                                    bg-white
                                                    p-6
                                                    text-left
                                                    shadow-sm
                                                    transition
                                                    ${
                                                        isSelected
                                                            ? "border-brand-500 ring-2 ring-brand-500/10"
                                                            : "border-slate-200 hover:border-brand-300"
                                                    }
                                                `}
                                            >

                                                <div
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => {

                                                        setSelectedVacancy(
                                                            vacancy,
                                                        );

                                                        setSelectedChatApplicationId(
                                                            null,
                                                        );

                                                    }}
                                                    onKeyDown={(event) => {

                                                        if (
                                                            event.key === "Enter"
                                                            ||
                                                            event.key === " "
                                                        ) {

                                                            event.preventDefault();

                                                            setSelectedVacancy(
                                                                vacancy,
                                                            );

                                                            setSelectedChatApplicationId(
                                                                null,
                                                            );
                                                        }
                                                    }}
                                                    className="cursor-pointer outline-none"
                                                >

                                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                                    <div>

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                {
                                                                    vacancy.title
                                                                }
                                                            </h3>


                                                            {vacancy.is_remote && (

                                                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                                                                    Remote
                                                                </span>

                                                            )}

                                                        </div>


                                                        <p className="mt-1 text-sm font-medium text-brand-600">
                                                            {
                                                                vacancy.category
                                                            }
                                                        </p>


                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">

                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                                                                📍{" "}
                                                                {
                                                                    vacancy.location
                                                                }
                                                            </span>


                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                                                                💰{" "}
                                                                {
                                                                    vacancy.salary_from !==
                                                                    null
                                                                        ? `${vacancy.salary_from.toLocaleString("ru-RU")} $`
                                                                        : "Зарплата не указана"
                                                                }
                                                            </span>

                                                        </div>

                                                    </div>


                                                    <span
                                                        className={`
                                                            shrink-0
                                                            rounded-xl
                                                            px-3
                                                            py-2
                                                            text-xs
                                                            font-semibold
                                                            ${
                                                                isSelected
                                                                    ? "bg-brand-50 text-brand-600"
                                                                    : "bg-slate-100 text-slate-600"
                                                            }
                                                        `}
                                                    >
                                                        Выбрать
                                                    </span>

                                                    </div>

                                                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">

                                                        <button
                                                            type="button"
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                router.push(
                                                                    `/employer/vacancies/${vacancy.id}`,
                                                                );
                                                            }}
                                                            className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                                        >
                                                            Редактировать
                                                        </button>

                                                        <button
                                                            type="button"
                                                            onClick={async (event) => {
                                                                event.stopPropagation();

                                                                const confirmed = window.confirm(
                                                                    `Удалить вакансию «${vacancy.title}»? Это действие нельзя отменить.`,
                                                                );

                                                                if (!confirmed) {
                                                                    return;
                                                                }

                                                                try {

                                                                    setError(null);

                                                                    await deleteVacancy(
                                                                        vacancy.id,
                                                                    );

                                                                    setVacancies(
                                                                        (current) =>
                                                                            current.filter(
                                                                                (item) =>
                                                                                    item.id !==
                                                                                    vacancy.id,
                                                                            ),
                                                                    );

                                                                    if (
                                                                        selectedVacancy?.id ===
                                                                        vacancy.id
                                                                    ) {

                                                                        setSelectedVacancy(
                                                                            null,
                                                                        );

                                                                        setApplications(
                                                                            [],
                                                                        );
                                                                    }

                                                                } catch (error: any) {

                                                                    setError(
                                                                        getApiErrorMessage(
                                                                            error,
                                                                            "Не удалось удалить вакансию.",
                                                                        ),
                                                                    );
                                                                }
                                                            }}
                                                            className="rounded-xl bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                                                        >
                                                            Удалить
                                                        </button>

                                                    </div>

                                                </div>

                                            </article>

                                        );

                                    },
                                )}

                            </div>

                        )}

                    </section>


                    {/* ================================================== */}
                    {/* Applications */}
                    {/* ================================================== */}

                    <section>

                        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

                            <div>

                                <h2 className="text-xl font-bold text-slate-900">
                                    Отклики кандидатов
                                </h2>


                                <p className="mt-1 text-sm text-slate-500">

                                    {selectedVacancy
                                        ? `Отклики на «${selectedVacancy.title}».`
                                        : "Выберите вакансию выше, чтобы посмотреть отклики."}

                                </p>

                            </div>


                            {selectedVacancy && (

                                <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">

                                    Откликов:{" "}
                                    {
                                        applications.length
                                    }

                                </span>

                            )}

                        </div>


                        {!selectedVacancy ? (

                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                                <div className="text-4xl">
                                    👈
                                </div>


                                <h3 className="mt-3 font-bold text-slate-800">
                                    Выберите вакансию
                                </h3>


                                <p className="mt-1 text-sm text-slate-500">
                                    После выбора здесь появятся отклики кандидатов.
                                </p>

                            </div>

                        ) : applicationsLoading ? (

                            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

                                <div className="text-3xl">
                                    ⏳
                                </div>


                                <p className="mt-3 text-sm text-slate-500">
                                    Загрузка откликов...
                                </p>

                            </div>

                        ) : applications.length === 0 ? (

                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                                <div className="text-4xl">
                                    📬
                                </div>


                                <h3 className="mt-3 font-bold text-slate-800">
                                    Откликов пока нет
                                </h3>


                                <p className="mt-1 text-sm text-slate-500">
                                    Когда кандидат откликнется на эту вакансию, его отклик появится здесь.
                                </p>

                            </div>

                        ) : (

                            <div className="space-y-4">

                                {applications.map(
                                    (
                                        application,
                                    ) => {

                                        const isChatSelected =
                                            selectedChatApplicationId ===
                                            application.id;


                                        const hasMessages =
                                            applicationHasMessages[
                                                application.id
                                            ] === true;


                                        return (

                                            <article
                                                key={
                                                    application.id
                                                }
                                                className="
                                                    rounded-2xl
                                                    border
                                                    border-slate-200
                                                    bg-white
                                                    p-6
                                                    shadow-sm
                                                "
                                            >

                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                                    <div>

                                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-lg font-bold text-white">

                                                            {application.candidate_email
                                                                .charAt(
                                                                    0,
                                                                )
                                                                .toUpperCase()}

                                                        </div>


                                                        <h3 className="mt-3 text-lg font-bold text-slate-900">
                                                            {
                                                                application.candidate_email
                                                            }
                                                        </h3>


                                                        <p className="mt-1 text-sm font-medium text-brand-600">
                                                            {
                                                                application
                                                                    .resume
                                                                    .desired_position
                                                            }
                                                        </p>

                                                    </div>


                                                    <select
                                                        value={
                                                            application.status
                                                        }
                                                        disabled={
                                                            statusUpdating ===
                                                            application.id
                                                        }
                                                        onChange={(
                                                            event,
                                                        ) =>
                                                            handleStatusChange(
                                                                application.id,
                                                                event
                                                                    .target
                                                                    .value as ApplicationStatus,
                                                            )
                                                        }
                                                        className={`
                                                            rounded-xl
                                                            border-0
                                                            px-3
                                                            py-2
                                                            text-xs
                                                            font-semibold
                                                            outline-none
                                                            ring-1
                                                            ring-inset
                                                            ring-slate-200
                                                            ${getStatusClass(
                                                                application.status,
                                                            )}
                                                        `}
                                                    >

                                                        <option value="new">
                                                            Новый
                                                        </option>


                                                        <option value="reviewing">
                                                            На рассмотрении
                                                        </option>


                                                        <option value="interview">
                                                            Собеседование
                                                        </option>


                                                        <option value="rejected">
                                                            Отклонён
                                                        </option>


                                                        <option value="hired">
                                                            Принят
                                                        </option>

                                                    </select>

                                                </div>


                                                <div className="mt-6 border-t border-slate-100 pt-5">

                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                        <div>

                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Резюме
                                                            </p>


                                                            <p className="mt-1 text-sm font-semibold text-slate-800">
                                                                {
                                                                    application
                                                                        .resume
                                                                        .title
                                                                }
                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Город
                                                            </p>


                                                            <p className="mt-1 text-sm text-slate-700">
                                                                {
                                                                    application
                                                                        .resume
                                                                        .city ??
                                                                    "Не указан"
                                                                }
                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Зарплатные ожидания
                                                            </p>


                                                            <p className="mt-1 text-sm text-slate-700">
                                                                {
                                                                    formatSalary(
                                                                        application
                                                                            .resume
                                                                            .salary_expectation,
                                                                    )
                                                                }
                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Дата отклика
                                                            </p>


                                                            <p className="mt-1 text-sm text-slate-700">
                                                                {
                                                                    formatDate(
                                                                        application.created_at,
                                                                    )
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                </div>


                                                {application.resume.about && (

                                                    <div className="mt-5 rounded-xl bg-slate-50 p-4">

                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            О кандидате
                                                        </p>


                                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                                            {
                                                                application
                                                                    .resume
                                                                    .about
                                                            }
                                                        </p>

                                                    </div>

                                                )}


                                                {application.cover_letter && (

                                                    <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/50 p-4">

                                                        <p className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                                                            Сопроводительное письмо
                                                        </p>


                                                        <p className="mt-2 text-sm leading-6 text-slate-700">
                                                            {
                                                                application.cover_letter
                                                            }
                                                        </p>

                                                    </div>

                                                )}


                                                <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <span
                                                            className={`
                                                                inline-flex
                                                                w-fit
                                                                rounded-xl
                                                                px-3
                                                                py-2
                                                                text-xs
                                                                font-semibold
                                                                ${getStatusClass(
                                                                    application.status,
                                                                )}
                                                            `}
                                                        >
                                                            {
                                                                getStatusLabel(
                                                                    application.status,
                                                                )
                                                            }
                                                        </span>


                                                        <span className="text-xs text-slate-400">
                                                            ID отклика: #
                                                            {
                                                                application.id
                                                            }
                                                        </span>

                                                    </div>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenChat(
                                                                application.id,
                                                            )
                                                        }
                                                        className={`
                                                            rounded-xl
                                                            px-4
                                                            py-2.5
                                                            text-xs
                                                            font-semibold
                                                            transition
                                                            ${
                                                                isChatSelected
                                                                    ? "bg-brand-100 text-brand-700"
                                                                    : "bg-brand-600 text-white hover:bg-brand-700"
                                                            }
                                                        `}
                                                    >

                                                        {isChatSelected
                                                            ? "Чат открыт"
                                                            : hasMessages
                                                                ? "💬 Открыть чат"
                                                                : "💬 Начать чат"}

                                                    </button>

                                                </div>

                                            </article>

                                        );

                                    },
                                )}

                            </div>

                        )}


                        {/* ================================================== */}
                        {/* Chat */}
                        {/* ================================================== */}

                        {(
                            selectedChatApplicationId !==
                            null
                            ||
                            notificationConversationId !==
                            null
                        ) && (

                            <div
                                id="employer-chat"
                                className="mt-8 scroll-mt-24"
                            >

                                <ChatPanel

                                    /*
                                     * При обычном открытии:
                                     *
                                     * applicationId →
                                     * ChatPanel сам получает/
                                     * создаёт conversation.
                                     */

                                    applicationId={
                                        notificationConversationId ===
                                        null
                                            ? selectedChatApplicationId ??
                                              undefined
                                            : undefined
                                    }


                                    /*
                                     * При переходе из notification:
                                     *
                                     * conversationId →
                                     * открываем существующий чат.
                                     */

                                    conversationId={
                                        notificationConversationId ??
                                        undefined
                                    }

                                />

                            </div>

                        )}

                    </section>

                </div>

            </div>

        </main>
    );
}