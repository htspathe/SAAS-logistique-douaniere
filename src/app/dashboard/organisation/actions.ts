"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getOrganizationContext, setOrganizationPreference } from "@/lib/organizations/server";
import { canManageOrganization, organizationIdSchema, organizationNameSchema } from "@/lib/organizations/validation";

export async function createOrganization(formData: FormData) {
  const context = await getOrganizationContext();
  if (context.membership) redirect("/dashboard");
  const name = organizationNameSchema.safeParse(formData.get("name"));
  if (!name.success) redirect("/dashboard/onboarding?erreur=nom");

  // auth.uid() and the OWNER role are resolved by PostgreSQL, never the form.
  const { data, error } = await context.supabase.rpc("create_organization", {
    organization_name: name.data,
  });
  const organizationId = organizationIdSchema.safeParse(data);
  if (error || !organizationId.success) {
    console.error("Création d'entreprise impossible", { code: error?.code });
    redirect("/dashboard/onboarding?erreur=creation");
  }

  await setOrganizationPreference(organizationId.data);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function switchOrganization(formData: FormData) {
  const context = await getOrganizationContext();
  const id = organizationIdSchema.safeParse(formData.get("organizationId"));
  if (!id.success || !context.memberships.some((item) => item.organization_id === id.data)) {
    redirect("/dashboard/organisation?erreur=acces");
  }
  await setOrganizationPreference(id.data);
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard");
}

export async function renameOrganization(formData: FormData) {
  const context = await getOrganizationContext();
  const id = organizationIdSchema.safeParse(formData.get("organizationId"));
  const name = organizationNameSchema.safeParse(formData.get("name"));
  if (!id.success || !name.success) redirect("/dashboard/organisation?erreur=nom");
  const membership = context.memberships.find((item) => item.organization_id === id.data);
  if (!membership || !canManageOrganization(membership.role)) {
    redirect("/dashboard/organisation?erreur=acces");
  }

  // The database enforces the same permission even if the UI/action is bypassed.
  const { data, error } = await context.supabase.from("organizations")
    .update({ name: name.data }).eq("id", id.data).select("id").maybeSingle();
  if (error || !data) {
    console.error("Modification d'entreprise impossible", { code: error?.code });
    redirect("/dashboard/organisation?erreur=modification");
  }
  revalidatePath("/dashboard", "layout");
  redirect("/dashboard/organisation?succes=1");
}
