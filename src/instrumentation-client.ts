type SentryModule = typeof import('./sentry.client');

let sentry: SentryModule | undefined;

// Sentry's browser SDK is the single biggest thing in the client bundle. A
// static import puts it in the main chunk, where parsing it delays the first
// paint of the LCP image on every page — so load it once the browser is idle.
// ponytail: an error thrown before it loads (the first second or so) isn't
// reported, and the initial pageload isn't traced. Go back to a static import
// if early-load errors ever need catching.
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  const load = async () => {
    sentry = await import('./sentry.client');
    sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 0,
    });
  };
  if ('requestIdleCallback' in window) requestIdleCallback(load);
  else setTimeout(load, 2000);
}

export const onRouterTransitionStart: SentryModule['captureRouterTransitionStart'] =
  (...args) => sentry?.captureRouterTransitionStart(...args);
