export type EmploymentType =
    | "full_time"
    | "part_time"
    | "contract"
    | "internship";

export type ExperienceLevel =
    | "junior"
    | "middle"
    | "senior";

export type VacancySort =
    | "newest"
    | "oldest"
    | "salary_asc"
    | "salary_desc";

export interface Technology {
    id: number;

    name: string;

    slug: string;
}

export interface Vacancy {
    id: number;

    company_id: number;

    company_name: string;

    company_logo: string | null;

    category: string;

    title: string;

    description: string;

    location: string;

    employment_type: EmploymentType;

    experience_level: ExperienceLevel;

    salary_from: number | null;

    salary_to: number | null;

    is_remote: boolean;

    published_at: string;

    technologies: Technology[];
}

export interface VacancyListResponse {
    items: Vacancy[];

    total: number;

    page: number;

    size: number;

    pages: number;

    has_next: boolean;

    has_previous: boolean;
}

export interface VacancySearchParams {
    search?: string;

    location?: string;

    category?: string;

    employment_type?: EmploymentType;

    experience_level?: ExperienceLevel;

    salary_from?: number;

    salary_to?: number;

    is_remote?: boolean;

    page?: number;

    size?: number;

    sort?: VacancySort;
}