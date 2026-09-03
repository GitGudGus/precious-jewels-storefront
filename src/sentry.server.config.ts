import * as Sentry from '@sentry/nextjs';

// Only imported by `instrumentation.ts` when NEXT_PUBLIC_SENTRY_DSN is set.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  enableLogs: false,
});
