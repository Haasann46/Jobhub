export type ApplicationStatus =
    | "NEW"
    | "REVIEWING"
    | "INTERVIEW"
    | "REJECTED"
    | "HIRED";


export interface ApplicationCreate {
    resume_id: number;

    cover_letter?: string | null;
}


export interface Application {
    id: number;

    candidate_id: number;

    vacancy_id: number;

    resume_id: number;

    cover_letter: string | null;

    status: ApplicationStatus;

    created_at: string;

    updated_at: string;
}


export interface ApplicationStatusUpdate {
    status: ApplicationStatus;
}


export interface ApplicationResume {
    id: number;

    title: string;

    desired_position: string;

    about: string | null;

    city: string | null;

    salary_expectation: number | null;

    is_active: boolean;
}


export interface EmployerApplication {
    id: number;

    candidate_id: number;

    candidate_email: string;

    vacancy_id: number;

    resume: ApplicationResume;

    cover_letter: string | null;

    status: ApplicationStatus;

    created_at: string;

    updated_at: string;
}