-- Wow & Amazing — Phase 2 locked catalog seed
-- Categories and products match Sections 4.5, 4.6, and 10 of the build specification.

insert into public.categories (id, slug, name, description, image_url, sort_order)
values
  ('10000000-0000-4000-8000-000000000001', 'gadgets-accessories', 'Gadgets & Accessories', 'Smart tech for modern life', '/catalog/categories/gadgets-accessories.svg', 1),
  ('10000000-0000-4000-8000-000000000002', 'creator-kits', 'Creator Kits', 'Tools for creators and innovators', '/catalog/categories/creator-kits.svg', 2),
  ('10000000-0000-4000-8000-000000000003', 'restaurant-food', 'Restaurant Food', 'Delicious meals, delivered fresh', '/catalog/categories/restaurant-food.svg', 3),
  ('10000000-0000-4000-8000-000000000004', 'food-packaging', 'Food Packaging', 'Sustainable. Safe. Stylish.', '/catalog/categories/food-packaging.svg', 4),
  ('10000000-0000-4000-8000-000000000005', 'housing-decor', 'Housing & Decor', 'Design. Décor. Transform.', '/catalog/categories/housing-decor.svg', 5),
  ('10000000-0000-4000-8000-000000000006', 'cinematography', 'Cinematography', 'Capture. Create. Cinematic.', '/catalog/categories/cinematography.svg', 6)
on conflict (id) do update set
  slug = excluded.slug,
  name = excluded.name,
  description = excluded.description,
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

insert into public.products (
  id,
  slug,
  category_id,
  name,
  description,
  price,
  image_urls,
  is_featured,
  stock_qty
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'wireless-earbuds-pro',
    '10000000-0000-4000-8000-000000000001',
    'Wireless Earbuds Pro',
    'Premium wireless listening for work, travel, and everyday life.',
    79.99,
    array['/catalog/products/wireless-earbuds-pro.svg'],
    true,
    40
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'creator-starter-kit',
    '10000000-0000-4000-8000-000000000002',
    'Creator Starter Kit',
    'A practical essentials bundle for creators building their next idea.',
    199.00,
    array['/catalog/products/creator-starter-kit.svg'],
    true,
    24
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    'gourmet-pasta-bowl',
    '10000000-0000-4000-8000-000000000003',
    'Gourmet Pasta Bowl',
    'A fresh, flavourful pasta bowl prepared for an elevated meal.',
    14.99,
    array['/catalog/products/gourmet-pasta-bowl.svg'],
    true,
    60
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    'eco-food-box-50pcs',
    '10000000-0000-4000-8000-000000000004',
    'Eco Food Box (50pcs)',
    'Durable food boxes designed for practical, responsible packaging.',
    19.99,
    array['/catalog/products/eco-food-box-50pcs.svg'],
    true,
    80
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    'wall-art-abstract',
    '10000000-0000-4000-8000-000000000005',
    'Wall Art – Abstract',
    'A refined abstract statement piece for modern interiors.',
    49.99,
    array['/catalog/products/wall-art-abstract.svg'],
    true,
    18
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    'camera-gimbal-pro',
    '10000000-0000-4000-8000-000000000006',
    'Camera Gimbal Pro',
    'Stable, smooth motion support for professional-looking footage.',
    249.00,
    array['/catalog/products/camera-gimbal-pro.svg'],
    true,
    16
  )
on conflict (id) do update set
  slug = excluded.slug,
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  image_urls = excluded.image_urls,
  is_featured = excluded.is_featured,
  stock_qty = excluded.stock_qty;

insert into public.services (id, slug, title, description, image_url)
values
  ('30000000-0000-4000-8000-000000000001', 'photography-videography', 'Photography & Videography', 'Premium visuals created to present your people, products, and story with clarity.', null),
  ('30000000-0000-4000-8000-000000000002', 'brand-packaging-design', 'Brand & Packaging Design', 'Thoughtful identity and packaging systems that make every product feel considered.', null),
  ('30000000-0000-4000-8000-000000000003', 'content-creation', 'Content Creation', 'Purposeful content shaped for campaigns, platforms, and consistent brand growth.', null),
  ('30000000-0000-4000-8000-000000000004', 'product-styling', 'Product Styling', 'Art direction and styling that help products look polished, distinctive, and ready to sell.', null)
on conflict (id) do update set
  slug = excluded.slug,
  title = excluded.title,
  description = excluded.description,
  image_url = excluded.image_url;
