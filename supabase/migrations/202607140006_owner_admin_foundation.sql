-- Wow & Amazing — Owner admin foundation and live catalog
-- Safe additive migration for an existing Supabase project.
-- Run after 202607130005_phase4_commerce.sql.

begin;

do $$
begin
  create type public.app_role as enum ('customer', 'owner');
exception
  when duplicate_object then null;
end $$;

alter table public.profiles
  add column if not exists role public.app_role not null default 'customer';

alter table public.products
  add column if not exists is_active boolean not null default true;

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists products_active_idx on public.products(is_active);
create index if not exists products_admin_created_idx on public.products(created_at desc);
create index if not exists orders_admin_created_idx on public.orders(created_at desc);

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'owner'::public.app_role
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to anon, authenticated;

-- Public customers only see active products. Owners can also see drafts.
drop policy if exists "Public can read products" on public.products;
create policy "Public can read active products"
on public.products for select
to anon, authenticated
using (is_active = true or public.is_owner());

-- Owner management policies. These are additional to the existing customer policies.
drop policy if exists "Owners can manage categories" on public.categories;
create policy "Owners can manage categories"
on public.categories for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Owners can manage products" on public.products;
create policy "Owners can manage products"
on public.products for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Owners can manage product variants" on public.product_variants;
create policy "Owners can manage product variants"
on public.product_variants for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Owners can manage services" on public.services;
create policy "Owners can manage services"
on public.services for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Owners can read all profiles" on public.profiles;
create policy "Owners can read all profiles"
on public.profiles for select
to authenticated
using (public.is_owner());

drop policy if exists "Owners can read all orders" on public.orders;
create policy "Owners can read all orders"
on public.orders for select
to authenticated
using (public.is_owner());

drop policy if exists "Owners can update all orders" on public.orders;
create policy "Owners can update all orders"
on public.orders for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Owners can read all order items" on public.order_items;
create policy "Owners can read all order items"
on public.order_items for select
to authenticated
using (public.is_owner());

drop policy if exists "Owners can read newsletter subscribers" on public.newsletter_subscribers;
create policy "Owners can read newsletter subscribers"
on public.newsletter_subscribers for select
to authenticated
using (public.is_owner());

grant select, insert, update, delete on public.categories, public.products, public.product_variants, public.services to authenticated;
grant select, update on public.orders to authenticated;
grant select on public.order_items, public.newsletter_subscribers to authenticated;

-- Public bucket for storefront product images. Upload and deletion remain owner-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'product-images');

drop policy if exists "Owners can upload product images" on storage.objects;
create policy "Owners can upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_owner());

drop policy if exists "Owners can update product images" on storage.objects;
create policy "Owners can update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_owner())
with check (bucket_id = 'product-images' and public.is_owner());

drop policy if exists "Owners can delete product images" on storage.objects;
create policy "Owners can delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_owner());

commit;
