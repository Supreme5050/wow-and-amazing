-- Wow & Amazing — Houses for Rent
-- Adds a new "Houses for Rent" collection inside the existing Housing & Decor
-- department. Houses are ordinary products under the hood (fixed price, paid
-- in full through the existing Paystack checkout, one "Standard" option per
-- listing) so every existing cart, checkout, stock and admin flow keeps
-- working unchanged. No schema changes are required.
begin;

insert into public.products
(id, slug, category_id, subcategory_slug, name, description, price, image_urls, is_featured, stock_qty, is_active)
values
('23000000-0000-4000-8000-000000000001','3-bedroom-duplex-lekki-phase-1','10000000-0000-4000-8000-000000000005','houses-for-rent','3-Bedroom Duplex – Lekki Phase 1','A modern 3-bedroom duplex in the heart of Lekki Phase 1, with 3 bathrooms, a fitted kitchen, private parking for two cars, 24-hour estate security, and constant water supply. Fully tiled, freshly painted, and ready for immediate move-in. Rent is paid securely online, in full, at checkout.',890.00,array['/catalog/products/rental-duplex.webp'],true,1,true),
('23000000-0000-4000-8000-000000000002','self-contained-studio-yaba','10000000-0000-4000-8000-000000000005','houses-for-rent','Self-Contained Studio Apartment – Yaba','A compact, self-contained studio apartment in Yaba with a private bathroom, kitchenette, and reliable power supply. Ideal for a student or single professional who wants a quiet, secure space close to the city. Rent covers the full lease term and is paid in full at checkout.',260.00,array['/catalog/products/rental-studio.webp'],false,1,true),
('23000000-0000-4000-8000-000000000003','4-bedroom-bungalow-ikoyi','10000000-0000-4000-8000-000000000005','houses-for-rent','4-Bedroom Detached Bungalow – Ikoyi','A spacious 4-bedroom detached bungalow on a quiet street in Ikoyi, with 4 en-suite bathrooms, a large sitting room, a fitted kitchen, staff quarters, and gated parking for three cars. Comes with a backup generator and borehole water supply.',1450.00,array['/catalog/products/rental-bungalow.webp'],true,1,true),
('23000000-0000-4000-8000-000000000004','2-bedroom-flat-ajah','10000000-0000-4000-8000-000000000005','houses-for-rent','2-Bedroom Flat – Ajah','A well-finished 2-bedroom flat in a gated estate in Ajah, with 2 bathrooms, a fitted kitchen, tiled floors throughout, and dedicated parking. Close to shops, schools and the express road, with 24-hour estate security.',410.00,array['/catalog/products/rental-apartment.webp'],false,1,true),
('23000000-0000-4000-8000-000000000005','5-bedroom-mansion-banana-island','10000000-0000-4000-8000-000000000005','houses-for-rent','5-Bedroom Luxury Mansion – Banana Island','An expansive 5-bedroom luxury mansion on Banana Island, with 6 bathrooms, a private swimming pool, a home cinema room, staff quarters, and gated parking for six cars. Finished to a premium standard with imported fittings throughout.',3200.00,array['/catalog/products/rental-mansion.webp'],true,1,true),
('23000000-0000-4000-8000-000000000006','1-bedroom-mini-flat-surulere','10000000-0000-4000-8000-000000000005','houses-for-rent','1-Bedroom Mini Flat – Surulere','A tidy 1-bedroom mini flat in Surulere with a private bathroom, kitchen, and constant water supply. A short walk from the bus stop and local market, ideal for a small family or young professional starting out. Rent is fixed and paid in full at checkout, with no hidden charges.',300.00,array['/catalog/products/rental-studio.webp'],false,1,true)
on conflict (slug) do update set
  category_id = excluded.category_id,
  subcategory_slug = excluded.subcategory_slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_urls = excluded.image_urls,
  is_featured = excluded.is_featured,
  stock_qty = excluded.stock_qty,
  is_active = true;

insert into public.product_variants (id, product_id, name, price_delta, stock_qty)
select gen_random_uuid(), p.id, 'Standard', 0, p.stock_qty
from public.products p
where p.slug in ('3-bedroom-duplex-lekki-phase-1', 'self-contained-studio-yaba', '4-bedroom-bungalow-ikoyi', '2-bedroom-flat-ajah', '5-bedroom-mansion-banana-island', '1-bedroom-mini-flat-surulere')
  and not exists (select 1 from public.product_variants v where v.product_id = p.id);

commit;
