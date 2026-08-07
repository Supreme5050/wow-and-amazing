-- Wow & Amazing — Phase 1 foundation schema
-- Supabase/Postgres schema, search preparation, helper functions, and RLS.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.order_status as enum (
  'pending',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded'
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  description text not null default '',
  price numeric(12,2) not null check (price >= 0),
  image_urls text[] not null default '{}',
  is_featured boolean not null default false,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  search_document tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B')
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_delta numeric(12,2) not null default 0,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, name)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Address',
  full_name text not null,
  phone text,
  line_1 text not null,
  line_2 text,
  city text not null,
  state text,
  postal_code text,
  country text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, user_id)
);

create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  qty integer not null default 1 check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  status public.order_status not null default 'pending',
  total numeric(12,2) not null check (total >= 0),
  address jsonb not null,
  payment_provider text,
  payment_reference text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_name text,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  qty integer not null check (qty > 0),
  created_at timestamptz not null default now()
);

create table public.services (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now(),
  constraint newsletter_email_format check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

create unique index newsletter_subscribers_email_unique
  on public.newsletter_subscribers (lower(email));

create index categories_sort_order_idx on public.categories(sort_order);
create index products_category_id_idx on public.products(category_id);
create index products_featured_idx on public.products(is_featured) where is_featured = true;
create index products_search_document_idx on public.products using gin(search_document);
create index products_name_trgm_idx on public.products using gin(name gin_trgm_ops);
create index reviews_product_id_idx on public.reviews(product_id);
create index wishlists_user_id_idx on public.wishlists(user_id);
create index cart_items_user_id_idx on public.cart_items(user_id);
create index orders_user_id_idx on public.orders(user_id);
create index orders_tracking_idx on public.orders(order_number, lower(email));
create index order_items_order_id_idx on public.order_items(order_id);
create index addresses_user_id_idx on public.addresses(user_id);

create unique index cart_items_unique_user_product_variant
  on public.cart_items (
    user_id,
    product_id,
    coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where user_id is not null;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_set_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger addresses_set_updated_at
before update on public.addresses
for each row execute function public.set_updated_at();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger services_set_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.track_order(
  p_order_number text,
  p_email text
)
returns table (
  order_number text,
  status public.order_status,
  total numeric,
  created_at timestamptz,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select o.order_number, o.status, o.total, o.created_at, o.updated_at
  from public.orders o
  where upper(o.order_number) = upper(trim(p_order_number))
    and lower(o.email) = lower(trim(p_email))
  limit 1;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.services enable row level security;
alter table public.newsletter_subscribers enable row level security;

create policy "Public can read categories"
on public.categories for select
to anon, authenticated
using (true);

create policy "Public can read products"
on public.products for select
to anon, authenticated
using (true);

create policy "Public can read product variants"
on public.product_variants for select
to anon, authenticated
using (true);

create policy "Public can read services"
on public.services for select
to anon, authenticated
using (true);

create policy "Public can read reviews"
on public.reviews for select
to anon, authenticated
using (true);

create policy "Users can create their own reviews"
on public.reviews for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
on public.reviews for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own reviews"
on public.reviews for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their own profile"
on public.profiles for select
to authenticated
using (auth.uid() = id);

create policy "Users can create their own profile"
on public.profiles for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.profiles for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "Users can read their own addresses"
on public.addresses for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can create their own addresses"
on public.addresses for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own addresses"
on public.addresses for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own addresses"
on public.addresses for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their own wishlist"
on public.wishlists for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add to their own wishlist"
on public.wishlists for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can remove from their own wishlist"
on public.wishlists for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their own cart"
on public.cart_items for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can add to their own cart"
on public.cart_items for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own cart"
on public.cart_items for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can remove from their own cart"
on public.cart_items for delete
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their own orders"
on public.orders for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can read their own order items"
on public.order_items for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and o.user_id = auth.uid()
  )
);

create policy "Anyone can subscribe to the newsletter"
on public.newsletter_subscribers for insert
to anon, authenticated
with check (true);

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_variants, public.services, public.reviews to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.addresses, public.wishlists, public.cart_items, public.reviews to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant insert on public.newsletter_subscribers to anon, authenticated;
