-- Run against an isolated Supabase test database after migrations 0001..0004.
-- Requires a privileged connection that can SET ROLE; all fixtures roll back.
begin;

insert into auth.users (id, aud, role, email, raw_user_meta_data) values
  ('11000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'client-owner-a@example.invalid', '{"full_name":"Owner A"}'),
  ('11000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'client-owner-b@example.invalid', '{"full_name":"Owner B"}'),
  ('11000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'client-member@example.invalid', '{"full_name":"Member"}'),
  ('11000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'client-inactive@example.invalid', '{"full_name":"Inactive"}'),
  ('11000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'client-finance@example.invalid', '{"full_name":"Finance"}'),
  ('11000000-0000-4000-8000-000000000006', 'authenticated', 'authenticated', 'client-operations@example.invalid', '{"full_name":"Operations"}');
insert into public.organizations (id, name, slug) values
  ('21000000-0000-4000-8000-000000000001', 'Clients Test A', 'clients-rls-test-a'),
  ('21000000-0000-4000-8000-000000000002', 'Clients Test B', 'clients-rls-test-b');
insert into public.organization_members (organization_id, user_id, role, is_active) values
  ('21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000001', 'OWNER', true),
  ('21000000-0000-4000-8000-000000000002', '11000000-0000-4000-8000-000000000002', 'OWNER', true),
  ('21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000003', 'MEMBER', true),
  ('21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000004', 'ADMIN', false),
  ('21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000005', 'FINANCE', true),
  ('21000000-0000-4000-8000-000000000001', '11000000-0000-4000-8000-000000000006', 'OPERATIONS', true);
insert into public.clients (id, organization_id, name, email) values
  ('31000000-0000-4000-8000-000000000001', '21000000-0000-4000-8000-000000000001', 'Shared client name', 'a@example.invalid'),
  ('31000000-0000-4000-8000-000000000002', '21000000-0000-4000-8000-000000000002', 'Shared client name', 'b@example.invalid');

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11000000-0000-4000-8000-000000000001","role":"authenticated"}', true);
do $$
declare touched integer;
begin
  assert (select count(*) from public.clients) = 1, 'Owner sees only own clients';
  assert (select count(*) from public.clients where id = '31000000-0000-4000-8000-000000000002') = 0, 'Foreign client ID must be hidden';
  update public.clients set phone = '+221 77 123 45 67' where id = '31000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 1, 'Owner may update own client';
  update public.clients set email = 'forbidden@example.invalid' where id = '31000000-0000-4000-8000-000000000002';
  get diagnostics touched = row_count;
  assert touched = 0, 'Owner cannot update foreign client';
  insert into public.clients (organization_id, name) values ('21000000-0000-4000-8000-000000000001', 'Own new client');
  begin
    insert into public.clients (organization_id, name) values ('21000000-0000-4000-8000-000000000002', 'Foreign new client');
    raise exception 'Cross-tenant insertion unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    update public.clients set organization_id = '21000000-0000-4000-8000-000000000002'
      where id = '31000000-0000-4000-8000-000000000001';
    raise exception 'Moving client to foreign tenant unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into public.clients (organization_id, name) values ('21000000-0000-4000-8000-000000000001', 'Shared client name');
    raise exception 'Duplicate client name unexpectedly accepted';
  exception when unique_violation then null;
  end;
end;
$$;

-- MEMBER and FINANCE can read, but direct API writes remain denied.
select set_config('request.jwt.claims', '{"sub":"11000000-0000-4000-8000-000000000003","role":"authenticated","user_metadata":{"role":"OWNER"}}', true);
do $$
declare touched integer;
begin
  assert (select count(*) from public.clients) = 2, 'Member can read own clients';
  update public.clients set name = 'Forbidden' where id = '31000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 0, 'Member cannot update clients despite forged metadata';
  begin
    insert into public.clients (organization_id, name) values ('21000000-0000-4000-8000-000000000001', 'Member forbidden');
    raise exception 'Member insertion unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"sub":"11000000-0000-4000-8000-000000000005","role":"authenticated"}', true);
do $$
declare touched integer;
begin
  assert (select count(*) from public.clients) = 2, 'Finance can read own clients';
  update public.clients set name = 'Finance forbidden' where id = '31000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 0, 'Finance cannot update clients';
end;
$$;

select set_config('request.jwt.claims', '{"sub":"11000000-0000-4000-8000-000000000006","role":"authenticated"}', true);
do $$
declare touched integer;
begin
  update public.clients set tax_identifier = 'TEST-NINEA' where id = '31000000-0000-4000-8000-000000000001';
  get diagnostics touched = row_count;
  assert touched = 1, 'Operations can update own clients';
end;
$$;

select set_config('request.jwt.claims', '{"sub":"11000000-0000-4000-8000-000000000004","role":"authenticated"}', true);
do $$ begin
  assert (select count(*) from public.clients) = 0, 'Inactive member cannot read clients';
end; $$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{}', true);
do $$ begin
  begin
    assert (select count(*) from public.clients) = 0, 'Anonymous caller cannot read clients';
  exception when insufficient_privilege then null;
  end;
end; $$;
reset role;
rollback;
