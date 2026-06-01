import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import Link from "next/link";
async function getCalls(userId, params) {
  const page = Math.max(1, parseInt(params.page || "1"));
  const limit = 20;
  const offset = (page - 1) * limit;
  const filters = ["user_id = $1"];
  const values = [userId];
  let idx = 2;
  if (params.status) {
    filters.push(`status = $${idx++}`);
    values.push(params.status);
  }
  if (params.from) {
    filters.push(`created_at >= $${idx++}`);
    values.push(params.from);
  }
  if (params.to) {
    filters.push(`created_at <= $${idx++}`);
    values.push(params.to);
  }
  const where = filters.join(" AND ");
  const [rows, countResult] = await Promise.all([
    db.query(`SELECT id, recipient_name, recipient_phone, voice_gender, status,
              created_at, duration_seconds, caller_name
       FROM calls WHERE ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx + 1}`, [...values, limit, offset]),
    db.query(`SELECT COUNT(*) FROM calls WHERE ${where}`, values),
  ]);
  return {
    calls: rows.rows,
    total: parseInt(countResult.rows[0].count),
    page,
    totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
  };
}
export default async function CallHistoryPage({ searchParams, }) {
  const session = await getSession();
  const { calls, total, page, totalPages } = await getCalls(session.userId, searchParams);
  return (
    <div className="space-y-8">
      <header className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/20">
        <h1 className="text-3xl font-semibold text-white">Call history</h1>
        <p className="mt-2 text-slate-400">{total} total calls</p>
      </header>

      <section className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6 shadow-lg shadow-slate-950/20">
        <form method="GET" className="grid gap-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] items-end">
          <label className="space-y-1 text-sm text-slate-300">
            Status
            <select name="status" className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10">
              <option value="">All statuses</option>
              <option value="queued">Queued</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            From
            <input type="date" name="from" defaultValue={searchParams.from} className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10" />
          </label>
          <label className="space-y-1 text-sm text-slate-300">
            To
            <input type="date" name="to" defaultValue={searchParams.to} className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-500/10" />
          </label>
          <button type="submit" className="rounded-2xl bg-sky-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
            Filter
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950/80 shadow-lg shadow-slate-950/20">
        <table className="min-w-full border-collapse text-left text-sm text-slate-300">
          <thead className="bg-slate-900/90 text-slate-400">
            <tr>
              <th className="px-5 py-4">Recipient</th>
              <th className="px-5 py-4">Phone</th>
              <th className="px-5 py-4">Voice</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Duration</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call) => (
              <tr key={call.id} className="border-t border-slate-800 hover:bg-slate-900/80">
                <td className="px-5 py-4">{call.recipient_name || "—"}</td>
                <td className="px-5 py-4">{call.recipient_phone}</td>
                <td className="px-5 py-4">{call.voice_gender}</td>
                <td className="px-5 py-4">{call.status}</td>
                <td className="px-5 py-4">{call.duration_seconds ? `${call.duration_seconds}s` : "—"}</td>
                <td className="px-5 py-4">{new Date(call.created_at).toLocaleString()}</td>
                <td className="px-5 py-4">
                  <Link href={`/call/${call.id}`} className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 rounded-[2rem] border border-slate-800 bg-slate-900/90 p-5 text-sm text-slate-300">
        <div className="flex items-center gap-3">
          {page > 1 && <Link href={`?page=${page - 1}`} className="rounded-2xl bg-slate-800 px-4 py-2 text-slate-100 transition hover:bg-slate-700">Previous</Link>}
          {page < totalPages && <Link href={`?page=${page + 1}`} className="rounded-2xl bg-slate-800 px-4 py-2 text-slate-100 transition hover:bg-slate-700">Next</Link>}
        </div>
        <span>Page {page} of {totalPages}</span>
      </nav>
    </div>
  );
}
