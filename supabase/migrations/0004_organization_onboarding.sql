begin;

alter table public.organizations add constraint organization_name_valid
  check (char_length(btrim(name)) between 2 and 120 and name !~ '[[:cntrl:]]') not valid;

create index if not exists organization_members_user_active_idx
  on public.organization_members (user_id, is_active, created_at);

create or replace function public.can_manage_organization(target_organization_id uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = target_organization_id and m.user_id = auth.uid()
      and m.is_active and m.role in ('OWNER', 'ADMIN')
  );
$$;
revoke all on function public.can_manage_organization(uuid) from public, anon;
grant execute on function public.can_manage_organization(uuid) to authenticated;

-- Organisation bootstrap is atomic and cannot accept a forged user/role.
-- Serialising requests for one user also makes double submits idempotent.
create or replace function public.create_organization(organization_name text)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  current_user_id uuid := auth.uid();
  new_organization_id uuid;
  clean_name text := btrim(organization_name);
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if clean_name is null or char_length(clean_name) not between 2 and 120
    or clean_name ~ '[[:cntrl:]]' then
    raise exception 'Invalid organization name' using errcode = '22023';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_user_id::text, 0));
  select m.organization_id into new_organization_id
  from public.organization_members m
  where m.user_id = current_user_id and m.is_active
  order by m.created_at, m.organization_id limit 1;
  if found then return new_organization_id; end if;

  new_organization_id := gen_random_uuid();
  insert into public.organizations (id, name, slug)
  values (new_organization_id, clean_name, 'org-' || replace(new_organization_id::text, '-', ''));
  insert into public.organization_members (organization_id, user_id, role)
  values (new_organization_id, current_user_id, 'OWNER');
  insert into public.audit_logs (organization_id, actor_id, action, resource_type, resource_id)
  values (new_organization_id, current_user_id, 'ORGANIZATION_CREATED', 'organization', new_organization_id);
  return new_organization_id;
end;
$$;
revoke all on function public.create_organization(text) from public, anon;
grant execute on function public.create_organization(text) to authenticated;

-- Even direct calls to the REST API cannot insert memberships, promote a role,
-- delete a tenant, or modify its ID/slug. Invitations need their own checked RPC.
revoke all on public.organizations from anon, authenticated;
grant select on public.organizations to authenticated;
grant update (name) on public.organizations to authenticated;
revoke all on public.organization_members from anon, authenticated;
grant select on public.organization_members to authenticated;

create policy "Owners and admins can rename their organization"
on public.organizations for update to authenticated
using (public.can_manage_organization(id))
with check (public.can_manage_organization(id));

-- MEMBER has read-only operational access. Existing specialised permissions
-- remain in can_manage_operations; roles are never taken from user metadata.
create policy "Members can read organization customs cases"
on public.customs_cases for select to authenticated
using (public.is_organization_member(organization_id));

create policy "Members can read organization documents"
on public.documents for select to authenticated
using (public.is_organization_member(organization_id));

-- Check authority over the original row as well as the resulting row.
alter policy "Members can update organization clients" on public.clients
using (public.can_manage_operations(organization_id))
with check (public.can_manage_operations(organization_id));
alter policy "Members can update organization shipments" on public.shipments
using (public.can_manage_operations(organization_id))
with check (public.can_manage_operations(organization_id));

commit;
