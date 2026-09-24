import assert from "node:assert/strict";
import test from "node:test";
import {
  organizationNameSchema, organizationIdSchema, canManageOrganization, selectMembership,
} from "../src/lib/organizations/validation.ts";

test("accepts national business names and trims outer whitespace", () => {
  assert.equal(organizationNameSchema.parse("  Sénégal Import & Export  "), "Sénégal Import & Export");
  assert.equal(organizationNameSchema.parse("Établissements Ndiaye"), "Établissements Ndiaye");
});

test("rejects empty, oversized and multiline organisation names", () => {
  for (const name of [null, "", " ", "A", "a".repeat(121), "Dakar\nTransit", "Dakar\u0000Transit"]) {
    assert.equal(organizationNameSchema.safeParse(name).success, false);
  }
});

test("only owner and admin can manage organisation settings", () => {
  for (const role of ["OWNER", "ADMIN"]) assert.equal(canManageOrganization(role), true);
  for (const role of ["MEMBER", "OPERATIONS", "CUSTOMS_AGENT", "FINANCE", "owner", "UNKNOWN"]) {
    assert.equal(canManageOrganization(role), false);
  }
});

test("validates organisation identifiers before database calls", () => {
  assert.equal(organizationIdSchema.safeParse("20000000-0000-4000-8000-000000000001").success, true);
  for (const id of ["", "other-tenant", null, "' OR 1=1"]) {
    assert.equal(organizationIdSchema.safeParse(id).success, false);
  }
});

test("forged or stale preference cannot create a membership", () => {
  const a = { organization_id: "a", role: "MEMBER", organization: { id: "a", name: "A", slug: "a" } };
  const b = { organization_id: "b", role: "OWNER", organization: { id: "b", name: "B", slug: "b" } };
  assert.equal(selectMembership([a, b], "b"), b);
  assert.equal(selectMembership([a, b], "foreign-tenant"), a);
  assert.equal(selectMembership([a], "b"), a);
  assert.equal(selectMembership([], "b"), null);
});
