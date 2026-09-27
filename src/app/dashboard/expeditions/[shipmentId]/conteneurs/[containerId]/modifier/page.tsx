import { notFound, redirect } from "next/navigation";
import { getShipment } from "@/lib/shipments/server";
import { canWriteShipments, shipmentIdSchema } from "@/lib/shipments/validation";
import { containerRecordSchema } from "@/lib/dossier/validation";
import { ContainerForm } from "@/components/dossier/forms";
import { ShipmentShell } from "@/components/shipments/shipment-shell";

export default async function EditContainerPage({ params }: { params: Promise<{ shipmentId: string; containerId: string }> }) {
  const route = await params;
  const { supabase, membership, shipment } = await getShipment(route.shipmentId);
  const path = `/dashboard/expeditions/${shipment.id}/conteneurs`;
  if (!canWriteShipments(membership.role)) redirect(path);
  const id = shipmentIdSchema.safeParse(route.containerId);
  if (!id.success) notFound();
  const { data, error } = await supabase.from("containers").select("id, container_number, seal_number, container_type, created_at")
    .eq("id", id.data).eq("organization_id", membership.organization_id).eq("shipment_id", shipment.id).maybeSingle();
  if (error) throw new Error("Impossible de charger le conteneur.");
  if (!data) notFound();
  return <ShipmentShell title="Modifier le conteneur" organizationName={membership.organization.name} backHref={path} backLabel="Retour aux conteneurs">
    <section className="rounded-md border border-slate-200 bg-white p-5 sm:p-8">
      <ContainerForm organizationId={membership.organization_id} shipmentId={shipment.id} container={containerRecordSchema.parse(data)} />
    </section>
  </ShipmentShell>;
}
