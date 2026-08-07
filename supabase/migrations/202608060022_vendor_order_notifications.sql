-- Wow & Amazing — Phase 8F vendor order notifications
-- Adds the private admin notification centre, delivery audit history, unread
-- state, and database-side event queuing. External email/WhatsApp delivery is
-- performed by the Next.js server using service-role access.

begin;

create table if not exists public.business_notifications (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  event_type text not null check (event_type in (
    'order_paid',
    'rental_paid',
    'service_inquiry',
    'contact_message',
    'payment_review',
    'low_stock',
    'test'
  )),
  title text not null,
  body text not null,
  href text,
  order_id uuid references public.orders(id) on delete cascade,
  service_inquiry_id uuid references public.service_inquiries(id) on delete cascade,
  contact_message_id uuid references public.contact_messages(id) on delete cascade,
  is_test_data boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid not null references public.business_notifications(id) on delete cascade,
  channel text not null check (channel in ('email', 'whatsapp')),
  provider text not null,
  recipient text not null,
  status text not null default 'pending' check (status in (
    'pending',
    'queued',
    'sent',
    'delivered',
    'read',
    'failed',
    'skipped'
  )),
  provider_message_id text,
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (notification_id, channel, recipient)
);

create index if not exists business_notifications_created_idx
  on public.business_notifications(created_at desc);
create index if not exists business_notifications_unread_idx
  on public.business_notifications(created_at desc)
  where read_at is null and is_test_data = false;
create index if not exists business_notifications_order_idx
  on public.business_notifications(order_id)
  where order_id is not null;
create index if not exists notification_deliveries_notification_idx
  on public.notification_deliveries(notification_id, created_at desc);
create index if not exists notification_deliveries_provider_message_idx
  on public.notification_deliveries(provider_message_id)
  where provider_message_id is not null;

comment on table public.business_notifications is
  'Private owner notification inbox for paid orders, rentals, and customer enquiries.';
comment on table public.notification_deliveries is
  'Audit history for vendor email and WhatsApp delivery attempts.';

-- Reuse the existing updated_at helper from the foundation migration.
drop trigger if exists business_notifications_set_updated_at on public.business_notifications;
create trigger business_notifications_set_updated_at
before update on public.business_notifications
for each row execute function public.set_updated_at();

drop trigger if exists notification_deliveries_set_updated_at on public.notification_deliveries;
create trigger notification_deliveries_set_updated_at
before update on public.notification_deliveries
for each row execute function public.set_updated_at();

-- Atomically claim a delivery before calling an external provider. This
-- prevents the Paystack callback and webhook from sending the same alert twice
-- when they arrive at nearly the same time.
create or replace function public.claim_notification_delivery(
  p_notification_id uuid,
  p_channel text,
  p_provider text,
  p_recipient text
)
returns table (
  result_delivery_id uuid,
  result_should_send boolean,
  result_status text,
  result_attempts integer
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_delivery public.notification_deliveries%rowtype;
begin
  insert into public.notification_deliveries (
    notification_id,
    channel,
    provider,
    recipient,
    status
  ) values (
    p_notification_id,
    p_channel,
    p_provider,
    p_recipient,
    'pending'
  )
  on conflict (notification_id, channel, recipient) do nothing;

  select *
  into v_delivery
  from public.notification_deliveries
  where notification_id = p_notification_id
    and channel = p_channel
    and recipient = p_recipient
  for update;

  if v_delivery.status in ('queued', 'sent', 'delivered', 'read') then
    return query select v_delivery.id, false, v_delivery.status, v_delivery.attempts;
    return;
  end if;

  -- A recent pending row is already being handled by another server request.
  if v_delivery.status = 'pending'
     and v_delivery.attempts > 0
     and v_delivery.updated_at > now() - interval '2 minutes'
  then
    return query select v_delivery.id, false, v_delivery.status, v_delivery.attempts;
    return;
  end if;

  update public.notification_deliveries
  set status = 'pending',
      attempts = attempts + 1,
      last_error = null,
      updated_at = now()
  where id = v_delivery.id
  returning * into v_delivery;

  return query select v_delivery.id, true, v_delivery.status, v_delivery.attempts;
end;
$$;

revoke all on function public.claim_notification_delivery(uuid, text, text, text) from public;
grant execute on function public.claim_notification_delivery(uuid, text, text, text) to service_role;

-- Queue the private in-dashboard alert in the same database transaction as the
-- order. The application then enriches it and sends configured external alerts.
create or replace function public.queue_paid_order_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status in ('paid'::public.order_status, 'processing'::public.order_status) then
    if tg_op = 'INSERT' then
      insert into public.business_notifications (
        event_key,
        event_type,
        title,
        body,
        href,
        order_id,
        is_test_data
      ) values (
        'order-paid:' || new.id::text,
        'order_paid',
        'New paid order ' || new.order_number,
        'A verified customer payment has created a new order.',
        '/admin/orders?order=' || new.id::text,
        new.id,
        coalesce(new.is_test_data, false)
      )
      on conflict (event_key) do nothing;
    elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
      insert into public.business_notifications (
        event_key,
        event_type,
        title,
        body,
        href,
        order_id,
        is_test_data
      ) values (
        'order-paid:' || new.id::text,
        'order_paid',
        'New paid order ' || new.order_number,
        'A verified customer payment has created a new order.',
        '/admin/orders?order=' || new.id::text,
        new.id,
        coalesce(new.is_test_data, false)
      )
      on conflict (event_key) do nothing;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_queue_paid_notification on public.orders;
create trigger orders_queue_paid_notification
after insert or update of status on public.orders
for each row execute function public.queue_paid_order_notification();

create or replace function public.queue_service_inquiry_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_notifications (
    event_key,
    event_type,
    title,
    body,
    href,
    service_inquiry_id,
    is_test_data
  ) values (
    'service-inquiry:' || new.id::text,
    'service_inquiry',
    'New service enquiry',
    coalesce(new.full_name, 'A customer') || ' requested ' || coalesce(new.service_title, 'a service') || '.',
    '/admin/inquiries?service=' || new.id::text,
    new.id,
    coalesce(new.is_test_data, false)
  )
  on conflict (event_key) do nothing;
  return new;
end;
$$;

drop trigger if exists service_inquiries_queue_notification on public.service_inquiries;
create trigger service_inquiries_queue_notification
after insert on public.service_inquiries
for each row execute function public.queue_service_inquiry_notification();

create or replace function public.queue_contact_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.business_notifications (
    event_key,
    event_type,
    title,
    body,
    href,
    contact_message_id,
    is_test_data
  ) values (
    'contact-message:' || new.id::text,
    'contact_message',
    'New contact message',
    coalesce(new.full_name, 'A customer') || ' sent: ' || coalesce(new.subject, 'Website enquiry') || '.',
    '/admin/inquiries?contact=' || new.id::text,
    new.id,
    coalesce(new.is_test_data, false)
  )
  on conflict (event_key) do nothing;
  return new;
end;
$$;

drop trigger if exists contact_messages_queue_notification on public.contact_messages;
create trigger contact_messages_queue_notification
after insert on public.contact_messages
for each row execute function public.queue_contact_message_notification();

alter table public.business_notifications enable row level security;
alter table public.notification_deliveries enable row level security;

drop policy if exists "Owners can read business notifications" on public.business_notifications;
create policy "Owners can read business notifications"
on public.business_notifications for select
to authenticated
using (public.is_owner());

drop policy if exists "Owners can update business notifications" on public.business_notifications;
create policy "Owners can update business notifications"
on public.business_notifications for update
to authenticated
using (public.is_owner())
with check (public.is_owner());

drop policy if exists "Owners can read notification deliveries" on public.notification_deliveries;
create policy "Owners can read notification deliveries"
on public.notification_deliveries for select
to authenticated
using (public.is_owner());

grant select, update on public.business_notifications to authenticated;
grant select on public.notification_deliveries to authenticated;
grant select, insert, update, delete on public.business_notifications, public.notification_deliveries to service_role;

commit;
