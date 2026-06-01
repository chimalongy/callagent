import { NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

// Protects /dashboard/* and /call/* — redirects unauthenticated requests to /auth/login
// Auth pages redirect authenticated users to /dashboard

const PROTECTED = ["/dashboard", "/call"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const session = await getSessionFromRequest(req);

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PAGES.some((p) => pathname.startsWith(p));

  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/call/:path*", "/auth/:path*"],
};