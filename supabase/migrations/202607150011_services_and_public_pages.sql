-- Wow & Amazing — Services module, enquiries, contact inbox, and public content foundation
-- Run after 202607150010_paystack_ngn_currency_hotfix.sql.
-- Safe additive migration: no existing catalog, customer, order, or payment data is deleted.

begin;

alter table public.services
  add column if not exists short_description text,
  add column if not exists price_from numeric(12,2) check (price_from is null or price_from >= 0),
  add column if not exists turnaround text,
  add column if not exists deliverables text[] not null default '{}',
  add column if not exists is_active boolean not null default true,
  add column if not exists sort_order integer not null default 0;

create index if not exists services_active_sort_idx
  on public.services(is_active, sort_order, created_at);

create table if not exists public.service_inquiries (
  id uuid primary key default gen_random_uuid(),
  service_id uuid references public.services(id) on delete set null,
  service_title text not null,
  full_name text not null,
  email text not null,
  phone text,
  company text,
  budget text,
  preferred_date date,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'booked', 'completed', 'closed')),
  owner_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_inquiry_email_format check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

create index if not exists service_inquiries_status_created_idx
  on public.service_inquiries(status, created_at desc);
create index if not exists service_inquiries_email_idx
  on public.service_inquiries(lower(email));

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'closed')),
  owner_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contact_message_email_format check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$')
);

create index if not exists contact_messages_status_created_idx
  on public.contact_messages(status, created_at desc);
create index if not exists contact_messages_email_idx
  on public.contact_messages(lower(email));

drop trigger if exists service_inquiries_set_updated_at on public.service_inquiries;
create trigger service_inquiries_set_updated_at
before update on public.service_inquiries
for each row execute function public.set_updated_at();

drop trigger if exists contact_messages_set_updated_at on public.contact_messages;
create trigger contact_messages_set_updated_at
before update on public.contact_messages
for each row execute function public.set_updated_at();

alter table public.service_inquiries enable row level security;
alter table public.contact_messages enable row level security;

-- Public users only see active services. Owners can inspect drafts.
drop policy if exists "Public can read services" on public.services;
create policy "Public can read active services"
on public.services for select
to anon, authenticated
using (is_active = true or public.is_owner());

-- Owner access to service and contact inboxes.
drop policy if exists "Owners can manage service inquiries" on public.service_inquiries;
create policy "Owners can manage service inquiries"
on public.service_inquiries for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Owners can manage contact messages" on public.contact_messages;
create policy "Owners can manage contact messages"
on public.contact_messages for all
to authenticated
using (public.is_owner())
with check (public.is_owner());

grant select on public.services to anon, authenticated;
grant select, insert, update, delete on public.services to authenticated;
grant select, insert, update, delete on public.service_inquiries, public.contact_messages to authenticated;
grant select, insert, update, delete on public.service_inquiries, public.contact_messages to service_role;

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
    'photography-videography',
    'Photography & Videography',
    'Premium visual production for products, people, events, and brands.',
    'Professional photography and videography planned around your goals, audience, and preferred visual direction. Every project is scoped before production so the final work is purposeful, polished, and ready to use.',
    null,
    'Timeline confirmed after consultation',
    array['Creative consultation', 'Production planning', 'Professionally edited final assets'],
    true,
    1
  ),
  (
    'brand-packaging-design',
    'Brand & Packaging Design',
    'Distinctive brand and packaging systems designed to communicate quality.',
    'A structured design service for businesses that need a stronger visual identity, packaging direction, or product presentation. The process moves from discovery through design development and final production-ready files.',
    null,
    'Timeline confirmed after consultation',
    array['Brand or packaging discovery', 'Design concepts and refinement', 'Production-ready final files'],
    true,
    2
  ),
  (
    'content-creation',
    'Content Creation',
    'Strategic visual and written content for consistent brand communication.',
    'Content planning and production designed for campaigns, launches, social channels, and ongoing brand communication. Deliverables are agreed in advance so each project remains focused and measurable.',
    null,
    'Timeline confirmed after consultation',
    array['Content direction', 'Agreed content deliverables', 'Ready-to-publish final assets'],
    true,
    3
  ),
  (
    'product-styling',
    'Product Styling',
    'Thoughtful product presentation for photography, retail, and campaigns.',
    'A focused styling service that prepares products, props, surfaces, and visual arrangements for stronger presentation. It can be booked independently or combined with photography and content production.',
    null,
    'Timeline confirmed after consultation',
    array['Styling consultation', 'Visual arrangement and prop direction', 'On-set or presentation support'],
    true,
    4
  )
on conflict (slug) do update set
  title = excluded.title,
  short_description = excluded.short_description,
  description = excluded.description,
  turnaround = excluded.turnaround,
  deliverables = excluded.deliverables,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

commit;
