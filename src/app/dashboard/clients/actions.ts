"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOrganization } from "@/lib/organizations/server";
import {
  clientDatabaseFields, clientIdSchema, clientInputSchema, clientWritePermission,
  type ClientFormState, type ClientFormValues,
} from "@/lib/clients/validation";

function formValues(form: FormData): ClientFormValues {
  const text = (key: string) => {
    const value = form.get(key);
    // Only bounded plain text returns to the form; never put contacts in URLs/logs.
    return typeof value === "string" ? value.slice(0, 1024) : "";
  };
  return { name: text("name"), email: text("email"), phone: text("phone"), taxIdentifier: text("taxIdentifier") };
}

async function saveClient(formData: FormData, mode: "create" | "update"): Promise<ClientFormState> {
  const { supabase, membership } = await requireOrganization();
  const values = formValues(formData);
  const permission = clientWritePermission(membership.role, membership.organization_id, formData.get("organizationId"));
  if (permission) return {
    values,
    error: permission === "access"
      ? "Votre rôle ne permet pas de modifier les clients."
      : "L’entreprise active a changé. Revenez à la liste des clients avant de poursuivre.",
  };

  const parsed = clientInputSchema.safeParse({
    name: formData.get("name"), email: formData.get("email"),
    phone: formData.get("phone"), taxIdentifier: formData.get("taxIdentifier"),
  });
  if (!parsed.success) {
    const fieldErrors: ClientFormState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof ClientFormValues;
      if (key in values && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { values, error: "Vérifiez les champs indiqués.", fieldErrors };
  }

  const fields = clientDatabaseFields(parsed.data);
  const clientId = clientIdSchema.safeParse(formData.get("clientId"));
  if (mode === "update" && !clientId.success) {
    return { values, error: "Ce client n’est pas accessible. Revenez à la liste des clients." };
  }

  const result = mode === "create"
    ? await supabase.from("clients").insert({ ...fields, organization_id: membership.organization_id }).select("id").single()
    : await supabase.from("clients").update({ ...fields, updated_at: new Date().toISOString() })
      .eq("id", clientId.success ? clientId.data : "")
      .eq("organization_id", membership.organization_id).select("id").maybeSingle();

  if (result.error || !result.data) {
    console.warn("Écriture client refusée ou indisponible", { code: result.error?.code });
    return {
      values,
      error: result.error?.code === "23505"
        ? "Un client porte déjà ce nom dans cette entreprise."
        : "L’enregistrement n’a pas abouti. Vérifiez votre accès ou réessayez dans un instant.",
    };
  }

  revalidatePath("/dashboard/clients", "layout");
  redirect(`/dashboard/clients?succes=${mode === "create" ? "creation" : "modification"}`);
}

export async function createClient(_previousState: ClientFormState, formData: FormData) {
  return saveClient(formData, "create");
}

export async function updateClient(_previousState: ClientFormState, formData: FormData) {
  return saveClient(formData, "update");
}
