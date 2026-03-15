export const revalidate = 60; // rebuild every 60 seconds max

import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import PublicBusinessClient from '@/components/Business/PublicBusinessClient';
import { notFound } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: { businessId: string };
}

// --- SERVER SIDE SEO METADATA ---
export async function generateMetadata({ params }: { params: { businessId: string } }): Promise<Metadata> {
  const supabase = await createClient()
  const { data: business } = await supabase
    .from('businesses')
    .select('name, category, location, address, avg_rating')
    .eq('id', params.businessId)
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
      url: `https://queueless-india.vercel.app/b/${params.businessId}`,
      type: 'website',
    },
    alternates: {
      canonical: `https://queueless-india.vercel.app/b/${params.businessId}`,
    },
  }
}

export default async function PublicBusinessPage({ params }: Props) {
  const { businessId } = params;
  const supabase = await createClient();

  // 1. Fetch Business Initial Data (SSR)
  const { data: business, error: bizErr } = await (supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single() as any);

  if (bizErr || !business) {
    notFound();
  }

  // 2. Fetch Initial Tokens for stats
  const { count: waitingCount } = await supabase
    .from('tokens')
    .select('*', { count: 'exact', head: true })
    .eq('orgId', businessId)
    .eq('status', 'WAITING')
    .gte('createdAt', new Date().toISOString().split('T')[0]) as any;

  // 3. Fetch Last 5 Reviews
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(5) as any;

  const jsonLd = {
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
         initialWaitingCount={waitingCount || 0} 
         initialReviews={reviews || []}
       />
    </main>
    </>
  );
}
