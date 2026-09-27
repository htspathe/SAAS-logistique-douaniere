import "server-only";
import { notFound } from "next/navigation";
import { requireOrganization } from "@/lib/organizations/server";
import { shipmentIdSchema, shipmentRecordSchema } from "@/lib/shipments/validation";

export const shipmentColumns = "id, reference, client_id, client:clients(id, name), direction, load_type, customs_mode, phase, origin_name, destination_name, bill_of_lading_number, booking_number, estimated_departure_at, estimated_arrival_at, created_at, updated_at";

export async function getShipment(id: string) {
  const context = await requireOrganization();
  const parsed = shipmentIdSchema.safeParse(id);
  if (!parsed.success) notFound();
  const { data, error } = await context.supabase.from("shipments").select(shipmentColumns)
    .eq("id", parsed.data).eq("organization_id", context.membership.organization_id).maybeSingle();
  if (error) {
    console.error("Lecture d’expédition impossible", { code: error.code });
    throw new Error("Impossible de charger l’expédition.");
  }
  if (!data) notFound();
  return { ...context, shipment: shipmentRecordSchema.parse(data) };
}
