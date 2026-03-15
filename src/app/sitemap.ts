import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const revalidate = 3600 // regenerate hourly

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const { data: businesses } = await (supabase as any)
    .from('businesses')
    .select('id, updated_at')

  const businessUrls = ((businesses as any[]) || []).map((b) => ({
    url: `https://queueless-india.vercel.app/b/${b.id}`,
    lastModified: b.updated_at ? new Date(b.updated_at) : new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  return [
    { url: 'https://queueless-india.vercel.app', lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: 'https://queueless-india.vercel.app/home', lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: 'https://queueless-india.vercel.app/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://queueless-india.vercel.app/contact', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ...businessUrls,
  ]
}
