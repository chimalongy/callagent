import Link from "next/link";
// Public landing page — unauthenticated users land here
export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-4xl flex-col justify-center rounded-[2rem] border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl">
      <p className="mb-4 text-sm uppercase tracking-[0.32em] text-sky-300">RingAI</p>
      <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">AI-powered outbound calls</h1>
      <p className="mt-6 max-w-2xl text-slate-300">
        You write the instructions. We make the call.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/auth/register" className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
          Get started
        </Link>
        <Link href="/auth/login" className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-950/90 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
          Sign in
        </Link>
      </div>
    </main>
  );
}
