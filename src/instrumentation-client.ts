import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  environment: process.env.NODE_ENV,
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection',
  ],
  enableLogs: true,
  integrations: [
    Sentry.replayIntegration(),
  ],
});

// Required for Next.js 16 navigation instrumentation
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
