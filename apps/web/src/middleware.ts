import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Presence-only check for the refresh cookie. This is a UX guard against
// flash-of-content — actual auth still happens on every API call.
const REFRESH_COOKIE = 'sumosta_rt';

export function middleware(req: NextRequest): NextResponse {
  const rt = req.cookies.get(REFRESH_COOKIE);

  if (!rt) {
    const url = req.nextUrl.clone();
    const nextPath = req.nextUrl.pathname + req.nextUrl.search;
    url.pathname = '/auth/login';
    url.search   = `?next=${encodeURIComponent(nextPath)}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*'],
};
