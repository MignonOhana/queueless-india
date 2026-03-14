import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, category, location, phone, description, serviceMins } = body;

    if (!name || !category || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Slugify name + city
    const slug = (name + '-' + location)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const businessData = {
      id: slug,
      name,
      category,
      location,
      phone,
      description,
      serviceMins: parseInt(serviceMins) || 15,
      owner_id: session.user.id,
      plan: 'free',
      claim_status: 'claimed',
      is_open: false,
      is_accepting_tokens: true,
      onboarding_step: 2
    };

    const { data, error } = await supabase
      .from('businesses')
      .insert([businessData])
      .select()
      .single();

    if (error) {
      // If slug exists, try appending random suffix once
      if (error.code === '23505') {
        const altSlug = `${slug}-${Math.floor(Math.random() * 1000)}`;
        const { data: altData, error: altError } = await supabase
          .from('businesses')
          .insert([{ ...businessData, id: altSlug }])
          .select()
          .single();
        
        if (altError) throw altError;
        return NextResponse.json(altData);
      }
      throw error;
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Business creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
