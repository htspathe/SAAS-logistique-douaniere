import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const landing = readFileSync(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const dashboard = readFileSync(new URL("../src/app/dashboard/page.tsx", import.meta.url), "utf8");

// Static guardrails for the two entry pages. A visual review remains mandatory:
// automated checks cannot assess contrast, accessibility or editorial tone.
test("the public landing and dashboard avoid banned generic visual effects", () => {
  for (const [name, source] of [["landing", landing], ["dashboard", dashboard]]) {
    assert.doesNotMatch(source, /bg-gradient-to-[a-z]+|bg-clip-text|text-transparent|backdrop-blur|hover:opacity-/, name);
    assert.doesNotMatch(source, /font-serif[^"\n]*italic|Space_Grotesk|Instrument_Serif/, name);
    assert.doesNotMatch(source, /\p{Extended_Pictographic}/u, name);
  }
});

test("landing explains unfinished features instead of claiming they are live", () => {
  assert.match(landing, /notifications restent en développement/);
  assert.match(landing, /Aucune disponibilité d'une API AIS/);
  assert.match(landing, /Toutes les positions, vitesses et dates présentées ici sont fictives/);
  assert.doesNotMatch(landing, /<Sparkles/);
  assert.doesNotMatch(landing, /lg:grid-cols-3|md:grid-cols-3/);
});

test("dashboard does not offer dead notification, search or menu buttons", () => {
  assert.match(dashboard, /<details className="relative lg:hidden">/);
  assert.match(dashboard, /href="\/dashboard\/expeditions"/);
  assert.doesNotMatch(dashboard, /aria-label="Notifications"|placeholder="Rechercher un dossier/);
  assert.doesNotMatch(dashboard, /href=\{item\.href \?\? "\/dashboard"\}/);
});
