import { Database } from './database';

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Helper to cast any to a typed supabase client if inference fails
import { SupabaseClient } from '@supabase/supabase-js';
export type TypedSupabaseClient = SupabaseClient<Database>;
