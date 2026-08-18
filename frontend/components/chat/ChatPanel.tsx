"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    getMyConversations,
    getOrCreateConversation,
    getConversation,
} from "@/services/conversation";

import {
    createMessage,
    getConversationMessages,
    markConversationAsRead,
} from "@/services/message";

import {
    Conversation,
    ConversationListItem,
} from "@/types/conversation";

import {
    Message,
} from "@/types/message";

import {
    useAuthStore,
} from "@/store/auth";


interface ChatPanelProps {

    /*
     * Работодатель открывает чат
     * по конкретному отклику.
     */
    applicationId?: number;

    /*
     * Открыть конкретный conversation.
     *
     * Используется, например,
     * при переходе из уведомления.
     */
    conversationId?: number;
}


/*
 * ============================================================
 * API ERROR
 * ============================================================
 */

function getApiErrorMessage(
    error: any,
    fallback: string,
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


    return fallback;
}


/*
 * ============================================================
 * MESSAGE TIME
 * ============================================================
 */

function formatMessageTime(
    value: string,
): string {

    return new Date(
        value,
    ).toLocaleTimeString(
        "ru-RU",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );
}


/*
 * ============================================================
 * CONVERSATION DATE
 * ============================================================
 */

function formatConversationDate(
    value: string | null,
): string {

    if (!value) {
        return "";
    }


    return new Date(
        value,
    ).toLocaleDateString(
        "ru-RU",
        {
            day: "numeric",
            month: "short",
        },
    );
}


/*
 * ============================================================
 * COMPONENT
 * ============================================================
 */

export default function ChatPanel({
    applicationId,
    conversationId,
}: ChatPanelProps) {

    const user = useAuthStore(
        (state) => state.user,
    );


    /*
     * ============================================================
     * STATE
     * ============================================================
     */

    const [
        conversations,
        setConversations,
    ] = useState<
        ConversationListItem[]
    >([]);


    const [
        selectedConversation,
        setSelectedConversation,
    ] = useState<
        ConversationListItem | null
    >(null);


    const [
        directConversation,
        setDirectConversation,
    ] = useState<
        Conversation | null
    >(null);


    const [
        messages,
        setMessages,
    ] = useState<Message[]>([]);


    const [
        messageText,
        setMessageText,
    ] = useState("");


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        messagesLoading,
        setMessagesLoading,
    ] = useState(false);


    const [
        sending,
        setSending,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(null);


    /*
     * Ссылка на последний message.
     *
     * Используется для автоматического
     * scroll вниз после загрузки/отправки.
     */
    const messagesEndRef =
        useRef<HTMLDivElement | null>(
            null,
        );


    /*
     * ============================================================
     * LOAD CONVERSATIONS
     * ============================================================
     *
     * Обычный режим:
     *
     * GET /conversations/my
     *
     * Если передан conversationId:
     *
     * Notification
     *      ↓
     * ChatPanel
     *      ↓
     * нужный conversation
     *
     * Если applicationId передан,
     * этот effect не работает.
     */

    useEffect(() => {

        if (!user) {
            return;
        }


        if (
            applicationId !==
            undefined
        ) {
            return;
        }


        async function loadConversations() {

            setLoading(true);
            setError(null);


            try {

                const response =
                    await getMyConversations();


                setConversations(
                    response,
                );


                /*
                 * Если ChatPanel открыт
                 * из notification.
                 */
                if (
                    conversationId !==
                    undefined
                ) {

                    const target =
                        response.find(
                            (
                                conversation,
                            ) =>
                                conversation.id ===
                                conversationId,
                        );


                    if (target) {

                        setSelectedConversation(
                            target,
                        );

                    } else {

                        /*
                         * Если conversation
                         * по какой-то причине
                         * не оказался в /my.
                         */

                        try {

                            const conversation =
                                await getConversation(
                                    conversationId,
                                );


                            const fallback:
                                ConversationListItem = {

                                id:
                                    conversation.id,

                                application_id:
                                    conversation.application_id,

                                other_user_id:
                                    0,

                                other_user_email:
                                    "Собеседник",

                                vacancy_id:
                                    0,

                                vacancy_title:
                                    "Диалог",

                                unread_count:
                                    0,

                                last_message:
                                    null,

                                last_message_at:
                                    null,

                                created_at:
                                    conversation.created_at,

                                updated_at:
                                    conversation.updated_at,
                            };


                            setSelectedConversation(
                                fallback,
                            );

                        } catch (
                            conversationError
                        ) {

                            setError(
                                getApiErrorMessage(
                                    conversationError,
                                    "Не удалось открыть этот чат.",
                                ),
                            );

                        }

                    }

                }

            } catch (error: any) {

                setError(
                    getApiErrorMessage(
                        error,
                        "Не удалось загрузить диалоги.",
                    ),
                );

            } finally {

                setLoading(false);

            }

        }


        loadConversations();

    }, [
        user,
        applicationId,
        conversationId,
    ]);


    /*
     * ============================================================
     * EMPLOYER APPLICATION MODE
     * ============================================================
     *
     * Работодатель открывает ChatPanel
     * по applicationId.
     *
     * В этом случае получаем или создаём
     * conversation.
     */

    useEffect(() => {

        if (
            applicationId ===
            undefined
            ||
            !user
        ) {
            return;
        }


        async function loadDirectConversation() {

            setLoading(true);
            setError(null);


            try {

                const conversation =
                    await getOrCreateConversation(
                        applicationId,
                    );


                setDirectConversation(
                    conversation,
                );

            } catch (error: any) {

                setError(
                    getApiErrorMessage(
                        error,
                        "Не удалось открыть чат.",
                    ),
                );

            } finally {

                setLoading(false);

            }

        }


        loadDirectConversation();

    }, [
        applicationId,
        user,
    ]);


    /*
     * ============================================================
     * ACTIVE CONVERSATION
     * ============================================================
     */

    const activeConversationId =
        applicationId !== undefined
            ? directConversation?.id
            : selectedConversation?.id;


    /*
     * ============================================================
     * LOAD MESSAGES
     * ============================================================
     */

    useEffect(() => {

        if (
            activeConversationId ===
            undefined
        ) {

            setMessages([]);

            return;
        }


        async function loadMessages() {

            setMessagesLoading(true);
            setError(null);


            try {

                const response =
                    await getConversationMessages(
                        activeConversationId,
                    );


                setMessages(
                    response,
                );


                /*
                 * После открытия conversation
                 * помечаем входящие сообщения
                 * прочитанными.
                 */

                await markConversationAsRead(
                    activeConversationId,
                );


                /*
                 * Обнуляем unread_count
                 * открытого conversation.
                 */

                if (
                    applicationId ===
                    undefined
                ) {

                    setConversations(
                        (current) =>
                            current.map(
                                (
                                    conversation,
                                ) =>
                                    conversation.id ===
                                    activeConversationId
                                        ? {
                                            ...conversation,
                                            unread_count: 0,
                                        }
                                        : conversation,
                            ),
                    );

                }

            } catch (error: any) {

                setError(
                    getApiErrorMessage(
                        error,
                        "Не удалось загрузить сообщения.",
                    ),
                );

            } finally {

                setMessagesLoading(false);

            }

        }


        loadMessages();

    }, [
        activeConversationId,
        applicationId,
    ]);


    /*
     * ============================================================
     * AUTO SCROLL
     * ============================================================
     */

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
        });

    }, [
        messages,
    ]);


    /*
     * ============================================================
     * SEND MESSAGE
     * ============================================================
     */

    async function handleSendMessage() {

        if (
            activeConversationId ===
            undefined
            ||
            !messageText.trim()
            ||
            sending
        ) {
            return;
        }


        const content =
            messageText.trim();


        setSending(true);
        setError(null);


        try {

            const message =
                await createMessage(
                    activeConversationId,
                    {
                        content,
                    },
                );


            /*
             * Сразу добавляем сообщение
             * в UI.
             */

            setMessages(
                (current) => [
                    ...current,
                    message,
                ],
            );


            setMessageText("");


            /*
             * Обновляем preview
             * conversation.
             */

            if (
                applicationId ===
                undefined
            ) {

                setConversations(
                    (current) =>
                        current.map(
                            (
                                conversation,
                            ) =>
                                conversation.id ===
                                activeConversationId
                                    ? {
                                        ...conversation,

                                        last_message:
                                            message.content,

                                        last_message_at:
                                            message.created_at,

                                        updated_at:
                                            message.created_at,

                                        unread_count:
                                            0,
                                    }
                                    : conversation,
                        ),
                );

            }

        } catch (error: any) {

            setError(
                getApiErrorMessage(
                    error,
                    "Не удалось отправить сообщение.",
                ),
            );

        } finally {

            setSending(false);

        }

    }


    /*
     * ============================================================
     * KEYBOARD
     * ============================================================
     *
     * Enter:
     *     отправить
     *
     * Shift + Enter:
     *     новая строка
     */

    function handleKeyDown(
        event: React.KeyboardEvent<HTMLTextAreaElement>,
    ) {

        if (
            event.key === "Enter"
            &&
            !event.shiftKey
        ) {

            event.preventDefault();

            handleSendMessage();

        }

    }


    /*
     * ============================================================
     * LOADING
     * ============================================================
     */

    if (loading) {

        return (
            <section className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">

                <div className="text-3xl">
                    💬
                </div>

                <p className="mt-3 text-sm text-slate-500">
                    Загрузка сообщений...
                </p>

            </section>
        );

    }


    /*
     * ============================================================
     * HEADER DATA
     * ============================================================
     */

    const otherUserEmail =
        applicationId !== undefined
            ? "Кандидат"
            : selectedConversation?.other_user_email;


    const vacancyTitle =
        applicationId !== undefined
            ? "Диалог по отклику"
            : selectedConversation?.vacancy_title;


    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <section>

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

            <div className="mb-4">

                <h2 className="text-xl font-bold text-slate-900">
                    Сообщения
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Общайтесь с работодателями и кандидатами.
                </p>

            </div>


            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (

                <div className="mb-4 whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>

            )}


            {/* ================================================== */}
            {/* CHAT CONTAINER */}
            {/* ================================================== */}

            <div
                className={`
                    grid
                    min-h-[600px]
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    ${
                        applicationId === undefined
                            ? "grid-cols-1 lg:grid-cols-[300px_1fr]"
                            : "grid-cols-1"
                    }
                `}
            >

                {/* ================================================== */}
                {/* CONVERSATIONS */}
                {/* ================================================== */}

                {applicationId === undefined && (

                    <aside className="border-b border-slate-200 lg:border-b-0 lg:border-r">

                        <div className="border-b border-slate-100 px-5 py-4">

                            <h3 className="font-bold text-slate-900">
                                Диалоги
                            </h3>

                        </div>


                        {conversations.length === 0 ? (

                            <div className="p-6 text-center">

                                <div className="text-3xl">
                                    💬
                                </div>

                                <p className="mt-2 text-sm text-slate-500">
                                    Диалогов пока нет.
                                </p>

                            </div>

                        ) : (

                            <div className="max-h-[550px] overflow-y-auto">

                                {conversations.map(
                                    (
                                        conversation,
                                    ) => {

                                        const isSelected =
                                            selectedConversation?.id ===
                                            conversation.id;


                                        return (

                                            <button
                                                key={
                                                    conversation.id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    setSelectedConversation(
                                                        conversation,
                                                    )
                                                }
                                                className={`
                                                    w-full
                                                    border-b
                                                    border-slate-100
                                                    px-5
                                                    py-4
                                                    text-left
                                                    transition
                                                    ${
                                                        isSelected
                                                            ? "bg-brand-50"
                                                            : "hover:bg-slate-50"
                                                    }
                                                `}
                                            >

                                                <div className="flex items-start gap-3">

                                                    {/* Avatar */}

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-sm font-bold text-white">

                                                        {conversation.other_user_email
                                                            .charAt(0)
                                                            .toUpperCase()}

                                                    </div>


                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex items-center justify-between gap-2">

                                                            <p className="truncate text-sm font-semibold text-slate-900">

                                                                {
                                                                    conversation.other_user_email
                                                                }

                                                            </p>


                                                            {conversation.last_message_at && (

                                                                <span className="shrink-0 text-[10px] text-slate-400">

                                                                    {
                                                                        formatConversationDate(
                                                                            conversation.last_message_at,
                                                                        )
                                                                    }

                                                                </span>

                                                            )}

                                                        </div>


                                                        <p className="mt-1 truncate text-xs text-slate-500">

                                                            {
                                                                conversation.vacancy_title
                                                            }

                                                        </p>


                                                        {conversation.last_message && (

                                                            <p className="mt-1 truncate text-xs text-slate-400">

                                                                {
                                                                    conversation.last_message
                                                                }

                                                            </p>

                                                        )}

                                                    </div>


                                                    {/* Unread */}

                                                    {conversation.unread_count > 0 && (

                                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[10px] font-bold text-white">

                                                            {
                                                                conversation.unread_count
                                                            }

                                                        </span>

                                                    )}

                                                </div>

                                            </button>

                                        );

                                    },
                                )}

                            </div>

                        )}

                    </aside>

                )}


                {/* ================================================== */}
                {/* CHAT */}
                {/* ================================================== */}

                <div className="flex min-h-[600px] flex-col">

                    {(
                        applicationId ===
                        undefined
                        &&
                        !selectedConversation
                    ) ? (

                        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">

                            <div className="text-5xl">
                                💬
                            </div>

                            <h3 className="mt-4 text-lg font-bold text-slate-900">
                                Выберите диалог
                            </h3>

                            <p className="mt-2 max-w-sm text-sm text-slate-500">
                                Выберите разговор слева, чтобы посмотреть историю сообщений.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* ================================================== */}
                            {/* CHAT HEADER */}
                            {/* ================================================== */}

                            <div className="border-b border-slate-100 px-5 py-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-sm font-bold text-white">

                                        {otherUserEmail
                                            ?.charAt(0)
                                            .toUpperCase()
                                            ?? "?"}

                                    </div>


                                    <div className="min-w-0">

                                        <h3 className="truncate text-sm font-bold text-slate-900">

                                            {
                                                otherUserEmail
                                            }

                                        </h3>

                                        <p className="truncate text-xs text-slate-500">

                                            {
                                                vacancyTitle
                                            }

                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* ================================================== */}
                            {/* MESSAGES */}
                            {/* ================================================== */}

                            <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/60 p-5">

                                {messagesLoading ? (

                                    <div className="flex h-full items-center justify-center">

                                        <p className="text-sm text-slate-500">
                                            Загрузка сообщений...
                                        </p>

                                    </div>

                                ) : messages.length === 0 ? (

                                    <div className="flex h-full items-center justify-center">

                                        <div className="text-center">

                                            <div className="text-4xl">
                                                💬
                                            </div>

                                            <p className="mt-3 text-sm text-slate-500">
                                                Сообщений пока нет.
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Начните диалог первым.
                                            </p>

                                        </div>

                                    </div>

                                ) : (

                                    messages.map(
                                        (
                                            message,
                                        ) => {

                                            const isMine =
                                                message.sender_id ===
                                                user?.id;


                                            return (

                                                <div
                                                    key={
                                                        message.id
                                                    }
                                                    className={`
                                                        flex
                                                        ${
                                                            isMine
                                                                ? "justify-end"
                                                                : "justify-start"
                                                        }
                                                    `}
                                                >

                                                    <div
                                                        className={`
                                                            max-w-[75%]
                                                            rounded-2xl
                                                            px-4
                                                            py-3
                                                            ${
                                                                isMine
                                                                    ? "rounded-br-md bg-brand-600 text-white"
                                                                    : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                                                            }
                                                        `}
                                                    >

                                                        <p className="whitespace-pre-wrap text-sm leading-6">
                                                            {
                                                                message.content
                                                            }
                                                        </p>


                                                        <p
                                                            className={`
                                                                mt-1 text-[10px]
                                                                ${
                                                                    isMine
                                                                        ? "text-white/70"
                                                                        : "text-slate-400"
                                                                }
                                                            `}
                                                        >

                                                            {
                                                                formatMessageTime(
                                                                    message.created_at,
                                                                )
                                                            }

                                                        </p>

                                                    </div>

                                                </div>

                                            );

                                        },
                                    )

                                )}


                                <div
                                    ref={
                                        messagesEndRef
                                    }
                                />

                            </div>


                            {/* ================================================== */}
                            {/* COMPOSER */}
                            {/* ================================================== */}

                            <div className="border-t border-slate-100 bg-white p-4">

                                <div className="flex items-end gap-3">

                                    <textarea
                                        value={
                                            messageText
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setMessageText(
                                                event.target.value,
                                            )
                                        }
                                        onKeyDown={
                                            handleKeyDown
                                        }
                                        rows={2}
                                        placeholder="Напишите сообщение..."
                                        className="
                                            min-h-[48px]
                                            flex-1
                                            resize-none
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-4
                                            py-3
                                            text-sm
                                            text-slate-900
                                            outline-none
                                            transition
                                            focus:border-brand-500
                                            focus:ring-2
                                            focus:ring-brand-500/10
                                        "
                                    />


                                    <button
                                        type="button"
                                        onClick={
                                            handleSendMessage
                                        }
                                        disabled={
                                            sending
                                            ||
                                            !messageText.trim()
                                        }
                                        className="
                                            rounded-xl
                                            bg-brand-600
                                            px-5
                                            py-3
                                            text-sm
                                            font-semibold
                                            text-white
                                            transition
                                            hover:bg-brand-700
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >

                                        {sending
                                            ? "..."
                                            : "Отправить"}

                                    </button>

                                </div>


                                <p className="mt-2 text-[11px] text-slate-400">
                                    Enter — отправить, Shift + Enter — новая строка
                                </p>

                            </div>

                        </>

                    )}

                </div>

            </div>

        </section>
    );
}