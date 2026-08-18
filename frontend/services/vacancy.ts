import api from "@/services/api";

import {
    Vacancy,
    VacancyListResponse,
    VacancySearchParams,
} from "@/types/vacancy";

import { API_URL } from "@/constants/api";


/*
 * ============================================================
 * Создание вакансии
 * ============================================================
 */

export interface VacancyCreateData {

    title: string;

    description: string;

    category: string;

    location: string;

    employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship";

    experience_level:
        | "junior"
        | "middle"
        | "senior";

    salary_from: number | null;

    salary_to: number | null;

    is_remote: boolean;

    technology_ids: number[];
}


export async function createVacancy(
    data: VacancyCreateData,
): Promise<Vacancy> {

    const response =
        await api.post<Vacancy>(
            "/vacancies",
            data,
        );

    return response.data;
}


/*
 * ============================================================
 * Публичный список вакансий
 * ============================================================
 */

export async function getVacancies(
    params?: VacancySearchParams,
): Promise<VacancyListResponse> {

    const query =
        new URLSearchParams();


    if (params?.search) {
        query.append("search", params.search);
    }

    if (params?.location) {
        query.append("location", params.location);
    }

    if (params?.category) {
        query.append("category", params.category);
    }

    if (params?.employment_type) {
        query.append("employment_type", params.employment_type);
    }

    if (params?.experience_level) {
        query.append("experience_level", params.experience_level);
    }

    if (params?.salary_from !== undefined) {
        query.append("salary_from", params.salary_from.toString());
    }

    if (params?.salary_to !== undefined) {
        query.append("salary_to", params.salary_to.toString());
    }

    if (params?.is_remote !== undefined) {
        query.append("is_remote", String(params.is_remote));
    }

    query.append("page", String(params?.page ?? 1));
    query.append("size", String(params?.size ?? 20));
    query.append("sort", params?.sort ?? "newest");


    const response =
        await fetch(
            `${API_URL}/vacancies?${query.toString()}`,
            {
                cache: "no-store",
            },
        );


    if (!response.ok) {
        throw new Error("Failed to load vacancies");
    }


    return response.json();
}


/*
 * ============================================================
 * Одна вакансия
 * ============================================================
 */

export async function getVacancyById(
    vacancyId: number | string,
): Promise<Vacancy> {

    const response =
        await fetch(
            `${API_URL}/vacancies/${vacancyId}`,
            {
                cache: "no-store",
            },
        );


    if (!response.ok) {

        if (response.status === 404) {
            throw new Error("Vacancy not found");
        }

        throw new Error("Failed to load vacancy");
    }


    return response.json();
}


/*
 * ============================================================
 * Вакансии текущего работодателя
 * ============================================================
 */

export async function getMyVacancies():
    Promise<Vacancy[]> {

    const response =
        await api.get<Vacancy[]>(
            "/vacancies/my",
        );

    return response.data;
}


/*
 * ============================================================
 * Обновление вакансии
 * ============================================================
 */

export interface VacancyUpdateData {

    title?: string;

    description?: string;

    category?: string;

    location?: string;

    employment_type?:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship";

    experience_level?:
        | "junior"
        | "middle"
        | "senior";

    salary_from?: number | null;

    salary_to?: number | null;

    is_remote?: boolean;

    technology_ids?: number[];
}


export async function updateVacancy(
    vacancyId: number | string,
    data: VacancyUpdateData,
): Promise<Vacancy> {

    const response =
        await api.put<Vacancy>(
            `/vacancies/${vacancyId}`,
            data,
        );

    return response.data;
}


/*
 * ============================================================
 * Удаление вакансии
 * ============================================================
 */

export async function deleteVacancy(
    vacancyId: number | string,
): Promise<void> {

    await api.delete(
        `/vacancies/${vacancyId}`,
    );
}