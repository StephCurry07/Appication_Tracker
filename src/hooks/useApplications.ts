import { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from '../types';
import { saveApplications, loadApplications, generateId, getCurrentDateTime } from '../utils/storage';

export const useApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Load applications from localStorage on mount
  useEffect(() => {
    const loadedApplications = loadApplications();
    setApplications(loadedApplications);
    setLoading(false);
  }, []);

  // Save applications to localStorage whenever applications change
  useEffect(() => {
    if (!loading) {
      saveApplications(applications);
    }
  }, [applications, loading]);

  const addApplication = (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newApplication: JobApplication = {
      ...applicationData,
      id: generateId(),
      createdAt: getCurrentDateTime(),
      updatedAt: getCurrentDateTime()
    };

    setApplications(prev => [...prev, newApplication]);
    return newApplication;
  };

  const updateApplication = (id: string, updates: Partial<JobApplication>) => {
    setApplications(prev =>
      prev.map(app =>
        app.id === id
          ? { ...app, ...updates, updatedAt: getCurrentDateTime() }
          : app
      )
    );
  };

  const deleteApplication = (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status);
  };

  const getApplicationsCount = () => applications.length;

  const clearAllApplications = () => {
    setApplications([]);
  };

  return {
    applications,
    loading,
    addApplication,
    updateApplication,
    deleteApplication,
    getApplicationById,
    getApplicationsByStatus,
    getApplicationsCount,
    clearAllApplications
  };
};