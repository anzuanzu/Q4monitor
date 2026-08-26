-- 在 Supabase Dashboard 的 SQL Editor 執行此檔案。
-- 不要在 GitHub Pages 或 config.js 放入 service_role key。

create table if not exists public.performance_records (
  branch text not null,
  advisor_name text not null,
  quarter_target text not null default '',
  quarter_progress text not null default '',
  quarter_rate text not null default '',
  fund_progress text not null default '',
  insurance_progress text not null default '',
  source_date text not null default '',
  updated_at timestamptz not null default now(),
  updated_by uuid not null default auth.uid(),
  primary key (branch, advisor_name)
);

alter table public.performance_records add column if not exists source_date text not null default '';

create table if not exists public.app_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  created_at timestamptz not null default now()
);

alter table public.performance_records enable row level security;
alter table public.app_members enable row level security;

create or replace function public.my_performance_role()
returns text language sql stable security definer set search_path = public
as $$ select role from public.app_members where user_id = auth.uid() $$;

create or replace function public.can_read_performance()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.app_members where user_id = auth.uid()) $$;

create or replace function public.can_write_performance()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.app_members where user_id = auth.uid() and role in ('admin', 'editor')) $$;

create or replace function public.set_performance_audit_fields()
returns trigger language plpgsql security invoker set search_path = public
as $$ begin new.updated_at = now(); new.updated_by = auth.uid(); return new; end; $$;

drop trigger if exists performance_records_audit on public.performance_records;
create trigger performance_records_audit before update on public.performance_records
for each row execute function public.set_performance_audit_fields();

drop policy if exists "Authorized members can view performance" on public.performance_records;
create policy "Authorized members can view performance" on public.performance_records for select to authenticated using (public.can_read_performance());
drop policy if exists "Editors can insert performance" on public.performance_records;
create policy "Editors can insert performance" on public.performance_records for insert to authenticated with check (public.can_write_performance());
drop policy if exists "Editors can update performance" on public.performance_records;
create policy "Editors can update performance" on public.performance_records for update to authenticated using (public.can_write_performance()) with check (public.can_write_performance());

grant usage on schema public to authenticated;
grant select, insert, update on public.performance_records to authenticated;
grant execute on function public.my_performance_role() to authenticated;
grant execute on function public.can_read_performance() to authenticated;
grant execute on function public.can_write_performance() to authenticated;

-- 在 Supabase Authentication 建立／邀請使用者後，將該使用者 UUID 加入以下表格：
-- insert into public.app_members (user_id, role) values ('貼上使用者 UUID', 'admin');
-- role 可使用：admin（管理者）、editor（可上傳）、viewer（唯讀）。
