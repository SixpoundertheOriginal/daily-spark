// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kknjntjniumgajltgrfs.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbmpudGpuaXVtZ2FqbHRncmZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMjY5NDQsImV4cCI6MjA1NjYwMjk0NH0.07R6WYeQuhd9YpGbtCgo9oTqXMiHClQ0LGRIkCibMTE";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);