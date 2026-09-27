import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShipmentForm } from "@/components/shipments/shipment-form";
import { ShipmentShell } from "@/components/shipments/shipment-shell";
import { requireOrganization } from "@/lib/organizations/server";
import { canWriteShipments } from "@/lib/shipments/validation";

export const metadata: Metadata = { title: "Nouvelle expédition" };
export default async function NewShipmentPage() {
  const { membership } = await requireOrganization();
  if (!canWriteShipments(membership.role)) redirect("/dashboard/expeditions?erreur=acces");
  return <ShipmentShell title="Nouvelle expédition" organizationName={membership.organization.name}>
    <section className="rounded-md border border-slate-200 bg-white p-5 sm:p-8"><ShipmentForm organizationId={membership.organization_id} /></section>
  </ShipmentShell>;
}
