import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";
// POST /api/auth/logout
// Clears session cookie and redirects to /auth/login
export async function POST() {
    const response = NextResponse.redirect(new URL("/auth/login", process.env.NEXT_PUBLIC_APP_URL));
    clearSession(response);
    return response;
}
