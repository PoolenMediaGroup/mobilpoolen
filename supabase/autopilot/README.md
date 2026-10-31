# Mobilpoolen Autopilot: drift

Autopilot ligger i Supabase-projektet **Mobilpoolen** (eget projekt, samma organisation som Elpoolen och Larmpoolen). Besöksräkningen ligger kvar i Elpoolens projekt tills vidare.

## Sätta upp från början

1. Kör `schema.sql` i projektet.
2. Kör `cron.sql` med `<PROJEKT>` utbytt mot projektets ref.
3. Hemligheter för edge functions:
   - `RESEND_API_KEY`: nyckel från Resend med domänen `send.mobilpoolen.se` verifierad.
   - `AUTOPILOT_NOTIS` (valfri): adress för interna notiser om nya anmälningar. Standard `info@mobilpoolen.se`.
4. Deploya `supabase/functions/autopilot` och `supabase/functions/autopilot-paminnelser` med `verify_jwt = false` (funktionerna kontrollerar själva: token för kunden, nyckel i `app_secrets` för cron). Båda importerar `../_delad/autopilot.ts`.
5. Sätt `AUTOPILOT_URL` och `AUTOPILOT_NYCKEL` (publik nyckel) i `src/lib/autopilot.ts`. Då öppnar formuläret.

## Flödet

1. Kunden fyller i formuläret på /autopilot. `autopilot` (action `anmalan`) sparar och mejlar en bekräftelselänk.
2. Kunden klickar på knappen på /autopilot/bekrafta. Bevakningen börjar och kunden får ett välkomstmejl med de billigaste abonnemangen för sitt behov.
3. `autopilot-paminnelser` körs varje morgon. 30 och 10 dagar före `bevaka_datum` (bindningstidens eller rabattens slut, det som kommer först) och samma dag mejlar den förslag. Sedan rullar bevakningen ett halvår.
4. Förslagen hämtas från sajten (`/api/autopilot/forslag`), så mejlen visar samma priser som jämförelsen.
5. Avslut: knappen på /autopilot/avsluta eller mejlprogrammets avslutsknapp (List-Unsubscribe-Post).

Fyller kunden i formuläret igen med samma e-post skrivs uppgifterna över, och ändringen måste bekräftas från inkorgen innan bevakningen fortsätter.

## Testa påminnelserna

```sql
select net.http_post(
  url := 'https://<PROJEKT>.supabase.co/functions/v1/autopilot-paminnelser',
  headers := jsonb_build_object('Content-Type','application/json',
    'x-autopilot-nyckel',(select varde from public.app_secrets where namn='autopilot_cron')),
  body := '{"mode":"dry"}'::jsonb);
```
