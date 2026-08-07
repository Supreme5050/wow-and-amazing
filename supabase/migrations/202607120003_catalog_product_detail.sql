-- Wow & Amazing — Phase 3 catalog and product-detail data

insert into public.product_variants (id, product_id, name, price_delta, stock_qty)
values
  ('40000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','Midnight Ink',0,24),
  ('40000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','Pearl White',0,16),
  ('40000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000002','Standard Kit',0,16),
  ('40000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000002','Complete Kit',49,8),
  ('40000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000003','Regular',0,42),
  ('40000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003','Large',4,18),
  ('40000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000004','50 Pieces',0,52),
  ('40000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000004','100 Pieces',16,28),
  ('40000000-0000-4000-8000-000000000009','20000000-0000-4000-8000-000000000005','A3',0,11),
  ('40000000-0000-4000-8000-000000000010','20000000-0000-4000-8000-000000000005','A2',20,7),
  ('40000000-0000-4000-8000-000000000011','20000000-0000-4000-8000-000000000006','Standard',0,10),
  ('40000000-0000-4000-8000-000000000012','20000000-0000-4000-8000-000000000006','Creator Bundle',45,6)
on conflict (id) do update set
  product_id = excluded.product_id,
  name = excluded.name,
  price_delta = excluded.price_delta,
  stock_qty = excluded.stock_qty;

create or replace view public.product_rating_summary as
select
  p.id as product_id,
  coalesce(avg(r.rating), 0)::numeric(3,2) as average_rating,
  count(r.id)::integer as review_count
from public.products p
left join public.reviews r on r.product_id = p.id
group by p.id;

grant select on public.product_rating_summary to anon, authenticated;
