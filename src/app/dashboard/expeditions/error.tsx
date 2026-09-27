"use client";
import Link from "next/link";

export default function ShipmentError({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-xl px-5 py-20 text-slate-900">
    <h1 className="text-2xl font-bold">Le dossier n’a pas pu être chargé</h1>
    <p className="mt-4 text-sm text-slate-600">Réessayez dans un instant ou revenez au tableau de bord.</p>
    <button onClick={reset} className="mt-6 rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900">Réessayer</button>
    <Link href="/dashboard" className="ml-5 text-sm text-teal-800 underline">Tableau de bord</Link>
  </main>;
}
