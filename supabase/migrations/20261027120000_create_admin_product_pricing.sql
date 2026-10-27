-- Store internal cost and MSRP data outside the public products catalog.
-- This table is accessible only through the admin-authorized Edge Function.
create table if not exists public.admin_product_pricing (
  product_id uuid primary key references public.products(id) on delete cascade,
  cost_basis numeric(12, 2) check (cost_basis is null or cost_basis >= 0),
  standard_msrp numeric(12, 2) check (standard_msrp is null or standard_msrp >= 0),
  updated_at timestamptz not null default now()
);

alter table public.admin_product_pricing enable row level security;

revoke all on table public.admin_product_pricing from public, anon, authenticated;
grant select, insert, update, delete on table public.admin_product_pricing to service_role;
