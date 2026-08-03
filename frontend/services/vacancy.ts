import api from "./api";
import { Vacancy } from "@/types/vacancy";

export async function getVacancies(): Promise<Vacancy[]> {
    const response = await api.get<Vacancy[]>("/vacancies");

    return response.data;
}