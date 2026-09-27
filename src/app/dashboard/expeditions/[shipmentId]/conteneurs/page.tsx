import Link from "next/link";
import { z } from "zod";
import { getShipment } from "@/lib/shipments/server";
import { canWriteShipments } from "@/lib/shipments/validation";
import { clientPageSchema } from "@/lib/clients/validation";
import { containerRecordSchema } from "@/lib/dossier/validation";
import { ContainerForm } from "@/components/dossier/forms";
import { DossierNavigation, DossierPagination } from "@/components/dossier/navigation";
import { ShipmentShell } from "@/components/shipments/shipment-shell";

export default async function ContainersPage({ params, searchParams }: {
  params: Promise<{ shipmentId: string }>; searchParams: Promise<{ page?: string; succes?: string }>;
}) {
  const { supabase, membership, shipment } = await getShipment((await params).shipmentId);
  const search = await searchParams;
  const page = clientPageSchema.parse(search.page ?? 1);
  const { data, error, count } = await supabase.from("containers").select("id, container_number, seal_number, container_type, created_at", { count: "exact" })
    .eq("organization_id", membership.organization_id).eq("shipment_id", shipment.id)
    .order("created_at", { ascending: false }).order("id").range((page - 1) * 25, page * 25 - 1);
  if (error) throw new Error("Les conteneurs n’ont pas pu être chargés.");
  const containers = z.array(containerRecordSchema).parse(data);
  const canWrite = canWriteShipments(membership.role);
  const path = `/dashboard/expeditions/${shipment.id}/conteneurs`;
  return <ShipmentShell title={`Conteneurs · ${shipment.reference}`} organizationName={membership.organization.name}>
    <DossierNavigation shipmentId={shipment.id} active="Conteneurs" />
    {search.succes === "1" && <p role="status" className="mb-5 text-sm text-teal-900">Le conteneur a été enregistré.</p>}
    <p className="mb-4 text-sm text-slate-600">{count ?? 0} conteneur(s) rattaché(s) au dossier.</p>
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
      {containers.length ? <table className="w-full text-left text-sm"><thead className="bg-slate-100"><tr>
        {['Numéro', 'Scellé', 'Type', ...(canWrite ? ['Action'] : [])].map((label) => <th scope="col" key={label} className="px-4 py-3">{label}</th>)}
      </tr></thead><tbody className="divide-y divide-slate-200">{containers.map((container) => <tr key={container.id}>
        <th scope="row" className="px-4 py-4 font-medium">{container.container_number ?? "Numéro à attribuer"}</th>
        <td className="max-w-48 break-words px-4 py-4">{container.seal_number ?? "Non renseigné"}</td><td className="max-w-40 break-words px-4 py-4">{container.container_type ?? "Non renseigné"}</td>
        {canWrite && <td className="px-4 py-4"><Link href={`${path}/${container.id}/modifier`} className="font-semibold text-teal-800 underline">Modifier</Link></td>}
      </tr>)}</tbody></table> : <p className="p-6 text-sm text-slate-600">Aucun conteneur sur cette page.</p>}
    </div>
    <DossierPagination path={path} page={page} total={count ?? 0} count={containers.length} />
    {canWrite && <section className="mt-8 rounded-md border border-slate-200 bg-white p-5 sm:p-8"><h2 className="mb-5 text-xl font-semibold">Ajouter un conteneur</h2>
      <ContainerForm organizationId={membership.organization_id} shipmentId={shipment.id} />
    </section>}
  </ShipmentShell>;
}
