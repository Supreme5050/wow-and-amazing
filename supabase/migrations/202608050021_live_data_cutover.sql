-- Wow & Amazing — Phase 8E live-data cutover
-- Archives the supplied demo catalogue and labels all records created before
-- this cutover as test data. Nothing is deleted. New live records use the
-- default false flags and appear automatically in the storefront/admin.

begin;

alter table public.products
  add column if not exists is_demo boolean not null default false;

alter table public.orders
  add column if not exists is_test_data boolean not null default false;

alter table public.payment_attempts
  add column if not exists is_test_data boolean not null default false;

alter table public.profiles
  add column if not exists is_test_account boolean not null default false;

alter table public.reviews
  add column if not exists is_test_data boolean not null default false;

alter table public.newsletter_subscribers
  add column if not exists is_test_data boolean not null default false;

alter table public.service_inquiries
  add column if not exists is_test_data boolean not null default false;

alter table public.contact_messages
  add column if not exists is_test_data boolean not null default false;

comment on column public.orders.is_test_data is
  'True for Paystack/test-mode orders that must not affect live business reporting.';
comment on column public.payment_attempts.is_test_data is
  'True for test-mode payment attempts that must not appear in live payment reporting.';
comment on column profiles.is_test_account is
  'True for customer accounts created before live launch or while the storefront is in test mode.';

-- The owner confirmed that every commerce/customer record currently present is
-- testing information. Preserve those rows for audit, but remove them from the
-- live dashboard and customer-facing account history.
update public.orders set is_test_data = true where is_test_data = false;
update public.payment_attempts set is_test_data = true where is_test_data = false;
update public.profiles set is_test_account = true
where role = 'customer'::public.app_role and is_test_account = false;
update public.reviews set is_test_data = true where is_test_data = false;
update public.newsletter_subscribers set is_test_data = true where is_test_data = false;
update public.service_inquiries set is_test_data = true where is_test_data = false;
update public.contact_messages set is_test_data = true where is_test_data = false;

-- Archive only records supplied by the seed migrations. Owner-created products
-- have normal random UUIDs and are not touched.
update public.products
set is_demo = true,
    is_active = false,
    updated_at = now()
where id::text like '20000000-%'
   or id::text like '21000000-%'
   or id::text like '22000000-%'
   or id::text like '23000000-%';

create index if not exists orders_live_created_idx
  on public.orders(created_at desc) where is_test_data = false;
create index if not exists payment_attempts_live_created_idx
  on public.payment_attempts(created_at desc) where is_test_data = false;
create index if not exists profiles_live_customer_idx
  on public.profiles(created_at desc) where is_test_account = false;
create index if not exists reviews_live_visible_idx
  on public.reviews(product_id, created_at desc)
  where is_test_data = false and is_visible = true;
create index if not exists products_live_catalog_idx
  on public.products(created_at desc)
  where is_demo = false and is_active = true;

-- Keep supplied seed UUIDs permanently archived, even if an old seed script is
-- accidentally run again later.
create or replace function public.enforce_seed_product_archive()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.id::text like '20000000-%'
     or new.id::text like '21000000-%'
     or new.id::text like '22000000-%'
     or new.id::text like '23000000-%'
  then
    new.is_demo := true;
    new.is_active := false;
  end if;
  return new;
end;
$$;

drop trigger if exists products_enforce_seed_archive on public.products;
create trigger products_enforce_seed_archive
before insert or update of is_active, is_demo
on public.products
for each row execute function public.enforce_seed_product_archive();

-- Customer registrations carry data_mode in Auth metadata. Local/test accounts
-- stay out of live customer totals; production accounts are counted.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone, is_test_account)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    coalesce(new.raw_user_meta_data ->> 'data_mode', 'test') <> 'live'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, profiles.full_name),
    email = coalesce(excluded.email, profiles.email),
    phone = coalesce(excluded.phone, profiles.phone),
    is_test_account = profiles.is_test_account and excluded.is_test_account,
    updated_at = now();
  return new;
end;
$$;

-- Copy the test/live flag from the verified payment attempt into the order
-- created by finalize_paid_checkout.
create or replace function public.copy_payment_data_mode_to_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_test boolean;
begin
  if new.payment_reference is not null then
    select pa.is_test_data
      into v_is_test
    from public.payment_attempts pa
    where pa.reference = new.payment_reference
    limit 1;

    if found then
      new.is_test_data := coalesce(v_is_test, false);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_copy_payment_data_mode on public.orders;
create trigger orders_copy_payment_data_mode
before insert or update of payment_reference
on public.orders
for each row execute function public.copy_payment_data_mode_to_order();

-- Only genuine paid orders qualify a customer to review a product in live mode.
create or replace function public.has_purchased_product(p_product_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    join public.order_items oi on oi.order_id = o.id
    where o.user_id = auth.uid()
      and o.is_test_data = false
      and oi.product_id = p_product_id
      and o.status in (
        'paid'::public.order_status,
        'processing'::public.order_status,
        'shipped'::public.order_status,
        'delivered'::public.order_status
      )
  );
$$;

revoke all on function public.has_purchased_product(uuid) from public;
grant execute on function public.has_purchased_product(uuid) to authenticated;

-- Public catalogue access never exposes archived demo products.
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read live active products"
on public.products for select
to anon, authenticated
using (
  (is_active = true and is_demo = false)
  or public.is_owner()
);

-- Public review access never exposes test reviews. Owners and the author can
-- still inspect their own records where needed.
drop policy if exists "Public can read visible reviews" on public.reviews;
create policy "Public can read live visible reviews"
on public.reviews for select
to anon, authenticated
using (
  (is_visible = true and is_test_data = false)
  or user_id = auth.uid()
  or public.is_owner()
);

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
    and o.is_test_data = false
  limit 1;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

create or replace function public.track_order_details(
  p_order_number text,
  p_email text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  select *
  into v_order
  from public.orders o
  where upper(o.order_number) = upper(trim(p_order_number))
    and lower(o.email) = lower(trim(p_email))
    and o.is_test_data = false
  limit 1;

  if not found then
    return null;
  end if;

  return jsonb_build_object(
    'id', v_order.id,
    'order_number', v_order.order_number,
    'status', v_order.status,
    'total', v_order.total,
    'currency', coalesce(v_order.currency, 'NGN'),
    'created_at', v_order.created_at,
    'updated_at', v_order.updated_at,
    'paid_at', v_order.paid_at,
    'payment_channel', v_order.payment_channel,
    'delivery', jsonb_build_object(
      'full_name', coalesce(v_order.address ->> 'fullName', v_order.address ->> 'full_name'),
      'city', v_order.address ->> 'city',
      'state', v_order.address ->> 'state',
      'country', v_order.address ->> 'country'
    ),
    'items', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', oi.id,
          'product_name', oi.product_name,
          'variant_name', oi.variant_name,
          'unit_price', oi.unit_price,
          'qty', oi.qty,
          'product_slug', oi.product_slug,
          'product_image_url', oi.product_image_url
        ) order by oi.created_at asc
      )
      from public.order_items oi
      where oi.order_id = v_order.id
    ), '[]'::jsonb),
    'history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ose.id,
          'status', ose.status,
          'note', ose.note,
          'created_at', ose.created_at
        ) order by ose.created_at asc
      )
      from public.order_status_events ose
      where ose.order_id = v_order.id
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.track_order_details(text, text) from public;
grant execute on function public.track_order_details(text, text) to anon, authenticated;

-- Search results are also restricted to genuine active products.
create or replace function public.search_active_product_ids(
  p_query text,
  p_limit integer default 8
)
returns table (
  product_id uuid,
  search_rank real
)
language sql
stable
security definer
set search_path = public
as $$
  with input as (
    select trim(coalesce(p_query, '')) as query_text
  ),
  ranked as (
    select
      p.id as product_id,
      greatest(
        ts_rank_cd(p.search_document, websearch_to_tsquery('simple', i.query_text)),
        similarity(lower(p.name), lower(i.query_text)),
        case when lower(p.name) like '%' || lower(i.query_text) || '%' then 0.80 else 0 end,
        case when lower(c.name) like '%' || lower(i.query_text) || '%' then 0.55 else 0 end
      )::real as search_rank
    from public.products p
    join public.categories c on c.id = p.category_id
    cross join input i
    where i.query_text <> ''
      and p.is_active = true
      and p.is_demo = false
      and (
        p.search_document @@ websearch_to_tsquery('simple', i.query_text)
        or lower(p.name) like '%' || lower(i.query_text) || '%'
        or lower(p.description) like '%' || lower(i.query_text) || '%'
        or lower(c.name) like '%' || lower(i.query_text) || '%'
        or p.name % i.query_text
      )
  )
  select r.product_id, r.search_rank
  from ranked r
  order by r.search_rank desc, r.product_id
  limit greatest(1, least(coalesce(p_limit, 8), 60));
$$;

revoke all on function public.search_active_product_ids(text, integer) from public;
grant execute on function public.search_active_product_ids(text, integer) to anon, authenticated, service_role;

commit;
