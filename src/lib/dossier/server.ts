import "server-only";
import { requireOrganization } from "@/lib/organizations/server";
import { shipmentIdSchema, shipmentWritePermission } from "@/lib/shipments/validation";

export async function authorizeDossierWrite(form: FormData) {
  const context = await requireOrganization();
  const permission = shipmentWritePermission(context.membership.role, context.membership.organization_id, form.get("organizationId"));
  if (permission) return { error: permission === "access" ? "Votre rôle ne permet pas cette opération."
    : "L’entreprise active a changé. Rechargez le dossier." } as const;
  const shipmentId = shipmentIdSchema.safeParse(form.get("shipmentId"));
  if (!shipmentId.success) return { error: "Dossier indisponible." } as const;
  const { data, error } = await context.supabase.from("shipments").select("id").eq("id", shipmentId.data)
    .eq("organization_id", context.membership.organization_id).maybeSingle();
  if (error || !data) return { error: "Dossier indisponible dans cette entreprise." } as const;
  return { ...context, shipmentId: shipmentId.data };
}

export function boundedFormValues(form: FormData, names: string[]) {
  return Object.fromEntries(names.map((name) => {
    const value = form.get(name);
    return [name, typeof value === "string" ? value.slice(0, 1024) : ""];
  }));
}
