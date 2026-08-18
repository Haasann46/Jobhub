import api from "@/services/api";

import {
    Conversation,
    ConversationListItem,
} from "@/types/conversation";


/*
 * ============================================================
 * Получить или создать conversation
 * ============================================================
 *
 * Используется работодателем,
 * когда он нажимает:
 *
 * "Начать чат"
 *
 * или
 *
 * "Открыть чат".
 */

export async function getOrCreateConversation(
    applicationId: number,
): Promise<Conversation> {

    const response =
        await api.post<Conversation>(
            `/conversations/application/${applicationId}`,
            {},
        );

    return response.data;
}


/*
 * ============================================================
 * Получить мои conversations
 * ============================================================
 */

export async function getMyConversations():
    Promise<ConversationListItem[]> {

    const response =
        await api.get<
            ConversationListItem[]
        >(
            "/conversations/my",
        );

    return response.data;
}


/*
 * ============================================================
 * Получить конкретный conversation
 * ============================================================
 */

export async function getConversation(
    conversationId: number,
): Promise<Conversation> {

    const response =
        await api.get<Conversation>(
            `/conversations/${conversationId}`,
        );

    return response.data;
}


/*
 * ============================================================
 * Получить conversation по application
 * ============================================================
 *
 * Используется кандидатом,
 * когда conversation уже существует.
 *
 * Если работодатель ещё не написал,
 * backend может вернуть 404.
 */

export async function getConversationByApplication(
    applicationId: number,
): Promise<Conversation> {

    const response =
        await api.get<Conversation>(
            `/conversations/application/${applicationId}`,
        );

    return response.data;
}