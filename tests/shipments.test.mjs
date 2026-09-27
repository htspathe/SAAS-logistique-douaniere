import assert from "node:assert/strict";
import test from "node:test";
import { shipmentInputSchema, shipmentDatabaseFields, shipmentValues, shipmentWritePermission,
  canWriteShipments, escapeClientSearch, isDakarDateTime, toDakarInput } from "../src/lib/shipments/validation.ts";
import { canWriteClients } from "../src/lib/clients/validation.ts";

const tenantA = "20000000-0000-4000-8000-000000000001";
const tenantB = "20000000-0000-4000-8000-000000000002";
const valid = { ...shipmentValues(), reference: " sn-imp-0042 ", clientId: tenantA, origin: "Shanghai", destination: "Dakar" };

test("accepts import/export and FCL/LCL with optional maritime references and dates", () => {
  for (const direction of ["IMPORT", "EXPORT"]) for (const loadType of ["FCL", "LCL"]) {
    const value = shipmentInputSchema.parse({ ...valid, direction, loadType });
    assert.equal(value.reference, "SN-IMP-0042");
    assert.equal(value.billOfLading, null);
    assert.equal(value.departure, null);
    assert.equal(value.arrival, null);
  }
});

test("rejects missing client, invalid enums, control characters and oversized references", () => {
  for (const changes of [{ clientId: "" }, { clientId: tenantA + "bad" }, { direction: "BOTH" },
    { customsMode: "FREE" }, { loadType: "AIR" }, { phase: "FORGED" }, { origin: "A\nB" },
    { reference: "X".repeat(81) }, { reference: "<script>" }, { booking: "Y".repeat(101) }, { destination: "" }]) {
    assert.equal(shipmentInputSchema.safeParse({ ...valid, ...changes }).success, false);
  }
});

test("rejects impossible dates, including non-leap years and hour rollover", () => {
  for (const value of ["2026-02-30T12:00", "2025-02-29T12:00", "1900-02-29T12:00", "2026-13-01T12:00",
    "2026-04-31T12:00", "2026-01-01T24:00", "2026-01-01T12:60", "2026-01-01", "2026-01-01T12:00Z"]) {
    assert.equal(isDakarDateTime(value), false, value);
    assert.equal(shipmentInputSchema.safeParse({ ...valid, departure: value }).success, false);
  }
  assert.equal(isDakarDateTime("2028-02-29T12:00"), true);
  assert.equal(isDakarDateTime("2000-02-29T12:00"), true);
});

test("enforces chronological order and permits one unknown estimated date", () => {
  assert.equal(shipmentInputSchema.safeParse({ ...valid, departure: "2026-09-28T10:00", arrival: "2026-09-27T10:00" }).success, false);
  assert.equal(shipmentInputSchema.safeParse({ ...valid, departure: "2026-09-28T10:00", arrival: "2026-09-28T10:00" }).success, true);
  assert.equal(shipmentInputSchema.safeParse({ ...valid, arrival: "2026-09-28T10:00" }).success, true);
});

test("date roundtrip is Dakar UTC+0 even when the server timezone differs", () => {
  const previous = process.env.TZ;
  process.env.TZ = "America/New_York";
  try {
    const parsed = shipmentInputSchema.parse({ ...valid, departure: "2026-03-29T02:30" });
    assert.equal(parsed.departure, "2026-03-29T02:30:00.000Z");
    assert.equal(toDakarInput(parsed.departure), "2026-03-29T02:30");
    assert.equal(toDakarInput("2026-09-27T12:30:00+03:00"), "2026-09-27T09:30");
  } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous; }
});

test("operational roles match existing clients permissions and reject stale tenant context", () => {
  for (const role of ["OWNER", "ADMIN", "MEMBER", "OPERATIONS", "CUSTOMS_AGENT", "FINANCE", "owner", "FORGED"]) {
    assert.equal(canWriteShipments(role), canWriteClients(role));
    assert.equal(shipmentWritePermission(role, tenantA, tenantA), canWriteShipments(role) ? null : "access");
  }
  for (const id of [tenantB, null, undefined, "forged"]) assert.equal(shipmentWritePermission("OWNER", tenantA, id), "context");
});

test("database payload cannot inject organization, author, ID or protected timestamps", () => {
  const result = shipmentDatabaseFields(shipmentInputSchema.parse({ ...valid, organization_id: tenantB,
    created_by: tenantB, id: tenantB, updated_at: "forged", actual_arrival_at: "forged" }));
  for (const key of ["organization_id", "created_by", "id", "updated_at", "actual_arrival_at"]) assert.equal(key in result, false);
  assert.equal(result.client_id, tenantA);
});

test("client search treats SQL wildcard characters as literal name characters", () => {
  assert.equal(escapeClientSearch("100%_Transit\\Dakar"), "100\\%\\_Transit\\\\Dakar");
  assert.equal(escapeClientSearch("Sénégal import"), "Sénégal import");
});
