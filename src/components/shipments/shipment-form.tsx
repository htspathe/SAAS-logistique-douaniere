"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createShipment, updateShipment } from "@/app/dashboard/expeditions/actions";
import { ClientPicker } from "@/components/shipments/client-picker";
import { customsLabels, directionLabels, loadLabels, phaseLabels, shipmentValues,
  type ShipmentFormState, type ShipmentRecord, type ShipmentValues } from "@/lib/shipments/validation";

const textFields: Array<{ name: keyof ShipmentValues; label: string; required?: boolean; max: number }> = [
  { name: "reference", label: "Référence du dossier", required: true, max: 80 },
  { name: "origin", label: "Lieu de départ", required: true, max: 160 },
  { name: "destination", label: "Lieu d’arrivée", required: true, max: 160 },
  { name: "billOfLading", label: "Numéro de connaissement (BL)", max: 100 },
  { name: "booking", label: "Numéro de réservation (booking)", max: 100 },
];
const selects: Array<{ name: keyof ShipmentValues; label: string; options: Record<string, string> }> = [
  { name: "direction", label: "Sens", options: directionLabels }, { name: "loadType", label: "Chargement", options: loadLabels },
  { name: "customsMode", label: "Traitement douanier", options: customsLabels }, { name: "phase", label: "Statut", options: phaseLabels },
];
const inputClass = "mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:outline-2 focus:outline-teal-700";

export function ShipmentForm({ organizationId, shipment }: { organizationId: string; shipment?: ShipmentRecord }) {
  const initial: ShipmentFormState = { values: shipmentValues(shipment) };
  const [state, action, pending] = useActionState(shipment ? updateShipment : createShipment, initial);
  const error = (name: keyof ShipmentValues) => state.fieldErrors?.[name]
    ? <p id={`shipment-${name}-error`} className="mt-1 text-xs text-red-800">{state.fieldErrors[name]}</p> : null;
  const accessibility = (name: keyof ShipmentValues) => ({
    "aria-invalid": Boolean(state.fieldErrors?.[name]),
    "aria-describedby": state.fieldErrors?.[name] ? `shipment-${name}-error` : undefined,
  });

  return <form action={action} className="space-y-8">
    <input type="hidden" name="organizationId" value={organizationId} />
    {shipment && <><input type="hidden" name="shipmentId" value={shipment.id} /><input type="hidden" name="updatedAt" value={shipment.updated_at} /></>}
    {state.error && <p role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-900">{state.error}</p>}
    <p className="text-sm text-slate-600">Les champs marqués * sont obligatoires. Le statut est renseigné manuellement.</p>
    <ClientPicker organizationId={organizationId} initialClient={shipment?.client} fieldError={state.fieldErrors?.clientId} />
    <fieldset><legend className="mb-4 font-semibold text-slate-900">Dossier et trajet</legend>
      <div className="grid gap-5 sm:grid-cols-2">
        {textFields.slice(0, 3).map((field) => <div key={field.name}>
          <label htmlFor={`shipment-${field.name}`} className="text-sm font-semibold text-slate-800">{field.label} *</label>
          <input id={`shipment-${field.name}`} name={field.name} required minLength={2} maxLength={field.max}
            defaultValue={state.values[field.name]} {...accessibility(field.name)} className={inputClass} />{error(field.name)}
        </div>)}
        {selects.map((field) => <div key={field.name}>
          <label htmlFor={`shipment-${field.name}`} className="text-sm font-semibold text-slate-800">{field.label} *</label>
          <select id={`shipment-${field.name}`} name={field.name} defaultValue={state.values[field.name]} required {...accessibility(field.name)} className={inputClass}>
            {Object.entries(field.options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>{error(field.name)}
        </div>)}
      </div>
    </fieldset>
    <fieldset><legend className="mb-4 font-semibold text-slate-900">Références maritimes</legend>
      <div className="grid gap-5 sm:grid-cols-2">{textFields.slice(3).map((field) => <div key={field.name}>
        <label htmlFor={`shipment-${field.name}`} className="text-sm font-semibold text-slate-800">{field.label}</label>
        <input id={`shipment-${field.name}`} name={field.name} maxLength={field.max} defaultValue={state.values[field.name]}
          {...accessibility(field.name)} className={inputClass} />{error(field.name)}
      </div>)}</div>
    </fieldset>
    <fieldset><legend className="font-semibold text-slate-900">Dates prévues</legend>
      <p className="mb-4 mt-2 text-xs text-slate-600">Heures de Dakar (UTC+0), quel que soit le pays de départ ou d’arrivée.</p>
      <div className="grid gap-5 sm:grid-cols-2">{([['departure', 'Départ prévu'], ['arrival', 'Arrivée prévue']] as const).map(([name, label]) => <div key={name}>
        <label htmlFor={`shipment-${name}`} className="text-sm font-semibold text-slate-800">{label}</label>
        <input id={`shipment-${name}`} name={name} type="datetime-local" min="1900-01-01T00:00" max="2199-12-31T23:59"
          defaultValue={state.values[name]} {...accessibility(name)} className={inputClass} />{error(name)}
      </div>)}</div>
    </fieldset>
    <div className="flex flex-wrap items-center gap-5 border-t border-slate-200 pt-6">
      <button disabled={pending} className="rounded-md bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-wait">
        {pending ? "Enregistrement…" : shipment ? "Enregistrer les modifications" : "Créer le dossier"}
      </button>
      <Link href={shipment ? `/dashboard/expeditions/${shipment.id}` : "/dashboard/expeditions"} className="text-sm font-semibold text-slate-700 underline">Annuler</Link>
    </div>
  </form>;
}
