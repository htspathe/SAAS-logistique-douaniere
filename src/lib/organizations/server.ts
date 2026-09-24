import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { membershipSchema, selectMembership } from "@/lib/organizations/validation";

export const organizationCookieName = "transitflow_organization";

export async function getOrganizationContext() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError || !authData?.claims?.sub) redirect("/auth/connexion");

  const { data, error } = await supabase.from("organization_members")
    .select("organization_id, role, organization:organizations!inner(id, name, slug)")
    .eq("user_id", authData.claims.sub)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .order("organization_id", { ascending: true });

  if (error) {
    console.error("Lecture des entreprises impossible", { code: error.code });
    throw new Error("Impossible de charger vos entreprises. Réessayez plus tard.");
  }

  const memberships = z.array(membershipSchema).parse(data);
  const preferredId = (await cookies()).get(organizationCookieName)?.value;
  const membership = selectMembership(memberships, preferredId);
  return { supabase, claims: authData.claims, memberships, membership };
}

export async function requireOrganization() {
  const context = await getOrganizationContext();
  if (!context.membership) redirect("/dashboard/onboarding");
  return { ...context, membership: context.membership };
}

export async function setOrganizationPreference(organizationId: string) {
  (await cookies()).set(organizationCookieName, organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
