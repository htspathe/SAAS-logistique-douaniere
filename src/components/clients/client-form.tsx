"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createClient, updateClient } from "@/app/dashboard/clients/actions";
import type { ClientFormState, ClientFormValues, ClientRecord } from "@/lib/clients/validation";

const fields: Array<{ name: keyof ClientFormValues; label: string; type: string; max: number; autoComplete: string }> = [
  { name: "name", label: "Nom du client ou raison sociale", type: "text", max: 160, autoComplete: "organization" },
  { name: "email", label: "E-mail principal", type: "email", max: 254, autoComplete: "email" },
  { name: "phone", label: "Téléphone principal", type: "tel", max: 32, autoComplete: "tel" },
  { name: "taxIdentifier", label: "Identifiant fiscal (NINEA ou équivalent)", type: "text", max: 80, autoComplete: "off" },
];

export function ClientForm({ organizationId, client }: { organizationId: string; client?: ClientRecord }) {
  const initialState: ClientFormState = { values: {
    name: client?.name ?? "", email: client?.email ?? "", phone: client?.phone ?? "", taxIdentifier: client?.tax_identifier ?? "",
  } };
  const [state, action, pending] = useActionState(client ? updateClient : createClient, initialState);

  return <form action={action} className="space-y-5">
    <input type="hidden" name="organizationId" value={organizationId} />
    {client && <input type="hidden" name="clientId" value={client.id} />}
    {state.error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    <p className="text-xs text-slate-500">Le nom est obligatoire. Les coordonnées et l’identifiant fiscal sont facultatifs.</p>
    {fields.map((field) => <div key={field.name}>
      <label htmlFor={`client-${field.name}`} className="block text-sm font-semibold text-slate-700">{field.label}</label>
      <input id={`client-${field.name}`} name={field.name} type={field.type}
        defaultValue={state.values[field.name]} required={field.name === "name"}
        minLength={field.name === "name" ? 2 : undefined} maxLength={field.max} autoComplete={field.autoComplete}
        aria-invalid={Boolean(state.fieldErrors?.[field.name])}
        aria-describedby={state.fieldErrors?.[field.name] ? `client-${field.name}-error` : undefined}
        className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" />
      {state.fieldErrors?.[field.name] && <p id={`client-${field.name}-error`} className="mt-1 text-xs text-red-700">{state.fieldErrors[field.name]}</p>}
    </div>)}
    <div className="flex flex-wrap items-center gap-5 pt-2">
      <button type="submit" disabled={pending} className="rounded-lg bg-[#0ca898] px-5 py-3 text-sm font-bold text-white hover:bg-[#098f82] disabled:cursor-wait disabled:opacity-60">
        {pending ? "Enregistrement…" : client ? "Enregistrer les modifications" : "Créer le client"}
      </button>
      <Link href="/dashboard/clients" className="text-sm font-semibold text-slate-500 hover:underline">Annuler</Link>
    </div>
  </form>;
}
