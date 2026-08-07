-- Wow & Amazing — service-role permissions hotfix
-- Safe and idempotent. This preserves existing data and only grants the
-- server-side service role the table permissions required by owner APIs.

begin;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.profiles to service_role;
grant select, insert, update, delete on table public.categories to service_role;
grant select, insert, update, delete on table public.products to service_role;
grant select, insert, update, delete on table public.product_variants to service_role;
grant select, insert, update, delete on table public.services to service_role;
grant select, insert, update, delete on table public.orders to service_role;
grant select, insert, update, delete on table public.order_items to service_role;
grant select, insert, update, delete on table public.newsletter_subscribers to service_role;

commit;
