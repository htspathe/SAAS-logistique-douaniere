-- Run on an isolated Supabase test database AFTER migrations 0001..0004.
-- Requires a privileged SQL connection able to SET ROLE. Everything rolls back.
-- Stop on the first SQL error; no live customer data or real email is used.
begin;

insert into auth.users (id, aud, role, email, raw_user_meta_data) values
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'owner-a@example.invalid', '{"full_name":"Owner A"}'),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'owner-b@example.invalid', '{"full_name":"Owner B"}'),
  ('10000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'admin-a@example.invalid', '{"full_name":"Admin A"}'),
  ('10000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'member-a@example.invalid', '{"full_name":"Member A"}'),
  ('10000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'inactive-a@example.invalid', '{"full_name":"Inactive A"}'),
  ('10000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'new-owner@example.invalid', '{"full_name":"New Owner"}');

insert into public.organizations (id, name, slug) values
  ('20000000-0000-4000-8000-000000000001', 'Test entreprise A', 'rls-test-a'),
  ('20000000-0000-4000-8000-000000000002', 'Test entreprise B', 'rls-test-b');
insert into public.organization_members (organization_id, user_id, role, is_active) values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'OWNER', true),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', 'OWNER', true),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'ADMIN', true),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', 'MEMBER', true),
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', 'ADMIN', false);
insert into public.shipments (id, organization_id, reference, direction, load_type, customs_mode, origin_name, destination_name) values
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'TEST-A', 'IMPORT', 'FCL', 'INTERNAL', 'Dakar', 'Thiès'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 'TEST-B', 'EXPORT', 'LCL', 'EXTERNAL', 'Dakar', 'Abidjan');

-- OWNER A sees only A; direct membership mutation and cross-tenant writes fail.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$
declare touched integer;
begin
  assert (select count(*) from public.organizations) = 1, 'Owner must see only own tenant';
  assert (select count(*) from public.organization_members) = 4, 'Membership visibility must be tenant-scoped';
  assert (select count(*) from public.shipments) = 1, 'Shipment visibility must be tenant-scoped';
  assert public.create_organization('Duplicate submit') = '20000000-0000-4000-8000-000000000001'::uuid,
    'Bootstrap must reuse an existing active membership';
  update public.organizations set name = 'Owner edit A' where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 1, 'Owner must be able to rename own tenant';
  update public.organizations set name = 'Forbidden rename' where id = '20000000-0000-4000-8000-000000000002';
  get diagnostics touched = row_count;
  assert touched = 0, 'Owner cannot update foreign tenant';
  begin
    insert into public.organization_members (organization_id, user_id, role)
    values ('20000000-0000-4000-8000-000000000002', auth.uid(), 'OWNER');
    raise exception 'Direct membership insertion unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.organizations (name, slug) values ('Direct tenant', 'forbidden-direct-tenant');
    raise exception 'Direct tenant insertion unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.organizations set slug = 'forged-slug' where id = '20000000-0000-4000-8000-000000000001';
    raise exception 'Protected column update unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.shipments (organization_id, reference, direction, load_type, customs_mode, origin_name, destination_name)
    values ('20000000-0000-4000-8000-000000000002', 'FORGED', 'IMPORT', 'FCL', 'INTERNAL', 'A', 'B');
    raise exception 'Cross-tenant shipment insert unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- ADMIN may rename; MEMBER reads but cannot rename, write operations or promote.
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}', true);
do $$
declare touched integer;
begin
  update public.organizations set name = 'Admin edit A' where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 1, 'Admin must be able to rename own tenant';
end;
$$;

select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated","user_metadata":{"role":"OWNER"}}', true);
do $$
declare touched integer;
begin
  assert (select count(*) from public.organizations) = 1, 'Member can read own tenant';
  assert not public.can_manage_organization('20000000-0000-4000-8000-000000000001'), 'Forged metadata must not grant rights';
  update public.organizations set name = 'Member edit forbidden' where id = '20000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 0, 'Member must not rename tenant';
  update public.shipments set reference = 'FORBIDDEN' where id = '30000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 0, 'Member must not modify shipment';
  begin
    update public.organization_members set role = 'OWNER' where user_id = auth.uid();
    raise exception 'Self-promotion unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

-- Deactivated memberships are not access grants.
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
do $$ begin
  assert (select count(*) from public.organizations) = 0, 'Inactive member must not see tenant';
  assert (select count(*) from public.organization_members) = 0, 'Inactive member must not see memberships';
  assert (select count(*) from public.shipments) = 0, 'Inactive member must not see shipments';
end; $$;

-- New account: no partial organisation, automatic OWNER, idempotent bootstrap.
select set_config('request.jwt.claims', '{"sub":"10000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
do $$
declare new_id uuid;
begin
  begin
    perform public.create_organization(' ');
    raise exception 'Invalid organization name unexpectedly accepted';
  exception when invalid_parameter_value then null;
  end;
  assert (select count(*) from public.organizations) = 0, 'Invalid bootstrap must not leave tenant behind';
  new_id := public.create_organization('  Nouvelle entreprise  ');
  assert (select name from public.organizations where id = new_id) = 'Nouvelle entreprise', 'Name must be trimmed';
  assert (select role from public.organization_members where organization_id = new_id and user_id = auth.uid()) = 'OWNER', 'Bootstrap must make caller OWNER';
  assert public.create_organization('Second submit') = new_id, 'Repeated bootstrap must not create duplicate';
  assert (select count(*) from public.audit_logs where organization_id = new_id and action = 'ORGANIZATION_CREATED') = 1, 'One audit event expected';
end;
$$;

-- No JWT identity and anonymous role cannot invoke bootstrap.
select set_config('request.jwt.claims', '{}', true);
do $$ begin
  begin
    perform public.create_organization('Unauthenticated tenant');
    raise exception 'Missing identity unexpectedly accepted';
  exception when insufficient_privilege then null;
  end;
end; $$;
reset role;
set local role anon;
do $$ begin
  begin
    perform public.create_organization('Anonymous tenant');
    raise exception 'Anonymous bootstrap unexpectedly accepted';
  exception when insufficient_privilege then null;
  end;
end; $$;

reset role;
rollback;
