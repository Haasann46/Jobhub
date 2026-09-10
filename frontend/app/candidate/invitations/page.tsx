"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    acceptInvitation,
    declineInvitation,
    getMyInvitations,
} from "@/services/invitation";

import {
    Invitation,
} from "@/types/invitation";


function getStatusLabel(
    status: Invitation["status"],
): string {
    switch (status) {
        case "pending":
            return "Ожидает ответа";

        case "accepted":
            return "Принято";

        case "declined":
            return "Отклонено";

        default:
            return status;
    }
}


function getStatusClasses(
    status: Invitation["status"],
): string {
    switch (status) {
        case "pending":
            return "bg-amber-50 text-amber-700 border-amber-200";

        case "accepted":
            return "bg-emerald-50 text-emerald-700 border-emerald-200";

        case "declined":
            return "bg-red-50 text-red-700 border-red-200";

        default:
            return "bg-slate-50 text-slate-700 border-slate-200";
    }
}


function formatDate(
    value: string,
): string {
    return new Date(value).toLocaleDateString(
        "ru-RU",
        {
            day: "2-digit",
            month: "long",
            year: "numeric",
        },
    );
}


function getErrorMessage(
    error: any,
    fallback: string,
): string {
    return (
        error?.response?.data?.detail ??
        error?.message ??
        fallback
    );
}


export default function CandidateInvitationsPage() {
    const [
        invitations,
        setInvitations,
    ] = useState<Invitation[]>([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [
        processingId,
        setProcessingId,
    ] = useState<number | null>(null);


    const loadInvitations = useCallback(
        async () => {
            setLoading(true);
            setError(null);

            try {
                const response =
                    await getMyInvitations();

                setInvitations(response);
            } catch (error: any) {
                setError(
                    getErrorMessage(
                        error,
                        "Не удалось загрузить приглашения.",
                    ),
                );
            } finally {
                setLoading(false);
            }
        },
        [],
    );


    useEffect(() => {
        loadInvitations();
    }, [loadInvitations]);


    const handleAccept = async (
        invitationId: number,
    ) => {
        setProcessingId(invitationId);
        setError(null);

        try {
            const updatedInvitation =
                await acceptInvitation(invitationId);

            setInvitations(
                (current) =>
                    current.map(
                        (invitation) =>
                            invitation.id === invitationId
                                ? updatedInvitation
                                : invitation,
                    ),
            );
        } catch (error: any) {
            setError(
                getErrorMessage(
                    error,
                    "Не удалось принять приглашение.",
                ),
            );
        } finally {
            setProcessingId(null);
        }
    };


    const handleDecline = async (
        invitationId: number,
    ) => {
        setProcessingId(invitationId);
        setError(null);

        try {
            const updatedInvitation =
                await declineInvitation(invitationId);

            setInvitations(
                (current) =>
                    current.map(
                        (invitation) =>
                            invitation.id === invitationId
                                ? updatedInvitation
                                : invitation,
                    ),
            );
        } catch (error: any) {
            setError(
                getErrorMessage(
                    error,
                    "Не удалось отклонить приглашение.",
                ),
            );
        } finally {
            setProcessingId(null);
        }
    };


    return (
        <main className="min-h-screen bg-slate-50">
            <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-start justify-between gap-4">

                        <div>
                            <div className="mb-2 flex items-center gap-2">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M9 20a3 3 0 0 0 6 0"
                                        />
                                    </svg>
                                </div>

                                <span className="text-sm font-medium text-slate-500">
                                    JobHub
                                </span>

                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Приглашения
                            </h1>

                            <p className="mt-2 text-sm text-slate-500">
                                Приглашения от работодателей на вакансии.
                            </p>
                        </div>


                        <button
                            type="button"
                            onClick={loadInvitations}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className={`h-4 w-4 ${
                                    loading ? "animate-spin" : ""
                                }`}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M4 4v5h5"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M20 20v-5h-5"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5.5 9A7.5 7.5 0 0 1 18 6.5L20 9"
                                />
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18.5 15A7.5 7.5 0 0 1 6 17.5L4 15"
                                />
                            </svg>

                            Обновить
                        </button>

                    </div>
                </div>


                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mt-0.5 h-5 w-5 shrink-0"
                        >
                            <circle
                                cx="12"
                                cy="12"
                                r="9"
                            />
                            <path
                                strokeLinecap="round"
                                d="M12 8v4"
                            />
                            <path
                                strokeLinecap="round"
                                d="M12 16h.01"
                            />
                        </svg>

                        <span>
                            {error}
                        </span>
                    </div>
                )}


                {/* Loading */}
                {loading && (
                    <div className="space-y-4">

                        {[1, 2, 3].map(
                            (item) => (
                                <div
                                    key={item}
                                    className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6"
                                >
                                    <div className="flex gap-4">

                                        <div className="h-12 w-12 rounded-xl bg-slate-200" />

                                        <div className="flex-1">

                                            <div className="h-4 w-1/3 rounded bg-slate-200" />

                                            <div className="mt-3 h-3 w-1/2 rounded bg-slate-200" />

                                            <div className="mt-5 h-3 w-full rounded bg-slate-200" />

                                        </div>
                                    </div>
                                </div>
                            ),
                        )}

                    </div>
                )}


                {/* Empty */}
                {!loading &&
                    invitations.length === 0 && (
                        <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">

                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.7"
                                    className="h-8 w-8"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M9 20a3 3 0 0 0 6 0"
                                    />
                                </svg>

                            </div>

                            <h2 className="mt-5 text-lg font-bold text-slate-900">
                                Пока нет приглашений
                            </h2>

                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Когда работодатель пригласит вас
                                на вакансию, приглашение появится
                                здесь.
                            </p>

                        </div>
                    )}


                {/* Invitations */}
                {!loading &&
                    invitations.length > 0 && (
                        <div className="space-y-4">

                            {invitations.map(
                                (invitation) => {
                                    const isProcessing =
                                        processingId === invitation.id;

                                    const isPending =
                                        invitation.status === "pending";

                                    return (
                                        <article
                                            key={invitation.id}
                                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:shadow-md"
                                        >
                                            <div className="p-5 sm:p-6">

                                                {/* Top */}
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                                    <div className="flex items-start gap-4">

                                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="1.8"
                                                                className="h-6 w-6"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5Z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="m4.5 7 6.2 4.6a2.2 2.2 0 0 0 2.6 0L19.5 7"
                                                                />
                                                            </svg>

                                                        </div>


                                                        <div>

                                                            <h2 className="text-lg font-bold text-slate-900">
                                                                {invitation.vacancy_title}
                                                            </h2>

                                                            <p className="mt-1 text-sm font-medium text-slate-600">
                                                                {invitation.company_name}
                                                            </p>

                                                            <p className="mt-1 text-xs text-slate-400">
                                                                Приглашение от{" "}
                                                                {invitation.employer_email}
                                                            </p>

                                                        </div>

                                                    </div>


                                                    <span
                                                        className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                            invitation.status,
                                                        )}`}
                                                    >
                                                        {getStatusLabel(
                                                            invitation.status,
                                                        )}
                                                    </span>

                                                </div>


                                                {/* Message */}
                                                {invitation.message && (
                                                    <div className="mt-5 rounded-xl bg-slate-50 px-4 py-4">

                                                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                            Сообщение работодателя
                                                        </p>

                                                        <p className="text-sm leading-6 text-slate-700">
                                                            {invitation.message}
                                                        </p>

                                                    </div>
                                                )}


                                                {/* Bottom */}
                                                <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                                                    <p className="text-xs text-slate-400">
                                                        Получено{" "}
                                                        {formatDate(
                                                            invitation.created_at,
                                                        )}
                                                    </p>


                                                    {isPending && (
                                                        <div className="flex flex-col gap-2 sm:flex-row">

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDecline(
                                                                        invitation.id,
                                                                    )
                                                                }
                                                                disabled={isProcessing}
                                                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {isProcessing
                                                                    ? "Обработка..."
                                                                    : "Отклонить"}
                                                            </button>


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAccept(
                                                                        invitation.id,
                                                                    )
                                                                }
                                                                disabled={isProcessing}
                                                                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                {isProcessing
                                                                    ? "Обработка..."
                                                                    : "Принять приглашение"}
                                                            </button>

                                                        </div>
                                                    )}

                                                </div>

                                            </div>
                                        </article>
                                    );
                                },
                            )}

                        </div>
                    )}

            </div>
        </main>
    );
}