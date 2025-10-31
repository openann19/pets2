/**
 * Application Review Types
 */

export interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLocation: string;
  applicantExperience: string;
  homeType: string;
  hasChildren: boolean;
  hasOtherPets: boolean;
  yardSize: string;
  workSchedule: string;
  applicationDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'interview';
  petName: string;
  petPhoto: string;
  notes: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

export type ApplicationStatus = Application['status'];

