import { createClient } from '@supabase/supabase-js';
import { JobApplication } from '../types';

// These will be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types for Supabase
export interface Database {
  public: {
    Tables: {
      job_applications: {
        Row: JobApplication;
        Insert: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt'>>;
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
        };
      };
    };
  };
}

// Type the supabase client
export type SupabaseClient = typeof supabase;