import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import Link from "next/link";
// Shared layout for all /dashboard/* routes
// Validates session server-side — redirects to /auth/login if unauthenticated
export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session)
    redirect("/auth/login");
  return (
    <div className="grid min-h-screen gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-2xl shadow-slate-950/30">
        <div className="space-y-8">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-sky-300">Dashboard</p>
            <p className="mt-2 text-2xl font-semibold text-white">RingAI</p>
          </div>
          <nav className="space-y-2 text-sm text-slate-300">
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-800 hover:text-white" href="/dashboard">Overview</Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-800 hover:text-white" href="/dashboard/calls">Call history</Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-800 hover:text-white" href="/call/new">New call</Link>
            <Link className="block rounded-2xl px-4 py-3 transition hover:bg-slate-800 hover:text-white" href="/dashboard/settings">Settings</Link>
          </nav>
          <form action="/api/auth/logout" method="POST">
            <button type="submit" className="w-full rounded-2xl bg-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-slate-950/30">
        {children}
      </main>
    </div>
  );
}
