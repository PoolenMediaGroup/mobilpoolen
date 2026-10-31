# Mobilpoolen Autopilot: drift

Autopilot ligger i PMG:s gemensamma Supabase-projekt (Elpoolen, `rilpjkuozcglwnxwfxgl`) med egna tabeller som börjar på `mobilpoolen_autopilot_`, samma upplägg som besöksräkningen och Larmpoolen. Ett eget projekt kostar 10 dollar i månaden och behövs inte.

## Sätta upp från början

1. Kör `schema.sql` i projektet.
2. Kör `cron.sql`.
3. Hemligheter för edge functions:
   - `RESEND_API_KEY`: finns redan i projektet (Elpoolens Resend-konto). Domänen `send.mobilpoolen.se` måste vara verifierad i samma konto.
   - `AUTOPILOT_NOTIS` (valfri): adress för interna notiser om nya anmälningar. Standard `info@mobilpoolen.se`.
4. Deploya `supabase/functions/mobilpoolen-autopilot` och `supabase/functions/mobilpoolen-autopilot-paminnelser` med `verify_jwt = false` (funktionerna kontrollerar själva: token för kunden, nyckel i `app_secrets` för cron). Båda importerar `../_delad/autopilot.ts`.
5. `AUTOPILOT_URL` och `AUTOPILOT_NYCKEL` i `src/lib/autopilot.ts` pekar på funktionen.

## Flödet

1. Kunden fyller i formuläret på /autopilot. `mobilpoolen-autopilot` (action `anmalan`) sparar och mejlar en bekräftelselänk.
2. Kunden klickar på knappen på /autopilot/bekrafta. Bevakningen börjar och kunden får ett välkomstmejl med de billigaste abonnemangen för sitt behov.
3. `mobilpoolen-autopilot-paminnelser` körs varje morgon. 30 och 10 dagar före `bevaka_datum` (bindningstidens eller rabattens slut, det som kommer först) och samma dag mejlar den förslag. Sedan rullar bevakningen ett halvår.
4. Förslagen hämtas från sajten (`/api/autopilot/forslag`), så mejlen visar samma priser som jämförelsen.
5. Avslut: knappen på /autopilot/avsluta eller mejlprogrammets avslutsknapp (List-Unsubscribe-Post).

Fyller kunden i formuläret igen med samma e-post skrivs uppgifterna över, och ändringen måste bekräftas från inkorgen innan bevakningen fortsätter.

## Testa påminnelserna

```sql
select net.http_post(
  url := 'https://rilpjkuozcglwnxwfxgl.supabase.co/functions/v1/mobilpoolen-autopilot-paminnelser',
  headers := jsonb_build_object('Content-Type','application/json',
    'x-autopilot-nyckel',(select value from public.app_secrets where name='mobilpoolen_autopilot')),
  body := '{"mode":"dry"}'::jsonb);
```
