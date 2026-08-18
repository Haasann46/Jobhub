export interface MessageCreate {
    content: string;
}


export interface Message {
    id: number;

    conversation_id: number;
    sender_id: number;

    content: string;

    is_read: boolean;

    created_at: string;
    updated_at: string;
}