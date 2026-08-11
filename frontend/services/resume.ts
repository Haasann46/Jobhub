import api from "@/services/api";

import {
    Resume,
    ResumeCreate,
    ResumeUpdate,
} from "@/types/resume";


function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem(
        "access_token",
    );
}


function getAuthConfig() {
    const token = getAccessToken();

    return {
        headers: token
            ? {
                Authorization:
                    `Bearer ${token}`,
            }
            : undefined,
    };
}


export async function getMyResumes(): Promise<Resume[]> {

    const response = await api.get<Resume[]>(
        "/resumes/my",
        getAuthConfig(),
    );

    return response.data;
}


export async function createResume(
    data: ResumeCreate,
): Promise<Resume> {

    const response =
        await api.post<Resume>(
            "/resumes",
            data,
            getAuthConfig(),
        );

    return response.data;
}


export async function updateResume(
    resumeId: number,
    data: ResumeUpdate,
): Promise<Resume> {

    const response =
        await api.patch<Resume>(
            `/resumes/${resumeId}`,
            data,
            getAuthConfig(),
        );

    return response.data;
}


export async function deleteResume(
    resumeId: number,
): Promise<void> {

    await api.delete(
        `/resumes/${resumeId}`,
        getAuthConfig(),
    );
}