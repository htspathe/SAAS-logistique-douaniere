import Link from "next/link";
export default function ShipmentNotFound() {
  return <main className="mx-auto max-w-xl px-5 py-20 text-slate-900">
    <h1 className="text-2xl font-bold">Dossier introuvable</h1>
    <p className="mt-4 text-sm text-slate-600">Ce dossier n’est pas disponible dans l’entreprise active.</p>
    <Link href="/dashboard/expeditions" className="mt-6 inline-block text-sm text-teal-800 underline">Toutes les expéditions</Link>
  </main>;
}
