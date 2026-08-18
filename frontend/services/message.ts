import api from "@/services/api";

import {
    Message,
    MessageCreate,
} from "@/types/message";


/*
 * ============================================================
 * Получить сообщения conversation
 * ============================================================
 */

export async function getConversationMessages(
    conversationId: number,
): Promise<Message[]> {

    const response =
        await api.get<Message[]>(
            `/conversations/${conversationId}/messages`,
        );

    return response.data;
}


/*
 * ============================================================
 * Отправить сообщение
 * ============================================================
 */

export async function createMessage(
    conversationId: number,
    data: MessageCreate,
): Promise<Message> {

    const response =
        await api.post<Message>(
            `/conversations/${conversationId}/messages`,
            data,
        );

    return response.data;
}


/*
 * ============================================================
 * Пометить conversation как прочитанный
 * ============================================================
 */

export async function markConversationAsRead(
    conversationId: number,
): Promise<void> {

    await api.patch(
        `/conversations/${conversationId}/read`,
        {},
    );
}