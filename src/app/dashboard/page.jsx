import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
// /dashboard
// Shows: call stats, recent calls, quick-action CTA
async function getStats(userId) {
  const result = await db.query(`SELECT
       COUNT(*)                                            AS total_calls,
       COUNT(*) FILTER (WHERE status = 'completed')       AS completed,
       COUNT(*) FILTER (WHERE status = 'failed')          AS failed,
       COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days') AS this_week
     FROM calls WHERE user_id = $1`, [userId]);
  return result.rows[0];
}
async function getRecentCalls(userId) {
  const result = await db.query(`SELECT id, recipient_name, recipient_phone, status, created_at, duration_seconds
     FROM calls WHERE user_id = $1 ORDER BY created_at DESC LIMIT 5`, [userId]);
  return result.rows;
}
export default async function DashboardPage() {
  const session = await getSession();
  const [stats, recentCalls] = await Promise.all([
    getStats(session.userId),
    getRecentCalls(session.userId),
  ]);
  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Overview</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Welcome back, {session.name}</h1>
          </div>
          <Link href="/call/new" className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Place a new call
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm shadow-slate-950/20">
          <p className="text-sm text-slate-400">Total calls</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.total_calls}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm shadow-slate-950/20">
          <p className="text-sm text-slate-400">Completed</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.completed}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm shadow-slate-950/20">
          <p className="text-sm text-slate-400">Failed</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.failed}</p>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-sm shadow-slate-950/20">
          <p className="text-sm text-slate-400">This week</p>
          <p className="mt-3 text-3xl font-semibold text-white">{stats.this_week}</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-900/90 p-6 shadow-lg shadow-slate-950/20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Recent calls</h2>
            <p className="text-sm text-slate-400">Latest activity from your account</p>
          </div>
        </div>
        {recentCalls.length === 0 ? (
          <p className="mt-4 text-slate-400">No calls yet. <Link href="/call/new" className="text-sky-300 hover:text-sky-200">Make your first one →</Link></p>
        ) : (
          <ul className="mt-6 space-y-3">
            {recentCalls.map((call) => (
              <li key={call.id} className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-slate-700 hover:bg-slate-900/90">
                <Link href={`/call/${call.id}`} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-medium text-white">{call.recipient_name || call.recipient_phone}</span>
                  <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">{call.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
