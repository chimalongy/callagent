"use client";
import { useState } from "react";
// /dashboard/settings
// Lets users update: display name, default voice preference, default caller ID name
// Submits to PATCH /api/calls (user record update — extend the route or add /api/user)
export default function SettingsPage() {
  const [name, setName] = useState("");
  const [defaultVoice, setDefaultVoice] = useState("female");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/user/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, defaultVoice }),
    });
    setSaved(true);
    setLoading(false);
    setTimeout(() => setSaved(false), 3000);
  }
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Settings</p>
        <h1 className="text-3xl font-semibold text-white">Update your preferences</h1>
        <p className="text-slate-400">Control your display name and default voice for future calls.</p>
      </div>
      <form onSubmit={handleSave} className="mt-8 space-y-6">
        <label className="block text-sm font-medium text-slate-300">
          Display name
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <span className="mt-2 block text-sm text-slate-500">Used as your caller name when the AI introduces itself.</span>
        </label>

        <fieldset className="rounded-3xl border border-slate-800 bg-slate-950/90 p-5">
          <legend className="text-sm font-semibold text-white">Default voice</legend>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 transition hover:border-sky-400">
              <input type="radio" name="voice" value="female" checked={defaultVoice === "female"} onChange={() => setDefaultVoice("female")} className="h-4 w-4 accent-sky-400" />
              <span className="text-slate-100">Sophia (female)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4 transition hover:border-sky-400">
              <input type="radio" name="voice" value="male" checked={defaultVoice === "male"} onChange={() => setDefaultVoice("male")} className="h-4 w-4 accent-sky-400" />
              <span className="text-slate-100">Marcus (male)</span>
            </label>
          </div>
        </fieldset>

        <button className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={loading}>
          {loading ? "Saving…" : "Save changes"}
        </button>
        {saved && <p role="status" className="rounded-2xl bg-sky-500/10 px-4 py-3 text-sm text-sky-200">Settings saved.</p>}
      </form>
    </div>
  );
}
