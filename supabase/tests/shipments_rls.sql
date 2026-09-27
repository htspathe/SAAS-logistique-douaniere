-- Isolated Supabase test database only, after migrations 0001..0004.
-- Run with a privileged SQL role able to SET ROLE. No real records; rollback.
begin;
insert into auth.users (id, aud, role, email, raw_user_meta_data) values
  ('12000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'shipment-owner-a@example.invalid', '{"full_name":"Owner A"}'),
  ('12000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'shipment-owner-b@example.invalid', '{"full_name":"Owner B"}'),
  ('12000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'shipment-dual@example.invalid', '{"full_name":"Dual member"}'),
  ('12000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'shipment-reader@example.invalid', '{"full_name":"Reader"}'),
  ('12000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'shipment-inactive@example.invalid', '{"full_name":"Inactive"}');
insert into public.organizations (id, name, slug) values
  ('22000000-0000-4000-8000-000000000001', 'Shipments Test A', 'shipments-rls-test-a'),
  ('22000000-0000-4000-8000-000000000002', 'Shipments Test B', 'shipments-rls-test-b');
insert into public.organization_members (organization_id, user_id, role, is_active) values
  ('22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000001', 'OWNER', true),
  ('22000000-0000-4000-8000-000000000002', '12000000-0000-4000-8000-000000000002', 'OWNER', true),
  ('22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000003', 'ADMIN', true),
  ('22000000-0000-4000-8000-000000000002', '12000000-0000-4000-8000-000000000003', 'ADMIN', true),
  ('22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000004', 'MEMBER', true),
  ('22000000-0000-4000-8000-000000000001', '12000000-0000-4000-8000-000000000005', 'ADMIN', false);
insert into public.clients (id, organization_id, name) values
  ('32000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', 'Client A'),
  ('32000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002', 'Client B');
insert into public.shipments (id, organization_id, client_id, reference, direction, load_type, customs_mode, origin_name, destination_name) values
  ('42000000-0000-4000-8000-000000000001', '22000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000001', 'TEST-A', 'IMPORT', 'FCL', 'INTERNAL', 'Shanghai', 'Dakar'),
  ('42000000-0000-4000-8000-000000000002', '22000000-0000-4000-8000-000000000002', '32000000-0000-4000-8000-000000000002', 'TEST-B', 'EXPORT', 'LCL', 'EXTERNAL', 'Dakar', 'Abidjan');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"12000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$
declare touched integer;
begin
  assert (select count(*) from public.shipments) = 1, 'Owner A must only see A shipments';
  update public.shipments set phase = 'PREPARATION' where id = '42000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 1, 'Owner A can update A';
  update public.shipments set reference = 'FORBIDDEN' where id = '42000000-0000-4000-8000-000000000002';
  get diagnostics touched = row_count;
  assert touched = 0, 'Owner A cannot update B';
  begin
    insert into public.shipments (organization_id, client_id, reference, direction, load_type, customs_mode, origin_name, destination_name)
    values ('22000000-0000-4000-8000-000000000002', '32000000-0000-4000-8000-000000000002', 'FORGED', 'IMPORT', 'FCL', 'INTERNAL', 'Shanghai', 'Dakar');
    raise exception 'Foreign tenant insertion unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- The composite FK is essential even when the user can manage BOTH tenants.
select set_config('request.jwt.claims', '{"sub":"12000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$ begin
  assert (select count(*) from public.clients) = 2, 'Dual admin can read both clients';
  begin
    insert into public.shipments (organization_id, client_id, reference, direction, load_type, customs_mode, origin_name, destination_name)
    values ('22000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000002', 'WRONG-CLIENT', 'IMPORT', 'FCL', 'MIXED', 'Shanghai', 'Dakar');
    raise exception 'Client from foreign tenant unexpectedly accepted';
  exception when foreign_key_violation then null;
  end;
  begin
    update public.shipments set client_id = '32000000-0000-4000-8000-000000000002'
      where id = '42000000-0000-4000-8000-000000000001';
    raise exception 'Foreign client reassignment unexpectedly allowed';
  exception when foreign_key_violation then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"12000000-0000-4000-8000-000000000004","role":"authenticated","user_metadata":{"role":"OWNER"}}', true);
do $$
declare touched integer;
begin
  assert (select count(*) from public.shipments) = 1, 'Member can read own shipment';
  update public.shipments set phase = 'COMPLETED' where id = '42000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 0, 'Read-only member cannot edit despite forged metadata';
  begin
    insert into public.shipments (organization_id, client_id, reference, direction, load_type, customs_mode, origin_name, destination_name)
    values ('22000000-0000-4000-8000-000000000001', '32000000-0000-4000-8000-000000000001', 'READER', 'IMPORT', 'FCL', 'INTERNAL', 'Shanghai', 'Dakar');
    raise exception 'Read-only insertion unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"12000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
do $$ begin
  assert (select count(*) from public.shipments) = 0, 'Inactive membership grants no shipment access';
end; $$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{}', true);
do $$ begin
  begin
    assert (select count(*) from public.shipments) = 0, 'Anonymous read must return no records';
  exception when insufficient_privilege then null;
  end;
end; $$;
reset role;
rollback;
