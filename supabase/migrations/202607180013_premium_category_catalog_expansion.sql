-- Wow & Amazing — premium category catalog expansion
-- Adds representative starter inventory across every department. Safe and additive.
begin;

insert into public.products (id, slug, category_id, name, description, price, image_urls, is_featured, stock_qty, is_active)
values
('21000000-0000-4000-8000-000000000001','fast-charge-power-bank','10000000-0000-4000-8000-000000000001','Fast-Charge Power Bank','Compact high-capacity portable power for phones, earbuds and daily travel.',42.00,array['/catalog/categories/gadgets-accessories.webp'],false,35,true),
('21000000-0000-4000-8000-000000000002','premium-phone-case','10000000-0000-4000-8000-000000000001','Premium Protective Phone Case','Slim shock-resistant protection with a refined matte finish for everyday use.',18.50,array['/catalog/categories/gadgets-accessories.webp'],false,54,true),
('21000000-0000-4000-8000-000000000003','braided-usb-c-cable','10000000-0000-4000-8000-000000000001','Braided USB-C Fast Cable','Durable reinforced cable designed for dependable charging and data transfer.',11.99,array['/catalog/products/wireless-earbuds-pro.webp'],false,90,true),
('21000000-0000-4000-8000-000000000004','portable-ring-light','10000000-0000-4000-8000-000000000002','Portable Ring Light','Adjustable soft lighting for videos, beauty content, calls and product photography.',36.00,array['/experience/creators-poster.jpg'],false,25,true),
('21000000-0000-4000-8000-000000000005','wireless-lavalier-microphone','10000000-0000-4000-8000-000000000002','Wireless Lavalier Microphone','Clear portable audio for interviews, short videos and live mobile content.',58.00,array['/catalog/categories/creator-kits.webp'],false,31,true),
('21000000-0000-4000-8000-000000000006','creator-desk-tripod','10000000-0000-4000-8000-000000000002','Creator Desk Tripod','Stable compact support for phones, cameras and overhead content creation.',29.99,array['/catalog/products/creator-starter-kit.webp'],false,28,true),
('21000000-0000-4000-8000-000000000007','jollof-chicken-bowl','10000000-0000-4000-8000-000000000003','Jollof Rice & Grilled Chicken','Smoky Nigerian jollof rice served with seasoned grilled chicken and sides.',18.99,array['/experience/food-poster.jpg'],false,45,true),
('21000000-0000-4000-8000-000000000008','creamy-chicken-pasta','10000000-0000-4000-8000-000000000003','Creamy Chicken Pasta','Rich creamy pasta finished with grilled chicken and fresh herbs.',17.50,array['/catalog/products/gourmet-pasta-bowl.webp'],false,38,true),
('21000000-0000-4000-8000-000000000009','fresh-fruit-cooler','10000000-0000-4000-8000-000000000003','Fresh Fruit Cooler','A chilled refreshing fruit blend prepared to complete any meal.',6.50,array['/catalog/categories/restaurant-food.webp'],false,60,true),
('21000000-0000-4000-8000-000000000010','kraft-takeaway-boxes','10000000-0000-4000-8000-000000000004','Kraft Takeaway Boxes','Strong natural-finish containers for meals, pastries and food delivery.',24.00,array['/catalog/products/eco-food-box-50pcs.webp'],false,76,true),
('21000000-0000-4000-8000-000000000011','clear-cups-with-lids','10000000-0000-4000-8000-000000000004','Clear Cups with Lids','Professional transparent drink cups for juice, smoothies and cold beverages.',16.00,array['/catalog/categories/food-packaging.webp'],false,84,true),
('21000000-0000-4000-8000-000000000012','branded-paper-bags','10000000-0000-4000-8000-000000000004','Premium Paper Carry Bags','Neat reinforced paper bags for takeaway orders, gifts and retail packaging.',21.00,array['/experience/food-poster.jpg'],false,62,true),
('21000000-0000-4000-8000-000000000013','ambient-table-lamp','10000000-0000-4000-8000-000000000005','Ambient Table Lamp','Warm minimalist lighting designed for bedrooms, desks and calm living spaces.',64.00,array['/experience/home-decor-poster.jpg'],false,20,true),
('21000000-0000-4000-8000-000000000014','textured-cushion-set','10000000-0000-4000-8000-000000000005','Textured Cushion Set','Soft decorative cushions that add warmth, depth and comfort to a room.',38.00,array['/catalog/categories/housing-decor.webp'],false,27,true),
('21000000-0000-4000-8000-000000000015','ceramic-decor-vase','10000000-0000-4000-8000-000000000005','Sculpted Ceramic Vase','A clean sculptural accent for shelves, consoles and dining surfaces.',47.50,array['/catalog/products/wall-art-abstract.webp'],false,19,true),
('21000000-0000-4000-8000-000000000016','led-video-light-panel','10000000-0000-4000-8000-000000000006','LED Video Light Panel','Adjustable portable lighting for interviews, product shoots and compact sets.',86.00,array['/experience/creators-poster.jpg'],false,22,true),
('21000000-0000-4000-8000-000000000017','camera-rig-cage','10000000-0000-4000-8000-000000000006','Professional Camera Rig Cage','Expandable protective rig support for monitors, microphones and production accessories.',118.00,array['/catalog/categories/cinematography.webp'],false,15,true),
('21000000-0000-4000-8000-000000000018','camera-storage-case','10000000-0000-4000-8000-000000000006','Protective Camera Storage Case','Padded compartment case for cameras, lenses, batteries and memory cards.',74.00,array['/catalog/products/camera-gimbal-pro.webp'],false,24,true)
on conflict (id) do update set name=excluded.name,description=excluded.description,price=excluded.price,image_urls=excluded.image_urls,stock_qty=excluded.stock_qty,is_active=true;

insert into public.product_variants (id, product_id, name, price_delta, stock_qty)
select gen_random_uuid(), p.id, 'Standard', 0, p.stock_qty
from public.products p
where p.id::text like '21000000-0000-4000-8000-%'
and not exists (select 1 from public.product_variants v where v.product_id=p.id);

commit;
