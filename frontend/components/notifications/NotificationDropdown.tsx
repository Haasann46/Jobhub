"use client";

import {
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


function formatNotificationTime(
    dateString: string,
): string {

    const date =
        new Date(dateString);

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

    const minute =
        60 * 1000;

    const hour =
        60 * minute;

    const day =
        24 * hour;


    if (diff < minute) {
        return "только что";
    }


    if (diff < hour) {

        const minutes =
            Math.floor(
                diff / minute,
            );

        return `${minutes} мин. назад`;
    }


    if (diff < day) {

        const hours =
            Math.floor(
                diff / hour,
            );

        return `${hours} ч. назад`;
    }


    if (diff < 7 * day) {

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


function formatExactTime(
    dateString: string,
): string {

    const date =
        new Date(dateString);

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


function getMessagePreview(
    notification: Notification,
): string {

    if (
        notification.type !==
        "new_message"
    ) {
        return notification.message;
    }


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
        message.slice(
            0,
            maxLength,
        ).trimEnd()
        + "..."
    );
}


export default function NotificationDropdown() {

    const router =
        useRouter();


    const user =
        useAuthStore(
            (state) => state.user,
        );


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


    const dropdownRef =
        useRef<HTMLDivElement>(null);


    /*
     * ============================================================
     * Получить количество непрочитанных
     * ============================================================
     */

    async function loadUnreadCount() {

        try {

            const count =
                await getUnreadNotificationCount();

            setUnreadCount(
                count,
            );

        } catch (error) {

            console.error(
                "Failed to load unread notification count:",
                error,
            );

        }
    }


    /*
     * ============================================================
     * Получить уведомления
     * ============================================================
     */

    async function loadNotifications() {

        try {

            setIsLoading(
                true,
            );


            const [
                notificationData,
                unreadData,
            ] = await Promise.all([
                getMyNotifications(),
                getUnreadNotificationCount(),
            ]);


            setNotifications(
                notificationData,
            );


            setUnreadCount(
                unreadData,
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
    }


    /*
     * ============================================================
     * Первичная загрузка badge
     * ============================================================
     */

    useEffect(() => {

        loadUnreadCount();

    }, []);


    /*
     * ============================================================
     * Автоматическое обновление badge
     * ============================================================
     */

    useEffect(() => {

        const interval =
            window.setInterval(
                () => {

                    loadUnreadCount();

                },
                10000,
            );


        return () => {

            window.clearInterval(
                interval,
            );

        };

    }, []);


    /*
     * ============================================================
     * Загрузка уведомлений при открытии
     * ============================================================
     */

    useEffect(() => {

        if (!isOpen) {
            return;
        }


        loadNotifications();

    }, [
        isOpen,
    ]);


    /*
     * ============================================================
     * Закрытие при клике вне dropdown
     * ============================================================
     */

    useEffect(() => {

        function handleClickOutside(
            event: MouseEvent,
        ) {

            if (
                dropdownRef.current
                &&
                !dropdownRef.current.contains(
                    event.target as Node,
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

    }, []);


    /*
     * ============================================================
     * Клик по уведомлению
     * ============================================================
     */

    async function handleNotificationClick(
        notification: Notification,
    ) {

        /*
         * Помечаем уведомление прочитанным.
         */

        if (
            !notification.is_read
        ) {

            try {

                await markNotificationAsRead(
                    notification.id,
                );


                setNotifications(
                    (current) =>
                        current.map(
                            (item) =>
                                item.id ===
                                notification.id
                                    ? {
                                        ...item,
                                        is_read: true,
                                    }
                                    : item,
                        ),
                );


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
         * Закрываем dropdown.
         */

        setIsOpen(
            false,
        );


        /*
         * ========================================================
         * Новое сообщение
         * ========================================================
         *
         * Передаём conversation_id.
         *
         * Страница кабинета сама откроет
         * существующий ChatPanel.
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


    return (

        <div
            ref={dropdownRef}
            className="relative"
        >

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


            {isOpen && (

                <div
                    className="
                        absolute
                        right-0
                        top-12
                        z-50
                        w-[410px]
                        overflow-hidden
                        rounded-2xl
                        border
                        border-slate-200
                        bg-white
                        shadow-xl
                        shadow-slate-900/10
                    "
                >

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
                                    text-base
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
                                        text-slate-500
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
                                text-xs
                                font-semibold
                                text-brand-600
                                transition
                                hover:text-brand-700
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >
                            {isMarkingAll
                                ? "Обновление..."
                                : "Прочитать все"}
                        </button>

                    </div>


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

                                <div className="text-3xl">
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
                                        text-slate-400
                                    "
                                >
                                    Здесь появятся важные события
                                    вашего аккаунта.
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
                                                gap-3
                                                border-b
                                                border-slate-100
                                                px-5
                                                py-4
                                                text-left
                                                transition
                                                hover:bg-slate-50
                                                ${
                                                    !notification.is_read
                                                        ? "bg-brand-50/40"
                                                        : "bg-white"
                                                }
                                            `}
                                        >

                                            <div
                                                className="
                                                    flex
                                                    h-10
                                                    w-10
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-slate-100
                                                    text-lg
                                                "
                                            >
                                                {getNotificationIcon(
                                                    notification.type,
                                                )}
                                            </div>


                                            <div
                                                className="
                                                    min-w-0
                                                    flex-1
                                                "
                                            >

                                                <div
                                                    className="
                                                        flex
                                                        items-start
                                                        justify-between
                                                        gap-2
                                                    "
                                                >

                                                    <p
                                                        className={`
                                                            text-sm
                                                            ${
                                                                !notification.is_read
                                                                    ? "font-bold text-slate-900"
                                                                    : "font-semibold text-slate-700"
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


                                                {isMessage &&
                                                    notification.sender_name && (

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
                                                        <span>
                                                            →
                                                        </span>
                                                    </div>

                                                )}


                                                <div
                                                    className="
                                                        mt-2
                                                        flex
                                                        items-center
                                                        justify-between
                                                        gap-2
                                                    "
                                                >

                                                    <span
                                                        className="
                                                            text-[11px]
                                                            text-slate-400
                                                        "
                                                    >
                                                        {
                                                            formatNotificationTime(
                                                                notification.created_at,
                                                            )
                                                        }
                                                    </span>


                                                    <span
                                                        className="
                                                            text-[11px]
                                                            font-medium
                                                            text-slate-400
                                                        "
                                                    >
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


                    {notifications.length > 0 && (

                        <div
                            className="
                                border-t
                                border-slate-100
                                p-3
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    loadNotifications
                                }
                                className="
                                    w-full
                                    rounded-xl
                                    py-2.5
                                    text-sm
                                    font-semibold
                                    text-brand-600
                                    transition
                                    hover:bg-brand-50
                                "
                            >
                                Обновить
                            </button>

                        </div>

                    )}

                </div>

            )}

        </div>
    );
}