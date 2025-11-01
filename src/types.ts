export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
  location?: string;
  salary?: string;
  notes?: string;
  contactPerson?: string;
  contactEmail?: string;
  jobUrl?: string;
  // AI-extracted fields
  experienceRequired?: string;
  techStack?: string[]; // Will be stored as JSON string in DB
  jobType?: string;
  workMode?: string;
  benefits?: string[]; // Will be stored as JSON string in DB
  requirements?: string[]; // Will be stored as JSON string in DB
  responsibilities?: string[]; // Will be stored as JSON string in DB
  applicationDeadline?: string;
  aiAnalysisConfidence?: number;
  aiAnalyzedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  APPLIED = 'applied',
  PHONE_SCREEN = 'phone_screen',
  INTERVIEW = 'interview',
  TECHNICAL = 'technical',
  FINAL_ROUND = 'final_round',
  OFFER = 'offer',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

export const StatusLabels: Record<ApplicationStatus, string> = {
  [ApplicationStatus.DRAFT]: 'Draft',
  [ApplicationStatus.APPLIED]: 'Applied',
  [ApplicationStatus.PHONE_SCREEN]: 'Phone Screen',
  [ApplicationStatus.INTERVIEW]: 'Interview',
  [ApplicationStatus.TECHNICAL]: 'Technical',
  [ApplicationStatus.FINAL_ROUND]: 'Final Round',
  [ApplicationStatus.OFFER]: 'Offer',
  [ApplicationStatus.REJECTED]: 'Rejected',
  [ApplicationStatus.WITHDRAWN]: 'Withdrawn'
};