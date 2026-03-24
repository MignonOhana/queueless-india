import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';
const supabase = createServiceRoleClient();

export const maxDuration = 30

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Close all queues from yesterday that are still "active"
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const { error } = await (supabase as any)
    .from('queues')
    .update({ is_active: false, is_accepting_tokens: false })
    .eq('session_date', yesterdayStr)
    .eq('is_active', true);

  // Also cancel WAITING tokens for those queues
  await (supabase as any)
    .from('tokens')
    .update({ status: 'CANCELLED' })
    .eq('status', 'WAITING')
    .lt('createdAt', `${yesterdayStr}T23:59:59Z`);

  return NextResponse.json({ success: !error })
}
