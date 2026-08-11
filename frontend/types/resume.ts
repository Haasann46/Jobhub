export interface Resume {
    id: number;

    user_id: number;

    title: string;

    desired_position: string;

    about: string | null;

    city: string | null;

    salary_expectation: number | null;

    is_active: boolean;

    created_at: string;

    updated_at: string;
}


export interface ResumeCreate {
    title: string;

    desired_position: string;

    about?: string | null;

    city?: string | null;

    salary_expectation?: number | null;
}


export interface ResumeUpdate {
    title?: string;

    desired_position?: string;

    about?: string | null;

    city?: string | null;

    salary_expectation?: number | null;

    is_active?: boolean;
}