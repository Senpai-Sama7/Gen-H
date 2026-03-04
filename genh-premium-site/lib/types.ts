export type InquiryStatus = "new" | "qualified" | "booked";

export interface InquiryRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  budgetBand: string;
  launchWindow: string;
  goals: string;
  createdAt: string;
  status: InquiryStatus;
}

export interface InquiryInput {
  name: string;
  company: string;
  email: string;
  phone: string;
  projectType: string;
  budgetBand: string;
  launchWindow: string;
  goals: string;
}
