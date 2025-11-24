-- Create pages table
create table if not exists public.pages (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  name text not null,
  slug text not null,
  description text null,
  schema jsonb null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Primary Key
  constraint pages_pkey primary key (id),

  -- Unique Slug
  constraint pages_slug_key unique (slug),

  -- Foreign Key to auth.users
  constraint pages_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Index for user_id
create index if not exists pages_user_id_idx on public.pages (user_id);

-- Enable RLS
alter table public.pages enable row level security;

-- RLS Policies
create policy "Users can view own pages"
on public.pages for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own pages"
on public.pages for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own pages"
on public.pages for update
to authenticated
using (auth.uid() = user_id);

create policy "Users can delete own pages"
on public.pages for delete
to authenticated
using (auth.uid() = user_id);

-- RPC: get_tables
-- Returns a list of table names in the public schema
create or replace function get_tables()
returns table (table_name text)
language plpgsql
security definer
as $$
begin
  return query
  select t.table_name::text
  from information_schema.tables t
  where t.table_schema = 'public'
    and t.table_type = 'BASE TABLE';
end;
$$;

-- RPC: get_columns
-- Returns column details for a specific table
create or replace function get_columns(table_name_param text)
returns table (
  column_name text,
  data_type text,
  is_nullable boolean,
  is_primary_key boolean
)
language plpgsql
security definer
as $$
begin
  return query
  select
    c.column_name::text,
    c.data_type::text,
    (c.is_nullable = 'YES'),
    (exists (
      select 1
      from information_schema.table_constraints tc
      join information_schema.key_column_usage kcu
        on kcu.constraint_name = tc.constraint_name
        and kcu.table_schema = tc.table_schema
      where tc.constraint_type = 'PRIMARY KEY'
        and tc.table_name = c.table_name
        and kcu.column_name = c.column_name
        and tc.table_schema = 'public'
    ))
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = table_name_param
  order by c.ordinal_position;
end;
$$;
