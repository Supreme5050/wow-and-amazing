-- Wow & Amazing — structured rental details
-- Adds optional, nullable property-detail columns to the existing products
-- table so house listings can show bedrooms / bathrooms / size / location /
-- property type as proper labeled fields instead of plain description text.
--
-- These columns are prefixed "rental_" and are null for every non-rental
-- product, so nothing about any existing product, category, or page changes.
begin;

alter table public.products
  add column if not exists rental_bedrooms integer,
  add column if not exists rental_bathrooms integer,
  add column if not exists rental_location text,
  add column if not exists rental_size_label text,
  add column if not exists rental_property_type text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_rental_bedrooms_non_negative'
  ) then
    alter table public.products
      add constraint products_rental_bedrooms_non_negative
      check (rental_bedrooms is null or rental_bedrooms >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'products_rental_bathrooms_non_negative'
  ) then
    alter table public.products
      add constraint products_rental_bathrooms_non_negative
      check (rental_bathrooms is null or rental_bathrooms >= 0);
  end if;
end $$;

update public.products set
  rental_bedrooms = 3, rental_bathrooms = 3, rental_location = 'Lekki Phase 1, Lagos', rental_size_label = '240 sqm', rental_property_type = 'Duplex'
where slug = '3-bedroom-duplex-lekki-phase-1';

update public.products set
  rental_bedrooms = null, rental_bathrooms = 1, rental_location = 'Yaba, Lagos', rental_size_label = '28 sqm', rental_property_type = 'Studio'
where slug = 'self-contained-studio-yaba';

update public.products set
  rental_bedrooms = 4, rental_bathrooms = 4, rental_location = 'Ikoyi, Lagos', rental_size_label = '380 sqm', rental_property_type = 'Bungalow'
where slug = '4-bedroom-bungalow-ikoyi';

update public.products set
  rental_bedrooms = 2, rental_bathrooms = 2, rental_location = 'Ajah, Lagos', rental_size_label = '95 sqm', rental_property_type = 'Flat'
where slug = '2-bedroom-flat-ajah';

update public.products set
  rental_bedrooms = 5, rental_bathrooms = 6, rental_location = 'Banana Island, Lagos', rental_size_label = '620 sqm', rental_property_type = 'Mansion'
where slug = '5-bedroom-mansion-banana-island';

update public.products set
  rental_bedrooms = 1, rental_bathrooms = 1, rental_location = 'Surulere, Lagos', rental_size_label = '42 sqm', rental_property_type = 'Mini Flat'
where slug = '1-bedroom-mini-flat-surulere';

commit;
