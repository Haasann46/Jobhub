import api from "./api";

import {
  Invitation,
  InvitationCreate,
} from "@/types/invitation";


export const createInvitation = async (
  data: InvitationCreate,
): Promise<Invitation> => {
  const response = await api.post<Invitation>(
    "/invitations",
    data,
  );

  return response.data;
};


export const getMyInvitations = async (): Promise<
  Invitation[]
> => {
  const response = await api.get<Invitation[]>(
    "/invitations/my",
  );

  return response.data;
};


export const getInvitation = async (
  invitationId: number,
): Promise<Invitation> => {
  const response = await api.get<Invitation>(
    `/invitations/${invitationId}`,
  );

  return response.data;
};


export const acceptInvitation = async (
  invitationId: number,
): Promise<Invitation> => {
  const response = await api.patch<Invitation>(
    `/invitations/${invitationId}/accept`,
  );

  return response.data;
};


export const declineInvitation = async (
  invitationId: number,
): Promise<Invitation> => {
  const response = await api.patch<Invitation>(
    `/invitations/${invitationId}/decline`,
  );

  return response.data;
};