export const revalidate = 60; // rebuild every 60 seconds max

import React from 'react';
import { Metadata } from 'next';
import PublicBusinessClient from '@/components/Business/PublicBusinessClient';
import { notFound } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';
import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service-role'

interface PageProps {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

interface BusinessWithDepts {
  business: any;
  departments: any[];
}

// --- SERVER SIDE SEO METADATA ---
export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const businessId = params.businessId;
  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('name, category, location, address, avg_rating')
    .eq('id', businessId)
    .single() as any

  if (!business) return { title: 'Business Not Found' }

  const location = business.address || business.location || 'India'
  const title = `${business.name} — Queue Token & Wait Time | QueueLess`
  const description = `Join the digital queue at ${business.name} in ${location}. Get your token on your phone — no waiting in line. Current wait time and token status available.`

  return {
    title,
    description,
    keywords: [
      `${business.name} queue`,
      `${business.name} token`,
      `${business.category?.toLowerCase()} queue ${location}`,
      `skip queue ${location}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://queueless-india.vercel.app/b/${businessId}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://queueless-india.vercel.app/b/${businessId}`,
    },
  }
}

export default async function PublicBusinessPage(props: PageProps) {
  const params = await props.params;
  const businessId = params.businessId;
  const supabase = await createClient();

  // 1. Fetch Business & Departments Data (SSR) via RPC with Fallback
  let business: any = null;
  let departments: any[] = [];

  const { data: businessData, error: bizErr } = await (supabase as any).rpc('get_business_with_departments', {
    p_business_id: businessId
  });

  if (!bizErr && businessData) {
    const typedData = businessData as BusinessWithDepts;
    business = typedData.business;
    departments = typedData.departments || [];
  } else {
    console.warn("RPC get_business_with_departments failed, using JS fallback...");
    const adminSupabase = createServiceRoleClient();

    const { data: biz } = await adminSupabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .maybeSingle();
      
    if (!biz) {
      console.error("Fallback failed: Business not found", businessId);
      notFound();
    }
    business = biz as any;

    const { data: rawDepts } = await adminSupabase
      .from('departments')
      .select('*')
      .eq('business_id', businessId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    const { data: todayQueues } = await adminSupabase
      .from('queues')
      .select('department_id, total_waiting')
      .eq('org_id', businessId)
      .eq('session_date', new Date().toISOString().split('T')[0]);

    const { data: staff } = await adminSupabase
      .from('staff_members')
      .select('department_id')
      .eq('business_id', businessId);

    departments = (rawDepts || []).map((d: any) => {
      const dbQ = (todayQueues || []).find((q: any) => q.department_id === d.id);
      const sCount = (staff || []).filter((s: any) => s.department_id === d.id).length;
      return {
        ...d,
        waiting_count: dbQ ? ((dbQ as any).total_waiting || 0) : 0,
        staff_count: sCount
      };
    });
  }

  // 2. Fetch Initial Tokens for stats
  const { count: waitingCount } = await supabase
    .from('tokens')
    .select('*', { count: 'exact', head: true })
    .eq('orgId', businessId)
    .eq('status', 'WAITING')
    .gte('createdAt', new Date().toISOString().split('T')[0]);

  // 3. Fetch Last 5 Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(5);

  const jsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: `Digital queue management at ${business.name}`,
    url: `https://queueless-india.vercel.app/b/${business.id}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address || '',
      addressLocality: business.location || '',
      addressCountry: 'IN',
    },
    ...(business.latitude && business.longitude && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: business.latitude,
        longitude: business.longitude,
      },
    }),
    ...(business.avg_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: business.avg_rating,
        reviewCount: business.total_reviews || 1,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="min-h-screen bg-background relative">
       {/* Regional Language Support (UX-2) */}
       <div className="absolute top-6 right-6 z-[100]">
          <LanguageSelector variant="compact" />
       </div>

       <PublicBusinessClient 
         business={business} 
         departments={departments}
         initialWaitingCount={waitingCount || 0} 
         initialReviews={reviews || []}
       />
    </main>
    </>
  );
}
