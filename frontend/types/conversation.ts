export interface Conversation {
    id: number;

    application_id: number;

    created_at: string;
    updated_at: string;
}


export interface ConversationListItem {
    id: number;

    application_id: number;

    other_user_id: number;
    other_user_email: string;

    vacancy_id: number;
    vacancy_title: string;

    unread_count: number;

    last_message: string | null;
    last_message_at: string | null;

    created_at: string;
    updated_at: string;
}