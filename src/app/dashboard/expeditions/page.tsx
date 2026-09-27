import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";
import { ShipmentShell } from "@/components/shipments/shipment-shell";
import { requireOrganization } from "@/lib/organizations/server";
import { clientPageSchema } from "@/lib/clients/validation";
import { shipmentColumns } from "@/lib/shipments/server";
import { canWriteShipments, directionLabels, formatDakar, phaseLabels, shipmentRecordSchema } from "@/lib/shipments/validation";

export const metadata: Metadata = { title: "Expéditions" };

export default async function ShipmentsPage({ searchParams }: { searchParams: Promise<{ page?: string | string[]; erreur?: string | string[] }> }) {
  const { supabase, membership } = await requireOrganization();
  const params = await searchParams;
  const page = clientPageSchema.parse(typeof params.page === "string" ? params.page : 1);
  const start = (page - 1) * 25;
  const { data, error, count } = await supabase.from("shipments").select(shipmentColumns, { count: "exact" })
    .eq("organization_id", membership.organization_id).order("created_at", { ascending: false }).order("id").range(start, start + 24);
  if (error) { console.error("Liste d’expéditions indisponible", { code: error.code }); throw new Error("Lecture impossible."); }
  const shipments = z.array(shipmentRecordSchema).parse(data);
  const total = count ?? 0;

  return <ShipmentShell title="Expéditions" organizationName={membership.organization.name} backHref="/dashboard" backLabel="Tableau de bord">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-slate-600">{total} dossier{total !== 1 ? "s" : ""} · Import et export</p>
      {canWriteShipments(membership.role) && <Link href="/dashboard/expeditions/nouveau" className="rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900">Nouvelle expédition</Link>}
    </div>
    {params.erreur === "acces" && <p role="alert" className="mt-5 text-sm text-red-800">Votre rôle permet uniquement de consulter les expéditions.</p>}
    <section aria-label="Liste des expéditions" className="mt-6 overflow-hidden rounded-md border border-slate-200 bg-white">
      {shipments.length ? <div className="overflow-x-auto"><table className="w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700"><tr>{["Référence / client", "Trajet", "Statut", "Arrivée prévue (Dakar)"].map((heading) => <th scope="col" key={heading} className="px-4 py-4 font-semibold">{heading}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-200">{shipments.map((shipment) => <tr key={shipment.id}>
          <th scope="row" className="max-w-64 break-words px-4 py-4 font-normal"><Link href={`/dashboard/expeditions/${shipment.id}`} className="font-semibold text-teal-800 underline">{shipment.reference}</Link><p className="mt-1 text-slate-600">{shipment.client?.name ?? "Client non renseigné"}</p></th>
          <td className="max-w-64 break-words px-4 py-4"><p>{shipment.origin_name} → {shipment.destination_name}</p><p className="mt-1 text-xs text-slate-600">{directionLabels[shipment.direction]} · {shipment.load_type}</p></td>
          <td className="px-4 py-4">{phaseLabels[shipment.phase]}</td>
          <td className="px-4 py-4 text-slate-600">{formatDakar(shipment.estimated_arrival_at)}</td>
        </tr>)}</tbody>
      </table></div> : <div className="px-5 py-12 text-center"><h2 className="font-semibold">{page === 1 ? "Aucune expédition pour le moment" : "Aucun dossier sur cette page"}</h2><p className="mt-2 text-sm text-slate-600">Les dossiers enregistrés dans cette entreprise apparaîtront ici.</p>{page > 1 && <Link href="/dashboard/expeditions" className="mt-4 inline-block text-sm text-teal-800 underline">Première page</Link>}</div>}
    </section>
    {(page > 1 || total > 25) && <nav aria-label="Pagination des expéditions" className="mt-6 flex items-center justify-between gap-4 text-sm">
      {page > 1 ? <Link href={`/dashboard/expeditions?page=${page - 1}`} className="font-semibold text-teal-800 underline">Précédent</Link> : <span />}
      <span className="text-slate-600">Page {page}</span>
      {start + shipments.length < total && shipments.length > 0 ? <Link href={`/dashboard/expeditions?page=${page + 1}`} className="font-semibold text-teal-800 underline">Suivant</Link> : <span />}
    </nav>}
  </ShipmentShell>;
}
