import Link from "next/link";

export default function ClientNotFound() {
  return <main className="min-h-screen bg-slate-50 px-5 py-20 text-center">
    <h1 className="text-2xl font-bold text-[#09223e]">Client introuvable</h1>
    <p className="mt-4 text-sm text-slate-600">Ce client n’est pas disponible dans l’entreprise active.</p>
    <Link href="/dashboard/clients" className="mt-6 inline-block font-semibold text-teal-700 underline">Revenir aux clients</Link>
  </main>;
}
