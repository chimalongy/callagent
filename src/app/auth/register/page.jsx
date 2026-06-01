"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// /auth/register
// Submits to POST /api/auth/register → creates user in Neon → auto-login → redirect to /dashboard
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (res.ok) {
      router.push("/dashboard");
    }
    else {
      const data = await res.json();
      setError(data.error || "Registration failed");
    }
    setLoading(false);
  }
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Create account</p>
        <h1 className="text-3xl font-semibold text-white">Get started with RingAI</h1>
        <p className="text-sm text-slate-400">Create your account and start making AI-assisted calls instantly.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <label className="block text-sm font-medium text-slate-300">
          Full name
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Email
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Password
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </label>
        {error && <p role="alert" className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        <button className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        Have an account? <Link href="/auth/login" className="font-semibold text-sky-300 hover:text-sky-200">Sign in</Link>
      </p>
    </main>
  );
}
