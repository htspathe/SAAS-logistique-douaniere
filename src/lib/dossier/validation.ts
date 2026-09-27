import { z } from "zod";

const optionalLine = (max: number) => z.preprocess((value) => value ?? "", z.string().trim().max(max)
  .refine((value) => !/[\u0000-\u001f\u007f]/.test(value), "Utilisez une seule ligne.")
  .transform((value) => value || null));

export function validContainerNumber(value: string) {
  if (!/^[A-Z]{3}[UJZ][0-9]{7}$/.test(value)) return false;
  let total = 0;
  for (let index = 0; index < 10; index++) {
    const char = value[index];
    const letter = char.charCodeAt(0) - 65;
    const digit = index < 4 ? 10 + letter + Math.floor((letter + 9) / 10) : Number(char);
    total += digit * 2 ** index;
  }
  return total % 11 % 10 === Number(value[10]);
}

export const containerInputSchema = z.object({
  number: z.preprocess((value) => value ?? "", z.string().trim().toUpperCase().transform((value) => value.replace(/[ -]/g, ""))
    .refine((value) => value === "" || validContainerNumber(value), "Numéro ISO 6346 invalide : vérifiez les lettres, les chiffres et la clé.")
    .transform((value) => value || null)),
  seal: optionalLine(80), type: optionalLine(40),
});
export const containerRecordSchema = z.object({ id: z.string().uuid(), container_number: z.string().nullable(),
  seal_number: z.string().nullable(), container_type: z.string().nullable(), created_at: z.string() });
export type ContainerRecord = z.infer<typeof containerRecordSchema>;

export function validEventDate(value: string) {
  if (!/^(19|20|21)\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
  const date = new Date(`${value}:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 16) === value;
}
export const eventInputSchema = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z][A-Z0-9_]{1,39}$/, "Code de 2 à 40 lettres, chiffres ou traits de soulignement."),
  label: z.string().trim().min(2).max(200).refine((v) => !/[\u0000-\u001f\u007f]/.test(v), "Utilisez une seule ligne."),
  eventAt: z.string().refine(validEventDate, "Indiquez une date et une heure valides à Dakar.").transform((v) => `${v}:00.000Z`),
  location: optionalLine(160),
});
export const eventRecordSchema = z.object({ id: z.string().uuid(), event_code: z.string(), label: z.string(),
  event_at: z.string(), location_name: z.string().nullable(), source: z.string(), created_at: z.string() });

export const documentCategories = { BILL_OF_LADING: "Connaissement (BL)", INVOICE: "Facture", PACKING_LIST: "Liste de colisage", CUSTOMS: "Douane", OTHER: "Autre document" } as const;
export const documentCategorySchema = z.enum(["BILL_OF_LADING", "INVOICE", "PACKING_LIST", "CUSTOMS", "OTHER"]);
export const documentRecordSchema = z.object({ id: z.string().uuid(), original_name: z.string(), category: documentCategorySchema,
  size_bytes: z.number(), mime_type: z.string(), upload_state: z.enum(["PENDING", "READY"]), created_at: z.string(), uploaded_by: z.string().uuid().nullable() });
export const maxDocumentBytes = 10 * 1024 * 1024;
export const documentBucket = "shipment-documents";
export const signedDocumentSeconds = 60;

export function detectDocumentType(bytes: Uint8Array): { mime: string; extension: string } | null {
  if (bytes.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((v, i) => bytes[i] === v)) {
    return { mime: "image/png", extension: "png" };
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", extension: "jpg" };
  }
  if (bytes.length >= 8 && String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-"
    && /^[12]\.\d$/.test(String.fromCharCode(...bytes.slice(5, 8)))) {
    return { mime: "application/pdf", extension: "pdf" };
  }
  return null;
}

export function validateDocument(name: string, claimedMime: string, size: number, bytes: Uint8Array) {
  if (!Number.isInteger(size) || size < 1 || size > maxDocumentBytes || size !== bytes.byteLength) {
    return { error: "Choisissez un fichier non vide de 10 Mio maximum." } as const;
  }
  if (name.length < 1 || name.length > 180 || /[\\/\u0000-\u001f\u007f]/.test(name)) {
    return { error: "Le nom du fichier est invalide ou dépasse 180 caractères." } as const;
  }
  const detected = detectDocumentType(bytes);
  const extension = name.split(".").at(-1)?.toLowerCase();
  const extensions = detected?.mime === "image/jpeg" ? ["jpg", "jpeg"] : [detected?.extension];
  if (!detected || !extensions.includes(extension) || (claimedMime !== "" && claimedMime !== detected.mime)) {
    return { error: "Le contenu, le type et l’extension doivent correspondre à un PDF, JPEG ou PNG." } as const;
  }
  return { ...detected };
}

export function documentPath(organizationId: string, shipmentId: string, documentId: string, extension: string) {
  for (const id of [organizationId, shipmentId, documentId]) z.string().uuid().parse(id);
  z.enum(["pdf", "jpg", "png"]).parse(extension);
  return `${organizationId}/${shipmentId}/${documentId}.${extension}`;
}

export type DossierFormState = { error?: string; values: Record<string, string> };
