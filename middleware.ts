import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';

const PROTECTED = ['/game', '/profile'];
const AUTH_ONLY = ['/login', '/register']; // redirect to /game if already logged in

export function middleware(req: NextRequest) {
  const token = req.cookies.get('pof_token')?.value;
  // const user = token ? verifyToken(token) : null;
  const user = token ? true : null;
  const { pathname } = req.nextUrl;

  if (PROTECTED.some(p => pathname.startsWith(p)) && !user) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (AUTH_ONLY.some(p => pathname.startsWith(p)) && user) {
    const url = req.nextUrl.clone();
    url.pathname = '/game';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/game', '/profile', '/login', '/register'],
};
