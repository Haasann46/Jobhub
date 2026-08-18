"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    getMyApplications,
} from "@/services/application";

import {
    deleteResume,
    getMyResumes,
} from "@/services/resume";

import {
    useAuthStore,
} from "@/store/auth";

import {
    Application,
    ApplicationStatus,
} from "@/types/application";

import {
    Resume,
} from "@/types/resume";

import ResumeModal from "@/components/candidate/ResumeModal";

import ChatPanel from "@/components/chat/ChatPanel";

import {
    useSearchParams,
} from "next/navigation";


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


export default function CandidatePage() {

    const searchParams =
        useSearchParams();


    /*
     * ============================================================
     * Conversation из notification
     * ============================================================
     */

    const conversationIdParam =
        searchParams.get(
            "conversation",
        );


    const parsedConversationId =
        conversationIdParam
            ? Number(
                conversationIdParam,
            )
            : null;


    const conversationId =
        parsedConversationId !== null
        &&
        Number.isInteger(
            parsedConversationId,
        )
        &&
        parsedConversationId > 0
            ? parsedConversationId
            : undefined;


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


    const [
        resumes,
        setResumes,
    ] = useState<Resume[]>([]);


    const [
        applications,
        setApplications,
    ] = useState<Application[]>([]);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    const [
        resumeModalOpen,
        setResumeModalOpen,
    ] = useState(false);


    const [
        editingResume,
        setEditingResume,
    ] = useState<Resume | null>(
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
     * Загрузка кабинета
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


        async function load() {

            setLoading(true);
            setError(null);


            try {

                const [
                    resumesResponse,
                    applicationsResponse,
                ] = await Promise.all([
                    getMyResumes(),
                    getMyApplications(),
                ]);


                setResumes(
                    resumesResponse,
                );


                setApplications(
                    applicationsResponse,
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
     * ============================================================
     * Переход к чату после notification
     * ============================================================
     *
     * Важно:
     *
     * ChatPanel находится ниже списка резюме и откликов.
     *
     * Поэтому нельзя сделать один setTimeout
     * и надеяться, что элемент уже существует.
     *
     * Пытаемся найти его несколько раз.
     * ============================================================
     */

    useEffect(() => {

        if (
            conversationId === undefined
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
            "candidate"
        ) {
            return;
        }


        let attempts = 0;

        const maxAttempts = 30;


        const scrollToChat =
            () => {

                const chatElement =
                    document.getElementById(
                        "candidate-chat",
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
        conversationId,
        initialized,
        user,
        loading,
    ]);


    async function handleDeleteResume(
        resume: Resume,
    ) {

        const confirmed =
            window.confirm(
                `Удалить резюме «${resume.title}»?`,
            );


        if (!confirmed) {
            return;
        }


        try {

            await deleteResume(
                resume.id,
            );


            setResumes(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !== resume.id,
                    ),
            );

        } catch (error: any) {

            const message =
                error?.response?.data?.detail ??
                "Не удалось удалить резюме.";


            setError(
                message,
            );

        }
    }


    function handleResumeSaved(
        savedResume: Resume,
    ) {

        setResumes(
            (current) => {

                const exists =
                    current.some(
                        (resume) =>
                            resume.id ===
                            savedResume.id,
                    );


                if (exists) {

                    return current.map(
                        (resume) =>
                            resume.id ===
                            savedResume.id
                                ? savedResume
                                : resume,
                    );

                }


                return [
                    savedResume,
                    ...current,
                ];
            },
        );
    }


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
     * Не кандидат
     * ============================================================
     */

    if (
        user.role !==
        "candidate"
    ) {

        return (
            <main className="mx-auto w-full max-w-3xl px-4 py-16">

                <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                    <div className="mb-4 text-4xl">
                        🏢
                    </div>


                    <h1 className="text-xl font-bold text-slate-900">
                        Кабинет кандидата
                    </h1>


                    <p className="mt-2 text-sm text-slate-500">
                        Этот раздел доступен только кандидатам.
                    </p>

                </div>

            </main>
        );
    }


    return (
        <>

            <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

                <div className="mb-8">

                    <p className="text-sm font-medium text-brand-600">
                        Личный кабинет
                    </p>


                    <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                        Кабинет кандидата
                    </h1>


                    <p className="mt-2 text-sm text-slate-500">
                        Управляйте резюме и отслеживайте свои отклики.
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
                                Кандидат
                            </h2>


                            <p className="mt-1 break-all text-sm text-slate-500">
                                {user.email}
                            </p>


                            <div className="mt-5 border-t border-slate-100 pt-5">

                                <div className="flex items-center justify-between text-sm">

                                    <span className="text-slate-500">
                                        Резюме
                                    </span>


                                    <span className="font-bold text-slate-900">
                                        {resumes.length}
                                    </span>

                                </div>


                                <div className="mt-3 flex items-center justify-between text-sm">

                                    <span className="text-slate-500">
                                        Отклики
                                    </span>


                                    <span className="font-bold text-slate-900">
                                        {applications.length}
                                    </span>

                                </div>

                            </div>

                        </div>

                    </aside>


                    <div className="space-y-8">

                        {/* Resumes */}

                        <section>

                            <div className="mb-4 flex items-center justify-between">

                                <div>

                                    <h2 className="text-xl font-bold text-slate-900">
                                        Мои резюме
                                    </h2>


                                    <p className="mt-1 text-sm text-slate-500">
                                        Резюме, которые можно использовать при отклике.
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={() => {

                                        setEditingResume(null);

                                        setResumeModalOpen(true);

                                    }}
                                    className="
                                        rounded-xl
                                        bg-brand-600
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-white
                                        shadow-md
                                        shadow-brand-500/20
                                        transition
                                        hover:bg-brand-700
                                    "
                                >
                                    + Создать резюме
                                </button>

                            </div>


                            {resumes.length === 0 ? (

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                                    <div className="text-4xl">
                                        📄
                                    </div>


                                    <h3 className="mt-3 font-bold text-slate-800">
                                        У вас пока нет резюме
                                    </h3>


                                    <p className="mt-1 text-sm text-slate-500">
                                        Создайте первое резюме, чтобы откликаться на вакансии.
                                    </p>


                                    <button
                                        type="button"
                                        onClick={() => {

                                            setEditingResume(null);

                                            setResumeModalOpen(true);

                                        }}
                                        className="
                                            mt-5
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
                                        Создать резюме
                                    </button>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    {resumes.map(
                                        (resume) => (

                                            <article
                                                key={resume.id}
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

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <h3 className="text-lg font-bold text-slate-900">
                                                                {resume.title}
                                                            </h3>


                                                            {resume.is_active && (

                                                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                                                                    Активно
                                                                </span>

                                                            )}

                                                        </div>


                                                        <p className="mt-1 text-sm font-medium text-brand-600">
                                                            {resume.desired_position}
                                                        </p>


                                                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">

                                                            {resume.city && (
                                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                                                                    📍 {resume.city}
                                                                </span>
                                                            )}


                                                            {resume.salary_expectation !== null && (
                                                                <span className="rounded-lg bg-slate-100 px-2.5 py-1">
                                                                    💰 ${resume.salary_expectation}
                                                                </span>
                                                            )}

                                                        </div>


                                                        {resume.about && (

                                                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                                                                {resume.about}
                                                            </p>

                                                        )}

                                                    </div>


                                                    <div className="flex shrink-0 gap-2">

                                                        <button
                                                            type="button"
                                                            onClick={() => {

                                                                setEditingResume(
                                                                    resume,
                                                                );

                                                                setResumeModalOpen(
                                                                    true,
                                                                );

                                                            }}
                                                            className="
                                                                rounded-xl
                                                                border
                                                                border-slate-200
                                                                px-3.5
                                                                py-2
                                                                text-xs
                                                                font-semibold
                                                                text-slate-700
                                                                transition
                                                                hover:bg-slate-50
                                                            "
                                                        >
                                                            Редактировать
                                                        </button>


                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDeleteResume(
                                                                    resume,
                                                                )
                                                            }
                                                            className="
                                                                rounded-xl
                                                                border
                                                                border-red-200
                                                                px-3.5
                                                                py-2
                                                                text-xs
                                                                font-semibold
                                                                text-red-600
                                                                transition
                                                                hover:bg-red-50
                                                            "
                                                        >
                                                            Удалить
                                                        </button>

                                                    </div>

                                                </div>

                                            </article>

                                        ),
                                    )}

                                </div>

                            )}

                        </section>


                        {/* Applications */}

                        <section>

                            <div className="mb-4">

                                <h2 className="text-xl font-bold text-slate-900">
                                    Мои отклики
                                </h2>


                                <p className="mt-1 text-sm text-slate-500">
                                    История отправленных откликов и их текущий статус.
                                </p>

                            </div>


                            {applications.length === 0 ? (

                                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">

                                    <div className="text-4xl">
                                        📬
                                    </div>


                                    <h3 className="mt-3 font-bold text-slate-800">
                                        Откликов пока нет
                                    </h3>


                                    <p className="mt-1 text-sm text-slate-500">
                                        Найдите подходящую вакансию и отправьте отклик.
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

                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                                    <div>

                                                        <div className="flex items-center gap-2">

                                                            <span className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
                                                                Вакансия #{application.vacancy_id}
                                                            </span>

                                                        </div>


                                                        <h3 className="mt-2 text-base font-bold text-slate-900">
                                                            Ваш отклик
                                                        </h3>


                                                        <p className="mt-1 text-sm text-slate-500">
                                                            Отправлен{" "}
                                                            {formatDate(
                                                                application.created_at,
                                                            )}
                                                        </p>


                                                        {application.cover_letter && (

                                                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                                                {application.cover_letter}
                                                            </p>

                                                        )}

                                                    </div>


                                                    <div className="shrink-0">

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
                                                            {getStatusLabel(
                                                                application.status,
                                                            )}
                                                        </span>

                                                    </div>

                                                </div>

                                            </article>

                                        ),
                                    )}

                                </div>

                            )}

                        </section>


                        {/* ================================================== */}
                        {/* Chat */}
                        {/* ================================================== */}

                        <section
                            id="candidate-chat"
                        >

                            <ChatPanel
                                conversationId={
                                    conversationId
                                }
                            />

                        </section>

                    </div>

                </div>

            </main>


            <ResumeModal
                isOpen={
                    resumeModalOpen
                }
                resume={
                    editingResume
                }
                onClose={() => {

                    setResumeModalOpen(
                        false,
                    );

                    setEditingResume(
                        null,
                    );

                }}
                onSaved={
                    handleResumeSaved
                }
            />

        </>
    );
}