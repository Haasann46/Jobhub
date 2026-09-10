"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import {
    getMyNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from "@/services/notification";

import {
    useAuthStore,
} from "@/store/auth";

import {
    Notification,
    NotificationType,
} from "@/types/notification";


/*
 * ============================================================
 * Иконка уведомления
 * ============================================================
 */

function getNotificationIcon(
    type: NotificationType,
): string {

    switch (type) {

        case "new_application":
            return "📩";

        case "new_message":
            return "💬";

        case "application_status_changed":
            return "🔄";

        case "invitation":
            return "🤝";

        case "new_vacancy":
            return "💼";

        default:
            return "🔔";
    }
}


/*
 * ============================================================
 * Относительное время
 * ============================================================
 */

function formatNotificationTime(
    dateString: string,
): string {

    const date =
        new Date(
            dateString,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {

        return "";
    }


    const now =
        new Date();

    const diff =
        now.getTime()
        -
        date.getTime();


    /*
     * Если дата из будущего
     * или разница отрицательная —
     * показываем "только что".
     */

    if (
        diff <= 0
    ) {

        return "только что";
    }


    const minute =
        60 * 1000;

    const hour =
        60 * minute;

    const day =
        24 * hour;


    if (
        diff < minute
    ) {

        return "только что";
    }


    if (
        diff < hour
    ) {

        const minutes =
            Math.floor(
                diff / minute,
            );

        return `${minutes} мин. назад`;
    }


    if (
        diff < day
    ) {

        const hours =
            Math.floor(
                diff / hour,
            );

        return `${hours} ч. назад`;
    }


    if (
        diff < 7 * day
    ) {

        const days =
            Math.floor(
                diff / day,
            );

        return `${days} дн. назад`;
    }


    return date.toLocaleDateString(
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        },
    );
}


/*
 * ============================================================
 * Точное время
 * ============================================================
 */

function formatExactTime(
    dateString: string,
): string {

    const date =
        new Date(
            dateString,
        );

    if (
        Number.isNaN(
            date.getTime(),
        )
    ) {

        return "";
    }


    return date.toLocaleTimeString(
        "ru-RU",
        {
            hour: "2-digit",
            minute: "2-digit",
        },
    );
}


/*
 * ============================================================
 * Preview сообщения
 * ============================================================
 */

function getMessagePreview(
    notification: Notification,
): string {

    if (
        notification.type !==
        "new_message"
    ) {

        return notification.message;
    }


    /*
     * Backend может вернуть:
     *
     * "Hasan: Привет"
     *
     * В интерфейсе оставляем только:
     *
     * "Привет"
     */

    if (
        notification.sender_name
        &&
        notification.message.startsWith(
            `${notification.sender_name}:`,
        )
    ) {

        return notification.message
            .slice(
                notification.sender_name.length + 1,
            )
            .trim();
    }


    return notification.message;
}


/*
 * ============================================================
 * Ограничение длины сообщения
 * ============================================================
 */

function truncateMessage(
    message: string,
    maxLength = 120,
): string {

    if (
        message.length <=
        maxLength
    ) {

        return message;
    }


    return (
        message
            .slice(
                0,
                maxLength,
            )
            .trimEnd()
        + "..."
    );
}


/*
 * ============================================================
 * Notification Dropdown
 * ============================================================
 */

export default function NotificationDropdown() {

    const router =
        useRouter();


    /*
     * ========================================================
     * Текущий пользователь
     * ========================================================
     */

    const user =
        useAuthStore(
            (state) => state.user,
        );


    /*
     * ========================================================
     * Mounted
     *
     * Нужен для защиты client-only логики
     * от SSR hydration mismatch.
     * ========================================================
     */

    const [
        mounted,
        setMounted,
    ] = useState(false);


    /*
     * ========================================================
     * State
     * ========================================================
     */

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);


    const [
        notifications,
        setNotifications,
    ] = useState<
        Notification[]
    >([]);


    const [
        unreadCount,
        setUnreadCount,
    ] = useState(0);


    const [
        isLoading,
        setIsLoading,
    ] = useState(false);


    const [
        isMarkingAll,
        setIsMarkingAll,
    ] = useState(false);


    /*
     * ========================================================
     * Ref
     * ========================================================
     */

    const dropdownRef =
        useRef<HTMLDivElement>(null);


    /*
     * ============================================================
     * Component mounted
     * ============================================================
     */

    useEffect(() => {

        setMounted(true);

    }, []);


    /*
     * ============================================================
     * Безопасное количество unread
     * ============================================================
     */

    function normalizeUnreadCount(
        value: unknown,
    ): number {

        if (
            typeof value !==
            "number"
        ) {

            return 0;
        }


        if (
            !Number.isFinite(
                value,
            )
        ) {

            return 0;
        }


        if (
            value < 0
        ) {

            return 0;
        }


        return Math.floor(
            value,
        );
    }


    /*
     * ============================================================
     * Получить количество непрочитанных
     *
     * Backend:
     *
     * GET /api/notifications/unread/count
     *
     * {
     *     "total": 3
     * }
     * ============================================================
     */

    const loadUnreadCount =
        useCallback(
            async () => {

                /*
                 * Не отправляем запрос,
                 * пока пользователь не авторизован.
                 */

                if (
                    !user
                ) {

                    setUnreadCount(
                        0,
                    );

                    return;
                }


                try {

                    const count =
                        await getUnreadNotificationCount();


                    const safeCount =
                        normalizeUnreadCount(
                            count,
                        );


                    setUnreadCount(
                        safeCount,
                    );

                } catch (error) {

                    console.error(
                        "Failed to load unread notification count:",
                        error,
                    );

                }

            },
            [
                user,
            ],
        );


    /*
     * ============================================================
     * Получить полный список уведомлений
     * ============================================================
     */

    const loadNotifications =
        useCallback(
            async () => {

                if (
                    !user
                ) {

                    setNotifications(
                        [],
                    );

                    setUnreadCount(
                        0,
                    );

                    return;
                }


                try {

                    setIsLoading(
                        true,
                    );


                    /*
                     * Запрашиваем одновременно:
                     *
                     * 1. список уведомлений
                     * 2. количество unread
                     */

                    const [
                        notificationData,
                        unreadData,
                    ] = await Promise.all([
                        getMyNotifications(),
                        getUnreadNotificationCount(),
                    ]);


                    /*
                     * Защита от некорректного
                     * ответа backend.
                     */

                    const safeNotifications =
                        Array.isArray(
                            notificationData,
                        )
                            ? notificationData
                            : [];


                    const safeUnreadCount =
                        normalizeUnreadCount(
                            unreadData,
                        );


                    setNotifications(
                        safeNotifications,
                    );


                    setUnreadCount(
                        safeUnreadCount,
                    );

                } catch (error) {

                    console.error(
                        "Failed to load notifications:",
                        error,
                    );

                } finally {

                    setIsLoading(
                        false,
                    );

                }

            },
            [
                user,
            ],
        );


    /*
     * ============================================================
     * Первичная загрузка badge
     * ============================================================
     */

    useEffect(() => {

        if (
            !mounted
        ) {

            return;
        }


        if (
            !user
        ) {

            setUnreadCount(
                0,
            );

            return;
        }


        loadUnreadCount();

    }, [
        mounted,
        user,
        loadUnreadCount,
    ]);


    /*
     * ============================================================
     * Автоматическое обновление
     *
     * Каждые 5 секунд проверяем:
     *
     * - unread count всегда
     * - список уведомлений, если dropdown открыт
     * ============================================================
     */

    useEffect(() => {

        if (
            !mounted
            ||
            !user
        ) {

            return;
        }


        const interval =
            window.setInterval(
                () => {

                    if (
                        isOpen
                    ) {

                        loadNotifications();

                    } else {

                        loadUnreadCount();

                    }

                },
                5000,
            );


        return () => {

            window.clearInterval(
                interval,
            );

        };

    }, [
        mounted,
        user,
        isOpen,
        loadUnreadCount,
        loadNotifications,
    ]);


    /*
     * ============================================================
     * Обновляем список при открытии dropdown
     * ============================================================
     */

    useEffect(() => {

        if (
            !mounted
            ||
            !isOpen
            ||
            !user
        ) {

            return;
        }


        loadNotifications();

    }, [
        mounted,
        isOpen,
        user,
        loadNotifications,
    ]);


    /*
     * ============================================================
     * Закрытие при клике вне dropdown
     * ============================================================
     */

    useEffect(() => {

        if (
            !mounted
        ) {

            return;
        }


        function handleClickOutside(
            event: MouseEvent,
        ) {

            const target =
                event.target as Node;


            if (
                dropdownRef.current
                &&
                !dropdownRef.current.contains(
                    target,
                )
            ) {

                setIsOpen(
                    false,
                );

            }

        }


        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );


        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );

        };

    }, [
        mounted,
    ]);


    /*
     * ============================================================
     * Клик по уведомлению
     * ============================================================
     */

    async function handleNotificationClick(
        notification: Notification,
    ) {

        /*
         * --------------------------------------------------------
         * Помечаем уведомление прочитанным
         * --------------------------------------------------------
         */

        if (
            !notification.is_read
        ) {

            try {

                await markNotificationAsRead(
                    notification.id,
                );


                /*
                 * Обновляем notification локально.
                 */

                setNotifications(
                    (current) =>
                        current.map(
                            (
                                item,
                            ) =>
                                item.id ===
                                notification.id
                                    ? {
                                        ...item,
                                        is_read: true,
                                    }
                                    : item,
                        ),
                );


                /*
                 * Уменьшаем badge.
                 */

                setUnreadCount(
                    (current) =>
                        Math.max(
                            0,
                            current - 1,
                        ),
                );

            } catch (error) {

                console.error(
                    "Failed to mark notification as read:",
                    error,
                );

            }

        }


        /*
         * --------------------------------------------------------
         * Закрываем dropdown.
         * --------------------------------------------------------
         */

        setIsOpen(
            false,
        );


        /*
         * ========================================================
         * Приглашение
         *
         * Кандидат должен попасть не просто на вакансию,
         * а на страницу приглашений, где доступны:
         *
         * - Принять
         * - Отклонить
         * ========================================================
         */

        if (
            notification.type ===
            "invitation"
        ) {

            if (
                user?.role ===
                "candidate"
            ) {

                router.push(
                    "/candidate/invitations",
                );

                return;
            }


            /*
             * Если уведомление приглашения
             * каким-либо образом открывается
             * у работодателя, оставляем переход
             * на связанную вакансию.
             */

            if (
                notification.vacancy_id
            ) {

                router.push(
                    `/vacancies/${notification.vacancy_id}`,
                );

            }

            return;
        }


        /*
         * ========================================================
         * Новое сообщение
         * ========================================================
         */

        if (
            notification.type ===
            "new_message"
            &&
            notification.conversation_id
        ) {

            if (
                user?.role ===
                "candidate"
            ) {

                router.push(
                    `/candidate?conversation=${notification.conversation_id}`,
                );

                return;
            }


            if (
                user?.role ===
                "employer"
            ) {

                router.push(
                    `/employer?conversation=${notification.conversation_id}`,
                );

                return;
            }


            return;
        }


        /*
         * ========================================================
         * Отклик
         * ========================================================
         */

        if (
            notification.application_id
        ) {

            if (
                user?.role ===
                "employer"
            ) {

                router.push(
                    "/employer",
                );

                return;
            }


            router.push(
                `/candidate?application=${notification.application_id}`,
            );

            return;
        }


        /*
         * ========================================================
         * Вакансия
         * ========================================================
         */

        if (
            notification.vacancy_id
        ) {

            router.push(
                `/vacancies/${notification.vacancy_id}`,
            );
        }

    }


    /*
     * ============================================================
     * Прочитать все
     * ============================================================
     */

    async function handleMarkAllAsRead() {

        if (
            unreadCount === 0
            ||
            isMarkingAll
        ) {

            return;
        }


        try {

            setIsMarkingAll(
                true,
            );


            await markAllNotificationsAsRead();


            /*
             * Обновляем локальный список.
             */

            setNotifications(
                (current) =>
                    current.map(
                        (
                            notification,
                        ) => ({
                            ...notification,
                            is_read: true,
                        }),
                    ),
            );


            /*
             * Badge обнуляем сразу.
             */

            setUnreadCount(
                0,
            );

        } catch (error) {

            console.error(
                "Failed to mark all notifications as read:",
                error,
            );

        } finally {

            setIsMarkingAll(
                false,
            );

        }

    }


    /*
     * ============================================================
     * До hydration ничего не рендерим.
     * ============================================================
     */

    if (
        !mounted
    ) {

        return null;
    }


    /*
     * ============================================================
     * Если пользователь не авторизован —
     * уведомления не показываем.
     * ============================================================
     */

    if (
        !user
    ) {

        return null;
    }


    /*
     * ============================================================
     * Render
     * ============================================================
     */

    return (

        <div
            ref={dropdownRef}
            className="
                relative
            "
        >

            {/* ================================================= */}
            {/* Bell */}
            {/* ================================================= */}

            <button
                type="button"
                onClick={() =>
                    setIsOpen(
                        (value) =>
                            !value,
                    )
                }
                aria-label="Уведомления"
                aria-expanded={isOpen}
                className="
                    relative
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    text-lg
                    transition
                    hover:bg-slate-100
                "
            >

                🔔


                {/* ================================================= */}
                {/* Unread badge */}
                {/* ================================================= */}

                {unreadCount > 0 && (

                    <span
                        className="
                            absolute
                            right-1
                            top-1
                            flex
                            h-4
                            min-w-4
                            items-center
                            justify-center
                            rounded-full
                            bg-red-500
                            px-1
                            text-[10px]
                            font-bold
                            text-white
                            ring-2
                            ring-white
                        "
                    >

                        {unreadCount > 99
                            ? "99+"
                            : unreadCount}

                    </span>

                )}

            </button>


            {/* ================================================= */}
            {/* Dropdown */}
            {/* ================================================= */}

            {isOpen && (

                <div
                    className="
                        absolute
                        right-0
                        top-12
                        z-50
                        w-[360px]
                        max-w-[calc(100vw-2rem)]
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-xl
                        shadow-slate-900/10
                    "
                >

                    {/* ================================================= */}
                    {/* Header */}
                    {/* ================================================= */}

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-slate-100
                            px-5
                            py-4
                        "
                    >

                        <div>

                            <h3
                                className="
                                    text-sm
                                    font-bold
                                    text-slate-900
                                "
                            >
                                Уведомления
                            </h3>


                            {unreadCount > 0 && (

                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-slate-400
                                    "
                                >
                                    Непрочитанных:{" "}
                                    {unreadCount}
                                </p>

                            )}

                        </div>


                        <button
                            type="button"
                            onClick={
                                handleMarkAllAsRead
                            }
                            disabled={
                                unreadCount === 0
                                ||
                                isMarkingAll
                            }
                            className="
                                rounded-lg
                                px-2.5
                                py-1.5
                                text-xs
                                font-semibold
                                text-brand-600
                                transition
                                hover:bg-brand-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >

                            {isMarkingAll
                                ? "Обновление..."
                                : "Прочитать все"}

                        </button>

                    </div>


                    {/* ================================================= */}
                    {/* Notification list */}
                    {/* ================================================= */}

                    <div
                        className="
                            max-h-[500px]
                            overflow-y-auto
                        "
                    >

                        {isLoading ? (

                            <div
                                className="
                                    px-5
                                    py-10
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        mx-auto
                                        h-6
                                        w-6
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-slate-200
                                        border-t-brand-600
                                    "
                                />


                                <p
                                    className="
                                        mt-3
                                        text-sm
                                        text-slate-500
                                    "
                                >
                                    Загрузка уведомлений...
                                </p>

                            </div>

                        ) : notifications.length === 0 ? (

                            <div
                                className="
                                    px-5
                                    py-12
                                    text-center
                                "
                            >

                                <div
                                    className="
                                        text-3xl
                                    "
                                >
                                    🔔
                                </div>


                                <p
                                    className="
                                        mt-3
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                    "
                                >
                                    Уведомлений пока нет
                                </p>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        leading-5
                                        text-slate-400
                                    "
                                >
                                    Здесь появятся важные
                                    события вашего аккаунта.
                                </p>

                            </div>

                        ) : (

                            notifications.map(
                                (
                                    notification,
                                ) => {

                                    const isMessage =
                                        notification.type ===
                                        "new_message";


                                    const messagePreview =
                                        truncateMessage(
                                            getMessagePreview(
                                                notification,
                                            ),
                                        );


                                    return (

                                        <button
                                            key={
                                                notification.id
                                            }
                                            type="button"
                                            onClick={() =>
                                                handleNotificationClick(
                                                    notification,
                                                )
                                            }
                                            className={`
                                                flex
                                                w-full
                                                items-start
                                                gap-3
                                                border-b
                                                border-slate-100
                                                px-5
                                                py-4
                                                text-left
                                                transition
                                                last:border-b-0
                                                ${
                                                    notification.is_read
                                                        ? "bg-white hover:bg-slate-50"
                                                        : "bg-brand-50/60 hover:bg-brand-50"
                                                }
                                            `}
                                        >

                                            {/* ================================================= */}
                                            {/* Icon */}
                                            {/* ================================================= */}

                                            <div
                                                className={`
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    text-lg
                                                    ${
                                                        notification.is_read
                                                            ? "bg-slate-100"
                                                            : "bg-white shadow-sm"
                                                    }
                                                `}
                                            >
                                                {
                                                    getNotificationIcon(
                                                        notification.type,
                                                    )
                                                }
                                            </div>


                                            {/* ================================================= */}
                                            {/* Content */}
                                            {/* ================================================= */}

                                            <div
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                {/* Title */}

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        justify-between
                                                        gap-3
                                                    "
                                                >

                                                    <p
                                                        className={`
                                                            text-sm
                                                            ${
                                                                notification.is_read
                                                                    ? "font-medium text-slate-700"
                                                                    : "font-bold text-slate-900"
                                                            }
                                                        `}
                                                    >
                                                        {
                                                            notification.title
                                                        }
                                                    </p>


                                                    {!notification.is_read && (

                                                        <span
                                                            className="
                                                                mt-1
                                                                h-2
                                                                w-2
                                                                shrink-0
                                                                rounded-full
                                                                bg-brand-600
                                                            "
                                                        />

                                                    )}

                                                </div>


                                                {/* Sender */}

                                                {notification.sender_name && (

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-xs
                                                            font-semibold
                                                            text-slate-700
                                                        "
                                                    >
                                                        От:{" "}
                                                        {
                                                            notification.sender_name
                                                        }
                                                    </p>

                                                )}


                                                {/* Message */}

                                                <p
                                                    className="
                                                        mt-2
                                                        text-xs
                                                        leading-5
                                                        text-slate-500
                                                    "
                                                >

                                                    {isMessage
                                                        ? `"${messagePreview}"`
                                                        : messagePreview}

                                                </p>


                                                {/* Conversation hint */}

                                                {isMessage
                                                    &&
                                                    notification.conversation_id
                                                    && (

                                                    <div
                                                        className="
                                                            mt-2.5
                                                            inline-flex
                                                            items-center
                                                            gap-1
                                                            text-[11px]
                                                            font-semibold
                                                            text-brand-600
                                                        "
                                                    >

                                                        💬

                                                        <span>
                                                            Открыть чат
                                                        </span>

                                                    </div>

                                                )}


                                                {/* Time */}

                                                <div
                                                    className="
                                                        mt-2
                                                        flex
                                                        items-center
                                                        gap-2
                                                        text-[11px]
                                                        text-slate-400
                                                    "
                                                >

                                                    <span>
                                                        {
                                                            formatNotificationTime(
                                                                notification.created_at,
                                                            )
                                                        }
                                                    </span>


                                                    <span>
                                                        •
                                                    </span>


                                                    <span>
                                                        {
                                                            formatExactTime(
                                                                notification.created_at,
                                                            )
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </button>

                                    );
                                },
                            )

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}