import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROUTES = ['/dashboard', '/posts/'];
const AUTH_ROUTES = ['/login', '/register'];

// 'session' is a frontend-domain cookie set after login/register.
// We cannot check httpOnly backend cookies here because they're scoped
// to the API domain (Render), not the frontend domain (Vercel).
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get('session')?.value;

  const isAdmin = ADMIN_ROUTES.some((r) => pathname.startsWith(r));
  const isAuth = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (isAdmin && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuth && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
