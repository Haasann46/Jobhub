import api from "@/services/api";

import {
    FavoriteCheckResponse,
    FavoriteResponse,
    FavoriteVacancy,
} from "@/types/favorite";


export async function addFavorite(
    vacancyId: number,
): Promise<FavoriteResponse> {

    const response =
        await api.post<FavoriteResponse>(
            `/favorites/${vacancyId}`,
        );

    return response.data;
}


export async function removeFavorite(
    vacancyId: number,
): Promise<void> {

    await api.delete(
        `/favorites/${vacancyId}`,
    );
}


export async function checkFavorite(
    vacancyId: number,
): Promise<boolean> {

    const response =
        await api.get<FavoriteCheckResponse>(
            `/favorites/${vacancyId}/check`,
        );

    return response.data.is_favorite;
}


export async function getMyFavorites():
    Promise<FavoriteVacancy[]> {

    const response =
        await api.get<FavoriteVacancy[]>(
            "/favorites/my",
        );

    return response.data;
}