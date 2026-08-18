import api from "@/services/api";

import {
    Company,
    CompanyCreateData,
    CompanyUpdateData,
} from "@/types/company";


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


export async function getMyCompany():
    Promise<Company> {

    const response =
        await api.get<Company>(
            "/companies/me",
        );

    return response.data;
}


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