import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup', '/forgot-password'];
const PUBLIC_PREFIXES = ['/_next', '/api', '/favicon', '/public'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and internal Next.js paths
  if (PUBLIC_PATHS.includes(pathname)) return NextResponse.next();
  if (PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))) return NextResponse.next();

  // Check for auth token in cookies
  const token = req.cookies.get('ino_auth_token')?.value;

  // In dev mode without API, skip auth check
  if (!process.env.NEXT_PUBLIC_API_URL) {
    return NextResponse.next();
  }

  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
