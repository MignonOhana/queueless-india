'use client'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in dev, send to Umami in prod
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }
    // Track poor performance — LCP > 2500ms is bad for Indian 3G users
    if (metric.name === 'LCP' && metric.value > 2500) {
      if (typeof window !== 'undefined' && (window as any).umami) {
        (window as any).umami.track('poor_lcp', { value: Math.round(metric.value) })
      }
    }
  })
  return null
}
