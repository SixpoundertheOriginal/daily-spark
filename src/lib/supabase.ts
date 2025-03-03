
import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Get environment variables with fallbacks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://kknjntjniumgajltgrfs.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbmpudGpuaXVtZ2FqbHRncmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMjY5NDQsImV4cCI6MjA1NjYwMjk0NH0.07R6WYeQuhd9YpGbtCgo9oTqXMiHClQ0LGRIkCibMTE';

// Check if we're in development mode and provide more helpful messages
if (import.meta.env.DEV) {
  console.log('🔌 Supabase configured with:', { 
    url: supabaseUrl ? 'Valid URL' : 'Missing URL',
    key: supabaseAnonKey ? 'Valid Key' : 'Missing Key'
  });
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
