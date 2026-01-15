import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://yvmzzgphvfvaovlmmjsa.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2bXp6Z3BodmZ2YW92bG1tanNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0NzgyNDEsImV4cCI6MjA4NDA1NDI0MX0.PrHpkAE07XXiNLNoNQTxBxcmNSIjAj1t5fu13ibdjY4";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});