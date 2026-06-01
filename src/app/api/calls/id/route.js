import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
// GET /api/calls/[id]
// Returns a single call record — used by the /call/[id] polling page
export async function GET(req, { params }) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const result = await db.query(`SELECT id, caller_name, recipient_name, recipient_phone, voice_gender,
            instructions, status, duration_seconds, transcript, summary,
            created_at, ended_at
     FROM calls WHERE id = $1 AND user_id = $2`, [params.id, session.userId]);
    if (result.rows.length === 0) {
        return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
}
// DELETE /api/calls/[id]
// Soft-delete (sets deleted_at); call records are kept for audit purposes
export async function DELETE(req, { params }) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await db.query("UPDATE calls SET deleted_at = NOW() WHERE id = $1 AND user_id = $2", [params.id, session.userId]);
    return NextResponse.json({ ok: true });
}
