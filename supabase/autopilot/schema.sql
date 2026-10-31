-- Mobilpoolen Autopilot. Körs i Supabase-projektet Mobilpoolen (inte i Elpoolens).
--
-- Kunden anger sitt nuvarande abonnemang och när bindningstiden eller rabatten tar slut.
-- Vi mejlar innan dess med de abonnemang som passar bäst just då. Kunden väljer själv om
-- hen vill byta (samma modell som Elpoolen Autopilot innan fullmaktsbytet är öppet).
--
-- Ingen kan läsa eller skriva tabellerna med den publika nyckeln: RLS är på och det finns
-- inga policyer. Allt går via edge functions med service role.

create extension if not exists pgcrypto;

create table if not exists public.autopilot_anmalningar (
  id uuid primary key default gen_random_uuid(),
  skapad timestamptz not null default now(),
  uppdaterad timestamptz not null default now(),

  -- Kontakt
  namn text not null check (char_length(namn) between 1 and 100),
  epost text not null check (char_length(epost) <= 200),
  mobil text check (mobil is null or mobil ~ '^\+467\d{8}$'),

  -- Nuvarande abonnemang
  operator text check (char_length(operator) <= 60),
  abonnemang text check (char_length(abonnemang) <= 120),
  manadskostnad numeric(8,2) check (manadskostnad is null or manadskostnad between 0 and 5000),
  har_rabatt boolean,
  ordinarie_pris numeric(8,2) check (ordinarie_pris is null or ordinarie_pris between 0 and 5000),
  rabatt_slutar date,
  surf_gb numeric(6,1) check (surf_gb is null or surf_gb between 0 and 5000),
  obegransad boolean not null default false,
  fria_samtal boolean,
  fria_sms boolean,
  eu_surf_gb numeric(6,1) check (eu_surf_gb is null or eu_surf_gb between 0 and 5000),
  utlandssamtal text check (utlandssamtal in ('ingar', 'kostar', 'anvander_inte', 'vet_ej')),
  antal_sim smallint check (antal_sim is null or antal_sim between 1 and 20),
  femg boolean,
  esim boolean,

  -- Bindning och uppsägning
  bindning text not null default 'vet_ej' check (bindning in ('ingen', 'har', 'vet_ej')),
  bindning_slutar date,
  uppsagningstid_man smallint check (uppsagningstid_man is null or uppsagningstid_man between 0 and 3),
  telefon_avbetalning boolean,
  avbetalning_slutar date,

  -- Det datum vi bevakar: det tidigaste av bindningstidens slut och rabattens slut.
  bevaka_datum date,

  -- Önskemål
  vill_byta_nu boolean not null default false,
  fullmakt_intresse boolean not null default false,
  nyhetsbrev boolean not null default false,
  -- Sms skickas inte än. Samtycket sparas så att vi inte behöver fråga igen när det startar.
  sms boolean not null default false,

  -- Samtycke: texten sparas som den visades, satt på servern.
  samtycke_text text not null,
  kalla text not null default 'autopilot',

  -- Dubbel bekräftelse och avslut
  bekrafta_token uuid not null default gen_random_uuid(),
  bekraftad timestamptz,
  avsluta_token uuid not null default gen_random_uuid(),
  avslutad timestamptz
);

create unique index if not exists autopilot_anmalningar_epost on public.autopilot_anmalningar (lower(epost));
create index if not exists autopilot_anmalningar_bevaka on public.autopilot_anmalningar (bevaka_datum)
  where bekraftad is not null and avslutad is null;

create table if not exists public.autopilot_handelser (
  id bigint generated always as identity primary key,
  anmalan_id uuid not null references public.autopilot_anmalningar (id) on delete cascade,
  skapad timestamptz not null default now(),
  typ text not null,
  data jsonb not null default '{}'::jsonb
);
create index if not exists autopilot_handelser_anmalan on public.autopilot_handelser (anmalan_id, typ);
-- Samma påminnelse skickas aldrig två gånger för samma bevakningsdatum.
create unique index if not exists autopilot_handelser_en_per_steg
  on public.autopilot_handelser (anmalan_id, typ, (data ->> 'bevaka_datum'))
  where typ like 'paminnelse_%';

-- Hemligheter som edge functions läser (t.ex. nyckeln som cron skickar). Ingen åtkomst utifrån.
create table if not exists public.app_secrets (
  namn text primary key,
  varde text not null
);

alter table public.autopilot_anmalningar enable row level security;
alter table public.autopilot_handelser enable row level security;
alter table public.app_secrets enable row level security;

create or replace function public.autopilot_uppdaterad() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.uppdaterad := now();
  return new;
end $$;

drop trigger if exists autopilot_uppdaterad on public.autopilot_anmalningar;
create trigger autopilot_uppdaterad before update on public.autopilot_anmalningar
  for each row execute function public.autopilot_uppdaterad();

-- Gallring: obekräftade anmälningar tas bort efter 30 dagar, avslutade efter 90 dagar.
create or replace function public.autopilot_gallra() returns void
language sql set search_path = '' as $$
  delete from public.autopilot_anmalningar
  where (bekraftad is null and skapad < now() - interval '30 days')
     or (avslutad is not null and avslutad < now() - interval '90 days');
$$;
