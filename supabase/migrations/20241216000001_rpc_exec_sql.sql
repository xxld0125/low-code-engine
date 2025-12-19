-- Create a function to execute arbitrary SQL
-- WARN: This is dangerous and should be protected by RLS or restricted service role access.
-- In this prototype, we assume the caller is an admin or we will add checks later.
create or replace function public.exec_sql(sql_query text)
returns void
language plpgsql
security definer
as $$
begin
  execute sql_query;
end;
$$;
