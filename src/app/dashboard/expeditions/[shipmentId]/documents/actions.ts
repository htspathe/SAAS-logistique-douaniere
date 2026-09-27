"use server";

import { createHash, randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeDossierWrite } from "@/lib/dossier/server";
import { documentBucket, documentCategorySchema, documentPath, maxDocumentBytes, signedDocumentSeconds,
  validateDocument, type DossierFormState } from "@/lib/dossier/validation";
import { requireOrganization } from "@/lib/organizations/server";
import { shipmentIdSchema } from "@/lib/shipments/validation";

type WriteContext = Exclude<Awaited<ReturnType<typeof authorizeDossierWrite>>, { error: string }>;

async function discardPending(context: WriteContext, id: string, path: string) {
  const { error: objectError } = await context.supabase.storage.from(documentBucket).remove([path]);
  if (objectError) return false;
  const { data, error } = await context.supabase.from("documents").delete().eq("id", id)
    .eq("organization_id", context.membership.organization_id).eq("shipment_id", context.shipmentId)
    .eq("uploaded_by", context.claims.sub).eq("upload_state", "PENDING").select("id").maybeSingle();
  return !error && Boolean(data);
}

export async function uploadDocument(_state: DossierFormState, form: FormData): Promise<DossierFormState> {
  const context = await authorizeDossierWrite(form);
  const values = { category: typeof form.get("category") === "string" ? String(form.get("category")).slice(0, 40) : "OTHER" };
  if ("error" in context) return { values, error: context.error };
  const category = documentCategorySchema.safeParse(form.get("category"));
  const file = form.get("file");
  if (!category.success) return { values, error: "Choisissez une catégorie valide." };
  if (!(file instanceof File) || file.size < 1 || file.size > maxDocumentBytes) {
    return { values, error: "Choisissez un fichier non vide de 10 Mio maximum." };
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const validated = validateDocument(file.name, file.type, file.size, bytes);
  if ("error" in validated) return { values, error: validated.error };
  const id = randomUUID();
  const path = documentPath(context.membership.organization_id, context.shipmentId, id, validated.extension);
  const inserted = await context.supabase.from("documents").insert({
    id, organization_id: context.membership.organization_id, shipment_id: context.shipmentId,
    category: category.data, original_name: file.name, storage_path: path, mime_type: validated.mime,
    size_bytes: file.size, sha256: createHash("sha256").update(bytes).digest("hex"), uploaded_by: context.claims.sub,
  });
  if (inserted.error) return { values, error: "Le transfert n’a pas pu être préparé. Réessayez dans un instant." };

  const uploaded = await context.supabase.storage.from(documentBucket).upload(path, bytes, {
    contentType: validated.mime, upsert: false, cacheControl: "0",
  });
  let failure = Boolean(uploaded.error);
  if (!failure) {
    const finalized = await context.supabase.from("documents").update({ upload_state: "READY" }).eq("id", id)
      .eq("organization_id", context.membership.organization_id).eq("shipment_id", context.shipmentId)
      .eq("uploaded_by", context.claims.sub).eq("upload_state", "PENDING").select("id").maybeSingle();
    failure = Boolean(finalized.error || !finalized.data);
  }
  const listPath = `/dashboard/expeditions/${context.shipmentId}/documents`;
  if (failure) {
    // A lost response may hide a committed finalization; never delete READY.
    const current = await context.supabase.from("documents").select("upload_state").eq("id", id)
      .eq("organization_id", context.membership.organization_id).eq("shipment_id", context.shipmentId).maybeSingle();
    if (current.data?.upload_state !== "READY") {
      const cleaned = await discardPending(context, id, path);
      revalidatePath(listPath);
      return { values, error: cleaned ? "Le transfert a échoué et a été annulé. Sélectionnez le fichier pour réessayer."
        : "Le transfert est incomplet. Revenez à la liste puis utilisez « Annuler le transfert » avant de réessayer." };
    }
  }
  revalidatePath(listPath); redirect(`${listPath}?succes=1`);
}

export async function cancelPendingDocument(form: FormData) {
  const context = await authorizeDossierWrite(form);
  if ("error" in context) redirect("/dashboard/expeditions");
  const id = shipmentIdSchema.safeParse(form.get("documentId"));
  const listPath = `/dashboard/expeditions/${context.shipmentId}/documents`;
  if (!id.success) redirect(`${listPath}?erreur=transfert`);
  const { data, error } = await context.supabase.from("documents").select("id, storage_path").eq("id", id.data)
    .eq("organization_id", context.membership.organization_id).eq("shipment_id", context.shipmentId)
    .eq("uploaded_by", context.claims.sub).eq("upload_state", "PENDING").maybeSingle();
  if (error || !data || !await discardPending(context, data.id, data.storage_path)) {
    redirect(`${listPath}?erreur=transfert`);
  }
  revalidatePath(listPath); redirect(`${listPath}?annule=1`);
}

export async function downloadDocument(form: FormData) {
  const { supabase, membership } = await requireOrganization();
  const shipmentId = shipmentIdSchema.safeParse(form.get("shipmentId"));
  const documentId = shipmentIdSchema.safeParse(form.get("documentId"));
  if (!shipmentId.success || !documentId.success || form.get("organizationId") !== membership.organization_id) {
    redirect("/dashboard/expeditions");
  }
  const listPath = `/dashboard/expeditions/${shipmentId.data}/documents`;
  const { data, error } = await supabase.from("documents").select("storage_path, original_name")
    .eq("id", documentId.data).eq("shipment_id", shipmentId.data).eq("organization_id", membership.organization_id)
    .eq("upload_state", "READY").maybeSingle();
  if (error || !data) redirect(`${listPath}?erreur=telechargement`);
  const filename = data.original_name.replace(/[\\/\u0000-\u001f\u007f]/g, "_").slice(0, 180);
  const signed = await supabase.storage.from(documentBucket).createSignedUrl(data.storage_path, signedDocumentSeconds, { download: filename });
  if (signed.error || !signed.data?.signedUrl) redirect(`${listPath}?erreur=telechargement`);
  redirect(signed.data.signedUrl);
}
