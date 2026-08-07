-- Wow & Amazing — Paystack currency hotfix for a standard Nigerian merchant account
-- Run after 202607150009_commerce_reliability.sql.
-- Safe additive migration: no rows are deleted and existing payment attempts are preserved.

begin;

alter table public.orders
  alter column currency set default 'NGN';

alter table public.payment_attempts
  alter column currency set default 'NGN';

commit;
