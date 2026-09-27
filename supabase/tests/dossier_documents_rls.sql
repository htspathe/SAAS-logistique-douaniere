-- Isolated test database after migrations 0001..0006; privileged SET ROLE required.
-- storage.objects fixtures test policies only, not the Storage HTTP service.
begin;
insert into auth.users (id, aud, role, email, raw_user_meta_data) values
 ('13000000-0000-4000-8000-000000000001','authenticated','authenticated','dossier-owner@example.invalid','{"full_name":"Owner"}'),
 ('13000000-0000-4000-8000-000000000002','authenticated','authenticated','dossier-reader@example.invalid','{"full_name":"Reader"}'),
 ('13000000-0000-4000-8000-000000000003','authenticated','authenticated','dossier-outsider@example.invalid','{"full_name":"Outsider"}');
insert into public.organizations (id,name,slug) values
 ('23000000-0000-4000-8000-000000000001','Dossier Test A','dossier-test-a'),
 ('23000000-0000-4000-8000-000000000002','Dossier Test B','dossier-test-b');
insert into public.organization_members (organization_id,user_id,role) values
 ('23000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','OWNER'),
 ('23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000001','ADMIN'),
 ('23000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000002','MEMBER'),
 ('23000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000003','OWNER');
insert into public.shipments (id,organization_id,reference,direction,load_type,customs_mode,origin_name,destination_name) values
 ('43000000-0000-4000-8000-000000000001','23000000-0000-4000-8000-000000000001','DOSSIER-A','IMPORT','FCL','INTERNAL','Shanghai','Dakar'),
 ('43000000-0000-4000-8000-000000000002','23000000-0000-4000-8000-000000000002','DOSSIER-B','EXPORT','LCL','EXTERNAL','Dakar','Abidjan');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
  assert public.valid_container_number('CSQU3054383'), 'Known ISO check digit must pass';
  assert not public.valid_container_number('CSQU3054384'), 'Wrong ISO check digit must fail';
  insert into public.containers (organization_id,shipment_id,container_number)
    values ('23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001',null);
  begin
    insert into public.containers (organization_id,shipment_id,container_number)
      values ('23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001','CSQU3054384');
    raise exception 'Invalid check digit accepted';
  exception when check_violation then null; end;
  begin
    insert into public.containers (organization_id,shipment_id)
      values ('23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000002');
    raise exception 'Foreign shipment accepted despite composite FK';
  exception when foreign_key_violation then null; end;
  begin
    update public.containers set shipment_id='43000000-0000-4000-8000-000000000002';
    raise exception 'Container parent mutation allowed';
  exception when insufficient_privilege then null; end;

  insert into public.tracking_events (organization_id,shipment_id,event_code,label,event_at,created_by)
    values ('23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001','ARRIVEE','Arrivée au port',now(),auth.uid());
  begin
    update public.tracking_events set label='Rewrite';
    raise exception 'Append-only event update allowed';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.tracking_events;
    raise exception 'Append-only event delete allowed';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.tracking_events (organization_id,shipment_id,event_code,label,event_at,created_by,source)
      values ('23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001','AIS','Forged provider',now(),auth.uid(),'AIS');
    raise exception 'Forged source accepted';
  exception when insufficient_privilege then null; end;
end; $$;

insert into public.documents (id,organization_id,shipment_id,category,original_name,storage_path,mime_type,size_bytes,sha256,uploaded_by) values
 ('53000000-0000-4000-8000-000000000001','23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001','OTHER','test.pdf','23000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/53000000-0000-4000-8000-000000000001.pdf','application/pdf',100,repeat('a',64),auth.uid());
do $$ begin
  begin
    insert into public.documents (id,organization_id,shipment_id,category,original_name,storage_path,mime_type,size_bytes,sha256,uploaded_by)
    values ('53000000-0000-4000-8000-000000000009','23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000002','OTHER','foreign.pdf','23000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000002/53000000-0000-4000-8000-000000000009.pdf','application/pdf',100,repeat('a',64),auth.uid());
    raise exception 'Document linked to foreign tenant shipment accepted';
  exception when foreign_key_violation then null; end;
  begin
    update public.documents set upload_state='READY' where id='53000000-0000-4000-8000-000000000001';
    raise exception 'Finalization without object accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.documents set uploaded_by='13000000-0000-4000-8000-000000000002';
    raise exception 'Uploader substitution accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.documents set storage_path='forged/path';
    raise exception 'Storage path mutation accepted';
  exception when insufficient_privilege then null; end;
  begin
    update public.documents set organization_id='23000000-0000-4000-8000-000000000002';
    raise exception 'Document tenant mutation accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects (bucket_id,name) values ('shipment-documents','foreign/unsolicited.pdf');
    raise exception 'Object without pending metadata accepted';
  exception when insufficient_privilege then null; end;
end; $$;
insert into storage.objects (bucket_id,name)
values ('shipment-documents','23000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/53000000-0000-4000-8000-000000000001.pdf');

-- Pending object is invisible to teammates; its uploader may access for cleanup.
select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$ begin
  assert (select count(*) from public.documents)=1, 'Member may list pending metadata';
  assert (select count(*) from storage.objects where bucket_id='shipment-documents')=0, 'Member must not read pending object';
  begin
    insert into public.documents (id,organization_id,shipment_id,category,original_name,storage_path,mime_type,size_bytes,sha256,uploaded_by)
    values ('53000000-0000-4000-8000-000000000008','23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001','OTHER','member.pdf','23000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/53000000-0000-4000-8000-000000000008.pdf','application/pdf',100,repeat('a',64),auth.uid());
    raise exception 'Read-only document insertion accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects (bucket_id,name) values ('shipment-documents','23000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/53000000-0000-4000-8000-000000000001.pdf');
    raise exception 'Teammate upload into another uploader pending path accepted';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.containers (organization_id,shipment_id) values ('23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001');
    raise exception 'Read-only container insertion accepted';
  exception when insufficient_privilege then null; end;
end; $$;

select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$
declare touched integer;
begin
  delete from public.documents where id='53000000-0000-4000-8000-000000000001';
  get diagnostics touched=row_count;
  assert touched=0, 'Metadata cannot be removed while an object exists';
  update public.documents set upload_state='READY' where id='53000000-0000-4000-8000-000000000001';
  get diagnostics touched=row_count;
  assert touched=1, 'Uploader can finalize existing object';
  update public.documents set upload_state='PENDING' where id='53000000-0000-4000-8000-000000000001';
  get diagnostics touched=row_count;
  assert touched=0, 'READY cannot be reactivated';
  update storage.objects set name='forged' where bucket_id='shipment-documents';
  get diagnostics touched=row_count;
  assert touched=0, 'Object overwrite must be denied';
  delete from storage.objects where bucket_id='shipment-documents';
  get diagnostics touched=row_count;
  assert touched=0, 'READY object deletion must be denied';
end; $$;

select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000002","role":"authenticated"}',true);
do $$ begin
  assert (select count(*) from storage.objects where bucket_id='shipment-documents')=1, 'Active member can read READY object';
end; $$;
select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
do $$ begin
  assert (select count(*) from public.documents)=0, 'Foreign tenant cannot list metadata';
  assert (select count(*) from storage.objects where bucket_id='shipment-documents')=0, 'Foreign tenant cannot read object';
end; $$;

-- Recovery order: remove own pending object, then remove the empty metadata.
select set_config('request.jwt.claims','{"sub":"13000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
insert into public.documents (id,organization_id,shipment_id,category,original_name,storage_path,mime_type,size_bytes,sha256,uploaded_by) values
 ('53000000-0000-4000-8000-000000000002','23000000-0000-4000-8000-000000000001','43000000-0000-4000-8000-000000000001','OTHER','pending.png','23000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/53000000-0000-4000-8000-000000000002.png','image/png',100,repeat('b',64),auth.uid());
insert into storage.objects (bucket_id,name)
values ('shipment-documents','23000000-0000-4000-8000-000000000001/43000000-0000-4000-8000-000000000001/53000000-0000-4000-8000-000000000002.png');
do $$
declare touched integer;
begin
  delete from storage.objects where name like '%53000000-0000-4000-8000-000000000002.png';
  get diagnostics touched=row_count;
  assert touched=1, 'Uploader may delete own pending object';
  delete from public.documents where id='53000000-0000-4000-8000-000000000002';
  get diagnostics touched=row_count;
  assert touched=1, 'Empty pending metadata may be deleted';
end; $$;
reset role;
rollback;
