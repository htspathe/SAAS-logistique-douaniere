import assert from "node:assert/strict";
import test from "node:test";
import {
  clientInputSchema, clientDatabaseFields, clientIdSchema, clientPageSchema,
  canWriteClients, clientWritePermission,
} from "../src/lib/clients/validation.ts";

const tenantA = "20000000-0000-4000-8000-000000000001";
const tenantB = "20000000-0000-4000-8000-000000000002";

test("client requires only a name and stores absent coordinates as null", () => {
  assert.deepEqual(clientInputSchema.parse({ name: "  Sénégal Import & Export  " }), {
    name: "Sénégal Import & Export", email: null, phone: null, taxIdentifier: null,
  });
  assert.deepEqual(clientInputSchema.parse({ name: "Client", email: " ", phone: null, taxIdentifier: "" }), {
    name: "Client", email: null, phone: null, taxIdentifier: null,
  });
});

test("supports Senegalese and foreign contacts without restricting the tax identifier to NINEA", () => {
  for (const phone of ["+221 77 123 45 67", "77 123 45 67", "+33 1 23 45 67 89", "00221 77 123 45 67"]) {
    assert.equal(clientInputSchema.safeParse({ name: "Client", email: " contact@example.sn ", phone, taxIdentifier: "FR 12 345 678" }).success, true);
  }
});

test("rejects malformed, oversized, multiline and non-text input", () => {
  for (const input of [
    { name: "" }, { name: "A" }, { name: "A".repeat(161) }, { name: "A\nB" },
    { name: "Client", email: "not-an-email" }, { name: "Client", email: "a\r\nb@example.com" },
    { name: "Client", phone: "123" }, { name: "Client", phone: "7".repeat(16) },
    { name: "Client", phone: "call me" }, { name: "Client", phone: "22+1771234567" },
    { name: "Client", taxIdentifier: "X".repeat(81) }, { name: "Client", taxIdentifier: "12\u000023" },
    { name: new Blob(["uploaded file"]) },
  ]) assert.equal(clientInputSchema.safeParse(input).success, false, JSON.stringify(input));
});

test("extra fields cannot inject tenant IDs, timestamps or privileged columns", () => {
  const parsed = clientInputSchema.parse({
    name: "Client", organization_id: tenantB, id: tenantB, role: "OWNER", updated_at: "forged",
  });
  assert.deepEqual(clientDatabaseFields(parsed), { name: "Client", email: null, phone: null, tax_identifier: null });
});

test("write permission matches operational roles and rejects read-only or forged roles", () => {
  for (const role of ["OWNER", "ADMIN", "OPERATIONS", "CUSTOMS_AGENT"]) {
    assert.equal(canWriteClients(role), true);
    assert.equal(clientWritePermission(role, tenantA, tenantA), null);
  }
  for (const role of ["MEMBER", "FINANCE", "owner", "UNKNOWN", ""]) {
    assert.equal(canWriteClients(role), false);
    assert.equal(clientWritePermission(role, tenantA, tenantA), "access");
  }
});

test("stale or forged organisation context refuses a write even for an administrator", () => {
  for (const submitted of [tenantB, undefined, null, "", "forged-tenant"]) {
    assert.equal(clientWritePermission("ADMIN", tenantA, submitted), "context");
  }
});

test("bounds pagination and validates identifiers", () => {
  assert.equal(clientPageSchema.parse("2"), 2);
  for (const page of ["0", "-1", "1.5", "invalid", "999999999999", "Infinity"]) {
    assert.equal(clientPageSchema.parse(page), 1);
  }
  assert.equal(clientIdSchema.safeParse(tenantA).success, true);
  assert.equal(clientIdSchema.safeParse("id=other-tenant").success, false);
});
