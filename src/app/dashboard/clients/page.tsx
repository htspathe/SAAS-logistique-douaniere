import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, UsersRound } from "lucide-react";
import { z } from "zod";
import { requireOrganization } from "@/lib/organizations/server";
import { canWriteClients, clientPageSchema, clientRecordSchema, clientsPageSize } from "@/lib/clients/validation";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage({ searchParams }: {
  searchParams: Promise<{ page?: string | string[]; succes?: string | string[]; erreur?: string | string[] }>;
}) {
  const { supabase, membership } = await requireOrganization();
  const params = await searchParams;
  const page = clientPageSchema.parse(typeof params.page === "string" ? params.page : 1);
  const start = (page - 1) * clientsPageSize;
  const { data, error, count } = await supabase.from("clients")
    .select("id, name, email, phone, tax_identifier", { count: "exact" })
    .eq("organization_id", membership.organization_id)
    .order("name", { ascending: true }).order("id", { ascending: true })
    .range(start, start + clientsPageSize - 1);
  if (error) {
    console.error("Lecture des clients impossible", { code: error.code });
    throw new Error("Impossible de charger les clients.");
  }
  const clients = z.array(clientRecordSchema).parse(data);
  const total = count ?? 0;
  const canWrite = canWriteClients(membership.role);
  const success = params.succes === "creation" ? "Le client a été créé."
    : params.succes === "modification" ? "Le client a été mis à jour." : null;

  return <main className="min-h-screen bg-[#f5f7fa] px-5 py-10 text-[#09223e] sm:px-10">
    <div className="mx-auto max-w-6xl">
      <Link href="/dashboard" className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-700"><ArrowLeft className="size-4" />Tableau de bord</Link>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-xs font-bold uppercase tracking-widest text-teal-700">{membership.organization.name}</p>
          <h1 className="mt-3 text-3xl font-bold">Clients</h1>
          <p className="mt-2 text-sm text-slate-500">{total} client{total !== 1 ? "s" : ""} · Coordonnées principales de vos donneurs d’ordre.</p>
        </div>
        {canWrite && <Link href="/dashboard/clients/nouveau" className="inline-flex items-center gap-2 rounded-lg bg-[#0ca898] px-5 py-3 text-sm font-bold text-white hover:bg-[#098f82]"><Plus className="size-4" />Nouveau client</Link>}
      </div>
      {success && <p role="status" className="mt-6 rounded-lg bg-teal-50 p-4 text-sm text-teal-800">{success}</p>}
      {params.erreur === "acces" && <p role="alert" className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">Votre rôle vous donne accès à la consultation des clients uniquement.</p>}
      {!canWrite && <p className="mt-5 text-xs text-slate-500">Lecture seule : contactez un responsable des opérations pour créer ou modifier un client.</p>}

      <section aria-label="Liste des clients" className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {clients.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500"><tr>
            <th scope="col" className="px-5 py-4">Client</th><th scope="col" className="px-5 py-4">Coordonnées principales</th>
            <th scope="col" className="px-5 py-4">Identifiant fiscal</th>{canWrite && <th scope="col" className="px-5 py-4">Action</th>}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{clients.map((client) => <tr key={client.id}>
            <th scope="row" className="max-w-xs break-words px-5 py-5 font-semibold">{client.name}</th>
            <td className="px-5 py-5 text-slate-600"><p className="break-all">{client.email || "E-mail non renseigné"}</p><p className="mt-1">{client.phone || "Téléphone non renseigné"}</p></td>
            <td className="max-w-48 break-words px-5 py-5 text-slate-600">{client.tax_identifier || "Non renseigné"}</td>
            {canWrite && <td className="px-5 py-5"><Link href={`/dashboard/clients/${client.id}/modifier`} aria-label={`Modifier ${client.name}`} className="font-semibold text-teal-700 hover:underline">Modifier</Link></td>}
          </tr>)}</tbody>
        </table></div> : <div className="p-10 text-center">
          <UsersRound className="mx-auto size-9 text-teal-600" />
          <h2 className="mt-4 font-bold">{page === 1 ? "Aucun client pour le moment" : "Aucun client sur cette page"}</h2>
          <p className="mt-2 text-sm text-slate-500">{page === 1 ? "Les clients de cette entreprise apparaîtront ici." : "Revenez à la première page pour retrouver vos clients."}</p>
          {page > 1 && <Link href="/dashboard/clients" className="mt-4 inline-block text-sm font-semibold text-teal-700 underline">Première page</Link>}
        </div>}
      </section>
      {(page > 1 || total > clientsPageSize) && <nav aria-label="Pagination des clients" className="mt-5 flex flex-wrap items-center justify-between gap-4 text-sm">
        {page > 1 ? <Link href={`/dashboard/clients?page=${page - 1}`} className="inline-flex items-center gap-2 font-semibold text-teal-700"><ArrowLeft className="size-4" />Précédent</Link> : <span />}
        <span className="text-slate-500">Page {page}</span>
        {start + clients.length < total && clients.length > 0 ? <Link href={`/dashboard/clients?page=${page + 1}`} className="inline-flex items-center gap-2 font-semibold text-teal-700">Suivant<ArrowRight className="size-4" /></Link> : <span />}
      </nav>}
    </div>
  </main>;
}
