export type NotificationType =
    | "new_application"
    | "new_message"
    | "application_status_changed"
    | "invitation"
    | "new_vacancy";


export interface Notification {
    id: number;

    recipient_id: number;

    sender_id: number | null;

    sender_name: string | null;

    type: NotificationType;

    title: string;

    message: string;

    is_read: boolean;

    application_id: number | null;

    conversation_id: number | null;

    vacancy_id: number | null;

    created_at: string;

    updated_at: string;
}