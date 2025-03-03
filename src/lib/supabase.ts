
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Check if we're in development mode and provide more helpful messages
if ((!supabaseUrl || !supabaseAnonKey) && import.meta.env.DEV) {
  console.warn('⚠️ Supabase environment variables are missing. Using empty strings for development. Add them to your .env file for proper functionality.');
}

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Helper functions for error handling
export const handleError = (error: Error) => {
  console.error('Error:', error);
  toast.error(error.message || 'An error occurred');
  return null;
};
