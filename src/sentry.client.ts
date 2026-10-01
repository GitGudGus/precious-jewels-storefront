// Loaded lazily by `instrumentation-client.ts`. Named re-exports (rather than
// `import('@sentry/nextjs')` directly) so the bundler can tree-shake the SDK.
export { captureRouterTransitionStart, init } from '@sentry/nextjs';
