export interface Company {
    id: number;

    name: string;

    description: string | null;

    website: string | null;

    logo_url: string | null;

    owner_id: number;
}


export interface CompanyCreateData {
    name: string;

    description?: string | null;

    website?: string | null;

    logo_url?: string | null;
}


export interface CompanyUpdateData {
    name?: string;

    description?: string | null;

    website?: string | null;

    logo_url?: string | null;
}