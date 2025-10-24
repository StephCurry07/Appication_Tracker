import { JobApplication } from '../types';

const STORAGE_KEY = 'job-applications';

export const saveApplications = (applications: JobApplication[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
};

export const loadApplications = (): JobApplication[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error parsing stored applications:', error);
    return [];
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};