-- Schemaläggning för Mobilpoolen Autopilot. Körs en gång efter schema.sql.
-- Ersätt <PROJEKT> med projektets ref. Nyckeln skapas här och läses av funktionen.

create extension if not exists pg_cron;
create extension if not exists pg_net;

insert into public.app_secrets (namn, varde)
values ('autopilot_cron', encode(gen_random_bytes(32), 'hex'))
on conflict (namn) do nothing;

-- Påminnelser varje morgon kl. 08.15 svensk vintertid (07.15 UTC).
select cron.schedule(
  'autopilot-paminnelser',
  '15 7 * * *',
  $$
  select net.http_post(
    url := 'https://<PROJEKT>.supabase.co/functions/v1/autopilot-paminnelser',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-autopilot-nyckel', (select varde from public.app_secrets where namn = 'autopilot_cron')
    ),
    body := '{"mode":"send"}'::jsonb
  );
  $$
);

-- Gallring av obekräftade och avslutade anmälningar varje natt.
select cron.schedule('autopilot-gallra', '30 2 * * *', $$ select public.autopilot_gallra(); $$);
