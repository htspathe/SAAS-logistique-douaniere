export type ShipmentDirection = "IMPORT" | "EXPORT";

export type LoadType = "FCL" | "LCL";

export type CustomsMode = "INTERNAL" | "EXTERNAL" | "MIXED";

export type ShipmentPhase =
  | "DRAFT"
  | "PREPARATION"
  | "BOOKED"
  | "ORIGIN"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "CUSTOMS"
  | "DELIVERY"
  | "COMPLETED"
  | "ON_HOLD"
  | "CANCELLED";

export type ShipmentSummary = {
  id: string;
  reference: string;
  client: string;
  direction: ShipmentDirection;
  loadType: LoadType;
  route: string;
  phase: ShipmentPhase;
  statusLabel: string;
  eta: string;
  progress: number;
  containerNumber?: string;
};
