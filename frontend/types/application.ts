export type ApplicationStatus =
    | "new"
    | "reviewing"
    | "interview"
    | "rejected"
    | "hired";


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


export interface ExperienceItem {

    company: string;

    position: string;

    start_date: string;

    end_date: string | null;

    description: string | null;
}


export interface EducationItem {

    institution: string;

    degree: string | null;

    field: string | null;

    start_date: string | null;

    end_date: string | null;
}


export interface LanguageItem {

    name: string;

    level: string;
}


export interface ProjectItem {

    name: string;

    description: string | null;

    url: string | null;
}


export interface ApplicationCandidateProfile {

    id: number;

    user_id: number;

    first_name: string | null;

    last_name: string | null;

    phone: string | null;

    avatar_url: string | null;

    bio: string | null;

    city: string | null;

    github_url: string | null;

    linkedin_url: string | null;

    skills: string[];

    experience: ExperienceItem[];

    education: EducationItem[];

    languages: LanguageItem[];

    projects: ProjectItem[];
}


export interface EmployerApplication {

    id: number;

    candidate_id: number;

    candidate_email: string;

    vacancy_id: number;

    resume: ApplicationResume;

    profile: ApplicationCandidateProfile | null;

    cover_letter: string | null;

    status: ApplicationStatus;

    created_at: string;

    updated_at: string;
}