export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined";

export interface Invitation {
  id: number;

  employer_id: number;
  candidate_id: number;
  vacancy_id: number;

  message: string | null;

  status: InvitationStatus;

  candidate_email: string;
  candidate_name: string | null;

  employer_email: string;

  vacancy_title: string;
  company_name: string;

  created_at: string;
  updated_at: string;
}

export interface InvitationCreate {
  candidate_email: string;
  vacancy_id: number;
  message?: string | null;
}