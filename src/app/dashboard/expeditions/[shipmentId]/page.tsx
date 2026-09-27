import type { Metadata } from "next";
import Link from "next/link";
import { ShipmentShell } from "@/components/shipments/shipment-shell";
import { getShipment } from "@/lib/shipments/server";
import { canWriteShipments, customsLabels, directionLabels, formatDakar, loadLabels, phaseLabels } from "@/lib/shipments/validation";

export const metadata: Metadata = { title: "Dossier d’expédition" };
export default async function ShipmentPage({ params, searchParams }: {
  params: Promise<{ shipmentId: string }>; searchParams: Promise<{ succes?: string | string[] }>;
}) {
  const { membership, shipment } = await getShipment((await params).shipmentId);
  const { succes } = await searchParams;
  const rows = [
    ["Client", shipment.client?.name ?? "Non renseigné"], ["Sens", directionLabels[shipment.direction]],
    ["Chargement", loadLabels[shipment.load_type]], ["Traitement douanier", customsLabels[shipment.customs_mode]],
    ["Statut", phaseLabels[shipment.phase]], ["Lieu de départ", shipment.origin_name], ["Lieu d’arrivée", shipment.destination_name],
    ["Connaissement (BL)", shipment.bill_of_lading_number ?? "Non renseigné"], ["Réservation (booking)", shipment.booking_number ?? "Non renseigné"],
    ["Départ prévu", formatDakar(shipment.estimated_departure_at)], ["Arrivée prévue", formatDakar(shipment.estimated_arrival_at)],
    ["Création", formatDakar(shipment.created_at)], ["Dernière modification", formatDakar(shipment.updated_at)],
  ];
  return <ShipmentShell title={shipment.reference} organizationName={membership.organization.name}>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <p className="text-sm text-slate-600">Dates et heures de Dakar (UTC+0). Statut renseigné manuellement.</p>
      {canWriteShipments(membership.role) && <Link href={`/dashboard/expeditions/${shipment.id}/modifier`} className="rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900">Modifier le dossier</Link>}
    </div>
    {(succes === "creation" || succes === "modification") && <p role="status" className="mt-5 rounded-md bg-teal-50 p-4 text-sm text-teal-900">{succes === "creation" ? "Le dossier a été créé." : "Les modifications ont été enregistrées."}</p>}
    <dl className="mt-6 grid divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      {rows.map(([label, value]) => <div key={label} className="grid gap-2 px-5 py-4 sm:grid-cols-[220px_1fr]"><dt className="text-sm text-slate-600">{label}</dt><dd className="break-words text-sm font-medium text-slate-900">{value}</dd></div>)}
    </dl>
  </ShipmentShell>;
}
