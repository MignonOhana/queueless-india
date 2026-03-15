import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions — keeps free tier usage low
  replaysSessionSampleRate: 0, // disable — uses quota
  replaysOnErrorSampleRate: 0, // disable — uses quota
  environment: process.env.NODE_ENV,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded', // harmless browser quirk
    'Non-Error promise rejection', // Supabase auth noise
  ],
  enableLogs: true,
  integrations: [
    Sentry.replayIntegration(),
  ],
});
