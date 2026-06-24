create extension if not exists pgcrypto with schema extensions;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 50),
  locale text not null default 'en' check (locale in ('en', 'ru')),
  onboarding_completed boolean not null default false,
  goals text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.mood_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null check (mood in ('great', 'good', 'okay', 'low', 'rough')),
  intensity smallint not null check (intensity between 1 and 5),
  tags text[] not null default '{}',
  note text check (char_length(note) <= 1000),
  created_at timestamptz not null default now()
);

create table public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 120),
  body text not null check (char_length(body) between 1 and 20000),
  prompt_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text check (char_length(title) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null check (char_length(content) between 1 and 12000),
  safety_flag boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.exercise_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  exercise_key text not null check (char_length(exercise_key) between 1 and 80),
  completed_at timestamptz not null default now()
);

create index mood_entries_user_created_idx on public.mood_entries(user_id, created_at desc);
create index journal_entries_user_updated_idx on public.journal_entries(user_id, updated_at desc);
create index chat_sessions_user_updated_idx on public.chat_sessions(user_id, updated_at desc);
create index chat_messages_session_created_idx on public.chat_messages(session_id, created_at);
create index exercise_completions_user_created_idx on public.exercise_completions(user_id, completed_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger journal_entries_updated_at before update on public.journal_entries
for each row execute function public.set_updated_at();
create trigger chat_sessions_updated_at before update on public.chat_sessions
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.mood_entries enable row level security;
alter table public.journal_entries enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.exercise_completions enable row level security;

create policy "profiles_select_own" on public.profiles for select using ((select auth.uid()) = id);
create policy "profiles_update_own" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "moods_select_own" on public.mood_entries for select using ((select auth.uid()) = user_id);
create policy "moods_insert_own" on public.mood_entries for insert with check ((select auth.uid()) = user_id);
create policy "moods_update_own" on public.mood_entries for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "moods_delete_own" on public.mood_entries for delete using ((select auth.uid()) = user_id);

create policy "journals_select_own" on public.journal_entries for select using ((select auth.uid()) = user_id);
create policy "journals_insert_own" on public.journal_entries for insert with check ((select auth.uid()) = user_id);
create policy "journals_update_own" on public.journal_entries for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "journals_delete_own" on public.journal_entries for delete using ((select auth.uid()) = user_id);

create policy "sessions_select_own" on public.chat_sessions for select using ((select auth.uid()) = user_id);
create policy "sessions_insert_own" on public.chat_sessions for insert with check ((select auth.uid()) = user_id);
create policy "sessions_update_own" on public.chat_sessions for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "sessions_delete_own" on public.chat_sessions for delete using ((select auth.uid()) = user_id);

create policy "messages_select_own" on public.chat_messages for select using ((select auth.uid()) = user_id);
create policy "messages_insert_own" on public.chat_messages for insert with check (
  (select auth.uid()) = user_id and exists (
    select 1 from public.chat_sessions s where s.id = session_id and s.user_id = (select auth.uid())
  )
);
create policy "messages_update_own" on public.chat_messages for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "messages_delete_own" on public.chat_messages for delete using ((select auth.uid()) = user_id);

create policy "exercises_select_own" on public.exercise_completions for select using ((select auth.uid()) = user_id);
create policy "exercises_insert_own" on public.exercise_completions for insert with check ((select auth.uid()) = user_id);
create policy "exercises_delete_own" on public.exercise_completions for delete using ((select auth.uid()) = user_id);

create or replace function public.delete_current_user_data()
returns void language plpgsql security definer set search_path = '' as $$
declare current_user_id uuid := auth.uid();
begin
  if current_user_id is null then raise exception 'Authentication required'; end if;
  delete from auth.users where id = current_user_id;
end;
$$;

revoke all on function public.delete_current_user_data() from public;
grant execute on function public.delete_current_user_data() to authenticated;
