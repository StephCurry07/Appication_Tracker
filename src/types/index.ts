export interface JobApplication {
  id: string;
  company: string;
  position: string;
  location: string;
  salaryRange?: string;
  jobDescription?: string;
  applicationDate: string;
  status: ApplicationStatus;
  source: string; // LinkedIn, Indeed, Company Website, etc.
  contactPerson?: string;
  contactEmail?: string;
  notes: string;
  interviews: Interview[];
  documents: Document[];
  followUps: FollowUp[];
  createdAt: string;
  updatedAt: string;
}

export interface Interview {
  id: string;
  type: InterviewType;
  date: string;
  time?: string;
  interviewer?: string;
  location?: string;
  notes?: string;
  feedback?: string;
  outcome?: InterviewOutcome;
}

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  url?: string;
  notes?: string;
}

export interface FollowUp {
  id: string;
  date: string;
  type: FollowUpType;
  notes: string;
  completed: boolean;
}

export enum ApplicationStatus {
  DRAFT = 'draft',
  APPLIED = 'applied',
  UNDER_REVIEW = 'under_review',
  INTERVIEW_SCHEDULED = 'interview_scheduled',
  INTERVIEW_COMPLETED = 'interview_completed',
  OFFER_RECEIVED = 'offer_received',
  OFFER_ACCEPTED = 'offer_accepted',
  OFFER_DECLINED = 'offer_declined',
  REJECTED = 'rejected',
  ON_HOLD = 'on_hold'
}

export enum InterviewType {
  PHONE_SCREENING = 'phone_screening',
  VIDEO_CALL = 'video_call',
  IN_PERSON = 'in_person',
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  PANEL = 'panel',
  FINAL = 'final'
}

export enum InterviewOutcome {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  PENDING = 'pending'
}

export enum DocumentType {
  RESUME = 'resume',
  COVER_LETTER = 'cover_letter',
  JOB_DESCRIPTION = 'job_description',
  PORTFOLIO = 'portfolio',
  REFERENCES = 'references',
  OTHER = 'other'
}

export enum FollowUpType {
  EMAIL = 'email',
  PHONE_CALL = 'phone_call',
  LINKEDIN_MESSAGE = 'linkedin_message',
  APPLICATION_STATUS = 'application_status',
  THANK_YOU_NOTE = 'thank_you_note'
}