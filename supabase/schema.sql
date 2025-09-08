create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null check (role in ('PLAYMATE','DISPATCH','FINANCE','ADMIN')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  boss text not null,
  companion_id uuid not null references public.profiles(id) on delete restrict,
  companion_name text not null,
  project text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  hours numeric not null,
  unit_price numeric not null,
  total_price numeric not null,
  remark text,
  status text not null check (status in ('PENDING','CONFIRMED')),
  created_at timestamptz not null default now()
);
alter table public.orders enable row level security;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  prev_balance numeric not null default 0,
  topup numeric not null default 0,
  spend numeric not null default 0,
  bonus numeric not null default 0,
  balance numeric not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.members enable row level security;

create or replace function public.is_role(roles text[])
returns boolean language sql stable as $$
  select exists(
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = any(roles)
  );
$$;

create policy profiles_self_select on public.profiles
for select using (id = auth.uid() or public.is_role(array['DISPATCH','FINANCE','ADMIN']));

create policy orders_playmate_insert on public.orders
for insert with check (companion_id = auth.uid());

create policy orders_playmate_select_own on public.orders
for select using (companion_id = auth.uid());

create policy orders_staff_select_all on public.orders
for select using (public.is_role(array['DISPATCH','FINANCE','ADMIN']));

create policy orders_dispatch_update on public.orders
for update using (public.is_role(array['DISPATCH','ADMIN']));

create policy orders_dispatch_delete on public.orders
for delete using (public.is_role(array['DISPATCH','ADMIN']));

create policy members_staff_select on public.members
for select using (public.is_role(array['DISPATCH','FINANCE','ADMIN']));

create policy members_staff_upsert on public.members
for all using (public.is_role(array['DISPATCH','FINANCE','ADMIN']))
with check (public.is_role(array['DISPATCH','FINANCE','ADMIN']));
