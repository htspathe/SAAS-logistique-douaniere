begin;

create schema if not exists private;
grant usage on schema private to authenticated;

-- Existing metadata is kept pending until a verified upload/reconciliation.
alter table public.documents add column upload_state text not null default 'PENDING'
  check (upload_state in ('PENDING', 'READY'));
alter table public.documents add constraint private_document_fields_valid
check (shipment_id is not null and size_bytes between 1 and 10485760
  and mime_type in ('application/pdf', 'image/jpeg', 'image/png')
  and char_length(original_name) between 1 and 180
  and category in ('BILL_OF_LADING', 'INVOICE', 'PACKING_LIST', 'CUSTOMS', 'OTHER')
  and sha256 ~ '^[a-f0-9]{64}$' and sha256 is not null
  and is_client_visible = false and version = 1
  and storage_path = organization_id::text || '/' || shipment_id::text || '/' || id::text ||
    case mime_type when 'application/pdf' then '.pdf' when 'image/jpeg' then '.jpg' when 'image/png' then '.png' end) not valid;

-- Private helpers avoid recursive policies; authorization always uses auth.uid().
create function private.can_upload_document(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.documents d where d.storage_path = object_name
    and d.upload_state = 'PENDING' and d.uploaded_by = auth.uid()
    and public.can_manage_operations(d.organization_id));
$$;
create function private.can_read_document(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.documents d where d.storage_path = object_name
    and d.upload_state = 'READY' and public.is_organization_member(d.organization_id));
$$;
create function private.document_object_exists(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from storage.objects o join public.documents d on d.storage_path = o.name
    where o.bucket_id = 'shipment-documents' and o.name = object_name
      and public.is_organization_member(d.organization_id));
$$;
revoke all on function private.can_upload_document(text) from public, anon;
revoke all on function private.can_read_document(text) from public, anon;
revoke all on function private.document_object_exists(text) from public, anon;
grant execute on function private.can_upload_document(text) to authenticated;
grant execute on function private.can_read_document(text) to authenticated;
grant execute on function private.document_object_exists(text) to authenticated;

drop policy "Members can manage organization documents" on public.documents;
drop policy "Portal users can read shared documents" on public.documents;
-- Read policy from 0004 is retained; only active internal members can list.
create policy "Operators create pending documents" on public.documents for insert to authenticated
with check (public.can_manage_operations(organization_id) and uploaded_by = auth.uid()
  and upload_state = 'PENDING');
create policy "Uploaders finalize documents" on public.documents for update to authenticated
using (public.can_manage_operations(organization_id) and uploaded_by = auth.uid() and upload_state = 'PENDING')
with check (public.can_manage_operations(organization_id) and uploaded_by = auth.uid()
  and upload_state = 'READY' and private.document_object_exists(storage_path));
create policy "Uploaders discard empty pending documents" on public.documents for delete to authenticated
using (public.can_manage_operations(organization_id) and uploaded_by = auth.uid()
  and upload_state = 'PENDING' and not private.document_object_exists(storage_path));
revoke all on public.documents from anon, authenticated;
grant select on public.documents to authenticated;
grant insert (id, organization_id, shipment_id, category, original_name, storage_path, mime_type, size_bytes, sha256, uploaded_by)
  on public.documents to authenticated;
grant update (upload_state) on public.documents to authenticated;
grant delete on public.documents to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shipment-documents', 'shipment-documents', false, 10485760, array['application/pdf', 'image/jpeg', 'image/png']);

create policy "Pending document objects may be inserted" on storage.objects for insert to authenticated
with check (bucket_id = 'shipment-documents' and private.can_upload_document(name));
create policy "Ready document objects may be read" on storage.objects for select to authenticated
using (bucket_id = 'shipment-documents' and private.can_read_document(name));
-- Storage deletion also needs SELECT access to find pending objects. This grants
-- the uploader read access to their own unfinished upload solely for recovery.
create policy "Uploaders may read their pending objects" on storage.objects for select to authenticated
using (bucket_id = 'shipment-documents' and private.can_upload_document(name));
create policy "Uploaders may remove their pending objects" on storage.objects for delete to authenticated
using (bucket_id = 'shipment-documents' and private.can_upload_document(name));
-- No UPDATE policy: an existing path cannot be overwritten or reactivated.

commit;
