-- Wow & Amazing Phase 3 image correction
-- Run after 202607120003_catalog_product_detail.sql.

update public.products set image_urls = array['/catalog/products/wireless-earbuds-pro.webp'] where slug = 'wireless-earbuds-pro';
update public.products set image_urls = array['/catalog/products/creator-starter-kit.webp'] where slug = 'creator-starter-kit';
update public.products set image_urls = array['/catalog/products/gourmet-pasta-bowl.webp'] where slug = 'gourmet-pasta-bowl';
update public.products set image_urls = array['/catalog/products/eco-food-box-50pcs.webp'] where slug = 'eco-food-box-50pcs';
update public.products set image_urls = array['/catalog/products/wall-art-abstract.webp'] where slug = 'wall-art-abstract';
update public.products set image_urls = array['/catalog/products/camera-gimbal-pro.webp'] where slug = 'camera-gimbal-pro';

update public.categories set image_url = '/catalog/categories/gadgets-accessories.webp' where slug = 'gadgets-accessories';
update public.categories set image_url = '/catalog/categories/creator-kits.webp' where slug = 'creator-kits';
update public.categories set image_url = '/catalog/categories/restaurant-food.webp' where slug = 'restaurant-food';
update public.categories set image_url = '/catalog/categories/food-packaging.webp' where slug = 'food-packaging';
update public.categories set image_url = '/catalog/categories/housing-decor.webp' where slug = 'housing-decor';
update public.categories set image_url = '/catalog/categories/cinematography.webp' where slug = 'cinematography';
