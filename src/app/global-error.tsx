'use client';

import * as Sentry from '@sentry/nextjs';
import Link from 'next/link';
import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          background: '#fffdf8',
          color: '#000',
          fontFamily: 'Georgia, serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <h1 style={{ fontWeight: 400, fontSize: '1.75rem' }}>
          Something went wrong
        </h1>
        <p style={{ fontFamily: 'system-ui, sans-serif', color: '#5c574e' }}>
          Please refresh, or head back to{' '}
          <Link href="/" style={{ color: '#000' }}>
            the home page
          </Link>
          .
        </p>
      </body>
    </html>
  );
}
