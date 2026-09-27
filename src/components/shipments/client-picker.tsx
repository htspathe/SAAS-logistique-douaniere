"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { clientChoiceSchema, type ClientChoice } from "@/lib/shipments/validation";

export function ClientPicker({ organizationId, initialClient, fieldError }: {
  organizationId: string; initialClient?: ClientChoice | null; fieldError?: string;
}) {
  const [selected, setSelected] = useState(initialClient ?? null);
  const [query, setQuery] = useState(initialClient?.name ?? "");
  const [results, setResults] = useState<ClientChoice[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [searched, setSearched] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function search() {
    setPending(true); setError(""); setSearched(false); setResults([]);
    try {
      const params = new URLSearchParams({ q: query, organizationId });
      const response = await fetch(`/dashboard/expeditions/recherche-clients?${params}`, { cache: "no-store" });
      if (!response.ok || !response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(response.status === 409 ? "L’entreprise active a changé. Rechargez ce formulaire."
          : "La recherche n’a pas abouti. Vérifiez votre connexion ou reconnectez-vous.");
      }
      const body = z.object({ clients: z.array(clientChoiceSchema), hasMore: z.boolean() }).parse(await response.json());
      setResults(body.clients); setHasMore(body.hasMore); setSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Recherche indisponible.");
    } finally { setPending(false); }
  }

  return <div>
    <label htmlFor="shipment-client" className="block text-sm font-semibold text-slate-800">Client *</label>
    <input type="hidden" name="clientId" value={selected?.id ?? ""} />
    <div className="mt-2 flex flex-wrap gap-2">
      <input id="shipment-client" value={query} maxLength={160} disabled={pending}
        onChange={(event) => { setQuery(event.target.value); setSelected(null); setSearched(false); setResults([]); }}
        onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void search(); } }}
        placeholder="Rechercher par nom" autoComplete="off" aria-invalid={Boolean(fieldError)}
        aria-describedby="shipment-client-help shipment-client-error"
        className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 px-3 text-sm focus:outline-2 focus:outline-teal-700" />
      <button type="button" onClick={search} disabled={pending}
        className="rounded-md border border-slate-400 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-wait">
        {pending ? "Recherche…" : "Rechercher"}
      </button>
    </div>
    <p id="shipment-client-help" className="mt-2 text-xs leading-5 text-slate-600">Recherchez puis sélectionnez un client. Une recherche vide affiche les premiers résultats.</p>
    <p id="shipment-client-error" role={fieldError || error ? "alert" : undefined} className="mt-1 text-xs text-red-800">{fieldError || error}</p>
    {selected && <p role="status" className="mt-2 break-words text-sm font-semibold text-teal-800">Client sélectionné : {selected.name}</p>}
    {searched && !selected && <div className="mt-3 rounded-md border border-slate-200">
      {results.length ? <ul className="max-h-60 divide-y divide-slate-100 overflow-y-auto">
        {results.map((client) => <li key={client.id}>
          <button type="button" onClick={() => { setSelected(client); setQuery(client.name); setResults([]); setSearched(false); }}
            className="w-full break-words px-3 py-3 text-left text-sm text-slate-800 hover:bg-slate-100 focus:bg-slate-100">{client.name}</button>
        </li>)}
      </ul> : <p className="p-3 text-sm text-slate-600">Aucun client trouvé.</p>}
      {hasMore && <p role="status" className="border-t border-slate-200 p-3 text-xs text-slate-700">Plus de 20 résultats : précisez le nom pour retrouver votre client.</p>}
    </div>}
    <Link href="/dashboard/clients/nouveau" className="mt-3 inline-block text-xs font-semibold text-teal-800 underline">Créer un client avant de remplir le dossier</Link>
  </div>;
}
