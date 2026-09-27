"use client";

import { useActionState } from "react";
import { appendEvent, createContainer, updateContainer } from "@/app/dashboard/expeditions/[shipmentId]/operations-actions";
import { uploadDocument } from "@/app/dashboard/expeditions/[shipmentId]/documents/actions";
import { documentCategories, type ContainerRecord, type DossierFormState } from "@/lib/dossier/validation";

type Context = { organizationId: string; shipmentId: string };
const inputClass = "mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-2 focus:outline-teal-800";
const buttonClass = "rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-wait";
function HiddenContext({ organizationId, shipmentId }: Context) {
  return <><input type="hidden" name="organizationId" value={organizationId} /><input type="hidden" name="shipmentId" value={shipmentId} /></>;
}
function ErrorMessage({ error }: { error?: string }) {
  return error ? <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</p> : null;
}

export function ContainerForm({ organizationId, shipmentId, container }: Context & { container?: ContainerRecord }) {
  const initial: DossierFormState = { values: { number: container?.container_number ?? "", seal: container?.seal_number ?? "", type: container?.container_type ?? "" } };
  const [state, action, pending] = useActionState(container ? updateContainer : createContainer, initial);
  return <form action={action} className="space-y-5">
    <HiddenContext organizationId={organizationId} shipmentId={shipmentId} />
    {container && <input type="hidden" name="containerId" value={container.id} />}
    <ErrorMessage error={state.error} />
    <p className="text-sm text-slate-600">Le numéro peut rester vide jusqu’à l’attribution du conteneur, notamment en groupage LCL.</p>
    {([['number', 'Numéro du conteneur', 20], ['seal', 'Numéro de scellé', 80], ['type', 'Type de conteneur (ex. 40HC)', 40]] as const).map(([name, label, max]) => <div key={name}>
      <label htmlFor={`container-${name}`} className="text-sm font-semibold">{label}</label>
      <input id={`container-${name}`} name={name} maxLength={max} defaultValue={state.values[name]} className={inputClass} />
    </div>)}
    <button disabled={pending} className={buttonClass}>{pending ? "Enregistrement…" : container ? "Enregistrer le conteneur" : "Ajouter le conteneur"}</button>
  </form>;
}

export function EventForm({ organizationId, shipmentId }: Context) {
  const initial: DossierFormState = { values: { code: "", label: "", eventAt: "", location: "" } };
  const [state, action, pending] = useActionState(appendEvent, initial);
  return <form action={action} className="space-y-5">
    <HiddenContext organizationId={organizationId} shipmentId={shipmentId} /><ErrorMessage error={state.error} />
    <p className="text-sm text-slate-600">L’événement sera conservé dans l’historique. Pour corriger une saisie, ajoutez un nouvel événement explicatif.</p>
    {([['code', 'Code (ex. ARRIVEE_PORT)', 'text', 40], ['label', 'Description', 'text', 200], ['eventAt', 'Date et heure à Dakar (UTC+0)', 'datetime-local', undefined], ['location', 'Lieu (facultatif)', 'text', 160]] as const).map(([name, label, type, max]) => <div key={name}>
      <label htmlFor={`event-${name}`} className="text-sm font-semibold">{label}{name !== "location" ? " *" : ""}</label>
      <input id={`event-${name}`} type={type} name={name} maxLength={max} required={name !== "location"}
        defaultValue={state.values[name]} className={inputClass} />
    </div>)}
    <button disabled={pending} className={buttonClass}>{pending ? "Enregistrement…" : "Ajouter à l’historique"}</button>
  </form>;
}

export function DocumentForm({ organizationId, shipmentId }: Context) {
  const initial: DossierFormState = { values: { category: "OTHER" } };
  const [state, action, pending] = useActionState(uploadDocument, initial);
  return <form action={action} className="space-y-5">
    <HiddenContext organizationId={organizationId} shipmentId={shipmentId} /><ErrorMessage error={state.error} />
    <p className="text-sm text-slate-600">PDF, JPEG ou PNG, 10 Mio maximum. Les documents sont réservés aux membres de votre entreprise.</p>
    <div><label htmlFor="document-category" className="text-sm font-semibold">Catégorie *</label>
      <select id="document-category" name="category" defaultValue={state.values.category} className={inputClass} required>
        {Object.entries(documentCategories).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
    <div><label htmlFor="document-file" className="text-sm font-semibold">Fichier *</label>
      <input id="document-file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" required
        className="mt-2 block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-2 file:text-slate-900" />
    </div>
    <button disabled={pending} className={buttonClass}>{pending ? "Transfert en cours…" : "Ajouter le document"}</button>
  </form>;
}
