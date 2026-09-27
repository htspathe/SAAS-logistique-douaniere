import assert from "node:assert/strict";
import test from "node:test";
import { containerInputSchema, validContainerNumber, eventInputSchema, validEventDate, validateDocument,
  detectDocumentType, documentPath, documentCategorySchema, maxDocumentBytes } from "../src/lib/dossier/validation.ts";

test("container number may be absent before assignment, including LCL", () => {
  assert.deepEqual(containerInputSchema.parse({ number: "", seal: "", type: "" }), { number: null, seal: null, type: null });
  assert.equal(containerInputSchema.parse({ number: null }).number, null);
});

test("ISO 6346 validates owner/category/serial/check digit and normalizes printed spacing", () => {
  assert.equal(validContainerNumber("CSQU3054383"), true);
  assert.equal(containerInputSchema.parse({ number: " csqu 305438-3 ", type: "40HC" }).number, "CSQU3054383");
  for (const value of ["CSQU3054384", "CSQA3054383", "CSQU305438", "CSQU30543833", "C1QU3054383", "CSQU305438X"]) {
    assert.equal(validContainerNumber(value), false, value);
    assert.equal(containerInputSchema.safeParse({ number: value }).success, false, value);
  }
});

test("container fields reject oversized and multiline values", () => {
  for (const input of [{ type: "X".repeat(41) }, { seal: "X".repeat(81) }, { seal: "line\nbreak" }]) {
    assert.equal(containerInputSchema.safeParse(input).success, false);
  }
});

test("manual event needs code, description and real Dakar datetime", () => {
  const input = { code: " arrivee_port ", label: "Arrivée au port", eventAt: "2028-02-29T14:30", location: "Dakar" };
  assert.deepEqual(eventInputSchema.parse(input), { code: "ARRIVEE_PORT", label: "Arrivée au port", eventAt: "2028-02-29T14:30:00.000Z", location: "Dakar" });
  for (const value of ["2026-02-29T12:00", "2026-04-31T12:00", "2026-09-27T24:00", "2026-09-27T12:00+02:00", ""]) {
    assert.equal(validEventDate(value), false);
    assert.equal(eventInputSchema.safeParse({ ...input, eventAt: value }).success, false);
  }
  assert.equal(eventInputSchema.safeParse({ ...input, code: "A" }).success, false);
  assert.equal(eventInputSchema.safeParse({ ...input, label: "Line\nbreak" }).success, false);
});

// Synthetic headers in memory only: these test MIME signatures, not full parsers.
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
const pdf = new TextEncoder().encode("%PDF-1.7\n");

test("document bytes, extension and MIME must agree", () => {
  assert.equal(validateDocument("test.pdf", "application/pdf", pdf.length, pdf).mime, "application/pdf");
  assert.equal(validateDocument("test.PNG", "image/png", png.length, png).mime, "image/png");
  assert.equal(validateDocument("test.jpeg", "image/jpeg", jpeg.length, jpeg).extension, "jpg");
  assert.equal(validateDocument("test.png", "", png.length, png).mime, "image/png");
  for (const [name, mime, bytes] of [["test.pdf", "application/pdf", png], ["test.png", "text/html", png],
    ["test.svg", "image/svg+xml", png], ["test.jpg", "image/jpeg", new TextEncoder().encode("<script>bad</script>")]]) {
    assert.ok(validateDocument(name, mime, bytes.length, bytes).error);
  }
  assert.equal(detectDocumentType(new Uint8Array([0xff, 0xd8])), null);
});

test("document filenames reject traversal and header control characters", () => {
  for (const name of ["../file.png", "path\\file.png", "file\r\n.png", "X".repeat(181) + ".png", ""]) {
    assert.ok(validateDocument(name, "image/png", png.length, png).error);
  }
});

test("document length is checked against bytes and the 10 MiB boundary", () => {
  assert.ok(validateDocument("empty.png", "image/png", 0, new Uint8Array()).error);
  assert.ok(validateDocument("fake.png", "image/png", png.length + 1, png).error);
  const atLimit = new Uint8Array(maxDocumentBytes); atLimit.set(png);
  assert.equal(validateDocument("limit.png", "image/png", atLimit.length, atLimit).mime, "image/png");
  assert.ok(validateDocument("large.png", "image/png", maxDocumentBytes + 1, atLimit).error);
});

test("document object path can contain only validated tenant/parent/document UUIDs and allowed extensions", () => {
  const org = "23000000-0000-4000-8000-000000000001";
  const shipment = "43000000-0000-4000-8000-000000000001";
  const document = "53000000-0000-4000-8000-000000000001";
  assert.equal(documentPath(org, shipment, document, "pdf"), `${org}/${shipment}/${document}.pdf`);
  assert.throws(() => documentPath(org, "../other", document, "pdf"));
  assert.throws(() => documentPath(org, shipment, document, "html"));
  assert.equal(documentCategorySchema.safeParse("PUBLIC_LINK").success, false);
});
