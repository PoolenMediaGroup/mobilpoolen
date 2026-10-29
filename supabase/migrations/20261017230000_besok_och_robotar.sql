-- Besöks- och robotlogg för Mobilpoolen. Samma modell som Elpoolen.
--
-- besok_dag räknar besök från människor per dag, kanal, källa, landningssida och
-- enhet. ai_bot_hits räknar sidhämtningar från sök- och AI-robotar per dag, robot
-- och sida. Båda skrivs av sajtens server (src/matning.ts). Inga cookies, ingen
-- IP-adress, ingen user agent sparas. Bara räknare.

create table if not exists public.besok_dag (
  dag date not null,
  kanal text not null,
  kalla text not null,
  sida text not null,
  enhet text not null,
  antal integer not null default 1,
  senast timestamptz not null default now(),
  primary key (dag, kanal, kalla, sida, enhet)
);

alter table public.besok_dag enable row level security;
revoke all on public.besok_dag from anon, authenticated;

create table if not exists public.ai_bot_hits (
  dag date not null,
  bot text not null,
  path text not null,
  antal integer not null default 1,
  senast timestamptz not null default now(),
  primary key (dag, bot, path)
);

alter table public.ai_bot_hits enable row level security;
revoke all on public.ai_bot_hits from anon, authenticated;

create or replace function public.logga_besok(p_kanal text, p_kalla text, p_sida text, p_enhet text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_kanal text;
  v_kalla text;
  v_sida text;
  v_enhet text;
begin
  -- Allt rensas och kortas så att ingen kan fylla tabellen med skräp.
  v_kanal := left(coalesce(nullif(p_kanal, ''), 'okand'), 40);
  if v_kanal !~ '^[a-z_]+(:[a-z0-9._\-]+)?$' then
    v_kanal := 'okand';
  end if;

  v_kalla := lower(left(coalesce(nullif(p_kalla, ''), '(ingen)'), 60));
  if v_kalla <> '(ingen)' and v_kalla !~ '^[a-z0-9._\-]+$' then
    v_kalla := 'annan';
  end if;

  v_sida := left(coalesce(nullif(p_sida, ''), '/'), 120);
  if v_sida !~ '^/[A-Za-z0-9/_.\-]*$' then
    v_sida := '/ogiltig';
  end if;

  v_enhet := case when p_enhet in ('mobil', 'dator') then p_enhet else 'okand' end;

  insert into besok_dag (dag, kanal, kalla, sida, enhet, antal, senast)
  values ((now() at time zone 'Europe/Stockholm')::date, v_kanal, v_kalla, v_sida, v_enhet, 1, now())
  on conflict (dag, kanal, kalla, sida, enhet)
  do update set antal = besok_dag.antal + 1, senast = now();
end;
$$;

revoke all on function public.logga_besok(text, text, text, text) from public;
grant execute on function public.logga_besok(text, text, text, text) to anon, authenticated;

-- Vilka robotar som räknas. Allt annat ignoreras.
create or replace function public.ai_bot_namn(p_ua text)
returns text
language sql
immutable
set search_path to 'public'
as $$
  select case
    when p_ua ilike '%OAI-SearchBot%'      then 'OAI-SearchBot'
    when p_ua ilike '%ChatGPT-User%'       then 'ChatGPT-User'
    when p_ua ilike '%GPTBot%'             then 'GPTBot'
    when p_ua ilike '%Claude-SearchBot%'   then 'Claude-SearchBot'
    when p_ua ilike '%Claude-User%'        then 'Claude-User'
    when p_ua ilike '%ClaudeBot%'          then 'ClaudeBot'
    when p_ua ilike '%PerplexityBot%'      then 'PerplexityBot'
    when p_ua ilike '%Perplexity-User%'    then 'Perplexity-User'
    when p_ua ilike '%Google-Extended%'    then 'Google-Extended'
    when p_ua ilike '%Google-InspectionTool%' then 'Google-InspectionTool'
    when p_ua ilike '%bingbot%'            then 'Bingbot'
    when p_ua ilike '%Googlebot%'          then 'Googlebot'
    when p_ua ilike '%Applebot%'           then 'Applebot'
    when p_ua ilike '%DuckDuckBot%'        then 'DuckDuckBot'
    when p_ua ilike '%Bytespider%'         then 'Bytespider'
    when p_ua ilike '%meta-externalagent%' then 'Meta-ExternalAgent'
    else null
  end;
$$;

create or replace function public.logga_ai_bot(p_ua text, p_path text)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_bot text;
  v_path text;
begin
  v_bot := ai_bot_namn(coalesce(p_ua, ''));
  if v_bot is null then
    return;
  end if;

  v_path := left(coalesce(nullif(p_path, ''), '/'), 120);
  if v_path !~ '^/[A-Za-z0-9/_.\-]*$' then
    v_path := '/ogiltig';
  end if;

  insert into ai_bot_hits (dag, bot, path, antal, senast)
  values ((now() at time zone 'Europe/Stockholm')::date, v_bot, v_path, 1, now())
  on conflict (dag, bot, path)
  do update set antal = ai_bot_hits.antal + 1, senast = now();
end;
$$;

revoke all on function public.logga_ai_bot(text, text) from public;
grant execute on function public.logga_ai_bot(text, text) to anon, authenticated;

-- Robotar per månad, för översikten.
create or replace view public.v_ai_bot_manad with (security_invoker = true) as
select date_trunc('month', dag)::date as manad,
       bot,
       sum(antal)::bigint as hamtningar,
       count(distinct path)::integer as unika_sidor,
       max(senast) as senaste
from ai_bot_hits
group by 1, 2;

revoke all on public.v_ai_bot_manad from anon, authenticated;
