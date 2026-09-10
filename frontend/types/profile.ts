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


export interface Profile {
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


export interface ProfileUpdate {
    first_name?: string | null;

    last_name?: string | null;

    phone?: string | null;

    avatar_url?: string | null;

    bio?: string | null;

    city?: string | null;

    github_url?: string | null;

    linkedin_url?: string | null;

    skills?: string[];

    experience?: ExperienceItem[];

    education?: EducationItem[];

    languages?: LanguageItem[];

    projects?: ProjectItem[];
}