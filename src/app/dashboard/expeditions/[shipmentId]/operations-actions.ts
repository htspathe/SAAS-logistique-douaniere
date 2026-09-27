"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeDossierWrite, boundedFormValues } from "@/lib/dossier/server";
import { containerInputSchema, eventInputSchema, type DossierFormState } from "@/lib/dossier/validation";
import { shipmentIdSchema } from "@/lib/shipments/validation";

async function saveContainer(form: FormData, edit: boolean): Promise<DossierFormState> {
  const context = await authorizeDossierWrite(form);
  const values = boundedFormValues(form, ["number", "seal", "type"]);
  if ("error" in context) return { values, error: context.error };
  const parsed = containerInputSchema.safeParse(Object.fromEntries(["number", "seal", "type"].map((key) => [key, form.get(key)])));
  if (!parsed.success) return { values, error: parsed.error.issues[0].message };
  const id = shipmentIdSchema.safeParse(form.get("containerId"));
  if (edit && !id.success) return { values, error: "Conteneur indisponible." };
  const fields = { container_number: parsed.data.number, seal_number: parsed.data.seal, container_type: parsed.data.type };
  const result = edit
    ? await context.supabase.from("containers").update(fields).eq("id", id.success ? id.data : "")
      .eq("organization_id", context.membership.organization_id).eq("shipment_id", context.shipmentId).select("id").maybeSingle()
    : await context.supabase.from("containers").insert({ ...fields, organization_id: context.membership.organization_id, shipment_id: context.shipmentId }).select("id").single();
  if (result.error || !result.data) return { values, error: "Le conteneur n’a pas pu être enregistré. Vérifiez votre accès et les informations." };
  const path = `/dashboard/expeditions/${context.shipmentId}/conteneurs`;
  revalidatePath(path, "layout");
  redirect(`${path}?succes=1`);
}
export async function createContainer(_state: DossierFormState, form: FormData) { return saveContainer(form, false); }
export async function updateContainer(_state: DossierFormState, form: FormData) { return saveContainer(form, true); }

export async function appendEvent(_state: DossierFormState, form: FormData): Promise<DossierFormState> {
  const context = await authorizeDossierWrite(form);
  const values = boundedFormValues(form, ["code", "label", "eventAt", "location"]);
  if ("error" in context) return { values, error: context.error };
  const parsed = eventInputSchema.safeParse(Object.fromEntries(Object.keys(values).map((key) => [key, form.get(key)])));
  if (!parsed.success) return { values, error: parsed.error.issues[0].message };
  const { error } = await context.supabase.from("tracking_events").insert({
    organization_id: context.membership.organization_id, shipment_id: context.shipmentId,
    event_code: parsed.data.code, label: parsed.data.label, event_at: parsed.data.eventAt,
    location_name: parsed.data.location, source: "MANUAL", created_by: context.claims.sub,
  });
  if (error) return { values, error: "L’événement n’a pas pu être ajouté. Réessayez dans un instant." };
  const path = `/dashboard/expeditions/${context.shipmentId}/historique`;
  revalidatePath(path); redirect(`${path}?succes=1`);
}
