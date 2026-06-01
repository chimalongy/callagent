"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
// /call/new
// The core call-creation form — submits to POST /api/calls
// On success, redirects to /call/[id] for live status tracking
export default function NewCallPage() {
  const router = useRouter();
  const [callerName, setCallerName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [voice, setVoice] = useState("female");
  const [instructions, setInstructions] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callerName,
          recipientName,
          recipientPhone,
          voice,
          instructions,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        router.push(`/call/${data.callId}`);
      } else {
        const data = await res.json();
        console.error("[call/new] Error response:", data);
        setError(data.error || "Failed to place call");
        setLoading(false);
      }
    } catch (err) {
      console.error("[call/new] Error:", err);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">New call</p>
        <h1 className="text-3xl font-semibold text-white">Create a new outbound call</h1>
        <p className="text-slate-400">Tell the AI what to say and who to call.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <fieldset className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
          <legend className="px-2 text-sm font-semibold text-slate-200">Choose a voice</legend>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 transition hover:border-sky-400">
              <input type="radio" name="voice" value="female" checked={voice === "female"} onChange={() => setVoice("female")} className="h-4 w-4 accent-sky-400" />
              <span>
                <span className="font-medium text-white">Sophia</span>
                <span className="block text-sm text-slate-400">Warm, friendly (female)</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 transition hover:border-sky-400">
              <input type="radio" name="voice" value="male" checked={voice === "male"} onChange={() => setVoice("male")} className="h-4 w-4 accent-sky-400" />
              <span>
                <span className="font-medium text-white">Marcus</span>
                <span className="block text-sm text-slate-400">Deep, confident (male)</span>
              </span>
            </label>
          </div>
        </fieldset>

        <label className="block text-sm font-medium text-slate-300">
          Your name (the AI will introduce itself as calling on your behalf)
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="text" value={callerName} onChange={(e) => setCallerName(e.target.value)} placeholder="e.g. David Okafor" required />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          Recipient phone number
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="tel" value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} placeholder="+2348012345678" required />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Recipient name (optional)
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. Mrs. Adaeze" />
        </label>

        <label className="block text-sm font-medium text-slate-300">
          What should the AI discuss?
          <textarea className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="e.g. Call to confirm the Friday 3pm appointment. If they ask to reschedule, suggest Saturday morning. Keep it brief and polite." rows={5} required />
        </label>

        {error && <p role="alert" className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}

        <button className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={loading}>
          {loading ? "Placing call…" : "Place call"}
        </button>
      </form>
    </main>
  );
}
