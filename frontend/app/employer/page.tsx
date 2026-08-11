"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    getVacancyApplications,
    getMyEmployerApplicationCount,
    updateApplicationStatus,
} from "@/services/application";

import {
    getMyVacancies,
} from "@/services/vacancy";

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

        case "NEW":
            return "Новый";

        case "REVIEWING":
            return "На рассмотрении";

        case "INTERVIEW":
            return "Собеседование";

        case "REJECTED":
            return "Отклонён";

        case "HIRED":
            return "Принят";

        default:
            return status;
    }
}


function getStatusClass(
    status: ApplicationStatus,
): string {

    switch (status) {

        case "NEW":
            return "bg-blue-50 text-blue-600";

        case "REVIEWING":
            return "bg-amber-50 text-amber-600";

        case "INTERVIEW":
            return "bg-violet-50 text-violet-600";

        case "REJECTED":
            return "bg-red-50 text-red-600";

        case "HIRED":
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


export default function EmployerPage() {

    const user = useAuthStore(
        (state) => state.user,
    );

    const initialized = useAuthStore(
        (state) => state.initialized,
    );

    const initialize = useAuthStore(
        (state) => state.initialize,
    );


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
    ] = useState<string | null>(null);


    /*
     * Инициализация авторизации
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
     * Загружаем вакансии работодателя
     */

    useEffect(() => {

        if (!initialized) {
            return;
        }

        if (!user) {
            setLoading(false);
            return;
        }

        if (user.role !== "employer") {
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
                    error?.response?.data?.detail ??
                    "Не удалось загрузить данные кабинета.";

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


    /*
     * Загружаем отклики выбранной вакансии
     */

    useEffect(() => {

        if (
            !selectedVacancy
        ) {

            setApplications([]);

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

            } catch (error: any) {

                const message =
                    error?.response?.data?.detail ??
                    "Не удалось загрузить отклики.";

                setError(
                    message,
                );

                setApplications([]);

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
     * Изменение статуса отклика
     */

    async function handleStatusChange(
        applicationId: number,
        status: ApplicationStatus,
    ) {

        setStatusUpdating(
            applicationId,
        );

        setError(null);

        try {

            const updated =
                await updateApplicationStatus(
                    applicationId,
                    status,
                );

            setApplications(
                (current) =>
                    current.map(
                        (application) =>
                            application.id ===
                            updated.id
                                ? updated
                                : application,
                    ),
            );

        } catch (error: any) {

            const message =
                error?.response?.data?.detail ??
                "Не удалось изменить статус отклика.";

            setError(
                message,
            );

        } finally {

            setStatusUpdating(
                null,
            );

        }
    }


    if (!initialized || loading) {

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


    if (user.role !== "employer") {

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

            {/* Header */}

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

                {/* Profile */}

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


                {/* Content */}

                <div className="space-y-8">

                    {/* Vacancies */}

                    <section>

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
                                    (vacancy) => {

                                        const isSelected =
                                            selectedVacancy?.id ===
                                            vacancy.id;


                                        return (

                                            <button
                                                key={vacancy.id}
                                                type="button"
                                                onClick={() => {

                                                    setSelectedVacancy(
                                                        vacancy,
                                                    );

                                                }}
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

                                                                📍 {vacancy.location}

                                                            </span>


                                                            <span className="rounded-lg bg-slate-100 px-2.5 py-1">

                                                                💰{" "}

                                                                {vacancy.salary_from !== null
                                                                    ? `${vacancy.salary_from.toLocaleString("ru-RU")} $`
                                                                    : "Зарплата не указана"}

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

                                            </button>

                                        );

                                    },
                                )}

                            </div>

                        )}

                    </section>


                    {/* Applications */}

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

                                    Откликов: {applications.length}

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
                                    (application) => (

                                        <article
                                            key={application.id}
                                            className="
                                                rounded-2xl
                                                border
                                                border-slate-200
                                                bg-white
                                                p-6
                                                shadow-sm
                                            "
                                        >

                                            {/* Candidate header */}

                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                                <div>

                                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-lg font-bold text-white">

                                                        {application.candidate_email
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>


                                                    <h3 className="mt-3 text-lg font-bold text-slate-900">

                                                        {application.candidate_email}

                                                    </h3>


                                                    <p className="mt-1 text-sm font-medium text-brand-600">

                                                        {
                                                            application.resume
                                                                .desired_position
                                                        }

                                                    </p>

                                                </div>


                                                {/* Status */}

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
                                                        ${
                                                            getStatusClass(
                                                                application.status,
                                                            )
                                                        }
                                                    `}
                                                >

                                                    <option value="NEW">
                                                        Новый
                                                    </option>

                                                    <option value="REVIEWING">
                                                        На рассмотрении
                                                    </option>

                                                    <option value="INTERVIEW">
                                                        Собеседование
                                                    </option>

                                                    <option value="REJECTED">
                                                        Отклонён
                                                    </option>

                                                    <option value="HIRED">
                                                        Принят
                                                    </option>

                                                </select>

                                            </div>


                                            {/* Resume information */}

                                            <div className="mt-6 border-t border-slate-100 pt-5">

                                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                                    <div>

                                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Резюме
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold text-slate-800">

                                                            {
                                                                application.resume
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
                                                                application.resume
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


                                            {/* About candidate */}

                                            {application.resume.about && (

                                                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        О кандидате
                                                    </p>

                                                    <p className="mt-2 text-sm leading-6 text-slate-600">

                                                        {
                                                            application.resume
                                                                .about
                                                        }

                                                    </p>

                                                </div>

                                            )}


                                            {/* Cover letter */}

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


                                            {/* Footer */}

                                            <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">

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

                                        </article>

                                    ),
                                )}

                            </div>

                        )}

                    </section>

                </div>

            </div>

        </main>
    );
}