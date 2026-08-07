-- Wow & Amazing — dedicated collection pages and expanded product varieties
-- Adds real subcategory routing, assigns every product to a collection, and seeds more varieties.
begin;

alter table public.products add column if not exists subcategory_slug text;

create index if not exists products_category_subcategory_idx
  on public.products(category_id, subcategory_slug)
  where is_active = true;

update public.products set subcategory_slug = 'wireless-audio' where slug = 'wireless-earbuds-pro';
update public.products set subcategory_slug = 'starter-bundles' where slug = 'creator-starter-kit';
update public.products set subcategory_slug = 'bowls-pasta' where slug = 'gourmet-pasta-bowl';
update public.products set subcategory_slug = 'takeaway-boxes' where slug = 'eco-food-box-50pcs';
update public.products set subcategory_slug = 'wall-decor' where slug = 'wall-art-abstract';
update public.products set subcategory_slug = 'stabilisers' where slug = 'camera-gimbal-pro';
update public.products set subcategory_slug = 'charging-power' where slug = 'fast-charge-power-bank';
update public.products set subcategory_slug = 'phone-accessories' where slug = 'premium-phone-case';
update public.products set subcategory_slug = 'charging-power' where slug = 'braided-usb-c-cable';
update public.products set subcategory_slug = 'lighting' where slug = 'portable-ring-light';
update public.products set subcategory_slug = 'microphones' where slug = 'wireless-lavalier-microphone';
update public.products set subcategory_slug = 'stands-supports' where slug = 'creator-desk-tripod';
update public.products set subcategory_slug = 'bowls-pasta' where slug = 'jollof-chicken-bowl';
update public.products set subcategory_slug = 'bowls-pasta' where slug = 'creamy-chicken-pasta';
update public.products set subcategory_slug = 'treats-drinks' where slug = 'fresh-fruit-cooler';
update public.products set subcategory_slug = 'takeaway-boxes' where slug = 'kraft-takeaway-boxes';
update public.products set subcategory_slug = 'cups-lids' where slug = 'clear-cups-with-lids';
update public.products set subcategory_slug = 'bags-wraps' where slug = 'branded-paper-bags';
update public.products set subcategory_slug = 'lighting' where slug = 'ambient-table-lamp';
update public.products set subcategory_slug = 'soft-furnishings' where slug = 'textured-cushion-set';
update public.products set subcategory_slug = 'table-storage' where slug = 'ceramic-decor-vase';
update public.products set subcategory_slug = 'lighting-grip' where slug = 'led-video-light-panel';
update public.products set subcategory_slug = 'camera-accessories' where slug = 'camera-rig-cage';
update public.products set subcategory_slug = 'lens-storage' where slug = 'camera-storage-case';

-- Assign any owner-created legacy product to its department's first collection so nothing disappears.
update public.products
set subcategory_slug = case category_id
  when '10000000-0000-4000-8000-000000000001'::uuid then 'phone-accessories'
  when '10000000-0000-4000-8000-000000000002'::uuid then 'starter-bundles'
  when '10000000-0000-4000-8000-000000000003'::uuid then 'bowls-pasta'
  when '10000000-0000-4000-8000-000000000004'::uuid then 'takeaway-boxes'
  when '10000000-0000-4000-8000-000000000005'::uuid then 'wall-decor'
  when '10000000-0000-4000-8000-000000000006'::uuid then 'stabilisers'
  else 'general'
end
where subcategory_slug is null or btrim(subcategory_slug) = '';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_subcategory_slug_format'
  ) then
    alter table public.products
      add constraint products_subcategory_slug_format
      check (subcategory_slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
end $$;

alter table public.products alter column subcategory_slug set not null;

insert into public.products
(id, slug, category_id, subcategory_slug, name, description, price, image_urls, is_featured, stock_qty, is_active)
values
('22000000-0000-4000-8000-000000000001','tempered-glass-screen-protector','10000000-0000-4000-8000-000000000001','phone-accessories','Tempered Glass Screen Protector','Crystal-clear impact protection with edge-to-edge coverage and an easy alignment frame.',9.99,array['/catalog/categories/gadgets-accessories.webp'],false,120,true),
('22000000-0000-4000-8000-000000000002','magnetic-car-phone-holder','10000000-0000-4000-8000-000000000001','phone-accessories','Magnetic Car Phone Holder','A secure dashboard mount with one-hand positioning for safer everyday navigation.',24.50,array['/catalog/categories/gadgets-accessories.webp'],false,46,true),
('22000000-0000-4000-8000-000000000003','portable-bluetooth-speaker','10000000-0000-4000-8000-000000000001','wireless-audio','Portable Bluetooth Speaker','Compact room-filling sound with long battery life for work, travel and small gatherings.',49.00,array['/catalog/products/wireless-earbuds-pro.webp'],false,32,true),
('22000000-0000-4000-8000-000000000004','noise-cancelling-headphones','10000000-0000-4000-8000-000000000001','wireless-audio','Noise-Cancelling Headphones','Comfortable over-ear listening with focused sound and reduced background noise.',129.00,array['/catalog/products/wireless-earbuds-pro.webp'],false,20,true),
('22000000-0000-4000-8000-000000000005','three-in-one-wireless-charging-stand','10000000-0000-4000-8000-000000000001','charging-power','3-in-1 Wireless Charging Stand','A refined bedside or desk station for compatible phones, earbuds and smart watches.',54.00,array['/experience/gadgets-poster.jpg'],false,29,true),
('22000000-0000-4000-8000-000000000006','smart-fitness-watch','10000000-0000-4000-8000-000000000001','smart-essentials','Smart Fitness Watch','Everyday activity, call and wellness tracking in a clean, lightweight design.',89.00,array['/catalog/categories/gadgets-accessories.webp'],false,27,true),
('22000000-0000-4000-8000-000000000007','bluetooth-item-tracker','10000000-0000-4000-8000-000000000001','smart-essentials','Bluetooth Item Tracker','Keep keys, bags and travel essentials easier to locate from a connected phone.',22.00,array['/catalog/categories/gadgets-accessories.webp'],false,58,true),
('22000000-0000-4000-8000-000000000008','foldable-phone-stand','10000000-0000-4000-8000-000000000001','smart-essentials','Foldable Phone Stand','An adjustable aluminium stand for video calls, recipes, charging and desk use.',14.50,array['/catalog/categories/gadgets-accessories.webp'],false,66,true),
('22000000-0000-4000-8000-000000000009','creator-background-backdrop-kit','10000000-0000-4000-8000-000000000002','starter-bundles','Creator Background Backdrop Kit','A portable neutral backdrop set for product photography, portraits and short videos.',79.00,array['/catalog/products/creator-starter-kit.webp'],false,17,true),
('22000000-0000-4000-8000-000000000010','portable-softbox-lighting-kit','10000000-0000-4000-8000-000000000002','lighting','Portable Softbox Lighting Kit','Soft, balanced lighting for interviews, beauty work and small product setups.',112.00,array['/experience/creators-poster.jpg'],false,18,true),
('22000000-0000-4000-8000-000000000011','compact-shotgun-microphone','10000000-0000-4000-8000-000000000002','microphones','Compact Shotgun Microphone','Directional on-camera audio for interviews, events and mobile production.',68.00,array['/catalog/categories/creator-kits.webp'],false,25,true),
('22000000-0000-4000-8000-000000000012','overhead-desk-mount','10000000-0000-4000-8000-000000000002','stands-supports','Overhead Desk Mount','A strong adjustable arm for overhead filming, tutorials and hands-free demonstrations.',46.00,array['/catalog/products/creator-starter-kit.webp'],false,22,true),
('22000000-0000-4000-8000-000000000013','grilled-chicken-wrap','10000000-0000-4000-8000-000000000003','quick-meals','Grilled Chicken Wrap','Seasoned grilled chicken, crisp vegetables and house sauce wrapped for an easy meal.',11.50,array['/experience/food-poster.jpg'],false,55,true),
('22000000-0000-4000-8000-000000000014','breakfast-sandwich','10000000-0000-4000-8000-000000000003','quick-meals','Breakfast Sandwich','A warm, satisfying breakfast sandwich prepared for a quick start to the day.',8.50,array['/catalog/categories/restaurant-food.webp'],false,48,true),
('22000000-0000-4000-8000-000000000015','family-jollof-tray','10000000-0000-4000-8000-000000000003','family-portions','Family Jollof Tray','A generous shareable tray of smoky jollof rice with grilled chicken and sides.',52.00,array['/experience/food-poster.jpg'],false,24,true),
('22000000-0000-4000-8000-000000000016','chocolate-dessert-cup','10000000-0000-4000-8000-000000000003','treats-drinks','Chocolate Dessert Cup','A rich chilled chocolate dessert finished in a convenient individual serving.',7.00,array['/catalog/categories/restaurant-food.webp'],false,42,true),
('22000000-0000-4000-8000-000000000017','leakproof-soup-containers','10000000-0000-4000-8000-000000000004','takeaway-boxes','Leakproof Soup Containers','Secure lidded containers for soups, sauces and delivery-ready hot meals.',28.00,array['/catalog/products/eco-food-box-50pcs.webp'],false,70,true),
('22000000-0000-4000-8000-000000000018','paper-hot-cups-with-lids','10000000-0000-4000-8000-000000000004','cups-lids','Paper Hot Cups with Lids','Insulated paper cups with fitted lids for coffee, tea and takeaway beverages.',18.00,array['/catalog/categories/food-packaging.webp'],false,82,true),
('22000000-0000-4000-8000-000000000019','aluminium-foil-wrap','10000000-0000-4000-8000-000000000004','bags-wraps','Commercial Aluminium Foil Wrap','Reliable food-safe wrapping for kitchens, catering, transport and storage.',15.50,array['/experience/food-poster.jpg'],false,64,true),
('22000000-0000-4000-8000-000000000020','bulk-food-packaging-starter-pack','10000000-0000-4000-8000-000000000004','bulk-bundles','Bulk Food Packaging Starter Pack','A practical mixed bundle of boxes, bags, cups and service essentials for growing food brands.',96.00,array['/catalog/categories/food-packaging.webp'],false,18,true),
('22000000-0000-4000-8000-000000000021','round-wall-mirror','10000000-0000-4000-8000-000000000005','wall-decor','Round Wall Mirror','A simple statement mirror with a slim frame for bedrooms, halls and living spaces.',78.00,array['/catalog/products/wall-art-abstract.webp'],false,15,true),
('22000000-0000-4000-8000-000000000022','floor-standing-lamp','10000000-0000-4000-8000-000000000005','lighting','Floor Standing Lamp','Warm directional lighting with a calm silhouette for reading corners and lounges.',118.00,array['/experience/home-decor-poster.jpg'],false,12,true),
('22000000-0000-4000-8000-000000000023','luxury-throw-blanket','10000000-0000-4000-8000-000000000005','soft-furnishings','Luxury Throw Blanket','A soft textured throw designed to add comfort and quiet warmth to a room.',56.00,array['/catalog/categories/housing-decor.webp'],false,21,true),
('22000000-0000-4000-8000-000000000024','woven-storage-baskets','10000000-0000-4000-8000-000000000005','table-storage','Woven Storage Basket Set','Elegant practical baskets for shelves, wardrobes, living rooms and nursery storage.',44.00,array['/catalog/categories/housing-decor.webp'],false,24,true),
('22000000-0000-4000-8000-000000000025','handheld-camera-stabilizer','10000000-0000-4000-8000-000000000006','stabilisers','Handheld Camera Stabilizer','A balanced mechanical support for smooth handheld movement without batteries.',94.00,array['/catalog/products/camera-gimbal-pro.webp'],false,13,true),
('22000000-0000-4000-8000-000000000026','camera-monitor-mount','10000000-0000-4000-8000-000000000006','camera-accessories','Adjustable Camera Monitor Mount','A secure tilting mount for field monitors, lights and compact camera accessories.',39.00,array['/catalog/categories/cinematography.webp'],false,26,true),
('22000000-0000-4000-8000-000000000027','heavy-duty-light-stand','10000000-0000-4000-8000-000000000006','lighting-grip','Heavy-Duty Light Stand','Stable height-adjustable support for LED panels, flashes and compact modifiers.',72.00,array['/experience/creators-poster.jpg'],false,19,true),
('22000000-0000-4000-8000-000000000028','lens-cleaning-storage-kit','10000000-0000-4000-8000-000000000006','lens-storage','Lens Cleaning & Storage Kit','A complete maintenance set with cleaning tools and padded protection for lenses.',34.00,array['/catalog/products/camera-gimbal-pro.webp'],false,37,true)
on conflict (slug) do update set
  category_id = excluded.category_id,
  subcategory_slug = excluded.subcategory_slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_urls = excluded.image_urls,
  stock_qty = excluded.stock_qty,
  is_active = true;

insert into public.product_variants (id, product_id, name, price_delta, stock_qty)
select gen_random_uuid(), p.id, 'Standard', 0, p.stock_qty
from public.products p
where p.slug in ('tempered-glass-screen-protector', 'magnetic-car-phone-holder', 'portable-bluetooth-speaker', 'noise-cancelling-headphones', 'three-in-one-wireless-charging-stand', 'smart-fitness-watch', 'bluetooth-item-tracker', 'foldable-phone-stand', 'creator-background-backdrop-kit', 'portable-softbox-lighting-kit', 'compact-shotgun-microphone', 'overhead-desk-mount', 'grilled-chicken-wrap', 'breakfast-sandwich', 'family-jollof-tray', 'chocolate-dessert-cup', 'leakproof-soup-containers', 'paper-hot-cups-with-lids', 'aluminium-foil-wrap', 'bulk-food-packaging-starter-pack', 'round-wall-mirror', 'floor-standing-lamp', 'luxury-throw-blanket', 'woven-storage-baskets', 'handheld-camera-stabilizer', 'camera-monitor-mount', 'heavy-duty-light-stand', 'lens-cleaning-storage-kit')
  and not exists (select 1 from public.product_variants v where v.product_id = p.id);

commit;
