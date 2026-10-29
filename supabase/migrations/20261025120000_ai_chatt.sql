-- AI-chatten: logg och dagstak. Körs av Leon i SQL-editorn. Samma fil finns i
-- Elpoolens repo (external-supabase/sql/chatt_logg.sql).
--
-- chatt_logg: en rad per fråga. Frågan och svaret sparas med e-post, telefon,
-- personnummer och långa nummer bortplockade redan i workern (rensaPersonuppgifter
-- i src/lib/chatt/skydd.ts). Ingen IP-adress, ingen user agent, inget i
-- webbläsaren. samtal_id är ett slumptal per samtal, bara för att knyta ihop
-- frågorna i samma samtal. Rader äldre än 90 dagar raderas automatiskt.
--
-- Tabellen går inte att läsa eller skriva direkt med den publika nyckeln. Workern
-- skriver via logga_chatt() och frågar chatt_kvot() om dagens tak.
--
-- Bara workern får skriva: funktionerna kräver en hemlig nyckel som skapas
-- här nedan. Efter körningen, hämta den med
--   select nyckel from public.chatt_installning;
-- och lägg den som hemligheten CHATT_DB_NYCKEL på workern i Cloudflare. Utan
-- nyckeln fungerar chatten ändå, men inget loggas och dagstaket räknas per worker.

create table if not exists public.chatt_logg (
  id uuid primary key default gen_random_uuid(),
  skapad timestamptz not null default now(),
  sajt text not null,
  samtal_id uuid,
  tur integer,
  sida text,
  fraga text,
  svar text,
  verktyg text[] not null default '{}',
  atgarder text[] not null default '{}',
  modell text,
  tokens_in integer,
  tokens_ut integer,
  cache_las integer,
  cache_skriv integer,
  svarstid_ms integer,
  fel text
);

comment on table public.chatt_logg is
  'AI-chatten: frågor och svar utan personuppgifter, för att förbättra svaren och sajten. Raderas efter 90 dagar. Ingen publik åtkomst.';

create index if not exists chatt_logg_skapad on public.chatt_logg (skapad);
create index if not exists chatt_logg_sajt_skapad on public.chatt_logg (sajt, skapad);

alter table public.chatt_logg enable row level security;
revoke all on public.chatt_logg from anon, authenticated;

create table if not exists public.chatt_installning (
  nyckel text primary key
);
alter table public.chatt_installning enable row level security;
revoke all on public.chatt_installning from anon, authenticated;

-- 64 tecken ur två slumpade uuid (kryptografiskt slumptal i Postgres).
insert into public.chatt_installning (nyckel)
select replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')
where not exists (select 1 from public.chatt_installning);

create or replace function public.chatt_nyckel_ok(p_nyckel text)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (select 1 from public.chatt_installning where nyckel = coalesce(p_nyckel, ''));
$$;
revoke all on function public.chatt_nyckel_ok(text) from public, anon, authenticated;

create or replace function public.logga_chatt(p_rad jsonb, p_nyckel text default null)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_samtal uuid;
begin
  if not public.chatt_nyckel_ok(p_nyckel)
     or coalesce(p_rad->>'sajt', '') not in ('elpoolen', 'mobilpoolen') then
    return;
  end if;
  if (p_rad->>'samtal_id') ~* '^[0-9a-f-]{36}$' then
    v_samtal := (p_rad->>'samtal_id')::uuid;
  end if;

  insert into public.chatt_logg (
    sajt, samtal_id, tur, sida, fraga, svar, verktyg, atgarder, modell,
    tokens_in, tokens_ut, cache_las, cache_skriv, svarstid_ms, fel
  ) values (
    left(coalesce(p_rad->>'sajt', 'okand'), 20),
    v_samtal,
    least(greatest(coalesce((p_rad->>'tur')::int, 0), 0), 1000),
    left(p_rad->>'sida', 200),
    left(p_rad->>'fraga', 1000),
    left(p_rad->>'svar', 4000),
    coalesce((select array_agg(left(x, 40)) from (select jsonb_array_elements_text(p_rad->'verktyg') x limit 20) v), '{}'),
    coalesce((select array_agg(left(x, 40)) from (select jsonb_array_elements_text(p_rad->'atgarder') x limit 10) a), '{}'),
    left(p_rad->>'modell', 60),
    (p_rad->>'tokens_in')::int,
    (p_rad->>'tokens_ut')::int,
    (p_rad->>'cache_las')::int,
    (p_rad->>'cache_skriv')::int,
    (p_rad->>'svarstid_ms')::int,
    left(p_rad->>'fel', 40)
  );

  -- Gallring: billig tack vare indexet på skapad.
  delete from public.chatt_logg where skapad < now() - interval '90 days';
end;
$$;

-- True om sajten har kvar av dagens tak (svensk tid).
create or replace function public.chatt_kvot(p_sajt text, p_tak integer, p_nyckel text default null)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  -- Null vid fel nyckel: då räknar workern med sitt eget tak i stället för att stänga chatten.
  select case
    when not public.chatt_nyckel_ok(p_nyckel) then null
    else (
      select count(*) from public.chatt_logg
      where sajt = p_sajt
        and skapad >= (date_trunc('day', now() at time zone 'Europe/Stockholm') at time zone 'Europe/Stockholm')
    ) < least(greatest(coalesce(p_tak, 0), 0), 20000)
  end;
$$;

revoke all on function public.logga_chatt(jsonb, text) from public, authenticated;
revoke all on function public.chatt_kvot(text, integer, text) from public, authenticated;
grant execute on function public.logga_chatt(jsonb, text) to anon;
grant execute on function public.chatt_kvot(text, integer, text) to anon;
