-- Phase 4 commerce hardening and order tracking details.
-- Run after migrations 001-004.

create index if not exists cart_items_product_variant_idx on public.cart_items(product_id, variant_id);
create index if not exists wishlists_product_id_idx on public.wishlists(product_id);
create index if not exists orders_payment_reference_idx on public.orders(payment_reference);

create or replace function public.track_order(p_order_number text, p_email text)
returns table(order_number text,status public.order_status,total numeric,created_at timestamptz,updated_at timestamptz)
language sql security definer set search_path=public as $$
select o.order_number,o.status,o.total,o.created_at,o.updated_at from public.orders o
where upper(o.order_number)=upper(trim(p_order_number)) and lower(o.email)=lower(trim(p_email)) limit 1;
$$;
revoke all on function public.track_order(text,text) from public;
grant execute on function public.track_order(text,text) to anon,authenticated;
