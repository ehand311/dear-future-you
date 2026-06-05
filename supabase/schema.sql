create table if not exists public.children (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age text not null default 'Age not set',
  tone text not null default 'bg-rose-100 text-rose-700',
  created_at timestamptz not null default now()
);

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  child_name text not null,
  type text not null,
  body text not null,
  memory_date date not null default current_date,
  accent text not null default 'border-slate-200',
  created_at timestamptz not null default now()
);

create table if not exists public.letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  child_id uuid references public.children(id) on delete set null,
  title text not null,
  body text not null,
  month text not null,
  source_memory_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

alter table public.children enable row level security;
alter table public.memories enable row level security;
alter table public.letters enable row level security;

drop policy if exists "Users can read own children" on public.children;
create policy "Users can read own children"
  on public.children for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own children" on public.children;
create policy "Users can insert own children"
  on public.children for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own children" on public.children;
create policy "Users can update own children"
  on public.children for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own children" on public.children;
create policy "Users can delete own children"
  on public.children for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own memories" on public.memories;
create policy "Users can read own memories"
  on public.memories for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own memories" on public.memories;
create policy "Users can insert own memories"
  on public.memories for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own memories" on public.memories;
create policy "Users can update own memories"
  on public.memories for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own memories" on public.memories;
create policy "Users can delete own memories"
  on public.memories for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own letters" on public.letters;
create policy "Users can read own letters"
  on public.letters for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own letters" on public.letters;
create policy "Users can insert own letters"
  on public.letters for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own letters" on public.letters;
create policy "Users can update own letters"
  on public.letters for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can delete own letters" on public.letters;
create policy "Users can delete own letters"
  on public.letters for delete
  using (auth.uid() = user_id);
