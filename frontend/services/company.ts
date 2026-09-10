import api from "@/services/api";

import {
    Company,
    CompanyCreateData,
    CompanyUpdateData,
} from "@/types/company";


/*
 * ============================================================
 * Создание компании
 * ============================================================
 */

export async function createCompany(
    data: CompanyCreateData,
): Promise<Company> {

    const response =
        await api.post<Company>(
            "/companies",
            data,
        );

    return response.data;
}


/*
 * ============================================================
 * Моя компания
 * ============================================================
 */

export async function getMyCompany():
    Promise<Company> {

    const response =
        await api.get<Company>(
            "/companies/me",
        );

    return response.data;
}


/*
 * ============================================================
 * Изменение моей компании
 * ============================================================
 */

export async function updateMyCompany(
    data: CompanyUpdateData,
): Promise<Company> {

    const response =
        await api.put<Company>(
            "/companies/me",
            data,
        );

    return response.data;
}


/*
 * ============================================================
 * Публичная компания
 * ============================================================
 */

export async function getCompanyById(
    companyId: number,
): Promise<Company> {

    const response =
        await api.get<Company>(
            `/companies/${companyId}`,
        );

    return response.data;
}