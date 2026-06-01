"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
// /auth/login
// Submits to POST /api/auth/login → sets httpOnly session cookie → redirects to /dashboard
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      console.log("[login] Response status:", res.status);
      if (res.ok) {
        console.log("[login] Login successful, redirecting...");
        router.refresh();
        router.push("/dashboard");
      } else {
        const data = await res.json();
        console.log("[login] Login error:", data.error);
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Network error. Please try again.");
    }
    setLoading(false);
  }
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center rounded-[2rem] border border-slate-800 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/40">
      <div className="space-y-3 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Sign in</p>
        <h1 className="text-3xl font-semibold text-white">Welcome back</h1>
        <p className="text-sm text-slate-400">Use your account to access the RingAI dashboard.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <label className="block text-sm font-medium text-slate-300">
          Email
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="block text-sm font-medium text-slate-300">
          Password
          <input className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/20" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        {error && <p role="alert" className="rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{error}</p>}
        <button className="w-full rounded-2xl bg-sky-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-50" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">
        No account? <Link href="/auth/register" className="font-semibold text-sky-300 hover:text-sky-200">Register</Link>
      </p>
    </main>
  );
}
