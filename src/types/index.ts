export interface JobApplication {
  id: string;
  company: string;
  position: string;
  status: ApplicationStatus;
  dateApplied: string;
  salary?: string;
  location?: string;
  jobUrl?: string;
  notes?: string;
  contactPerson?: string;
  contactEmail?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 
  | 'applied'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface StorageAdapter {
  save(applications: JobApplication[]): Promise<void>;
  load(): Promise<JobApplication[]>;
  clear(): Promise<void>;
}