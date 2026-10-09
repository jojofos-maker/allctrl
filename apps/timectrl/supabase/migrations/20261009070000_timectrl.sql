create table public.timectrl_states (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null, updated_at bigint not null
);
create table public.timectrl_history (
 user_id uuid not null references auth.users(id) on delete cascade,
 date date not null, state jsonb not null, updated_at bigint not null,
 primary key(user_id,date)
);
create table public.timectrl_reports (
 user_id uuid primary key references auth.users(id) on delete cascade,
 email_id text not null, report_date date not null, scheduled_at timestamptz not null
);
create table public.timectrl_legacy_imports (
 email text primary key, state jsonb, days jsonb not null default '[]'::jsonb,
 imported_at timestamptz not null default now()
);
alter table public.timectrl_states enable row level security;
alter table public.timectrl_history enable row level security;
alter table public.timectrl_reports enable row level security;
alter table public.timectrl_legacy_imports enable row level security;
create policy own_state on public.timectrl_states for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_history on public.timectrl_history for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_reports on public.timectrl_reports for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy own_legacy on public.timectrl_legacy_imports for select to authenticated using (email = lower((select auth.jwt())->>'email'));
revoke all on public.timectrl_states, public.timectrl_history, public.timectrl_reports, public.timectrl_legacy_imports from anon;
grant select,insert,update,delete on public.timectrl_states, public.timectrl_history, public.timectrl_reports to authenticated;
grant select on public.timectrl_legacy_imports to authenticated;

create function public.timectrl_save_state(new_state jsonb) returns boolean
language plpgsql security invoker set search_path = '' as $$
declare changed integer; previous jsonb; revision bigint;
begin
 if auth.uid() is null then raise exception 'Unauthenticated'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 revision := (new_state->>'updatedAt')::bigint;
 select state into previous from public.timectrl_states where user_id = auth.uid();
 if previous is not null and (previous->>'updatedAt')::bigint > revision then return false; end if;
 if previous is not null then
  insert into public.timectrl_history(user_id,date,state,updated_at)
  values(auth.uid(),(previous->>'date')::date,previous,(previous->>'updatedAt')::bigint)
  on conflict(user_id,date) do update set state=excluded.state,updated_at=excluded.updated_at where excluded.updated_at > timectrl_history.updated_at;
 end if;
 insert into public.timectrl_states(user_id,state,updated_at) values(auth.uid(),new_state,revision)
 on conflict(user_id) do update set state=excluded.state,updated_at=excluded.updated_at where excluded.updated_at > timectrl_states.updated_at;
 get diagnostics changed = row_count;
 if changed=0 then return false; end if;
 insert into public.timectrl_history(user_id,date,state,updated_at) values(auth.uid(),(new_state->>'date')::date,new_state,revision)
 on conflict(user_id,date) do update set state=excluded.state,updated_at=excluded.updated_at where excluded.updated_at >= timectrl_history.updated_at;
 return true;
end; $$;

create function public.timectrl_seed_legacy() returns void
language plpgsql security invoker set search_path = '' as $$
declare imported record; item jsonb; safe_state jsonb;
begin
 if auth.uid() is null then raise exception 'Unauthenticated'; end if;
 perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text,0));
 select * into imported from public.timectrl_legacy_imports where email=lower(auth.jwt()->>'email');
 if not found then return; end if;
 for item in select value from jsonb_array_elements(imported.days) loop
  insert into public.timectrl_history(user_id,date,state,updated_at) values(auth.uid(),(item->>'date')::date,item,coalesce((item->>'updatedAt')::bigint,0)) on conflict do nothing;
 end loop;
 if imported.state is not null then
  safe_state := jsonb_set(imported.state,'{reportSettings,enabled}','false'::jsonb);
  insert into public.timectrl_states(user_id,state,updated_at) values(auth.uid(),safe_state,coalesce((safe_state->>'updatedAt')::bigint,0)) on conflict do nothing;
 end if;
end; $$;
revoke all on function public.timectrl_save_state(jsonb), public.timectrl_seed_legacy() from public,anon;
grant execute on function public.timectrl_save_state(jsonb), public.timectrl_seed_legacy() to authenticated;
