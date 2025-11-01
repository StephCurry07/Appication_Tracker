import { useState, useEffect } from 'react';
import { JobApplication, ApplicationStatus } from '../types';
import { supabase } from '../lib/supabase';
import { generateId, getCurrentDateTime } from '../utils/storage';
import { processJobApplicationData, prepareJobApplicationForStorage } from '../utils/jsonUtils';

export const useSupabaseApplications = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Check authentication status
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load applications from Supabase
  useEffect(() => {
    if (user) {
      loadApplications();
    } else {
      // Only clear applications if we actually had some before
      setApplications(prev => prev.length > 0 ? [] : prev);
      setLoading(false);
    }
  }, [user]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('dateApplied', { ascending: false });

      if (error) throw error;

      // Parse JSON fields back to arrays with error handling
      const processedData = (data || []).map(processJobApplicationData);

      setApplications(processedData);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const addApplication = async (applicationData: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) {
      setError('You must be logged in to add applications');
      return null;
    }

    try {
      setError(null);
      const baseApplication = {
        ...applicationData,
        id: generateId(),
        user_id: user.id,
        createdAt: getCurrentDateTime(),
        updatedAt: getCurrentDateTime()
      };

      const newApplication = prepareJobApplicationForStorage(baseApplication);

      const { data, error } = await supabase
        .from('job_applications')
        .insert([newApplication])
        .select()
        .single();

      if (error) throw error;

      const processedData = processJobApplicationData(data);
      setApplications(prev => [processedData, ...prev]);
      return processedData;
    } catch (err) {
      console.error('Error adding application:', err);
      setError(err instanceof Error ? err.message : 'Failed to add application');
      return null;
    }
  };

  const updateApplication = async (id: string, updates: Partial<JobApplication>) => {
    if (!user) {
      setError('You must be logged in to update applications');
      return;
    }

    try {
      setError(null);

      // Convert arrays to JSON for storage if they exist in updates
      const processedUpdates = prepareJobApplicationForStorage(updates);

      const { data, error } = await supabase
        .from('job_applications')
        .update(processedUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Parse JSON fields back to arrays for the updated data with error handling
      const processedData = processJobApplicationData(data);

      setApplications(prev =>
        prev.map(app => app.id === id ? processedData : app)
      );
    } catch (err) {
      console.error('Error updating application:', err);
      setError(err instanceof Error ? err.message : 'Failed to update application');
    }
  };

  const deleteApplication = async (id: string) => {
    if (!user) {
      setError('You must be logged in to delete applications');
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== id));
    } catch (err) {
      console.error('Error deleting application:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete application');
    }
  };

  const getApplicationById = (id: string) => {
    return applications.find(app => app.id === id);
  };

  const getApplicationsByStatus = (status: ApplicationStatus) => {
    return applications.filter(app => app.status === status);
  };

  const getApplicationsCount = () => applications.length;

  const clearAllApplications = async () => {
    if (!user) {
      setError('You must be logged in to clear applications');
      return;
    }

    try {
      setError(null);
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('user_id', user.id); // Delete all records for the current user

      if (error) throw error;

      setApplications([]);
    } catch (err) {
      console.error('Error clearing applications:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear applications');
    }
  };

  // Authentication methods
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error signing in:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      return null;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      return null;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
    }
  };

  return {
    applications,
    loading,
    error,
    user,
    addApplication,
    updateApplication,
    deleteApplication,
    getApplicationById,
    getApplicationsByStatus,
    getApplicationsCount,
    clearAllApplications,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshApplications: loadApplications
  };
};