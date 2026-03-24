import { SupabaseClient } from '@supabase/supabase-js';

interface DummyDatabase {
  public: {
    Tables: {
      test: {
        Row: { id: string; name: string }
        Insert: { id?: string; name: string }
        Update: { id?: string; name?: string }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}

const supabase = {} as SupabaseClient<DummyDatabase>;
const { data } = await supabase.from('test').select('*');
if (data) {
    console.log(data[0].name); // This should be string
}
