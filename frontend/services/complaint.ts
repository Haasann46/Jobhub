import api from "@/services/api";

import {
    Complaint,
    ComplaintAdminUpdate,
    ComplaintCreate,
} from "@/types/complaint";


export async function createComplaint(
    data: ComplaintCreate,
): Promise<Complaint> {

    const response =
        await api.post<Complaint>(
            "/complaints",
            data,
        );

    return response.data;
}


export async function getMyComplaints(): Promise<Complaint[]> {

    const response =
        await api.get<Complaint[]>(
            "/complaints/my",
        );

    return response.data;
}


export async function getComplaint(
    complaintId: number,
): Promise<Complaint> {

    const response =
        await api.get<Complaint>(
            `/complaints/${complaintId}`,
        );

    return response.data;
}


export async function getAdminComplaints(): Promise<Complaint[]> {

    const response =
        await api.get<Complaint[]>(
            "/complaints/admin",
        );

    return response.data;
}


export async function updateAdminComplaint(
    complaintId: number,
    data: ComplaintAdminUpdate,
): Promise<Complaint> {

    const response =
        await api.patch<Complaint>(
            `/complaints/admin/${complaintId}`,
            data,
        );

    return response.data;
}
