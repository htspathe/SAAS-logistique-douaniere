create extension if not exists "pgcrypto";

create type public.member_role as enum ('admin', 'operator', 'client');
create type public.shipment_status as enum ('draft', 'in_transit', 'customs', 'delivered', 'blocked');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 120),
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'client',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.shipments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  reference text not null,
  origin text not null,
  destination text not null,
  status public.shipment_status not null default 'draft',
  estimated_arrival date,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, reference)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  name text not null,
  storage_path text not null,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.shipments enable row level security;
alter table public.documents enable row level security;

create or replace function public.is_organization_member(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization and user_id = auth.uid()
  );
$$;

create policy "Members can view their shipments"
on public.shipments for select
using (public.is_organization_member(organization_id));

create policy "Members can view their documents"
on public.documents for select
using (public.is_organization_member(organization_id));

