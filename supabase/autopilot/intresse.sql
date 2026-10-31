-- Intresseanmälan till Mobilpoolen Autopilot före lansering.
--
-- Formuläret på /autopilot är öppet redan innan bevakningen och mejlen är igång. Den som
-- fyller i det hamnar här, inte i mobilpoolen_autopilot_anmalningar. Inga mejl skickas
-- härifrån. När Autopilot öppnar mejlar vi varje intresseanmälan en gång och ber om
-- bekräftelse, och först då startar bevakningen (dubbel bekräftelse som vanligt).
--
-- Tabellen går inte att läsa med den publika nyckeln: RLS är på utan policyer. Sajten
-- skriver bara via funktionen mobilpoolen_autopilot_intresse, som kontrollerar uppgifterna
-- och sätter samtyckestexten själv.

create table if not exists public.mobilpoolen_autopilot_intresse (
  id uuid primary key default gen_random_uuid(),
  skapad timestamptz not null default now(),
  uppdaterad timestamptz not null default now(),
  namn text not null check (char_length(namn) between 1 and 100),
  epost text not null check (char_length(epost) <= 200),
  -- Det kunden fyllde i om sitt abonnemang, som det skickades från formuläret.
  uppgifter jsonb not null default '{}'::jsonb check (pg_column_size(uppgifter) <= 4000),
  nyhetsbrev boolean not null default false,
  fullmakt_intresse boolean not null default false,
  samtycke_text text not null,
  kalla text not null default 'autopilot',
  -- Sätts när vi har mejlat om lanseringen och flyttat över anmälan till Autopilot.
  overford timestamptz
);

create unique index if not exists mobilpoolen_autopilot_intresse_epost
  on public.mobilpoolen_autopilot_intresse (lower(epost));

alter table public.mobilpoolen_autopilot_intresse enable row level security;

create or replace function public.mobilpoolen_autopilot_intresse(p jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  v_namn text := btrim(coalesce(p ->> 'namn', ''));
  v_epost text := lower(btrim(coalesce(p ->> 'epost', '')));
  v_kalla text := left(coalesce(nullif(p ->> 'kalla', ''), 'autopilot'), 40);
  -- Samma text som INTRESSE_SAMTYCKE i src/lib/autopilot.ts. Ändras den där, ändra här.
  v_samtycke constant text :=
    'Ja, mejla mig när Mobilpoolen Autopilot öppnar och spara uppgifterna om mitt abonnemang till dess. Bevakningen startar först när jag har bekräftat i mejlet.';
begin
  -- Honungsfält: botar fyller i det. Svara som om allt gick bra.
  if coalesce(p ->> 'webbplats', '') <> '' then return true; end if;
  if (p ->> 'samtycke')::boolean is distinct from true then
    raise exception 'samtycke' using errcode = '22023';
  end if;
  if char_length(v_namn) not between 1 and 100 then
    raise exception 'namn' using errcode = '22023';
  end if;
  if char_length(v_epost) > 200 or v_epost !~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' then
    raise exception 'epost' using errcode = '22023';
  end if;
  if pg_column_size(coalesce(p -> 'uppgifter', '{}'::jsonb)) > 4000 then
    raise exception 'uppgifter' using errcode = '22023';
  end if;
  -- Broms mot massinskick: högst 300 nya eller ändrade anmälningar per timme.
  if (select count(*) from public.mobilpoolen_autopilot_intresse
      where uppdaterad > now() - interval '1 hour') >= 300 then
    raise exception 'broms' using errcode = '53400';
  end if;

  insert into public.mobilpoolen_autopilot_intresse
    (namn, epost, uppgifter, nyhetsbrev, fullmakt_intresse, samtycke_text, kalla)
  values (
    v_namn, v_epost, coalesce(p -> 'uppgifter', '{}'::jsonb),
    coalesce((p ->> 'nyhetsbrev')::boolean, false),
    coalesce((p ->> 'fullmakt_intresse')::boolean, false),
    v_samtycke, v_kalla
  )
  on conflict (lower(epost)) do update set
    namn = excluded.namn,
    uppgifter = excluded.uppgifter,
    nyhetsbrev = excluded.nyhetsbrev,
    fullmakt_intresse = excluded.fullmakt_intresse,
    samtycke_text = excluded.samtycke_text,
    kalla = excluded.kalla,
    uppdaterad = now();
  return true;
end $$;

revoke execute on function public.mobilpoolen_autopilot_intresse(jsonb) from public;
grant execute on function public.mobilpoolen_autopilot_intresse(jsonb) to anon, authenticated;

-- Gallring: en intresseanmälan sparas högst 12 månader om Autopilot inte har öppnat,
-- och tas bort 30 dagar efter att den har förts över.
create or replace function public.mobilpoolen_autopilot_intresse_gallra() returns void
language sql set search_path = '' as $$
  delete from public.mobilpoolen_autopilot_intresse
  where (overford is null and skapad < now() - interval '12 months')
     or (overford is not null and overford < now() - interval '30 days');
$$;
revoke execute on function public.mobilpoolen_autopilot_intresse_gallra() from public, anon, authenticated;

select cron.schedule(
  'mobilpoolen-autopilot-intresse-gallra', '45 2 * * *',
  $$ select public.mobilpoolen_autopilot_intresse_gallra(); $$
);
