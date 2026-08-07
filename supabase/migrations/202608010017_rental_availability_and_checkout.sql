-- Wow & Amazing — Phase 7A rental availability and checkout polish
-- Safe whether the earlier rental migrations were already run or not.
-- Existing rental stock is never reset.
begin;

alter table public.products
  add column if not exists rental_bedrooms integer,
  add column if not exists rental_bathrooms integer,
  add column if not exists rental_location text,
  add column if not exists rental_size_label text,
  add column if not exists rental_property_type text,
  add column if not exists rental_status text;

insert into public.products
(id, slug, category_id, subcategory_slug, name, description, price, image_urls, is_featured, stock_qty, is_active)
values
('23000000-0000-4000-8000-000000000001','3-bedroom-duplex-lekki-phase-1','10000000-0000-4000-8000-000000000005','houses-for-rent','3-Bedroom Duplex – Lekki Phase 1','A modern 3-bedroom duplex in the heart of Lekki Phase 1, with 3 bathrooms, a fitted kitchen, private parking for two cars, 24-hour estate security, and constant water supply. Fully tiled, freshly painted, and ready for immediate move-in. Rent is paid securely online, in full, at checkout.',890.00,array['/catalog/products/rental-duplex.webp'],true,1,true),
('23000000-0000-4000-8000-000000000002','self-contained-studio-yaba','10000000-0000-4000-8000-000000000005','houses-for-rent','Self-Contained Studio Apartment – Yaba','A compact, self-contained studio apartment in Yaba with a private bathroom, kitchenette, and reliable power supply. Ideal for a student or single professional who wants a quiet, secure space close to the city. Rent covers the full lease term and is paid in full at checkout.',260.00,array['/catalog/products/rental-studio.webp'],false,1,true),
('23000000-0000-4000-8000-000000000003','4-bedroom-bungalow-ikoyi','10000000-0000-4000-8000-000000000005','houses-for-rent','4-Bedroom Detached Bungalow – Ikoyi','A spacious 4-bedroom detached bungalow on a quiet street in Ikoyi, with 4 en-suite bathrooms, a large sitting room, a fitted kitchen, staff quarters, and gated parking for three cars. Comes with a backup generator and borehole water supply.',1450.00,array['/catalog/products/rental-bungalow.webp'],true,1,true),
('23000000-0000-4000-8000-000000000004','2-bedroom-flat-ajah','10000000-0000-4000-8000-000000000005','houses-for-rent','2-Bedroom Flat – Ajah','A well-finished 2-bedroom flat in a gated estate in Ajah, with 2 bathrooms, a fitted kitchen, tiled floors throughout, and dedicated parking. Close to shops, schools and the express road, with 24-hour estate security.',410.00,array['/catalog/products/rental-apartment.webp'],false,1,true),
('23000000-0000-4000-8000-000000000005','5-bedroom-mansion-banana-island','10000000-0000-4000-8000-000000000005','houses-for-rent','5-Bedroom Luxury Mansion – Banana Island','An expansive 5-bedroom luxury mansion on Banana Island, with 6 bathrooms, a private swimming pool, a home cinema room, staff quarters, and gated parking for six cars. Finished to a premium standard with imported fittings throughout.',3200.00,array['/catalog/products/rental-mansion.webp'],true,1,true),
('23000000-0000-4000-8000-000000000006','1-bedroom-mini-flat-surulere','10000000-0000-4000-8000-000000000005','houses-for-rent','1-Bedroom Mini Flat – Surulere','A tidy 1-bedroom mini flat in Surulere with a private bathroom, kitchen, and constant water supply. A short walk from the bus stop and local market, ideal for a small family or young professional starting out. Rent is fixed and paid in full at checkout, with no hidden charges.',300.00,array['/catalog/products/rental-studio.webp'],false,1,true)
on conflict (slug) do nothing;

insert into public.product_variants (id, product_id, name, price_delta, stock_qty)
select gen_random_uuid(), p.id, 'Standard', 0, greatest(p.stock_qty, 0)
from public.products p
where p.slug in ('3-bedroom-duplex-lekki-phase-1', 'self-contained-studio-yaba', '4-bedroom-bungalow-ikoyi', '2-bedroom-flat-ajah', '5-bedroom-mansion-banana-island', '1-bedroom-mini-flat-surulere')
  and not exists (select 1 from public.product_variants v where v.product_id = p.id);

update public.products set
  rental_bedrooms = coalesce(rental_bedrooms, 3), rental_bathrooms = coalesce(rental_bathrooms, 3), rental_location = coalesce(rental_location, 'Lekki Phase 1, Lagos'), rental_size_label = coalesce(rental_size_label, '240 sqm'), rental_property_type = coalesce(rental_property_type, 'Duplex')
where slug = '3-bedroom-duplex-lekki-phase-1';
update public.products set
  rental_bathrooms = coalesce(rental_bathrooms, 1), rental_location = coalesce(rental_location, 'Yaba, Lagos'), rental_size_label = coalesce(rental_size_label, '28 sqm'), rental_property_type = coalesce(rental_property_type, 'Studio')
where slug = 'self-contained-studio-yaba';
update public.products set
  rental_bedrooms = coalesce(rental_bedrooms, 4), rental_bathrooms = coalesce(rental_bathrooms, 4), rental_location = coalesce(rental_location, 'Ikoyi, Lagos'), rental_size_label = coalesce(rental_size_label, '380 sqm'), rental_property_type = coalesce(rental_property_type, 'Bungalow')
where slug = '4-bedroom-bungalow-ikoyi';
update public.products set
  rental_bedrooms = coalesce(rental_bedrooms, 2), rental_bathrooms = coalesce(rental_bathrooms, 2), rental_location = coalesce(rental_location, 'Ajah, Lagos'), rental_size_label = coalesce(rental_size_label, '95 sqm'), rental_property_type = coalesce(rental_property_type, 'Flat')
where slug = '2-bedroom-flat-ajah';
update public.products set
  rental_bedrooms = coalesce(rental_bedrooms, 5), rental_bathrooms = coalesce(rental_bathrooms, 6), rental_location = coalesce(rental_location, 'Banana Island, Lagos'), rental_size_label = coalesce(rental_size_label, '620 sqm'), rental_property_type = coalesce(rental_property_type, 'Mansion')
where slug = '5-bedroom-mansion-banana-island';
update public.products set
  rental_bedrooms = coalesce(rental_bedrooms, 1), rental_bathrooms = coalesce(rental_bathrooms, 1), rental_location = coalesce(rental_location, 'Surulere, Lagos'), rental_size_label = coalesce(rental_size_label, '42 sqm'), rental_property_type = coalesce(rental_property_type, 'Mini Flat')
where slug = '1-bedroom-mini-flat-surulere';

update public.products
set rental_status = case when stock_qty < 1 then 'rented' else 'available' end
where subcategory_slug = 'houses-for-rent' and rental_status is null;

update public.products
set rental_status = null
where subcategory_slug is distinct from 'houses-for-rent' and rental_status is not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_rental_bedrooms_non_negative') then
    alter table public.products add constraint products_rental_bedrooms_non_negative check (rental_bedrooms is null or rental_bedrooms >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_rental_bathrooms_non_negative') then
    alter table public.products add constraint products_rental_bathrooms_non_negative check (rental_bathrooms is null or rental_bathrooms >= 0);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_rental_status_allowed') then
    alter table public.products add constraint products_rental_status_allowed check (rental_status is null or rental_status in ('available', 'reserved', 'rented'));
  end if;
end $$;

create index if not exists products_rental_status_idx
  on public.products (subcategory_slug, rental_status)
  where subcategory_slug = 'houses-for-rent';

commit;
