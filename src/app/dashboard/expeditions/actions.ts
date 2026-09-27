"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireOrganization } from "@/lib/organizations/server";
import { shipmentDatabaseFields, shipmentIdSchema, shipmentInputSchema, shipmentValues, shipmentWritePermission,
  type ShipmentFormState, type ShipmentValues } from "@/lib/shipments/validation";

async function saveShipment(form: FormData, mode: "create" | "update"): Promise<ShipmentFormState> {
  const { supabase, membership, claims } = await requireOrganization();
  const values = shipmentValues();
  const input: Record<string, unknown> = {};
  for (const field of Object.keys(values) as Array<keyof ShipmentValues>) {
    input[field] = form.get(field);
    values[field] = typeof input[field] === "string" ? (input[field] as string).slice(0, 1024) : "";
  }
  const permission = shipmentWritePermission(membership.role, membership.organization_id, form.get("organizationId"));
  if (permission) return { values, error: permission === "access" ? "Votre rôle ne permet pas de modifier les expéditions."
    : "L’entreprise active a changé. Revenez à la liste des expéditions avant de poursuivre." };

  const parsed = shipmentInputSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: ShipmentFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof ShipmentValues;
      if (field in values && !fieldErrors[field]) fieldErrors[field] = issue.message;
    }
    return { values, error: "Vérifiez les champs indiqués.", fieldErrors };
  }

  const client = await supabase.from("clients").select("id").eq("id", parsed.data.clientId)
    .eq("organization_id", membership.organization_id).maybeSingle();
  if (client.error || !client.data) return { values, error: "Sélectionnez un client disponible dans cette entreprise.",
    fieldErrors: { clientId: "Ce client n’est pas disponible." } };

  const fields = shipmentDatabaseFields(parsed.data);
  const id = shipmentIdSchema.safeParse(form.get("shipmentId"));
  const version = z.iso.datetime({ offset: true }).safeParse(form.get("updatedAt"));
  if (mode === "update" && (!id.success || !version.success)) {
    return { values, error: "Ce dossier doit être rechargé avant modification." };
  }

  const result = mode === "create"
    ? await supabase.from("shipments").insert({ ...fields, organization_id: membership.organization_id, created_by: claims.sub }).select("id").single()
    : await supabase.from("shipments").update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", id.success ? id.data : "").eq("organization_id", membership.organization_id)
      .eq("updated_at", version.success ? version.data : "").select("id").maybeSingle();

  if (result.error || !result.data) {
    console.warn("Enregistrement d’expédition impossible", { code: result.error?.code });
    return { values, error: result.error?.code === "23505" ? "Cette référence existe déjà dans cette entreprise."
      : result.error?.code === "23503" ? "Le client associé n’est plus disponible. Sélectionnez-le à nouveau."
      : !result.error && mode === "update" ? "Ce dossier a changé ou n’est plus accessible. Rechargez-le avant de recommencer."
      : "L’enregistrement a échoué. Vérifiez votre accès ou réessayez dans un instant." };
  }
  const savedId = shipmentIdSchema.parse(result.data.id);
  revalidatePath("/dashboard/expeditions", "layout");
  redirect(`/dashboard/expeditions/${savedId}?succes=${mode === "create" ? "creation" : "modification"}`);
}

export async function createShipment(_state: ShipmentFormState, form: FormData) { return saveShipment(form, "create"); }
export async function updateShipment(_state: ShipmentFormState, form: FormData) { return saveShipment(form, "update"); }
