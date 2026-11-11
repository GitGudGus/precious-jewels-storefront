import { NextResponse, type NextRequest } from 'next/server';

// Temporary: the site is paused until new merch is in (owner, 2026-11-10).
// Every page renders the holding page; delete this file and
// `src/app/back-soon/` to relaunch.
export function proxy(request: NextRequest) {
  return NextResponse.rewrite(new URL('/back-soon', request.url));
}

export const config = {
  // Skip Next internals, files (robots.txt, sitemap.xml, images) and the page itself.
  matcher: '/((?!_next/|back-soon|.*\\..*).*)',
};
