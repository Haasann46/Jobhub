export interface Company {
    id: number;

    name: string;

    description: string;

    website: string | null;

    logo_url: string | null;

    size: string | null;

    address: string | null;

    industry: string | null;

    owner_id: number;
}


export interface CompanyCreateData {
    name: string;

    description: string;

    website?: string | null;

    logo_url?: string | null;

    size?: string | null;

    address?: string | null;

    industry?: string | null;
}


export interface CompanyUpdateData {
    name: string;

    description: string;

    website?: string | null;

    logo_url?: string | null;

    size?: string | null;

    address?: string | null;

    industry?: string | null;
}