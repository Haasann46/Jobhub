"use client";

import {
    useCallback,
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
    updateVacancy,
} from "@/services/vacancy";

import {
    getConversationByApplication,
    getMyConversations,
} from "@/services/conversation";

import {
    getConversationMessages,
} from "@/services/message";

import {
    getUnreadNotificationCount,
} from "@/services/notification";

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

import InviteCandidateForm from "@/components/invitation/InviteCandidateForm";

import {
    Invitation,
} from "@/types/invitation";


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


function formatSalary(
    salary: number | null,
    currency = "USD",
): string {

    if (salary === null) {

        return "Не указана";
    }

    const symbols: Record<
        string,
        string
    > = {
        USD: "$",
        EUR: "€",
        AZN: "₼",
        RUB: "₽",
        GBP: "£",
    };

    const symbol =
        symbols[currency] ??
        currency;

    return `${salary.toLocaleString(
        "ru-RU",
    )} ${symbol}`;
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
        newApplicationsCount,
        setNewApplicationsCount,
    ] = useState(0);

    const [
        unreadNotifications,
        setUnreadNotifications,
    ] = useState(0);

    const [
        unreadMessages,
        setUnreadMessages,
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
        expandedApplicationId,
        setExpandedApplicationId,
    ] = useState<number | null>(
        null,
    );

    const [
        invitationApplication,
        setInvitationApplication,
    ] = useState<EmployerApplication | null>(
        null,
    );

    const [
        invitationVacancy,
        setInvitationVacancy,
    ] = useState<Vacancy | null>(
        null,
    );

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        applicationsLoading,
        setApplicationsLoading,
    ] = useState(false);

    const [
        dashboardRefreshing,
        setDashboardRefreshing,
    ] = useState(false);

    const [
        vacancyUpdating,
        setVacancyUpdating,
    ] = useState<number | null>(
        null,
    );

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


    useEffect(() => {

        if (!initialized) {

            initialize();
        }

    }, [
        initialized,
        initialize,
    ]);


    const loadDashboard =
        useCallback(
            async (
                showMainLoading = true,
            ) => {

                if (
                    !initialized
                    ||
                    !user
                    ||
                    user.role !== "employer"
                ) {

                    return;
                }

                if (showMainLoading) {

                    setLoading(true);

                } else {

                    setDashboardRefreshing(
                        true,
                    );
                }

                setError(null);

                try {

                    const [
                        vacanciesResponse,
                        applicationsCountResponse,
                        unreadNotificationResponse,
                        conversationsResponse,
                    ] = await Promise.all([
                        getMyVacancies(),
                        getMyEmployerApplicationCount(),
                        getUnreadNotificationCount(),
                        getMyConversations(),
                    ]);


                    /*
                     * ----------------------------------------------------
                     * Overview statistics
                     * ----------------------------------------------------
                     *
                     * Active vacancies are calculated from the employer's
                     * own vacancies.
                     *
                     * New applications are calculated from the
                     * applications belonging to the employer's vacancies.
                     *
                     * We use the existing applications endpoint instead
                     * of creating a new backend endpoint.
                     */

                    let newApplications = 0;

                    if (
                        vacanciesResponse.length > 0
                    ) {

                        const applicationsByVacancy =
                            await Promise.all(
                                vacanciesResponse.map(
                                    async (
                                        vacancy,
                                    ) => {

                                        try {

                                            return await getVacancyApplications(
                                                vacancy.id,
                                            );

                                        } catch {

                                            return [];
                                        }
                                    },
                                ),
                            );


                        newApplications =
                            applicationsByVacancy.reduce(
                                (
                                    total,
                                    vacancyApplications,
                                ) =>
                                    total +
                                    vacancyApplications.filter(
                                        (
                                            application,
                                        ) =>
                                            application.status ===
                                            "new",
                                    ).length,
                                0,
                            );
                    }


                    setVacancies(
                        vacanciesResponse,
                    );

                    setApplicationsCount(
                        applicationsCountResponse,
                    );

                    setNewApplicationsCount(
                        newApplications,
                    );

                    setUnreadNotifications(
                        unreadNotificationResponse,
                    );

                    setUnreadMessages(
                        conversationsResponse.reduce(
                            (
                                total,
                                conversation,
                            ) =>
                                total +
                                conversation.unread_count,
                            0,
                        ),
                    );

                    setSelectedVacancy(
                        (current) => {

                            if (!current) {

                                return null;
                            }

                            return (
                                vacanciesResponse.find(
                                    (vacancy) =>
                                        vacancy.id ===
                                        current.id,
                                ) ??
                                null
                            );
                        },
                    );

                } catch (error: any) {

                    setError(
                        getApiErrorMessage(
                            error,
                            "Не удалось загрузить данные кабинета.",
                        ),
                    );

                } finally {

                    if (showMainLoading) {

                        setLoading(false);

                    } else {

                        setDashboardRefreshing(
                            false,
                        );
                    }
                }
            },
            [
                initialized,
                user,
            ],
        );


    useEffect(() => {

        if (
            !initialized
            ||
            !user
            ||
            user.role !== "employer"
        ) {

            setLoading(false);

            return;
        }

        loadDashboard();

    }, [
        initialized,
        user,
        loadDashboard,
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


    const loadApplications =
        useCallback(
            async (
                vacancyId: number,
            ) => {

                setApplicationsLoading(
                    true,
                );

                setError(null);

                try {

                    const response =
                        await getVacancyApplications(
                            vacancyId,
                        );

                    setApplications(
                        response,
                    );

                    const messageStates:
                        Record<number, boolean> =
                        {};

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
                                    ] =
                                        false;
                                }
                            },
                        ),
                    );

                    setApplicationHasMessages(
                        messageStates,
                    );

                } catch (error: any) {

                    setError(
                        getApiErrorMessage(
                            error,
                            "Не удалось загрузить отклики.",
                        ),
                    );

                    setApplications([]);

                    setApplicationHasMessages(
                        {},
                    );

                } finally {

                    setApplicationsLoading(
                        false,
                    );
                }
            },
            [],
        );


    useEffect(() => {

        if (!selectedVacancy) {

            setApplications([]);

            setSelectedChatApplicationId(
                null,
            );

            setExpandedApplicationId(
                null,
            );

            setApplicationHasMessages(
                {},
            );

            return;
        }

        loadApplications(
            selectedVacancy.id,
        );

    }, [
        selectedVacancy,
        loadApplications,
    ]);


    async function handleRefreshApplications() {

        if (!selectedVacancy) {

            return;
        }

        await loadApplications(
            selectedVacancy.id,
        );

        await loadDashboard(
            false,
        );
    }


    async function handleToggleVacancy(
        vacancy: Vacancy,
    ) {

        setVacancyUpdating(
            vacancy.id,
        );

        setError(null);

        try {

            const updated =
                await updateVacancy(
                    vacancy.id,
                    {
                        is_active:
                            !vacancy.is_active,
                    },
                );

            setVacancies(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            updated.id
                                ? updated
                                : item,
                    ),
            );

            setSelectedVacancy(
                (current) =>
                    current?.id ===
                    updated.id
                        ? updated
                        : current,
            );

        } catch (error: any) {

            setError(
                getApiErrorMessage(
                    error,
                    "Не удалось изменить статус вакансии.",
                ),
            );

        } finally {

            setVacancyUpdating(
                null,
            );
        }
    }


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

            await loadApplications(
                selectedVacancy.id,
            );

            await loadDashboard(
                false,
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


    async function handleDeleteVacancy(
        vacancy: Vacancy,
    ) {

        const confirmed =
            window.confirm(
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

                setApplications([]);

            }

            await loadDashboard(
                false,
            );

        } catch (error: any) {

            setError(
                getApiErrorMessage(
                    error,
                    "Не удалось удалить вакансию.",
                ),
            );
        }
    }


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
            ||
            user.role !== "employer"
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


    const activeVacanciesCount =
        vacancies.filter(
            (vacancy) =>
                vacancy.is_active,
        ).length;


    return (

        <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>

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


                <button
                    type="button"
                    disabled={dashboardRefreshing}
                    onClick={() =>
                        loadDashboard(
                            false,
                        )
                    }
                    className="rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {dashboardRefreshing
                        ? "Обновление..."
                        : "↻ Обновить кабинет"}
                </button>

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


            {/* ============================================================
                OVERVIEW
            ============================================================ */}

            <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">

                {/* Active vacancies */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Активные вакансии
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                        {activeVacanciesCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Сейчас опубликованы
                    </p>

                </div>


                {/* Total applications */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Отклики
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                        {applicationsCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        На все вакансии
                    </p>

                </div>


                {/* New applications */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Новые отклики
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                        {newApplicationsCount}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Требуют рассмотрения
                    </p>

                </div>


                {/* Unread messages */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Сообщения
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                        {unreadMessages}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Непрочитанных
                    </p>

                </div>


                {/* Unread notifications */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Уведомления
                    </p>

                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                        {unreadNotifications}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        Непрочитанных
                    </p>

                </div>

            </div>


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
                                    Активные вакансии
                                </span>

                                <span className="font-bold text-slate-900">
                                    {activeVacanciesCount}
                                </span>

                            </div>


                            <div className="mt-3 flex items-center justify-between text-sm">

                                <span className="text-slate-500">
                                    Всего вакансий
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


                            <div className="mt-3 flex items-center justify-between text-sm">

                                <span className="text-slate-500">
                                    Новые отклики
                                </span>

                                <span className="font-bold text-brand-600">
                                    {newApplicationsCount}
                                </span>

                            </div>

                        </div>

                    </div>

                </aside>


                <div className="space-y-8">

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
                                    className="mt-5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700"
                                >
                                    Создать компанию
                                </button>

                            </div>

                        )}

                        {companyError && (

                            <p className="mt-3 text-sm text-red-600">
                                {companyError}
                            </p>

                        )}

                    </section>


                    <section>

                        <div className="mb-4">

                            <h2 className="text-xl font-bold text-slate-900">
                                Мои вакансии
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Управляйте публикацией вакансий и просматривайте отклики.
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
                                    (vacancy) => {

                                        const isSelected =
                                            selectedVacancy?.id ===
                                            vacancy.id;

                                        const updating =
                                            vacancyUpdating ===
                                            vacancy.id;

                                        return (

                                            <article
                                                key={
                                                    vacancy.id
                                                }
                                                className={`
                                                    rounded-2xl
                                                    border
                                                    bg-white
                                                    p-6
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

                                                        router.push(
                                                            `/vacancies/${vacancy.id}`,
                                                        );

                                                    }}
                                                    onKeyDown={(
                                                        event,
                                                    ) => {

                                                        if (
                                                            event.key ===
                                                                "Enter"
                                                            ||
                                                            event.key ===
                                                                " "
                                                        ) {

                                                            event.preventDefault();

                                                            router.push(
                                                                `/vacancies/${vacancy.id}`,
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


                                                                <span
                                                                    className={`
                                                                        rounded-md
                                                                        px-2
                                                                        py-1
                                                                        text-xs
                                                                        font-semibold
                                                                        ${
                                                                            vacancy.is_active
                                                                                ? "bg-emerald-50 text-emerald-600"
                                                                                : "bg-slate-100 text-slate-500"
                                                                        }
                                                                    `}
                                                                >
                                                                    {vacancy.is_active
                                                                        ? "Активна"
                                                                        : "Неактивна"}
                                                                </span>


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
                                                                            ? formatSalary(
                                                                                vacancy.salary_from,
                                                                                vacancy.currency,
                                                                            )
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
                                                            Открыть карточку →
                                                        </span>

                                                    </div>


                                                    <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                updating
                                                            }
                                                            onClick={(
                                                                event,
                                                            ) => {

                                                                event.stopPropagation();

                                                                handleToggleVacancy(
                                                                    vacancy,
                                                                );

                                                            }}
                                                            className={`
                                                                rounded-xl
                                                                px-4
                                                                py-2.5
                                                                text-xs
                                                                font-semibold
                                                                transition
                                                                disabled:cursor-not-allowed
                                                                disabled:opacity-60
                                                                ${
                                                                    vacancy.is_active
                                                                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                                                                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                                                }
                                                            `}
                                                        >
                                                            {updating
                                                                ? "Сохранение..."
                                                                : vacancy.is_active
                                                                    ? "Деактивировать"
                                                                    : "Активировать"}
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                event,
                                                            ) => {

                                                                event.stopPropagation();

                                                                setSelectedVacancy(
                                                                    vacancy,
                                                                );

                                                                setSelectedChatApplicationId(
                                                                    null,
                                                                );

                                                            }}
                                                            className="rounded-xl bg-brand-50 px-4 py-2.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100"
                                                        >
                                                            Отклики
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                event,
                                                            ) => {

                                                                event.stopPropagation();

                                                                setInvitationVacancy(
                                                                    vacancy,
                                                                );

                                                            }}
                                                            className="rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                                                        >
                                                            ✉ Пригласить кандидата
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                event,
                                                            ) => {

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
                                                            onClick={(
                                                                event,
                                                            ) => {

                                                                event.stopPropagation();

                                                                handleDeleteVacancy(
                                                                    vacancy,
                                                                );

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

                                <button
                                    type="button"
                                    disabled={
                                        applicationsLoading
                                    }
                                    onClick={
                                        handleRefreshApplications
                                    }
                                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {applicationsLoading
                                        ? "Обновление..."
                                        : "↻ Обновить"}
                                </button>
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

                                        const profile =
                                            application.profile;

                                        const isExpanded =
                                            expandedApplicationId ===
                                            application.id;

                                        const fullName =
                                            [
                                                profile?.first_name,
                                                profile?.last_name,
                                            ]
                                                .filter(
                                                    Boolean,
                                                )
                                                .join(
                                                    " ",
                                                );

                                        return (

                                            <article
                                                key={
                                                    application.id
                                                }
                                                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                                            >

                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                                    <div className="flex items-start gap-4">

                                                        {profile?.avatar_url ? (

                                                            <img
                                                                src={
                                                                    profile.avatar_url
                                                                }
                                                                alt=""
                                                                className="h-14 w-14 rounded-xl object-cover ring-1 ring-slate-200"
                                                            />

                                                        ) : (

                                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-lg font-bold text-white">

                                                                {application.candidate_email
                                                                    .charAt(
                                                                        0,
                                                                    )
                                                                    .toUpperCase()}

                                                            </div>
                                                        )}


                                                        <div>

                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                {
                                                                    fullName ||
                                                                    application.candidate_email
                                                                }
                                                            </h3>

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {
                                                                    application.candidate_email
                                                                }
                                                            </p>

                                                            <p className="mt-1 text-sm font-medium text-brand-600">
                                                                {
                                                                    application.resume.desired_position
                                                                }
                                                            </p>

                                                        </div>

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
                                                                    application.resume.title
                                                                }
                                                            </p>

                                                        </div>


                                                        <div>

                                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                Город
                                                            </p>

                                                            <p className="mt-1 text-sm text-slate-700">
                                                                {
                                                                    application.resume.city ??
                                                                    profile?.city ??
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
                                                                        application.resume.salary_expectation,
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
                                                            О кандидате в резюме
                                                        </p>

                                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                                            {
                                                                application.resume.about
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


                                                    <div className="flex flex-wrap gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setExpandedApplicationId(
                                                                    isExpanded
                                                                        ? null
                                                                        : application.id,
                                                                )
                                                            }
                                                            className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                                                        >
                                                            {isExpanded
                                                                ? "Скрыть профиль"
                                                                : "Профиль кандидата"}
                                                        </button>


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


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setInvitationApplication(
                                                                    application,
                                                                )
                                                            }
                                                            className="rounded-xl bg-violet-50 px-4 py-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
                                                        >
                                                            ✉ Пригласить
                                                        </button>

                                                    </div>

                                                </div>


                                                {isExpanded && (

                                                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">

                                                        <div className="flex items-center justify-between">

                                                            <div>

                                                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                    Профиль кандидата
                                                                </p>

                                                                <h4 className="mt-1 text-lg font-bold text-slate-900">
                                                                    {
                                                                        fullName ||
                                                                        "Профиль без имени"
                                                                    }
                                                                </h4>

                                                            </div>

                                                        </div>


                                                        {profile ? (

                                                            <div className="mt-5 space-y-5">

                                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Телефон
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-slate-700">
                                                                            {
                                                                                profile.phone ??
                                                                                "Не указан"
                                                                            }
                                                                        </p>

                                                                    </div>


                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Город
                                                                        </p>

                                                                        <p className="mt-1 text-sm text-slate-700">
                                                                            {
                                                                                profile.city ??
                                                                                application.resume.city ??
                                                                                "Не указан"
                                                                            }
                                                                        </p>

                                                                    </div>

                                                                </div>


                                                                {profile.bio && (

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            О себе
                                                                        </p>

                                                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                            {
                                                                                profile.bio
                                                                            }
                                                                        </p>

                                                                    </div>

                                                                )}


                                                                {profile.skills.length >
                                                                    0 && (

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Навыки
                                                                        </p>

                                                                        <div className="mt-2 flex flex-wrap gap-2">

                                                                            {profile.skills.map(
                                                                                (
                                                                                    skill,
                                                                                    index,
                                                                                ) => (

                                                                                    <span
                                                                                        key={`${skill}-${index}`}
                                                                                        className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                                                                                    >
                                                                                        {
                                                                                            skill
                                                                                        }
                                                                                    </span>

                                                                                ),
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}


                                                                {profile.experience.length >
                                                                    0 && (

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Опыт работы
                                                                        </p>

                                                                        <div className="mt-3 space-y-3">

                                                                            {profile.experience.map(
                                                                                (
                                                                                    item,
                                                                                    index,
                                                                                ) => (

                                                                                    <div
                                                                                        key={`${item.company}-${item.position}-${index}`}
                                                                                        className="rounded-xl bg-white p-4 ring-1 ring-slate-200"
                                                                                    >

                                                                                        <p className="font-semibold text-slate-900">
                                                                                            {
                                                                                                item.position
                                                                                            }
                                                                                        </p>

                                                                                        <p className="mt-1 text-sm text-brand-600">
                                                                                            {
                                                                                                item.company
                                                                                            }
                                                                                        </p>

                                                                                        <p className="mt-1 text-xs text-slate-400">
                                                                                            {
                                                                                                item.start_date
                                                                                            }
                                                                                            {" — "}
                                                                                            {
                                                                                                item.end_date ??
                                                                                                "по настоящее время"
                                                                                            }
                                                                                        </p>

                                                                                        {item.description && (

                                                                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                                                                {
                                                                                                    item.description
                                                                                                }
                                                                                            </p>

                                                                                        )}

                                                                                    </div>
                                                                                ),
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}


                                                                {profile.education.length >
                                                                    0 && (

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Образование
                                                                        </p>

                                                                        <div className="mt-3 space-y-3">

                                                                            {profile.education.map(
                                                                                (
                                                                                    item,
                                                                                    index,
                                                                                ) => (

                                                                                    <div
                                                                                        key={`${item.institution}-${index}`}
                                                                                        className="rounded-xl bg-white p-4 ring-1 ring-slate-200"
                                                                                    >

                                                                                        <p className="font-semibold text-slate-900">
                                                                                            {
                                                                                                item.institution
                                                                                            }
                                                                                        </p>

                                                                                        {(item.degree ||
                                                                                            item.field) && (

                                                                                            <p className="mt-1 text-sm text-slate-600">
                                                                                                {
                                                                                                    [
                                                                                                        item.degree,
                                                                                                        item.field,
                                                                                                    ]
                                                                                                        .filter(
                                                                                                            Boolean,
                                                                                                        )
                                                                                                        .join(
                                                                                                            " • ",
                                                                                                        )
                                                                                                }
                                                                                            </p>

                                                                                        )}

                                                                                        {(item.start_date ||
                                                                                            item.end_date) && (

                                                                                            <p className="mt-1 text-xs text-slate-400">
                                                                                                {
                                                                                                    item.start_date ??
                                                                                                    ""
                                                                                                }
                                                                                                {" — "}
                                                                                                {
                                                                                                    item.end_date ??
                                                                                                    "по настоящее время"
                                                                                                }
                                                                                            </p>

                                                                                        )}

                                                                                    </div>
                                                                                ),
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}


                                                                {profile.languages.length >
                                                                    0 && (

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Языки
                                                                        </p>

                                                                        <div className="mt-2 flex flex-wrap gap-2">

                                                                            {profile.languages.map(
                                                                                (
                                                                                    language,
                                                                                    index,
                                                                                ) => (

                                                                                    <span
                                                                                        key={`${language.name}-${index}`}
                                                                                        className="rounded-lg bg-white px-3 py-2 text-xs font-medium text-slate-700 ring-1 ring-slate-200"
                                                                                    >
                                                                                        {
                                                                                            language.name
                                                                                        }
                                                                                        {" — "}
                                                                                        {
                                                                                            language.level
                                                                                        }
                                                                                    </span>

                                                                                ),
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}


                                                                {profile.projects.length >
                                                                    0 && (

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Личные проекты
                                                                        </p>

                                                                        <div className="mt-3 space-y-3">

                                                                            {profile.projects.map(
                                                                                (
                                                                                    project,
                                                                                    index,
                                                                                ) => (

                                                                                    <div
                                                                                        key={`${project.name}-${index}`}
                                                                                        className="rounded-xl bg-white p-4 ring-1 ring-slate-200"
                                                                                    >

                                                                                        <p className="font-semibold text-slate-900">
                                                                                            {
                                                                                                project.name
                                                                                            }
                                                                                        </p>

                                                                                        {project.description && (

                                                                                            <p className="mt-2 text-sm leading-6 text-slate-600">
                                                                                                {
                                                                                                    project.description
                                                                                                }
                                                                                            </p>

                                                                                        )}

                                                                                        {project.url && (

                                                                                            <a
                                                                                                href={
                                                                                                    project.url
                                                                                                }
                                                                                                target="_blank"
                                                                                                rel="noreferrer"
                                                                                                className="mt-2 inline-block text-xs font-semibold text-brand-600 hover:text-brand-700"
                                                                                            >
                                                                                                Открыть проект →
                                                                                            </a>

                                                                                        )}

                                                                                    </div>
                                                                                ),
                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}


                                                                {(profile.github_url ||
                                                                    profile.linkedin_url) && (

                                                                    <div>

                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                                            Ссылки
                                                                        </p>

                                                                        <div className="mt-2 flex flex-wrap gap-2">

                                                                            {profile.github_url && (

                                                                                <a
                                                                                    href={
                                                                                        profile.github_url
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                                                                                >
                                                                                    GitHub →
                                                                                </a>

                                                                            )}

                                                                            {profile.linkedin_url && (

                                                                                <a
                                                                                    href={
                                                                                        profile.linkedin_url
                                                                                    }
                                                                                    target="_blank"
                                                                                    rel="noreferrer"
                                                                                    className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
                                                                                >
                                                                                    LinkedIn →
                                                                                </a>

                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                )}

                                                            </div>

                                                        ) : (

                                                            <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-500 ring-1 ring-slate-200">
                                                                Профиль кандидата пока не заполнен.
                                                            </div>

                                                        )}

                                                    </div>

                                                )}

                                            </article>
                                        );
                                    },
                                )}

                            </div>
                        )}


                        {invitationApplication && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
                                <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

                                    <div className="mb-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInvitationApplication(null)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                            aria-label="Закрыть"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <InviteCandidateForm
                                        vacancyId={
                                            selectedVacancy?.id ??
                                            invitationApplication.vacancy_id
                                        }
                                        initialCandidateEmail={
                                            invitationApplication.candidate_email
                                        }
                                        vacancyTitle={
                                            selectedVacancy?.title ??
                                            undefined
                                        }
                                        onSuccess={(
                                            _invitation: Invitation,
                                        ) => {
                                            window.setTimeout(() => {
                                                setInvitationApplication(null);
                                            }, 1200);
                                        }}
                                        onClose={() =>
                                            setInvitationApplication(null)
                                        }
                                    />

                                </div>
                            </div>
                        )}

                        {invitationVacancy && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6">
                                <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

                                    <div className="mb-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setInvitationVacancy(null)
                                            }
                                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                                            aria-label="Закрыть"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <InviteCandidateForm
                                        vacancyId={
                                            invitationVacancy.id
                                        }
                                        vacancyTitle={
                                            invitationVacancy.title
                                        }
                                        onSuccess={(
                                            _invitation: Invitation,
                                        ) => {
                                            window.setTimeout(() => {
                                                setInvitationVacancy(null);
                                            }, 1200);
                                        }}
                                        onClose={() =>
                                            setInvitationVacancy(null)
                                        }
                                    />

                                </div>
                            </div>
                        )}


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
                                    applicationId={
                                        notificationConversationId ===
                                        null
                                            ? selectedChatApplicationId ??
                                              undefined
                                            : undefined
                                    }
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

