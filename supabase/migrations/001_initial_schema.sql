-- ============================================================
-- Lumina Chat — Esquema inicial
-- ============================================================
-- Copiar/pegar este archivo en el SQL Editor de Supabase y ejecutar,
-- o correr `supabase db push` si usas la CLI.
-- ============================================================

-- Extensiones
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabla: conversations
-- Una fila por conversación de un usuario con Lumina.
-- ------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Nueva conversación',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists conversations_user_idx
  on public.conversations (user_id, updated_at desc);

-- ------------------------------------------------------------
-- Tabla: messages
-- ------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_conv_idx
  on public.messages (conversation_id, created_at asc);

-- ------------------------------------------------------------
-- Trigger: mantener updated_at de conversations al vuelo
-- ------------------------------------------------------------
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
     set updated_at = now()
   where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_touch_conversation on public.messages;
create trigger trg_touch_conversation
after insert on public.messages
for each row execute function public.touch_conversation();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- Conversations: cada usuario ve/modifica sólo las suyas
drop policy if exists conv_select on public.conversations;
create policy conv_select on public.conversations
  for select using (auth.uid() = user_id);

drop policy if exists conv_insert on public.conversations;
create policy conv_insert on public.conversations
  for insert with check (auth.uid() = user_id);

drop policy if exists conv_update on public.conversations;
create policy conv_update on public.conversations
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists conv_delete on public.conversations;
create policy conv_delete on public.conversations
  for delete using (auth.uid() = user_id);

-- Messages: mismo criterio
drop policy if exists msg_select on public.messages;
create policy msg_select on public.messages
  for select using (auth.uid() = user_id);

drop policy if exists msg_insert on public.messages;
create policy msg_insert on public.messages
  for insert with check (auth.uid() = user_id);

drop policy if exists msg_delete on public.messages;
create policy msg_delete on public.messages
  for delete using (auth.uid() = user_id);
