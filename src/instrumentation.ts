import * as Sentry from '@sentry/nextjs';

/**
 * Error monitoring — inert unless `NEXT_PUBLIC_SENTRY_DSN` is set (see
 * `docs/launch-checklist.md`). Guarded so local dev and CI stay quiet.
 */
export async function register() {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
