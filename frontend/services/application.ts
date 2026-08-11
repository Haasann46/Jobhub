import api from "@/services/api";

import {
    Application,
    ApplicationCreate,
    ApplicationStatus,
    EmployerApplication,
} from "@/types/application";


function getAccessToken(): string | null {

    if (
        typeof window === "undefined"
    ) {
        return null;
    }

    return localStorage.getItem(
        "access_token",
    );
}


function getAuthConfig() {

    const token =
        getAccessToken();

    return {
        headers: token
            ? {
                Authorization:
                    `Bearer ${token}`,
            }
            : undefined,
    };
}


/*
 * Создание отклика кандидатом
 */

export async function createApplication(
    vacancyId: number,
    data: ApplicationCreate,
): Promise<Application> {

    const response =
        await api.post<Application>(
            `/applications/vacancy/${vacancyId}`,
            data,
            getAuthConfig(),
        );

    return response.data;
}


/*
 * Мои отклики кандидата
 */

export async function getMyApplications():
    Promise<Application[]> {

    const response =
        await api.get<Application[]>(
            "/applications/my",
            getAuthConfig(),
        );

    return response.data;
}


/*
 * Отклики на вакансию работодателя
 */

export async function getVacancyApplications(
    vacancyId: number,
): Promise<EmployerApplication[]> {

    const response =
        await api.get<
            EmployerApplication[]
        >(
            `/applications/vacancy/${vacancyId}`,
            getAuthConfig(),
        );

    return response.data;
}


/*
 * Изменение статуса отклика
 */

export async function updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
): Promise<EmployerApplication> {

    const response =
        await api.patch<
            EmployerApplication
        >(
            `/applications/${applicationId}/status`,
            {
                status,
            },
            getAuthConfig(),
        );

    return response.data;
}

export async function getMyEmployerApplicationCount(): Promise<number> {

    const response =
        await api.get<{
            total: number;
        }>(
            "/applications/employer/my/count",
            getAuthConfig(),
        );

    return response.data.total;
}