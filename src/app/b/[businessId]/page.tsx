import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { supabase } from '@/lib/supabaseClient';
import PublicBusinessClient from '@/components/Business/PublicBusinessClient';
import { notFound } from 'next/navigation';
import LanguageSelector from '@/components/LanguageSelector';

interface Props {
  params: { businessId: string };
}

// --- SERVER SIDE SEO METADATA ---
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { businessId } = params;
  
  const { data: business } = await supabase
    .from('businesses')
    .select('name, description, avg_rating, total_reviews')
    .eq('id', businessId)
    .single();

  if (!business) return { title: 'Business Not Found | QueueLess India' };

  return {
    title: `${business.name} | Live Queue Status | QueueLess`,
    description: business.description || `Join the digital queue for ${business.name}. Current wait time and live status available.`,
    openGraph: {
      title: `${business.name} - Join Digital Queue`,
      description: `⭐ ${business.avg_rating} Stars | ${business.total_reviews} reviews. Join now to save time.`,
      images: ['/og-business-default.png'], // You can make this dynamic with a dedicated OG route
    },
  };
}

export default async function PublicBusinessPage({ params }: Props) {
  const { businessId } = params;

  // 1. Fetch Business Initial Data (SSR)
  const { data: business, error: bizErr } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', businessId)
    .single();

  if (bizErr || !business) {
    notFound();
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

  return (
    <main className="min-h-screen bg-[#0A0A0F] relative">
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
  );
}
