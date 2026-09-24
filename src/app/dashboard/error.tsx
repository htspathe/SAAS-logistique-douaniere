"use client";

import Link from "next/link";

export default function DashboardError({ reset }: { reset: () => void }) {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
    <section className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <h1 className="text-xl font-bold text-[#09223e]">Votre espace est temporairement indisponible</h1>
      <p className="mt-4 text-sm text-slate-600">Vos entreprises n’ont pas pu être chargées. Réessayez dans un instant.</p>
      <button onClick={reset} className="mt-6 rounded-lg bg-teal-600 px-5 py-3 text-sm font-bold text-white">Réessayer</button>
      <Link href="/" className="mt-5 block text-sm text-slate-500 underline">Revenir à l’accueil</Link>
    </section>
  </main>;
}
