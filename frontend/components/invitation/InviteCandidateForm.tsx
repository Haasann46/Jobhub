"use client";

import {
    FormEvent,
    useState,
} from "react";

import {
    createInvitation,
} from "@/services/invitation";

import {
    Invitation,
} from "@/types/invitation";


interface InviteCandidateFormProps {
    vacancyId: number;
    vacancyTitle?: string;
    initialCandidateEmail?: string;
    onSuccess?: (
        invitation: Invitation,
    ) => void;
    onClose?: () => void;
}


function getErrorMessage(
    error: any,
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

    return "Не удалось отправить приглашение.";
}


export default function InviteCandidateForm({
    vacancyId,
    vacancyTitle,
    initialCandidateEmail = "",
    onSuccess,
    onClose,
}: InviteCandidateFormProps) {

    const [
        email,
        setEmail,
    ] = useState(
        initialCandidateEmail,
    );

    const [
        message,
        setMessage,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState<string | null>(null);

    const [
        success,
        setSuccess,
    ] = useState(false);


    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>,
    ) => {

        event.preventDefault();

        setLoading(true);
        setError(null);
        setSuccess(false);

        const normalizedEmail =
            email.trim().toLowerCase();

        if (!normalizedEmail) {

            setError(
                "Введите email кандидата.",
            );

            setLoading(false);

            return;
        }

        try {

            const invitation =
                await createInvitation({
                    candidate_email:
                        normalizedEmail,
                    vacancy_id: vacancyId,
                    message:
                        message.trim() || null,
                });

            setSuccess(true);

            setEmail("");
            setMessage("");

            onSuccess?.(
                invitation,
            );

        } catch (error: any) {

            setError(
                getErrorMessage(
                    error,
                ),
            );

        } finally {

            setLoading(false);
        }
    };


    return (
        <div className="w-full">

            <div className="mb-6">

                <div className="flex items-start gap-3">

                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

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
                                d="M15 17h5l-1.4-1.4A2 2 0 0 0 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 0-.6 1.4L4 17h5"
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 20a3 3 0 0 0 6 0"
                            />

                        </svg>

                    </div>


                    <div>

                        <h2 className="text-lg font-bold text-slate-900">
                            Пригласить кандидата
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Введите email зарегистрированного кандидата.
                        </p>

                        {vacancyTitle && (
                            <p className="mt-1 text-xs text-slate-400">
                                Вакансия: {vacancyTitle}
                            </p>
                        )}

                    </div>

                </div>

            </div>


            {success && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">

                    <div className="flex items-start gap-3">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="m5 12 4 4L19 6"
                            />
                        </svg>

                        <div>

                            <p className="text-sm font-semibold text-emerald-800">
                                Приглашение отправлено
                            </p>

                            <p className="mt-1 text-xs text-emerald-700">
                                Кандидат получит уведомление
                                и сможет принять или отклонить
                                приглашение.
                            </p>

                        </div>

                    </div>

                </div>
            )}


            {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

                    <div className="flex items-start gap-3">

                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
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

                        <p className="whitespace-pre-line text-sm text-red-700">
                            {error}
                        </p>

                    </div>

                </div>
            )}


            <form
                onSubmit={handleSubmit}
                className="space-y-5"
            >

                <div>

                    <label
                        htmlFor="candidate-email"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Email кандидата
                    </label>

                    <input
                        id="candidate-email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(
                                event.target.value,
                            )
                        }
                        placeholder="candidate@gmail.com"
                        autoComplete="email"
                        required
                        disabled={loading}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <p className="mt-1.5 text-xs text-slate-400">
                        Кандидат должен быть зарегистрирован
                        в JobHub.
                    </p>

                </div>


                <div>

                    <label
                        htmlFor="invitation-message"
                        className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                        Сообщение кандидату
                        <span className="ml-1 font-normal text-slate-400">
                            (необязательно)
                        </span>
                    </label>

                    <textarea
                        id="invitation-message"
                        value={message}
                        onChange={(event) =>
                            setMessage(
                                event.target.value,
                            )
                        }
                        rows={5}
                        maxLength={2000}
                        disabled={loading}
                        placeholder="Например: Нам понравился ваш опыт. Хотели бы пригласить вас обсудить вакансию подробнее."
                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <div className="mt-1.5 flex justify-end">

                        <span className="text-xs text-slate-400">
                            {message.length}/2000
                        </span>

                    </div>

                </div>


                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Отмена
                        </button>
                    )}


                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {loading ? (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4 animate-spin"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 3v3"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M12 18v3"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m4.22 4.22 2.12 2.12"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m17.66 17.66 2.12 2.12"
                                    />
                                </svg>

                                Отправка...
                            </>
                        ) : (
                            <>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="h-4 w-4"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m22 2-7 20-4-9-9-4 20-7Z"
                                    />

                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M22 2 11 13"
                                    />
                                </svg>

                                Отправить приглашение
                            </>
                        )}

                    </button>

                </div>

            </form>

        </div>
    );
}