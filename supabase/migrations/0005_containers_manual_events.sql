begin;

create or replace function public.valid_container_number(value text)
returns boolean language plpgsql immutable set search_path = ''
as $$
declare total integer := 0; digit integer; letter integer; position integer;
begin
  if value is null then return true; end if;
  if value !~ '^[A-Z]{3}[UJZ][0-9]{7}$' then return false; end if;
  for position in 1..10 loop
    if position <= 4 then
      letter := ascii(substr(value, position, 1)) - 65;
      digit := 10 + letter + ((letter + 9) / 10);
    else digit := substr(value, position, 1)::integer;
    end if;
    total := total + digit * (2 ^ (position - 1))::integer;
  end loop;
  return (total % 11) % 10 = substr(value, 11, 1)::integer;
end;
$$;
revoke all on function public.valid_container_number(text) from public;
grant execute on function public.valid_container_number(text) to authenticated;

alter table public.containers add constraint container_iso6346
  check (public.valid_container_number(container_number)) not valid;
alter table public.containers add constraint container_fields_bounded
  check ((seal_number is null or char_length(seal_number) between 1 and 80)
    and (container_type is null or char_length(container_type) between 1 and 40)) not valid;

drop policy "Members can manage organization containers" on public.containers;
drop policy "Portal users can read shipment containers" on public.containers;
create policy "Members read containers" on public.containers for select to authenticated
using (public.is_organization_member(organization_id));
create policy "Operators insert containers" on public.containers for insert to authenticated
with check (public.can_manage_operations(organization_id));
create policy "Operators update containers" on public.containers for update to authenticated
using (public.can_manage_operations(organization_id)) with check (public.can_manage_operations(organization_id));
revoke all on public.containers from anon, authenticated;
grant select on public.containers to authenticated;
grant insert (organization_id, shipment_id, container_number, seal_number, container_type) on public.containers to authenticated;
grant update (container_number, seal_number, container_type) on public.containers to authenticated;

-- Append-only for all application users, including owners and administrators.
drop policy "Members can manage organization tracking events" on public.tracking_events;
drop policy "Portal users can read shipment tracking" on public.tracking_events;
create policy "Members read tracking events" on public.tracking_events for select to authenticated
using (public.is_organization_member(organization_id));
create policy "Operators append manual tracking events" on public.tracking_events for insert to authenticated
with check (public.can_manage_operations(organization_id) and created_by = auth.uid() and source = 'MANUAL'
  and payload = '{}'::jsonb and source_reference is null and latitude is null and longitude is null);
revoke all on public.tracking_events from anon, authenticated;
grant select on public.tracking_events to authenticated;
grant insert (organization_id, shipment_id, event_code, label, event_at, location_name, source, created_by)
  on public.tracking_events to authenticated;
alter table public.tracking_events add constraint manual_event_fields_valid
check (event_code ~ '^[A-Z][A-Z0-9_]{1,39}$' and char_length(btrim(label)) between 2 and 200
  and (location_name is null or char_length(location_name) between 1 and 160)) not valid;

commit;
