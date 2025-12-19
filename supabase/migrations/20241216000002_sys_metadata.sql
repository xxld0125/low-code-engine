create table if not exists public._sys_models (
  id uuid not null default gen_random_uuid(),
  name text not null, -- Display name
  table_name text not null, -- Physical table name
  description text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint _sys_models_pkey primary key (id),
  constraint _sys_models_table_name_unique unique (table_name)
);

create table if not exists public._sys_fields (
  id uuid not null default gen_random_uuid(),
  model_id uuid not null,
  name text not null, -- Display name
  key text not null, -- Physical column name
  type text not null, -- 'text', 'number', etc.
  description text null,
  config jsonb null default '{}'::jsonb, -- Store validation rules, options, relation config
  is_system boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint _sys_fields_pkey primary key (id),
  constraint _sys_fields_model_id_fkey foreign key (model_id) references public._sys_models(id) on delete cascade,
  constraint _sys_fields_model_key_unique unique (model_id, key)
);

-- RLS
alter table public._sys_models enable row level security;
alter table public._sys_fields enable row level security;

-- For development, allow authenticated users to do everything
create policy "Enable all for authenticated currently" on public._sys_models
  for all using (auth.role() = 'authenticated');

create policy "Enable all for authenticated currently" on public._sys_fields
  for all using (auth.role() = 'authenticated');
