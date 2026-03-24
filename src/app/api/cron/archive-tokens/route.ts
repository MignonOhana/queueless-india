import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
const supabase = createServiceRoleClient();

export const maxDuration = 30

export async function GET(request: Request) {
  // Verify it's called from Vercel cron (not public)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // archive_old_tokens should be a stored procedure (RPC) in your database
  const { data, error } = await supabase.rpc('archive_old_tokens');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ archived: data, timestamp: new Date().toISOString() });
}
