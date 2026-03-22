import { createClient } from './src/lib/supabase/client';
const supabase = createClient();
const a = supabase.from('businesses').insert({ name: 'test' } as any);
