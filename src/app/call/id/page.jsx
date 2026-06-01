"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
const ACTIVE_STATUSES = new Set(["queued", "in-progress"]);
export default function CallDetailPage() {
  const { id } = useParams();
  const [call, setCall] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let isMounted = true;
    async function loadCall() {
      const res = await fetch(`/api/calls/${id}`);
      if (!res.ok) {
        if (isMounted) setError("Call not found");
        return null;
      }
      const data = await res.json();
      if (isMounted) setCall(data);
      return data;
    }
    loadCall();
    // Poll while call is active
    const interval = setInterval(async () => {
      const data = await loadCall();
      if (data && !ACTIVE_STATUSES.has(data.status)) {
        clearInterval(interval);
      }
    }, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [id]);
  if (error)
    return <p className="text-center text-rose-300">{error}</p>;
  if (!call)
    return <p className="text-center text-slate-400">Loading…</p>;
  const isActive = ACTIVE_STATUSES.has(call.status);
  const voiceName = call.voice_gender === "female" ? "Sophia" : "Marcus";
  return (
    <main className="mx-auto max-w-4xl space-y-8 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Call details</p>
        <h1 className="text-3xl font-semibold text-white">Call to {call.recipient_name || call.recipient_phone}</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
          <div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-400">Status</dt>
                <dd className="mt-1 text-lg font-medium text-white">{call.status}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Voice</dt>
                <dd className="mt-1 text-lg font-medium text-white">{voiceName}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Caller name</dt>
                <dd className="mt-1 text-lg font-medium text-white">{call.caller_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Started</dt>
                <dd className="mt-1 text-lg font-medium text-white">{new Date(call.created_at).toLocaleString()}</dd>
              </div>
              {call.ended_at && (
                <div>
                  <dt className="text-sm text-slate-400">Ended</dt>
                  <dd className="mt-1 text-lg font-medium text-white">{new Date(call.ended_at).toLocaleString()}</dd>
                </div>
              )}
              {call.duration_seconds && (
                <div>
                  <dt className="text-sm text-slate-400">Duration</dt>
                  <dd className="mt-1 text-lg font-medium text-white">{call.duration_seconds}s</dd>
                </div>
              )}
            </dl>
          </div>
          {isActive && (
            <p aria-live="polite" className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sky-200">
              {call.status === "queued" ? "Connecting…" : `${voiceName} is speaking now. Refreshing every 5s…`}
            </p>
          )}
        </div>
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
            <h2 className="text-xl font-semibold text-white">Instructions</h2>
            <p className="mt-3 text-slate-300">{call.instructions}</p>
          </section>
          {call.transcript && (
            <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
              <h2 className="text-xl font-semibold text-white">Transcript</h2>
              <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-900 p-4 text-sm text-slate-300">{call.transcript}</pre>
            </section>
          )}
          {call.summary && (
            <section className="rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
              <h2 className="text-xl font-semibold text-white">Call summary</h2>
              <p className="mt-3 text-slate-300">{call.summary}</p>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
