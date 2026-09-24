import { z } from "zod";

export const organizationNameSchema = z.string().trim().min(2).max(120)
  .refine((name) => !/[\u0000-\u001f\u007f]/.test(name), "Nom invalide");

export const organizationIdSchema = z.string().uuid();

// Preserve the specialised roles already present in the database.
export const organizationRoleSchema = z.enum([
  "OWNER", "ADMIN", "MEMBER", "OPERATIONS", "CUSTOMS_AGENT", "FINANCE",
]);

export type OrganizationRole = z.infer<typeof organizationRoleSchema>;

export const roleLabels: Record<OrganizationRole, string> = {
  OWNER: "Propriétaire", ADMIN: "Administrateur", MEMBER: "Membre",
  OPERATIONS: "Opérations", CUSTOMS_AGENT: "Agent douanier", FINANCE: "Finance",
};

export function canManageOrganization(role: OrganizationRole) {
  return role === "OWNER" || role === "ADMIN";
}

export const membershipSchema = z.object({
  organization_id: organizationIdSchema,
  role: organizationRoleSchema,
  organization: z.object({
    id: organizationIdSchema,
    name: z.string(),
    slug: z.string(),
  }),
});

export type OrganizationMembership = z.infer<typeof membershipSchema>;

// A cookie is a preference, never proof of membership. Fall back only to a
// membership returned for this authenticated user by the RLS-protected query.
export function selectMembership(
  memberships: OrganizationMembership[],
  preferredId: string | undefined,
) {
  return memberships.find((membership) => membership.organization_id === preferredId)
    ?? memberships[0]
    ?? null;
}
