import { NextRequest } from 'next/server'

const requests = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(req: NextRequest, limit = 10, windowMs = 60000): boolean {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  const entry = requests.get(ip)

  if (!entry || now > entry.resetAt) {
    requests.set(ip, { count: 1, resetAt: now + windowMs })
    return true // allowed
  }

  if (entry.count >= limit) return false // blocked

  entry.count++
  return true
}
