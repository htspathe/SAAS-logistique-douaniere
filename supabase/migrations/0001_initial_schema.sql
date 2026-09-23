begin;

create extension if not exists pgcrypto;

create type public.organization_role as enum (
  'OWNER', 'ADMIN', 'OPERATIONS', 'CUSTOMS_AGENT', 'FINANCE'
);
create type public.shipment_direction as enum ('IMPORT', 'EXPORT');
create type public.load_type as enum ('FCL', 'LCL');
create type public.customs_mode as enum ('INTERNAL', 'EXTERNAL', 'MIXED');
create type public.shipment_phase as enum (
  'DRAFT', 'PREPARATION', 'BOOKED', 'ORIGIN', 'IN_TRANSIT',
  'ARRIVED', 'CUSTOMS', 'DELIVERY', 'COMPLETED', 'ON_HOLD', 'CANCELLED'
);
create type public.notification_channel as enum ('IN_APP', 'EMAIL', 'WHATSAPP');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code char(2) not null default 'SN',
  timezone text not null default 'Africa/Dakar',
  default_currency char(3) not null default 'XOF',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.organization_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  tax_identifier text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, name),
  unique (organization_id, id)
);

create table public.client_portal_users (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (organization_id, client_id, user_id),
  foreign key (organization_id, client_id)
    references public.clients(organization_id, id) on delete cascade
);

create table public.vessels (
  id uuid primary key default gen_random_uuid(),
  imo_number text unique,
  mmsi text unique,
  name text not null,
  flag_code char(2),
  created_at timestamptz not null default now()
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid,
  reference text not null,
  direction public.shipment_direction not null,
  load_type public.load_type not null,
  customs_mode public.customs_mode not null,
  phase public.shipment_phase not null default 'DRAFT',
  origin_name text not null,
  destination_name text not null,
  bill_of_lading_number text,
  booking_number text,
  current_vessel_id uuid references public.vessels(id) on delete set null,
  estimated_departure_at timestamptz,
  estimated_arrival_at timestamptz,
  actual_departure_at timestamptz,
  actual_arrival_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, reference),
  unique (organization_id, id),
  foreign key (organization_id, client_id)
    references public.clients(organization_id, id) on delete restrict
);

create table public.containers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null,
  container_number text,
  seal_number text,
  container_type text,
  created_at timestamptz not null default now(),
  foreign key (organization_id, shipment_id)
    references public.shipments(organization_id, id) on delete cascade,
  constraint container_number_format check (
    container_number is null or container_number ~ '^[A-Z]{4}[0-9]{7}$'
  )
);

create table public.customs_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null,
  declaration_number text,
  external_agent_name text,
  status text not null default 'NOT_STARTED',
  clearance_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, shipment_id),
  foreign key (organization_id, shipment_id)
    references public.shipments(organization_id, id) on delete cascade
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid,
  category text not null,
  original_name text not null,
  storage_path text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  sha256 text,
  version integer not null default 1 check (version > 0),
  is_client_visible boolean not null default false,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (organization_id, storage_path),
  foreign key (organization_id, shipment_id)
    references public.shipments(organization_id, id) on delete cascade
);

create table public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null,
  event_code text not null,
  label text not null,
  event_at timestamptz not null,
  location_name text,
  latitude numeric(9,6),
  longitude numeric(9,6),
  source text not null default 'MANUAL',
  source_reference text,
  payload jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  foreign key (organization_id, shipment_id)
    references public.shipments(organization_id, id) on delete cascade,
  constraint valid_latitude check (latitude is null or latitude between -90 and 90),
  constraint valid_longitude check (longitude is null or longitude between -180 and 180)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid,
  channel public.notification_channel not null,
  recipient text not null,
  template_key text not null,
  status text not null default 'PENDING',
  provider_message_id text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (organization_id, shipment_id)
    references public.shipments(organization_id, id) on delete cascade
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index shipments_org_phase_idx on public.shipments (organization_id, phase);
create index shipments_eta_idx on public.shipments (organization_id, estimated_arrival_at);
create index containers_shipment_idx on public.containers (shipment_id);
create index documents_shipment_idx on public.documents (shipment_id);
create index tracking_events_shipment_time_idx on public.tracking_events (shipment_id, event_at desc);
create index notifications_status_idx on public.notifications (organization_id, status, scheduled_at);
create index audit_logs_org_time_idx on public.audit_logs (organization_id, created_at desc);

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.is_active = true
  );
$$;

revoke all on function public.is_organization_member(uuid) from public;
grant execute on function public.is_organization_member(uuid) to authenticated;

create or replace function public.can_manage_operations(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_members membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.is_active = true
      and membership.role in ('OWNER', 'ADMIN', 'OPERATIONS', 'CUSTOMS_AGENT')
  );
$$;

revoke all on function public.can_manage_operations(uuid) from public;
grant execute on function public.can_manage_operations(uuid) to authenticated;

create or replace function public.can_read_shipment(target_shipment_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.shipments shipment
    where shipment.id = target_shipment_id
      and (
        public.is_organization_member(shipment.organization_id)
        or exists (
          select 1
          from public.client_portal_users portal_user
          where portal_user.organization_id = shipment.organization_id
            and portal_user.client_id = shipment.client_id
            and portal_user.user_id = auth.uid()
        )
      )
  );
$$;

revoke all on function public.can_read_shipment(uuid) from public;
grant execute on function public.can_read_shipment(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_portal_users enable row level security;
alter table public.vessels enable row level security;
alter table public.shipments enable row level security;
alter table public.containers enable row level security;
alter table public.customs_cases enable row level security;
alter table public.documents enable row level security;
alter table public.tracking_events enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

create policy "Users can read their profile"
on public.profiles for select to authenticated
using (id = auth.uid());

create policy "Users can update their profile"
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members can read their organizations"
on public.organizations for select to authenticated
using (public.is_organization_member(id));

create policy "Members can read organization memberships"
on public.organization_members for select to authenticated
using (public.is_organization_member(organization_id));

create policy "Members can read organization clients"
on public.clients for select to authenticated
using (public.is_organization_member(organization_id));

create policy "Portal users can read their client"
on public.clients for select to authenticated
using (
  exists (
    select 1 from public.client_portal_users portal_user
    where portal_user.organization_id = clients.organization_id
      and portal_user.client_id = clients.id
      and portal_user.user_id = auth.uid()
  )
);

create policy "Members and invited users can read portal access"
on public.client_portal_users for select to authenticated
using (
  public.is_organization_member(organization_id)
  or user_id = auth.uid()
);

create policy "Authenticated users can read vessels"
on public.vessels for select to authenticated
using (true);

create policy "Members can create organization clients"
on public.clients for insert to authenticated
with check (public.can_manage_operations(organization_id));

create policy "Members can update organization clients"
on public.clients for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.can_manage_operations(organization_id));

create policy "Members can read organization shipments"
on public.shipments for select to authenticated
using (public.is_organization_member(organization_id));

create policy "Portal users can read their shipments"
on public.shipments for select to authenticated
using (public.can_read_shipment(id));

create policy "Members can create organization shipments"
on public.shipments for insert to authenticated
with check (public.can_manage_operations(organization_id));

create policy "Members can update organization shipments"
on public.shipments for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.can_manage_operations(organization_id));

create policy "Members can manage organization containers"
on public.containers for all to authenticated
using (public.can_manage_operations(organization_id))
with check (public.can_manage_operations(organization_id));

create policy "Portal users can read shipment containers"
on public.containers for select to authenticated
using (public.can_read_shipment(shipment_id));

create policy "Members can manage organization customs cases"
on public.customs_cases for all to authenticated
using (public.can_manage_operations(organization_id))
with check (public.can_manage_operations(organization_id));

create policy "Members can manage organization documents"
on public.documents for all to authenticated
using (public.can_manage_operations(organization_id))
with check (public.can_manage_operations(organization_id));

create policy "Portal users can read shared documents"
on public.documents for select to authenticated
using (is_client_visible and public.can_read_shipment(shipment_id));

create policy "Members can manage organization tracking events"
on public.tracking_events for all to authenticated
using (public.can_manage_operations(organization_id))
with check (public.can_manage_operations(organization_id));

create policy "Portal users can read shipment tracking"
on public.tracking_events for select to authenticated
using (public.can_read_shipment(shipment_id));

create policy "Members can read organization notifications"
on public.notifications for select to authenticated
using (public.is_organization_member(organization_id));

create policy "Members can read organization audit logs"
on public.audit_logs for select to authenticated
using (public.is_organization_member(organization_id));

commit;
