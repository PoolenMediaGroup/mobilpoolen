-- Schemaläggning för Mobilpoolen Autopilot. Körs en gång efter schema.sql.
-- Nyckeln sparas i den gemensamma tabellen app_secrets och läses av funktionen.

insert into public.app_secrets (name, value)
values ('mobilpoolen_autopilot', encode(gen_random_bytes(32), 'hex'))
on conflict (name) do nothing;

-- Påminnelser varje morgon kl. 08.15 svensk vintertid (07.15 UTC).
select cron.schedule(
  'mobilpoolen-autopilot-paminnelser',
  '15 7 * * *',
  $$
  select net.http_post(
    url := 'https://rilpjkuozcglwnxwfxgl.supabase.co/functions/v1/mobilpoolen-autopilot-paminnelser',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-autopilot-nyckel', (select value from public.app_secrets where name = 'mobilpoolen_autopilot')
    ),
    body := '{"mode":"send"}'::jsonb
  );
  $$
);

-- Gallring av obekräftade och avslutade anmälningar varje natt.
select cron.schedule('mobilpoolen-autopilot-gallra', '30 2 * * *', $$ select public.mobilpoolen_autopilot_gallra(); $$);
