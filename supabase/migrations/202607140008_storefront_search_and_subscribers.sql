-- Wow & Amazing — Storefront search and subscriber capture
-- Run after 202607140006_owner_admin_foundation.sql.
-- Safe additive migration: no existing records are deleted or reset.

begin;

create extension if not exists pg_trgm;

-- The products table already has a generated search_document column from the
-- foundation migration. This RPC exposes ranked search for active products
-- only, keeping drafts out of public results.
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
        ts_rank_cd(
          p.search_document,
          websearch_to_tsquery('simple', i.query_text)
        ),
        similarity(lower(p.name), lower(i.query_text)),
        case when lower(p.name) like '%' || lower(i.query_text) || '%' then 0.80 else 0 end,
        case when lower(c.name) like '%' || lower(i.query_text) || '%' then 0.55 else 0 end
      )::real as search_rank
    from public.products p
    join public.categories c on c.id = p.category_id
    cross join input i
    where i.query_text <> ''
      and p.is_active = true
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
