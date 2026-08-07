-- Wow & Amazing — Commerce reliability, Paystack reconciliation, and order history
-- Run after 202607140008_storefront_search_and_subscribers.sql.
-- Safe additive migration: existing products, users, orders, and payments are preserved.

begin;

alter table public.orders
  add column if not exists currency text not null default 'USD',
  add column if not exists payment_channel text,
  add column if not exists paid_at timestamptz;

create table if not exists public.payment_attempts (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  email text not null,
  address jsonb not null,
  items jsonb not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  status text not null default 'initialized'
    check (status in ('initialized', 'paid', 'failed', 'abandoned', 'review_required')),
  access_code text,
  authorization_url text,
  order_id uuid references public.orders(id) on delete set null,
  failure_reason text,
  provider_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_attempts_created_idx
  on public.payment_attempts(created_at desc);
create index if not exists payment_attempts_status_idx
  on public.payment_attempts(status, created_at desc);
create index if not exists payment_attempts_email_idx
  on public.payment_attempts(lower(email));

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists order_status_events_order_idx
  on public.order_status_events(order_id, created_at desc);

-- Reuse the project's updated_at trigger helper.
drop trigger if exists payment_attempts_set_updated_at on public.payment_attempts;
create trigger payment_attempts_set_updated_at
before update on public.payment_attempts
for each row execute function public.set_updated_at();

create or replace function public.log_order_status_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' or old.status is distinct from new.status then
    insert into public.order_status_events(order_id, status, created_by)
    values (new.id, new.status, auth.uid());
  end if;
  return new;
end;
$$;

drop trigger if exists orders_log_status_event on public.orders;
create trigger orders_log_status_event
after insert or update of status on public.orders
for each row execute function public.log_order_status_event();

-- Finalises a verified payment and performs all order/stock writes in one
-- database transaction. Calling it repeatedly with the same reference returns
-- the already-created order instead of duplicating fulfilment.
create or replace function public.finalize_paid_checkout(
  p_reference text,
  p_payment_channel text default null,
  p_paid_at timestamptz default now(),
  p_provider_payload jsonb default '{}'::jsonb
)
returns table (
  result_order_id uuid,
  result_order_number text,
  result_status text,
  result_message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.payment_attempts%rowtype;
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_qty integer;
  v_subtotal numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_verified_total numeric(12,2) := 0;
  v_order_id uuid;
  v_order_number text;
  v_product_ids uuid[] := '{}'::uuid[];
begin
  select *
  into v_attempt
  from public.payment_attempts
  where reference = trim(p_reference)
  for update;

  if not found then
    return query select null::uuid, null::text, 'not_found'::text, 'Payment attempt not found.'::text;
    return;
  end if;

  if v_attempt.order_id is not null then
    select o.order_number into v_order_number
    from public.orders o
    where o.id = v_attempt.order_id;

    return query select v_attempt.order_id, v_order_number, 'completed'::text, 'Order already finalised.'::text;
    return;
  end if;

  begin
    if jsonb_typeof(v_attempt.items) <> 'array' or jsonb_array_length(v_attempt.items) = 0 then
      raise exception 'The payment attempt has no valid cart items.';
    end if;

    -- Lock and validate every line before creating the order.
    for v_item in select value from jsonb_array_elements(v_attempt.items)
    loop
      v_qty := greatest(1, floor(coalesce((v_item ->> 'qty')::numeric, 1))::integer);

      select * into v_product
      from public.products
      where id = (v_item ->> 'productId')::uuid
      for update;

      if not found or not v_product.is_active then
        raise exception 'A product in this payment is no longer available.';
      end if;

      select * into v_variant
      from public.product_variants
      where id = (v_item ->> 'variantId')::uuid
        and product_id = v_product.id
      for update;

      if not found then
        raise exception 'A selected product option is no longer available.';
      end if;

      if v_variant.stock_qty < v_qty then
        raise exception '% does not have enough stock to fulfil this paid order.', v_product.name;
      end if;

      v_subtotal := v_subtotal + ((v_product.price + v_variant.price_delta) * v_qty);
      if not (v_product.id = any(v_product_ids)) then
        v_product_ids := array_append(v_product_ids, v_product.id);
      end if;
    end loop;

    v_shipping := case when v_subtotal >= 50 then 0 else 5 end;
    v_verified_total := round(v_subtotal + v_shipping, 2);

    if abs(v_verified_total - v_attempt.amount) > 0.01 then
      raise exception 'The verified cart total no longer matches the payment amount.';
    end if;

    v_order_id := gen_random_uuid();
    v_order_number := 'WA-' || extract(year from now())::text || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

    insert into public.orders (
      id,
      order_number,
      user_id,
      email,
      status,
      total,
      address,
      payment_provider,
      payment_reference,
      currency,
      payment_channel,
      paid_at
    ) values (
      v_order_id,
      v_order_number,
      v_attempt.user_id,
      lower(v_attempt.email),
      'paid'::public.order_status,
      v_verified_total,
      v_attempt.address,
      'paystack',
      v_attempt.reference,
      upper(v_attempt.currency),
      nullif(trim(p_payment_channel), ''),
      coalesce(p_paid_at, now())
    );

    for v_item in select value from jsonb_array_elements(v_attempt.items)
    loop
      v_qty := greatest(1, floor(coalesce((v_item ->> 'qty')::numeric, 1))::integer);

      select * into v_product
      from public.products
      where id = (v_item ->> 'productId')::uuid;

      select * into v_variant
      from public.product_variants
      where id = (v_item ->> 'variantId')::uuid;

      insert into public.order_items (
        order_id,
        product_id,
        variant_id,
        product_name,
        variant_name,
        unit_price,
        qty
      ) values (
        v_order_id,
        v_product.id,
        v_variant.id,
        v_product.name,
        v_variant.name,
        v_product.price + v_variant.price_delta,
        v_qty
      );

      update public.product_variants
      set stock_qty = stock_qty - v_qty
      where id = v_variant.id;
    end loop;

    update public.products p
    set stock_qty = coalesce((
      select sum(pv.stock_qty)::integer
      from public.product_variants pv
      where pv.product_id = p.id
    ), 0)
    where p.id = any(v_product_ids);

    update public.payment_attempts
    set
      status = 'paid',
      order_id = v_order_id,
      failure_reason = null,
      provider_payload = coalesce(p_provider_payload, '{}'::jsonb)
    where id = v_attempt.id;

    return query select v_order_id, v_order_number, 'completed'::text, 'Payment finalised and order created.'::text;
    return;
  exception
    when others then
      update public.payment_attempts
      set
        status = 'review_required',
        failure_reason = sqlerrm,
        provider_payload = coalesce(p_provider_payload, '{}'::jsonb)
      where id = v_attempt.id;

      return query select null::uuid, null::text, 'review_required'::text, sqlerrm::text;
      return;
  end;
end;
$$;

revoke all on function public.finalize_paid_checkout(text, text, timestamptz, jsonb) from public;
grant execute on function public.finalize_paid_checkout(text, text, timestamptz, jsonb) to service_role;

alter table public.payment_attempts enable row level security;
alter table public.order_status_events enable row level security;

drop policy if exists "Owners can read payment attempts" on public.payment_attempts;
create policy "Owners can read payment attempts"
on public.payment_attempts for select
to authenticated
using (public.is_owner());

drop policy if exists "Owners can read order status events" on public.order_status_events;
create policy "Owners can read order status events"
on public.order_status_events for select
to authenticated
using (public.is_owner());

grant select on public.payment_attempts, public.order_status_events to authenticated;
grant select, insert, update, delete on public.payment_attempts, public.order_status_events to service_role;
grant select, insert, update, delete on public.orders, public.order_items, public.products, public.product_variants to service_role;

commit;
