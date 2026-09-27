import { z } from "zod";

const singleLine = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);
const optionalText = (max: number) => z.preprocess(
  (value) => value === null || value === undefined ? "" : value,
  z.string().trim().max(max, `Limité à ${max} caractères.`)
    .refine(singleLine, "Utilisez une seule ligne.").transform((value) => value || null),
);

export const clientInputSchema = z.object({
  name: z.string().trim().min(2, "Indiquez au moins 2 caractères.")
    .max(160, "Limité à 160 caractères.").refine(singleLine, "Utilisez une seule ligne."),
  email: optionalText(254).refine(
    (value) => value === null || z.email().safeParse(value).success,
    "Indiquez une adresse e-mail valide.",
  ),
  phone: optionalText(32).refine((value) => {
    if (value === null) return true;
    const digits = value.replace(/\D/g, "");
    return /^\+?[0-9][0-9 ().-]*$/.test(value) && digits.length >= 7 && digits.length <= 15;
  }, "Indiquez un numéro de 7 à 15 chiffres, avec indicatif si nécessaire."),
  taxIdentifier: optionalText(80),
});

export const clientIdSchema = z.string().uuid();
export const clientPageSchema = z.coerce.number().int().min(1).max(10000).catch(1);
export const clientsPageSize = 25;

export function canWriteClients(role: string) {
  // Mirrors public.can_manage_operations; never use auth user_metadata roles.
  return ["OWNER", "ADMIN", "OPERATIONS", "CUSTOMS_AGENT"].includes(role);
}

export function clientWritePermission(
  role: string,
  activeOrganizationId: string,
  submittedOrganizationId: unknown,
): "access" | "context" | null {
  if (!canWriteClients(role)) return "access";
  if (!clientIdSchema.safeParse(submittedOrganizationId).success
    || activeOrganizationId !== submittedOrganizationId) return "context";
  return null;
}

export const clientRecordSchema = z.object({
  id: clientIdSchema,
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  tax_identifier: z.string().nullable(),
});

export type ClientRecord = z.infer<typeof clientRecordSchema>;
export type ClientFormValues = { name: string; email: string; phone: string; taxIdentifier: string };
export type ClientFormState = {
  values: ClientFormValues;
  error?: string;
  fieldErrors?: Partial<Record<keyof ClientFormValues, string>>;
};

export function clientDatabaseFields(input: z.infer<typeof clientInputSchema>) {
  return { name: input.name, email: input.email, phone: input.phone, tax_identifier: input.taxIdentifier };
}
