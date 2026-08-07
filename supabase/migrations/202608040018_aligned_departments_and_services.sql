-- Wow & Amazing — Phase 7B aligned public departments and service hubs
-- Public navigation is consolidated in the application without changing product category IDs.
-- This migration only aligns the public Services records. Existing enquiries are preserved.
begin;

insert into public.services (
  slug,
  title,
  short_description,
  description,
  price_from,
  turnaround,
  deliverables,
  is_active,
  sort_order
)
values
  (
    'food-catering',
    'Food & Catering',
    'Prepared meals and catering support for meetings, celebrations, events, and group orders.',
    'A coordinated food service for customers who need prepared meals, event catering, office food, family orders, or packaging support. Every request is reviewed by the owner before the menu, quantity, delivery arrangement, price, and date are confirmed.',
    null,
    'Schedule confirmed after consultation',
    array['Menu and quantity planning', 'Catering or group-order quotation', 'Collection or delivery arrangement'],
    true,
    1
  ),
  (
    'property-home-services',
    'Property & Home Services',
    'House-rental support, painting, finishing, decoration, and home-improvement enquiries.',
    'A single property and home-services point for rental enquiries, property viewings, painting, finishing, and interior decoration. The owner reviews the property or space, confirms the required work, and provides the appropriate next steps and quotation.',
    null,
    'Inspection or consultation arranged first',
    array['Property or space consultation', 'Painting and decoration scope', 'Quotation and service schedule'],
    true,
    2
  ),
  (
    'media-production',
    'Media Production',
    'Photography, videography, and content production for brands, people, products, and events.',
    'Professional media production planned around the purpose, audience, location, and final platform. Projects can include photography, videography, interviews, event coverage, product visuals, and edited content assets.',
    null,
    'Timeline confirmed after consultation',
    array['Creative and production consultation', 'Photography or video production', 'Professionally edited final assets'],
    true,
    3
  ),
  (
    'gadget-equipment-rentals',
    'Gadget & Equipment Rentals',
    'Camera, lighting, audio, and creator equipment requested for productions and events.',
    'A managed rental-enquiry service for cameras, stabilisers, lighting, microphones, tripods, and other creator or production equipment. Availability, rental period, security terms, pickup or delivery, and final pricing are confirmed before booking.',
    null,
    'Availability confirmed before booking',
    array['Equipment availability check', 'Rental period and terms', 'Pickup or delivery arrangement'],
    true,
    4
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  price_from = excluded.price_from,
  turnaround = excluded.turnaround,
  deliverables = excluded.deliverables,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- Retire only the original starter services. Their records and historical enquiries remain intact.
update public.services
set is_active = false
where slug in (
  'photography-videography',
  'brand-packaging-design',
  'content-creation',
  'product-styling'
);

commit;
