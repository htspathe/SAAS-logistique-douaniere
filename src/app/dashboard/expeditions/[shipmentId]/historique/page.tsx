import { z } from "zod";
import { getShipment } from "@/lib/shipments/server";
import { canWriteShipments, formatDakar } from "@/lib/shipments/validation";
import { clientPageSchema } from "@/lib/clients/validation";
import { eventRecordSchema } from "@/lib/dossier/validation";
import { EventForm } from "@/components/dossier/forms";
import { DossierNavigation, DossierPagination } from "@/components/dossier/navigation";
import { ShipmentShell } from "@/components/shipments/shipment-shell";

export default async function HistoryPage({ params, searchParams }: {
  params: Promise<{ shipmentId: string }>; searchParams: Promise<{ page?: string; succes?: string }>;
}) {
  const { supabase, membership, shipment } = await getShipment((await params).shipmentId);
  const search = await searchParams;
  const page = clientPageSchema.parse(search.page ?? 1);
  const { data, error, count } = await supabase.from("tracking_events")
    .select("id, event_code, label, event_at, location_name, source, created_at", { count: "exact" })
    .eq("organization_id", membership.organization_id).eq("shipment_id", shipment.id)
    .order("event_at", { ascending: false }).order("id").range((page - 1) * 25, page * 25 - 1);
  if (error) throw new Error("L’historique n’a pas pu être chargé.");
  const events = z.array(eventRecordSchema).parse(data);
  const path = `/dashboard/expeditions/${shipment.id}/historique`;
  return <ShipmentShell title={`Historique · ${shipment.reference}`} organizationName={membership.organization.name}>
    <DossierNavigation shipmentId={shipment.id} active="Historique" />
    {search.succes === "1" && <p role="status" className="mb-5 text-sm text-teal-900">L’événement a été ajouté.</p>}
    <p className="mb-4 text-sm text-slate-600">Heures de Dakar (UTC+0). Cet historique ne modifie pas automatiquement le statut du dossier.</p>
    <ol className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      {events.map((event) => <li key={event.id} className="p-5">
        <p className="text-sm text-slate-600">{formatDakar(event.event_at)} · {event.event_code}</p>
        <h2 className="mt-2 break-words font-semibold">{event.label}</h2>
        <p className="mt-2 min-w-0 break-words text-sm text-slate-600">{event.location_name ?? "Lieu non renseigné"} · {event.source === "MANUAL" ? "Saisie manuelle" : event.source}</p>
        <p className="mt-1 text-xs text-slate-500">Enregistré le {formatDakar(event.created_at)}</p>
      </li>)}
      {!events.length && <li className="p-6 text-sm text-slate-600">Aucun événement sur cette page.</li>}
    </ol>
    <DossierPagination path={path} page={page} total={count ?? 0} count={events.length} />
    {canWriteShipments(membership.role) && <section className="mt-8 rounded-md border border-slate-200 bg-white p-5 sm:p-8"><h2 className="mb-5 text-xl font-semibold">Ajouter un événement</h2>
      <EventForm organizationId={membership.organization_id} shipmentId={shipment.id} />
    </section>}
  </ShipmentShell>;
}
