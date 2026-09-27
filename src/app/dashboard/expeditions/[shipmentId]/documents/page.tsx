import { z } from "zod";
import { getShipment } from "@/lib/shipments/server";
import { canWriteShipments, formatDakar } from "@/lib/shipments/validation";
import { clientPageSchema } from "@/lib/clients/validation";
import { documentCategories, documentRecordSchema } from "@/lib/dossier/validation";
import { DocumentForm } from "@/components/dossier/forms";
import { DossierNavigation, DossierPagination } from "@/components/dossier/navigation";
import { ShipmentShell } from "@/components/shipments/shipment-shell";
import { cancelPendingDocument, downloadDocument } from "./actions";

export default async function DocumentsPage({ params, searchParams }: {
  params: Promise<{ shipmentId: string }>; searchParams: Promise<{ page?: string; succes?: string; annule?: string; erreur?: string }>;
}) {
  const { supabase, membership, shipment, claims } = await getShipment((await params).shipmentId);
  const search = await searchParams;
  const page = clientPageSchema.parse(search.page ?? 1);
  const { data, error, count } = await supabase.from("documents")
    .select("id, original_name, category, size_bytes, mime_type, upload_state, created_at, uploaded_by", { count: "exact" })
    .eq("organization_id", membership.organization_id).eq("shipment_id", shipment.id)
    .order("created_at", { ascending: false }).order("id").range((page - 1) * 25, page * 25 - 1);
  if (error) throw new Error("Les documents n’ont pas pu être chargés.");
  const documents = z.array(documentRecordSchema).parse(data);
  const canWrite = canWriteShipments(membership.role);
  const path = `/dashboard/expeditions/${shipment.id}/documents`;
  return <ShipmentShell title={`Documents · ${shipment.reference}`} organizationName={membership.organization.name}>
    <DossierNavigation shipmentId={shipment.id} active="Documents" />
    {search.succes === "1" && <p role="status" className="mb-5 text-sm text-teal-900">Le document a été ajouté.</p>}
    {search.annule === "1" && <p role="status" className="mb-5 text-sm text-teal-900">Le transfert incomplet a été annulé.</p>}
    {search.erreur && <p role="alert" className="mb-5 text-sm text-red-800">L’opération n’a pas abouti. Vérifiez votre accès ou réessayez dans un instant.</p>}
    <ul className="divide-y divide-slate-200 rounded-md border border-slate-200 bg-white">
      {documents.map((document) => <li key={document.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1"><h2 className="break-words font-semibold">{document.original_name}</h2>
          <p className="mt-2 text-sm text-slate-600">{documentCategories[document.category]} · {(document.size_bytes / 1024).toLocaleString("fr-SN", { maximumFractionDigits: 0 })} Kio · {formatDakar(document.created_at)}</p>
          {document.upload_state === "PENDING" && <p className="mt-2 text-sm text-amber-900">Transfert incomplet</p>}
        </div>
        {(document.upload_state === "READY" || (canWrite && document.uploaded_by === claims.sub)) && <form action={document.upload_state === "READY" ? downloadDocument : cancelPendingDocument}>
          <input type="hidden" name="organizationId" value={membership.organization_id} /><input type="hidden" name="shipmentId" value={shipment.id} /><input type="hidden" name="documentId" value={document.id} />
          <button className="rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-teal-800 hover:bg-slate-100">{document.upload_state === "READY" ? "Télécharger" : "Annuler le transfert"}</button>
        </form>}
      </li>)}
      {!documents.length && <li className="p-6 text-sm text-slate-600">Aucun document sur cette page.</li>}
    </ul>
    <DossierPagination path={path} page={page} total={count ?? 0} count={documents.length} />
    {canWrite && <section className="mt-8 rounded-md border border-slate-200 bg-white p-5 sm:p-8"><h2 className="mb-5 text-xl font-semibold">Ajouter un document</h2>
      <DocumentForm organizationId={membership.organization_id} shipmentId={shipment.id} />
    </section>}
  </ShipmentShell>;
}
