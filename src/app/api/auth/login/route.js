import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
// POST /api/auth/login
// Body: { email, password }
// Validates credentials against Neon, sets session cookie
export async function POST(req) {
    try {
        const { email, password } = await req.json();
        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }
        const result = await db.query("SELECT id, name, email, password_hash FROM users WHERE email = $1", [email.toLowerCase()]);
        if (result.rows.length === 0) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
        const user = result.rows[0];
        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
        }
        const response = NextResponse.json({ ok: true });
        await createSession(response, { userId: user.id, name: user.name, email: user.email });
        console.log("[login] Session created for user:", user.id);
        return response;
    }
    catch (err) {
        console.error("[login] Error:", err.message);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
