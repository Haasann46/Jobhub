import api from "@/services/api";

import {
    Notification,
} from "@/types/notification";


/*
 * Получить мои уведомления
 */

export async function getMyNotifications():
    Promise<Notification[]> {

    const response =
        await api.get<Notification[]>(
            "/notifications/my",
        );

    return response.data;
}


/*
 * Получить количество непрочитанных
 */

export async function getUnreadNotificationCount():
    Promise<number> {

    const response =
        await api.get<{
            total: number;
        }>(
            "/notifications/unread/count",
        );

    return response.data.total;
}


/*
 * Пометить одно уведомление
 * как прочитанное
 */

export async function markNotificationAsRead(
    notificationId: number,
): Promise<Notification> {

    const response =
        await api.patch<Notification>(
            `/notifications/${notificationId}/read`,
        );

    return response.data;
}


/*
 * Пометить все уведомления
 * как прочитанные
 */

export async function markAllNotificationsAsRead():
    Promise<void> {

    await api.patch(
        "/notifications/read-all",
    );
}