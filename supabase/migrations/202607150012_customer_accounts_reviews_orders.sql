-- Wow & Amazing — Customer accounts, saved addresses, reviews, and order experience
-- Run after 202607150011_services_and_public_pages.sql.
-- Safe additive migration: existing products, customers, orders, payments, and content are preserved.

begin;

-- Keep the public profile email aligned with Supabase Auth after an email change
-- is confirmed by the customer.
create or replace function public.sync_profile_email_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set email = new.email,
      updated_at = now()
  where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_updated on auth.users;
create trigger on_auth_user_email_updated
after update of email on auth.users
for each row
when (old.email is distinct from new.email)
execute function public.sync_profile_email_from_auth();

-- Make exactly one saved address the default for every customer that has
-- addresses. Existing data is normalised before the unique index is created.
with ranked_addresses as (
  select
    id,
    row_number() over (
      partition by user_id
      order by is_default desc, created_at asc, id asc
    ) as position
  from public.addresses
)
update public.addresses a
set is_default = (r.position = 1)
from ranked_addresses r
where a.id = r.id
  and a.is_default is distinct from (r.position = 1);

create unique index if not exists addresses_one_default_per_user_idx
on public.addresses(user_id)
where is_default;

create or replace function public.manage_default_address_before_write()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if not exists (
      select 1 from public.addresses where user_id = new.user_id
    ) then
      new.is_default := true;
    end if;
  end if;

  if new.is_default then
    update public.addresses
    set is_default = false,
        updated_at = now()
    where user_id = new.user_id
      and id is distinct from new.id
      and is_default = true;
  end if;

  return new;
end;
$$;

drop trigger if exists addresses_manage_default_before_write on public.addresses;
create trigger addresses_manage_default_before_write
before insert or update of is_default on public.addresses
for each row execute function public.manage_default_address_before_write();

create or replace function public.reassign_default_address_after_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.is_default then
    update public.addresses
    set is_default = true,
        updated_at = now()
    where id = (
      select id
      from public.addresses
      where user_id = old.user_id
      order by created_at asc, id asc
      limit 1
    );
  end if;
  return old;
end;
$$;

drop trigger if exists addresses_reassign_default_after_delete on public.addresses;
create trigger addresses_reassign_default_after_delete
after delete on public.addresses
for each row execute function public.reassign_default_address_after_delete();

-- Snapshot the product presentation used at the time an order is created so
-- a customer's order history remains useful even after a catalog item changes.
alter table public.order_items
  add column if not exists product_slug text,
  add column if not exists product_image_url text;

update public.order_items oi
set
  product_slug = coalesce(oi.product_slug, p.slug),
  product_image_url = coalesce(oi.product_image_url, p.image_urls[1])
from public.products p
where oi.product_id = p.id
  and (oi.product_slug is null or oi.product_image_url is null);

create or replace function public.snapshot_order_item_product()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_slug text;
  v_image text;
begin
  if new.product_id is not null then
    select slug, image_urls[1]
    into v_slug, v_image
    from public.products
    where id = new.product_id;

    new.product_slug := coalesce(new.product_slug, v_slug);
    new.product_image_url := coalesce(new.product_image_url, v_image);
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_snapshot_product on public.order_items;
create trigger order_items_snapshot_product
before insert on public.order_items
for each row execute function public.snapshot_order_item_product();

-- Customers may read the fulfilment timeline for their own orders.
drop policy if exists "Users can read their own order status events" on public.order_status_events;
create policy "Users can read their own order status events"
on public.order_status_events for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_status_events.order_id
      and o.user_id = auth.uid()
  )
);

grant select on public.order_status_events to authenticated;

-- Review moderation and verified-purchase protection.
alter table public.reviews
  add column if not exists is_visible boolean not null default true,
  add column if not exists owner_response text,
  add column if not exists moderated_at timestamptz;

create index if not exists reviews_visible_product_idx
on public.reviews(product_id, is_visible, created_at desc);

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

drop policy if exists "Public can read reviews" on public.reviews;
drop policy if exists "Public can read visible reviews" on public.reviews;
create policy "Public can read visible reviews"
on public.reviews for select
to anon, authenticated
using (
  is_visible = true
  or user_id = auth.uid()
  or public.is_owner()
);

drop policy if exists "Users can create their own reviews" on public.reviews;
create policy "Verified customers can create their own reviews"
on public.reviews for insert
to authenticated
with check (
  auth.uid() = user_id
  and public.has_purchased_product(product_id)
);

drop policy if exists "Users can update their own reviews" on public.reviews;
create policy "Verified customers can update their own reviews"
on public.reviews for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and public.has_purchased_product(product_id)
);

drop policy if exists "Owners can manage reviews" on public.reviews;
create policy "Owners can manage reviews"
on public.reviews for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.reviews to service_role;
grant select on public.profiles, public.orders, public.order_items, public.order_status_events to service_role;

-- Detailed public tracking result. The exact order number and customer email
-- are both required before any item or fulfilment information is returned.
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
        )
        order by oi.created_at asc
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
        )
        order by ose.created_at asc
      )
      from public.order_status_events ose
      where ose.order_id = v_order.id
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.track_order_details(text, text) from public;
grant execute on function public.track_order_details(text, text) to anon, authenticated;

commit;
