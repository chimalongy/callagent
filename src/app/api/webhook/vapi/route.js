import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
// POST /api/webhook/vapi
// Receives real-time call events from Vapi and updates the Neon call record
//
// Vapi event types we handle:
//   call-started      → status = 'in-progress'
//   call-ended        → status = 'completed', duration, transcript, summary
//   call-failed       → status = 'failed'
//
// Configure this URL in Vapi dashboard → Settings → Webhooks
function verifyVapiSignature(req, rawBody) {
    const signature = req.headers.get("x-vapi-signature");
    if (!signature || !process.env.VAPI_WEBHOOK_SECRET)
        return false;
    const expected = crypto
        .createHmac("sha256", process.env.VAPI_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");
    return signature === expected;
}
export async function POST(req) {
    const rawBody = await req.text();
    if (!verifyVapiSignature(req, rawBody)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    let payload;
    try {
        payload = JSON.parse(rawBody);
    }
    catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }
    const { message } = payload;
    if (!message)
        return NextResponse.json({ ok: true });
    const type = message.type;
    const call = message.call;
    const vapiCallId = call?.id;
    if (!vapiCallId)
        return NextResponse.json({ ok: true });
    if (type === "call-started") {
        await db.query("UPDATE calls SET status = 'in-progress' WHERE vapi_call_id = $1", [vapiCallId]);
    }
    if (type === "end-of-call-report") {
        const durationSeconds = call?.duration;
        const transcript = message.transcript;
        const summary = message.summary;
        await db.query(`UPDATE calls
       SET status = 'completed',
           duration_seconds = $2,
           transcript = $3,
           summary = $4,
           ended_at = NOW()
       WHERE vapi_call_id = $1`, [vapiCallId, durationSeconds ?? null, transcript ?? null, summary ?? null]);
    }
    if (type === "call-failed" || call?.endedReason?.includes("error")) {
        await db.query("UPDATE calls SET status = 'failed', ended_at = NOW() WHERE vapi_call_id = $1", [vapiCallId]);
    }
    return NextResponse.json({ ok: true });
}
