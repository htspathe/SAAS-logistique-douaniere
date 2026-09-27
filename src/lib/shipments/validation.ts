import { z } from "zod";

export const directionLabels = { IMPORT: "Import", EXPORT: "Export" } as const;
export const loadLabels = { FCL: "FCL — Conteneur complet", LCL: "LCL — Groupage" } as const;
export const customsLabels = { INTERNAL: "Interne", EXTERNAL: "Externe", MIXED: "Mixte" } as const;
export const phaseLabels = {
  DRAFT: "Brouillon", PREPARATION: "Préparation", BOOKED: "Réservé", ORIGIN: "Au départ",
  IN_TRANSIT: "En transit", ARRIVED: "Arrivé", CUSTOMS: "En douane", DELIVERY: "En livraison",
  COMPLETED: "Terminé", ON_HOLD: "En attente", CANCELLED: "Annulé",
} as const;

const singleLine = (value: string) => !/[\u0000-\u001f\u007f]/.test(value);
const requiredText = (max: number) => z.string().trim().min(2, "Indiquez au moins 2 caractères.")
  .max(max, `Limité à ${max} caractères.`).refine(singleLine, "Utilisez une seule ligne.");
const optionalText = (max: number) => z.preprocess((v) => v ?? "", z.string().trim()
  .max(max, `Limité à ${max} caractères.`).refine(singleLine, "Utilisez une seule ligne.")
  .transform((v) => v || null));

// datetime-local has no timezone. All operational input here is Dakar (UTC+0).
// Round-tripping rejects impossible dates such as 30 February and hour 24.
export function isDakarDateTime(value: string) {
  if (!/^(19|20|21)\d{2}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return false;
  const time = new Date(`${value}:00.000Z`);
  return Number.isFinite(time.getTime()) && time.toISOString().slice(0, 16) === value;
}

const optionalDate = z.preprocess((v) => v ?? "", z.string()
  .refine((v) => v === "" || isDakarDateTime(v), "Indiquez une date et une heure valides à Dakar.")
  .transform((v) => v === "" ? null : `${v}:00.000Z`));

export const shipmentIdSchema = z.string().uuid();
export const shipmentInputSchema = z.object({
  reference: requiredText(80).transform((v) => v.toUpperCase())
    .refine((v) => /^[A-Z0-9][A-Z0-9._/-]*$/.test(v), "Utilisez lettres, chiffres, tirets, points ou barres obliques."),
  clientId: z.string().uuid("Sélectionnez un client de cette entreprise."),
  direction: z.enum(["IMPORT", "EXPORT"]),
  loadType: z.enum(["FCL", "LCL"]),
  customsMode: z.enum(["INTERNAL", "EXTERNAL", "MIXED"]),
  phase: z.enum(Object.keys(phaseLabels) as [keyof typeof phaseLabels, ...Array<keyof typeof phaseLabels>]),
  origin: requiredText(160), destination: requiredText(160),
  billOfLading: optionalText(100), booking: optionalText(100),
  departure: optionalDate, arrival: optionalDate,
}).superRefine((input, context) => {
  if (input.departure && input.arrival && input.arrival < input.departure) {
    context.addIssue({ code: "custom", path: ["arrival"], message: "L’arrivée prévue ne peut pas précéder le départ prévu." });
  }
});

export function canWriteShipments(role: string) {
  return ["OWNER", "ADMIN", "OPERATIONS", "CUSTOMS_AGENT"].includes(role);
}

export function shipmentWritePermission(role: string, activeId: string, submittedId: unknown) {
  if (!canWriteShipments(role)) return "access";
  if (!shipmentIdSchema.safeParse(submittedId).success || activeId !== submittedId) return "context";
  return null;
}

export const clientChoiceSchema = z.object({ id: shipmentIdSchema, name: z.string() });
export type ClientChoice = z.infer<typeof clientChoiceSchema>;
export const shipmentRecordSchema = z.object({
  id: shipmentIdSchema, reference: z.string(), client_id: shipmentIdSchema.nullable(),
  client: clientChoiceSchema.nullable(), direction: z.enum(["IMPORT", "EXPORT"]),
  load_type: z.enum(["FCL", "LCL"]), customs_mode: z.enum(["INTERNAL", "EXTERNAL", "MIXED"]),
  phase: z.enum(Object.keys(phaseLabels) as [keyof typeof phaseLabels, ...Array<keyof typeof phaseLabels>]),
  origin_name: z.string(), destination_name: z.string(), bill_of_lading_number: z.string().nullable(),
  booking_number: z.string().nullable(), estimated_departure_at: z.string().nullable(),
  estimated_arrival_at: z.string().nullable(), created_at: z.string(), updated_at: z.string(),
});
export type ShipmentRecord = z.infer<typeof shipmentRecordSchema>;
export type ShipmentValues = Record<keyof z.input<typeof shipmentInputSchema>, string>;
export type ShipmentFormState = { values: ShipmentValues; error?: string; fieldErrors?: Partial<Record<keyof ShipmentValues, string>> };

export function toDakarInput(value: string | null) {
  if (!value) return "";
  const time = new Date(value);
  return Number.isFinite(time.getTime()) ? time.toISOString().slice(0, 16) : "";
}

export function formatDakar(value: string | null) {
  if (!value) return "Non renseigné";
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("fr-SN", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Dakar" }).format(date)
    : "Date indisponible";
}

export function shipmentValues(record?: ShipmentRecord): ShipmentValues {
  return {
    reference: record?.reference ?? "", clientId: record?.client_id ?? "", direction: record?.direction ?? "IMPORT",
    loadType: record?.load_type ?? "FCL", customsMode: record?.customs_mode ?? "INTERNAL", phase: record?.phase ?? "DRAFT",
    origin: record?.origin_name ?? "", destination: record?.destination_name ?? "", billOfLading: record?.bill_of_lading_number ?? "",
    booking: record?.booking_number ?? "", departure: toDakarInput(record?.estimated_departure_at ?? null),
    arrival: toDakarInput(record?.estimated_arrival_at ?? null),
  };
}

export function shipmentDatabaseFields(value: z.infer<typeof shipmentInputSchema>) {
  return { reference: value.reference, client_id: value.clientId, direction: value.direction, load_type: value.loadType,
    customs_mode: value.customsMode, phase: value.phase, origin_name: value.origin, destination_name: value.destination,
    bill_of_lading_number: value.billOfLading, booking_number: value.booking,
    estimated_departure_at: value.departure, estimated_arrival_at: value.arrival };
}

export function escapeClientSearch(value: string) {
  return value.replace(/[\\%_]/g, "\\$&");
}
