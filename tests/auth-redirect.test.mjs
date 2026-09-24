import assert from "node:assert/strict";
import test from "node:test";
import { safeRedirectPath } from "../src/lib/auth/redirect.ts";

test("preserves dashboard paths and their query parameters", () => {
  for (const path of ["/dashboard", "/dashboard/dossiers?id=42#documents"]) {
    assert.equal(safeRedirectPath(path), path);
  }
});

test("rejects external destinations and URL parser ambiguities", () => {
  for (const path of [
    undefined, null, "", "https://example.com", "//example.com",
    "/\\example.com", "/\t/example.com", "/\n/example.com",
    "/dashboard/../../auth/callback", "/auth/callback", "/dashboard-other",
    "javascript:alert(1)",
  ]) {
    assert.equal(safeRedirectPath(path), "/dashboard", String(path));
  }
});

test("encoded input never changes the redirect origin", () => {
  for (const path of [
    "/%2f%2fexample.com", "/%5cexample.com", "/dashboard/%2e%2e/auth/callback",
    "/dashboard?next=https://example.com", "/dashboard/%5cexample.com",
  ]) {
    const target = new URL(safeRedirectPath(path), "https://transitflow.invalid");
    assert.equal(target.origin, "https://transitflow.invalid");
    assert.ok(target.pathname === "/dashboard" || target.pathname.startsWith("/dashboard/"));
  }
});
