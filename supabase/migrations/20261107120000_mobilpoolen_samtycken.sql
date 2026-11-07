-- Cookiesamtycken på mobilpoolen.se: bevis på att besökaren har gjort ett val.
--
-- Samtyckesskriptet i <head> (src/lib/samtycke.ts) anropar mobilpoolen_logga_samtycke varje
-- gång någon väljer. Vi sparar bara ett slumpat id (samma som i besökarens
-- lokala lagring), valet per tjänst som jsonb ({"meta": true, "google-ads": false}),
-- versionen av rutan och sidan. Ingen IP-adress, ingen webbläsare, inget annat
-- som kan kopplas till en person. Raderna rensas efter 25 månader (samtycket
-- gäller 12 månader, plus marginal). Nya tjänster kräver ingen ändring här.

create table if not exists public.mobilpoolen_samtycken (
  id bigint generated always as identity primary key,
  samtycke_id uuid not null,
  val jsonb not null,
  version smallint not null,
  sida text not null,
  created_at timestamptz not null default now()
);

create index if not exists mobilpoolen_samtycken_created_idx on public.mobilpoolen_samtycken (created_at);
create index if not exists mobilpoolen_samtycken_id_idx on public.mobilpoolen_samtycken (samtycke_id);

alter table public.mobilpoolen_samtycken enable row level security;
revoke all on public.mobilpoolen_samtycken from anon, authenticated;

comment on table public.mobilpoolen_samtycken is
  'Cookiesamtycken från rutan på mobilpoolen.se. Slumpat id och valet per tjänst, inget om besökaren.';

create or replace function public.mobilpoolen_logga_samtycke(
  p_id uuid,
  p_val jsonb,
  p_version integer,
  p_sida text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sida text;
  v_val jsonb := '{}'::jsonb;
  k text;
  v jsonb;
begin
  if p_id is null or p_version is null or p_version < 1 or p_version > 100 then
    return;
  end if;
  if p_val is null or jsonb_typeof(p_val) <> 'object'
     or (select count(*) from jsonb_object_keys(p_val)) > 20 then
    return;
  end if;
  -- Bara tjänst-id (a-z, 0-9, bindestreck) med true eller false. Högst 20 tjänster.
  for k, v in select * from jsonb_each(p_val) loop
    if k ~ '^[a-z0-9-]{1,30}$' and jsonb_typeof(v) = 'boolean' then
      v_val := v_val || jsonb_build_object(k, v);
    end if;
  end loop;

  v_sida := left(coalesce(nullif(p_sida, ''), '/'), 120);
  if v_sida !~ '^/[A-Za-z0-9/_.\-]*$' then
    v_sida := '/ogiltig';
  end if;

  -- Skydd mot att någon fyller tabellen: högst 20 000 val per dygn.
  if (select count(*) from mobilpoolen_samtycken where created_at > now() - interval '1 day') >= 20000 then
    return;
  end if;

  insert into mobilpoolen_samtycken (samtycke_id, val, version, sida)
  values (p_id, v_val, p_version::smallint, v_sida);

  delete from mobilpoolen_samtycken where created_at < now() - interval '25 months';
end;
$$;

revoke all on function public.mobilpoolen_logga_samtycke(uuid, jsonb, integer, text) from public;
grant execute on function public.mobilpoolen_logga_samtycke(uuid, jsonb, integer, text) to anon, authenticated, service_role;
