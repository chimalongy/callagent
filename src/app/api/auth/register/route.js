import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { createSession } from "@/lib/session";
// POST /api/auth/register
// Body: { name, email, password }
// Creates user in Neon, starts session, returns 200
export async function POST(req) {
    try {
        const { name, email, password } = await req.json();
        if (!name || !email || !password) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }
        // Check for existing user
        const existing = await db.query("SELECT id FROM users WHERE email = $1", [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
        }
        const passwordHash = await hashPassword(password);
        const result = await db.query(`INSERT INTO users (name, email, password_hash, default_voice, created_at)
       VALUES ($1, $2, $3, 'female', NOW())
       RETURNING id, name, email`, [name, email.toLowerCase(), passwordHash]);
        const user = result.rows[0];
        const response = NextResponse.json({ ok: true });
        await createSession(response, { userId: user.id, name: user.name, email: user.email });
        return response;
    }
    catch (err) {
        console.error("[register]", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
