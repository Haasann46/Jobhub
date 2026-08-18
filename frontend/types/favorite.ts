import { Vacancy } from "@/types/vacancy";


export interface FavoriteResponse {
    id: number;

    user_id: number;

    vacancy_id: number;

    created_at: string;

    updated_at: string;
}


export interface FavoriteCheckResponse {
    is_favorite: boolean;
}


export type FavoriteVacancy = Vacancy;