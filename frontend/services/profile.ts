import api from "@/services/api";

import {
    Profile,
    ProfileUpdate,
} from "@/types/profile";


export async function getMyProfile():
    Promise<Profile> {

    const response =
        await api.get<Profile>(
            "/profile/me",
        );

    return response.data;
}


export async function updateMyProfile(
    data: ProfileUpdate,
): Promise<Profile> {

    const response =
        await api.put<Profile>(
            "/profile/me",
            data,
        );

    return response.data;
}