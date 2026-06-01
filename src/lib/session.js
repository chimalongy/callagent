import { NextResponse, NextRequest } from "next/server";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "ringai_session";
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
const EXPIRY = "7d";

export async function createSession(response, payload) {
 const token = await new SignJWT({ ...payload })
   .setProtectedHeader({ alg: "HS256" })
   .setExpirationTime(EXPIRY)
   .setIssuedAt()
   .sign(SECRET);

 response.cookies.set(COOKIE_NAME, token, {
   httpOnly: true,
   secure: process.env.NODE_ENV === "production",
   sameSite: "lax",
   maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
   path: "/",
 });
 console.log("[session] Cookie set for:", payload.email);
}

export async function getSession() {
 try {
   const cookieStore = await cookies();
   const token = cookieStore.get(COOKIE_NAME)?.value;
   if (!token) return null;
   const { payload } = await jwtVerify(token, SECRET);
   return payload;
 } catch {
   return null;
 }
}

export function clearSession(response) {
 response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
}

// For use in middleware — reads cookie from NextRequest (no cookies() import needed)
export async function getSessionFromRequest(req) {
 try {
   const token = req.cookies.get(COOKIE_NAME)?.value;
   if (!token) return null;
   const { payload } = await jwtVerify(token, SECRET);
   return payload;
 } catch {
   return null;
 }
}