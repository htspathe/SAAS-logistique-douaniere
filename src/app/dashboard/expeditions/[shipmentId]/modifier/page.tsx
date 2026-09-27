import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import { ShipmentShell } from "@/components/shipments/shipment-shell";
import { getShipment } from "@/lib/shipments/server";
import { canWriteShipments } from "@/lib/shipments/validation";

export const metadata: Metadata = { title: "Modifier l’expédition" };
export default async function EditShipmentPage({ params }: { params: Promise<{ shipmentId: string }> }) {
  const { membership, shipment } = await getShipment((await params).shipmentId);
  if (!canWriteShipments(membership.role)) redirect("/dashboard/expeditions?erreur=acces");
  return <ShipmentShell title={`Modifier ${shipment.reference}`} organizationName={membership.organization.name}
    backHref={`/dashboard/expeditions/${shipment.id}`} backLabel="Retour au dossier">
    <section className="rounded-md border border-slate-200 bg-white p-5 sm:p-8"><ShipmentForm organizationId={membership.organization_id} shipment={shipment} /></section>
  </ShipmentShell>;
}
