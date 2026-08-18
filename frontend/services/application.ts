import api from "@/services/api";

import {
    Application,
    ApplicationCreate,
    ApplicationStatus,
    EmployerApplication,
} from "@/types/application";


/*
 * ============================================================
 * Создание отклика кандидатом
 * ============================================================
 */

export async function createApplication(
    vacancyId: number,
    data: ApplicationCreate,
): Promise<Application> {

    const response =
        await api.post<Application>(
            `/applications/vacancy/${vacancyId}`,
            data,
        );

    return response.data;
}


/*
 * ============================================================
 * Мои отклики кандидата
 * ============================================================
 */

export async function getMyApplications():
    Promise<Application[]> {

    const response =
        await api.get<Application[]>(
            "/applications/my",
        );

    return response.data;
}


/*
 * ============================================================
 * Отклики на вакансию работодателя
 * ============================================================
 */

export async function getVacancyApplications(
    vacancyId: number,
): Promise<EmployerApplication[]> {

    const response =
        await api.get<EmployerApplication[]>(
            `/applications/vacancy/${vacancyId}`,
        );

    return response.data;
}


/*
 * ============================================================
 * Изменение статуса отклика
 * ============================================================
 */

export async function updateApplicationStatus(
    applicationId: number,
    status: ApplicationStatus,
): Promise<EmployerApplication> {

    const response =
        await api.patch<EmployerApplication>(
            `/applications/${applicationId}/status`,
            {
                status,
            },
        );

    return response.data;
}


/*
 * ============================================================
 * Количество откликов работодателя
 * ============================================================
 */

export async function getMyEmployerApplicationCount():
    Promise<number> {

    const response =
        await api.get<{
            total: number;
        }>(
            "/applications/employer/my/count",
        );

    return response.data.total;
}