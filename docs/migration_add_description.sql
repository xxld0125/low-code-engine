-- Add description column
alter table public.pages
add column if not exists description text null;
