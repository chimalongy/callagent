import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { placeVapiCall } from "@/lib/vapi";
// GET /api/calls
// Returns the authed user's call history (used by dashboard; page-level fetches use server components)
export async function GET(req) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 20;
    const offset = (page - 1) * limit;
    const result = await db.query(`SELECT id, recipient_name, recipient_phone, voice_gender, status, created_at, duration_seconds
     FROM calls WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3`, [session.userId, limit, offset]);
    return NextResponse.json({ calls: result.rows, page });
}
// POST /api/calls
// Body: { callerName, recipientName?, recipientPhone, voice, instructions }
// 1. Inserts a call row in Neon with status = 'queued'
// 2. Fires the Vapi outbound call API
// 3. Updates the row with the vapi_call_id
// 4. Returns { callId }
export async function POST(req) {
    const session = await getSession();
    if (!session)
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    try {
        const { callerName, recipientName, recipientPhone, voice, instructions } = await req.json();
        if (!callerName || !recipientPhone || !voice || !instructions) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }
        // 1. Insert pending call row
        const insert = await db.query(`INSERT INTO calls
         (user_id, caller_name, recipient_name, recipient_phone, voice_gender, instructions, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'queued', NOW())
       RETURNING id`, [session.userId, callerName, recipientName || null, recipientPhone, voice, instructions]);
        const callId = insert.rows[0].id;
        // 2. Fire Vapi call
        const vapiCallId = await placeVapiCall({
            callerName,
            recipientName,
            recipientPhone,
            voice,
            instructions,
            internalCallId: callId,
        });
        // 3. Store Vapi's call ID for webhook matching
        await db.query("UPDATE calls SET vapi_call_id = $1 WHERE id = $2", [vapiCallId, callId]);
        return NextResponse.json({ callId });
    }
    catch (err) {
        console.error("[POST /api/calls] Error:", err.message);
        console.error("[POST /api/calls] Stack:", err.stack);
        return NextResponse.json({ error: err.message || "Failed to place call" }, { status: 500 });
    }
}
