# Mobilpoolen – instruktioner för Claude Code

## Högsta prioritet: SEO

Varje ändring i det här repot ska göra Mobilpoolen mer synlig i Google, Bing (inkl. Yahoo, DuckDuckGo, ChatGPT-sök) och AI-tjänster (ChatGPT, Perplexity, Gemini, Claude). Fråga dig alltid: hjälper det här oss att ranka, bli citerade eller få fler offertförfrågningar?

Målet nås med den bästa svenska sidan för varje sökning, inte med volym. Tunt, massproducerat eller omskrivet innehåll straffas. Hellre en riktigt bra sida än tio svaga.

## Om Mobilpoolen

- Jämförelsetjänst för hemlarm, drivs av PMG Poolen Media Group AB (559602-5287). Syskonsajt till Elpoolen.
- Affären ska bli offertförmedling: en förfrågan skickas till två till tre utvalda larmbolag. Den är inte öppen än, se Status längst ner. Tills dess leder `/#jamfor` till väntelistan.
- Intäkt: ersättning från larmbolagen. Skriv ALDRIG "oberoende". Överdriv aldrig antalet bolag. Ersättningen ska vara upplyst. Den står idag på /sa-tjanar-vi-pengar, i FAQ, på /om-oss, i användarvillkoren och på skribentsidan, och sidfoten länkar dit. Ta inte bort de kvarvarande ställena: marknadsföring ska gå att känna igen som marknadsföring, och en förmedlingstjänst som får betalt per kund måste vara öppen med det.
- Stycket om ersättningen längst ner i sidfoten togs bort 22 september 2026 på Leons beslut, av designskäl. Lägg inte tillbaka det, men behåll länken "Så tjänar vi pengar" i sidfotens Om oss-kolumn. Att det togs bort ur sidfoten var ett designbeslut, inte ett beslut om att sluta upplysa.
- **Ersättningsupplysningen ska stå nära varje offert-CTA**, alltså där användaren fattar beslutet, inte bara på en egen sida. Sidfoten behöver den inte. Använd alltid komponenten `<Ersattningsrad />` (med `className` och `linkClassName` vid behov), skriv aldrig texten för hand. Med offerterna öppna säger den "Gratis för dig. Vi får ersättning av larmbolagen." med länk till /sa-tjanar-vi-pengar. Före lansering visas den inte alls (Leons beslut 2 oktober 2026): vi får ingen ersättning, så det finns inget att upplysa om vid knappen. Håll den kort och dämpad så att den inte konkurrerar med knappen.
  - Det avslutande `CtaBand`-et har raden inbyggd, i `text-[13px] text-white/70` under knappen. Den följer alltså med automatiskt på varje sida som använder bandet, och ska inte skrivas en gång till där.
  - Övriga offert-CTA:n får raden på plats, som i sammanfattningen på bolagssidorna (`src/routes/larmbolag.$slug.tsx`): `text-[13px] text-foreground/60` direkt under knappen, och källa med kontrolldatum på en egen rad under den.
  - Ligger två knappar nära varandra räcker raden vid den översta. Två likadana rader inom en skärmhöjd blir brus, inte upplysning.
  - Kontrollera kontrasten när raden ligger mot en bild. I `CtaBand` är vit 70 procent kontrollerad mot det värsta tänkbara fallet, en helvit bildpunkt under övertoningen vid knappen, och landar över 6:1.
- Använd ALDRIG Larmkollens data, texter eller priser.
- Svenska, du-tilltal, sakligt och varmt. Inga bindestreck som tankstreck i löptext, korta meningar.

## Stack

- TanStack Start (SSR) + React + Tailwind. Supabase som backend. Byggs med Nitro och hostas på Cloudflare Workers (worker `mobilpoolen`, konfig i `wrangler.jsonc`). Merge till main publiceras automatiskt. Lovable används inte längre.
- Bilder läggs i `public/`, aldrig i något externt bildlager.
- Håll ändringar små och följ befintliga mönster.

## AI-chatten

- Knappen nere till höger (`src/components/chatt/`), servern i `src/routes/api.chatt.ts` och motorn i `src/lib/chatt/`. Claude svarar strömmande och kan läsa sajtens egna sidor (`las_sida`, renderas i workern) med `public/llms.txt` som karta. Nya sidor i llms.txt blir alltså kända för chatten direkt.
- Vad chatten får och inte får säga står i systemprompten i `src/lib/chatt/sajt-server.ts`. Texter, snabbval och knappar i `src/lib/chatt/sajt-klient.ts`. Reglerna i den här filen gäller även prompten: ändras en regel här, ändra prompten.
- `protokoll.ts`, `motor.ts`, `las-sida.ts`, `sidtext.ts`, `skydd.ts`, `klient.ts` och komponenterna `chatt-panel.tsx`, `chatt-knapp.tsx`, `chatt-text.tsx` är likadana i Elpoolens repo. Ändra i båda. Tester: `bun test tests/chatt.test.ts`.
- `CHATT_PA` i `sajt-klient.ts` styr om knappen syns för alla. Med `false` syns den bara med `?chatt=1`.
- Hemligheter på workern i Cloudflare: `ANTHROPIC_API_KEY` (krävs), `CHATT_MODELL`, `CHATT_DAGSTAK` (standard 1500 frågor per dygn) och `CHATT_DB_NYCKEL` (valfria). Lokalt: `.dev.vars`.
- Loggen `chatt_logg` (SQL i `supabase/migrations/20261025120000_ai_chatt.sql`) sparar frågor och svar i 90 dagar utan e-post, telefon och personnummer, inget om besökaren. Läs den när du förbättrar sajten: frågor som chatten inte kunde svara på är ämnen som saknar en sida.
- Inget av samtalet sparas i webbläsaren. Lägg inte till localStorage eller cookies i chatten utan att uppdatera integritetspolicyn (avsnittet `#ai-chatt`).

## Arbetssätt i git

- Arbeta alltid på en egen gren `claude/<namn>`. Pusha ALDRIG direkt till main.
- Öppna en vanlig PR (inte utkast) per steg. En sida eller ett avgränsat område per PR.
- Merga först när allt är grönt: `bun run build`, `npx tsc --noEmit`, `eslint` (0 fel) och en curl-kontroll av HTML, title, meta description, canonical och sitemap.
- Skriv i PR-texten vilka beslut du fattat själv och varför, inte bara vad som ändrats.

## SEO-byggstenar som redan finns (använd dem)

- `src/lib/seo.ts`: `pageHead`, `faqJsonLd`, `breadcrumbJsonLd`, `guideBreadcrumb`, `articleJsonLd`.
- `src/lib/guides.ts`: registret för guider (slug, title, excerpt, category, datum inkl. `publishedIso`/`updatedIso`).
- `src/components/guide-page.tsx`: layout och komponenter för guider (H2, P, UL, OL, Callout, GuideTable, FaqAccordion, A).
- `src/routes/sitemap[.]xml.ts`: sitemap. Nya routes utanför guides.ts ska läggas till här med `lastmod`.
- `public/llms.txt`: ska lista alla publicerade sidor. Uppdatera när en sida läggs till.
- `public/robots.txt`, IndexNow-nyckel `public/8f3c2a9e5d7b4e1f9a6c0b2d4e8f1a3c.txt`.
- `src/lib/bildbank.ts`: bildbanken. Alla redaktionella bilder på sajten kommer härifrån.

## Bilder

- Hämta ALLTID bilder ur bildbanken: `bild("nyckel")` från `src/lib/bildbank.ts`. Lägg aldrig in en bild från Unsplash eller en extern URL, och ladda aldrig upp en lös bild till `src/assets/`.
- Varje bild finns i fyra filer i `src/assets/bildbank/`: `<namn>.jpg` och `<namn>.webp` (max 1600px), plus `<namn>-800.jpg` och `<namn>-800.webp`.
- Rendera alltid med `<picture>` och webp först. Använd `.jpg`/`.webp` i stort format och `.thumb`/`.thumbWebp` i kort och listor.
- Alt-texten bor i registret och beskriver vad som syns, inte vad sidan handlar om. Skriv aldrig om den till en nyckelordsräcka. Behöver sammanhanget en annan formulering: `bild("nyckel", "egen alt-text")`.
- Ny bild i banken: lägg de fyra filerna i `src/assets/bildbank/` (stor max 1600px och under ~280 kB) och lägg en rad i `BILDER` med alt-text, kategori och taggar.
- Bild per guide sätts i `src/lib/guide-images.ts`, en rad per slug. Alla publicerade guider ska ha en bild.
- Leons porträtt, logotyper, partnerloggor, favicons och og-image ligger utanför bildbanken och ska inte bytas ut.
- Samma bild ska aldrig visas två gånger på samma sida. Pelarsidorna har bandbild, kortbilder och CTA-bild, guiderna har hjältebild, kortbilder och CTA-bild. Kontrollera hela sidan när du sätter en ny bild, inte bara den plats du håller på med.
- Korten under "Guider som hör ihop med den här sidan" hämtar bilden automatiskt: pekar kortet på en guide tas guidens egen bild ur `guide-images.ts`, annars sätts `bild: "<nyckel>"` på länken i `HousingLink`.
- `overvakningskameror-vagg` är bankens enda stående bild (833x1200). Använd den inte i breda band (21:9) eller CTA-band, då blir den en enda uppförstorad kamera. Den fungerar i guidernas 16:9-hero och i kort.
- Breda band (21:9) tål bara bilder där motivet är en scen, inte ett närbildsmotiv. `villa-tradgard`, `trahus-tatort`, `sjobodar-smogen`, `kamera-stolpe-utomhus` och familjebilderna fungerar. `montering-dorrlas`, `utomhuskamera-natt`, `passerkort-lasare` och `hanglas-kedja` är närbilder och blir en uppförstorad underarm eller lins över hela sidbredden. Titta alltid på bandet renderat i 1280 px innan du låter en ny bild stå kvar.
- `TrustPage` tar en valfri `bild`-nyckel som ger samma band som pelarsidorna. Villkor, policyer och sidorna om metod och ersättning står medvetet utan bild: ett stort foto över en upplysningstext läser som reklam ovanpå det som ska vara torrt och kontrollerbart.

## Design och typografi

- Inga versala etiketter någonstans utom i tabellhuvuden och sidfotens kolumnrubriker. Sidfotens kolumnrubriker är versala som på Elpoolen (Leons beslut 25 oktober 2026), så att de två sajternas sidfötter ser likadana ut. Navets gruppetiketter är avversalerade 23 september 2026. Prisjämförelsens tabellhuvuden är kvar versala, de är gränssnitt och följer tabellkonvention.
- Inga etiketter ovanför rubriker. Den lilla versala texten ovanför en rubrik ("STEG FÖR STEG", "JÄMFÖR AVTALSFORMER", "Skribent") är borttagen på hela sajten. Lägg inte tillbaka den, varken via `SectionHeader`, `TrustPage` eller egen markup. Rubriken ska bära sektionen själv.
- Underrubriken (`sub`) ska svara på frågan rubriken ställer, inte kommentera den. "Det här är frågan ingen svarar på" är en metamening och vinner inga utdrag.
- Brödtext i ljusa sektioner: undvik `text-muted-foreground` för längre stycken, kontrasten blir för låg. Använd `text-foreground/90` för ledmening och `/65` för detaljrad.
- Radlängd i löpande text: håll den runt 680px, inte hela sektionsbredden.

## Påståenden som är kontrollerade och inte får generaliseras

- **Räddningstjänsten larmas inte automatiskt vid brand.** Bolagen gör olika, kontrollerat 22 september 2026: Verisure skriver på sin sajt att de ringer brandkåren oavsett, men enligt tjänstevillkoren Brandvarningssystem 2021:1 förmedlas larmet som regel vid verifierad brand (kameradetektor visar rök, person på plats bekräftar, eller minst två rökdetektorer larmar), och minst två rökdetektorer krävs (kontrollerat 26 oktober 2026). Återge båda när Verisures rutin beskrivs. Sector Alarm kontaktar kunden och verifierar med kamera först, Securitas Home meddelar SOS först vid muntlig bekräftelse på plats eller synlig rök eller eld på bild. Skriv aldrig att räddningstjänsten larmas som en generell regel. Skillnaden är beskriven i guiden om brandvarnare och brandlarm.
- "Inom sekunder" om larmcentralens mottagning går att belägga: både Verisure och Sector Alarm publicerar det på sina egna sidor. Gå inte längre än så, vi har inga uppmätta svarstider.

## Checklista för varje ny eller ändrad sida

1. Sökord och intention: huvudsökord + varianter, kolla vad som rankar på Google.se och vad som saknas där.
2. Ingen kannibalisering: finns redan en sida för sökordet? Förbättra den i stället.
3. Title max ~60 tecken med sökordet först, meta description max ~155 tecken, slug utan å/ä/ö, en H1.
4. Ingressen svarar direkt på frågan (vinner utdrag och AI-svar).
5. FAQ med 4–8 riktiga frågor, `faqJsonLd` från samma data som visas.
6. JSON-LD: Article (guider), BreadcrumbList, FAQPage. Aldrig Review/AggregateRating med egna eller påhittade betyg.
7. Fakta: varje pris och villkor kontrolleras mot bolagets egen webbplats och får ett datum. Går det inte att verifiera: skriv inte det, markera `[KONTROLLERA]` och säg till Leon.
8. Intern länkning: klustersida länkar upp till sin pelare och till 2–4 syskonsidor, pelaren länkar ner.
9. Uppdatera sitemap (om det behövs), `llms.txt` och `updatedIso` när innehåll faktiskt ändras.
10. Kör typkontroll och build innan commit.

## Pelare och kluster

- Pelare: startsidan (jämför hemlarm), /villalarm, /lagenhetslarm, /fritidshuslarm, /radhuslarm, /foretag, /brf, /foreningar.
- Kluster: /larmbolag/[bolag], /jamfor/[a]-vs-[b], guider under /guider/.
- Kommunsidor (/inbrottsstatistik/[kommun]) med färre än 50 anmälda bostadsinbrott 2025 har `noindex, follow` och står inte i sitemap eller `llms.txt` (beslut 17 oktober 2026, `kommunsidanIndexeras` i `src/lib/inbrottsstatistik-kommuner.ts`). 39 av 179 indexeras. Höj inte antalet förrän de 39 är indexerade och har fått eget innehåll utöver mallen.

## Status: öppen för Google, offerterna stängda (från 2 oktober 2026)

- Sajten är indexerbar. Lösenordsspärren (`PasswordGate`, komponenten ligger kvar oanvänd) och den globala `noindex, nofollow` är borta. Bara 404-sidan har noindex (satt i `__root.tsx`).
- Mobilpoolen har **inga avtal med larmbolag**. Ingen förfrågan skickas vidare och vi får ingen ersättning. `OFFERT_OPPEN = false` i `src/lib/lansering.ts` gör att:
  - hjälteytorna (startsidan, /foretag, /brf, /foreningar) visar väntelistan `VantelistaForm` (tabell `intresseanmalan`) i stället för offertformulären,
  - knappar till `#jamfor` i `CtaBand`, guidernas knappar, `OrganisationCta` och bolagssidorna säger "Få besked när vi öppnar",
  - ersättningsraden (`Ersattningsrad` i `src/components/ersattningsrad.tsx`) inte visas, eftersom vi inte får någon ersättning.
- **Skriv inget som påstår att vi skickar förfrågningar, att bolag hör av sig eller att vi får ersättning.** Beskriv offerterna i framtid ("När vi öppnar ..."). Råd till läsaren att själv begära offerter från flera bolag är okej, men länka då till `/larmbolag`, inte till `#jamfor`.
- Ingen cookiebanner: sajten har bara nödvändig lagring. Usercentrics är borttaget. Lägg till en egen CMP för Mobilpoolen innan något mätverktyg som körs i webbläsaren (GA4, pixel, Cloudflare Web Analytics-skriptet) läggs in. EDPB:s riktlinjer 2/2023 räknar även skript som läser information i webbläsaren som samtyckeskrävande, inte bara cookies.
- Besöksmätningen är serverbaserad (beslut 17 oktober 2026), samma modell som Elpoolen: `src/matning.ts` räknar besök från människor i Supabase-tabellen `besok_dag` (dag, kanal, källa, sida, enhet, antal) via `logga_besok()`, och sök- och AI-robotars sidhämtningar i `ai_bot_hits` via `logga_ai_bot()` (robotlistan ligger i SQL-funktionen `ai_bot_namn`). Bara räknare per dag, ingen IP-adress, ingen user agent, ingenting i webbläsaren. Tabellerna går inte att läsa med den publika nyckeln. Lägg inte till fält som kan identifiera en person utan att uppdatera integritetspolicyn.
- Statiska filer (robots.txt, llms.txt, bilder) serveras av Cloudflare innan workern körs och syns inte i mätningen. Robotars hämtningar av dem syns i Cloudflares HTTP-analys för zonen. Bara sidor som svarar 200 med HTML räknas.
- När avtalen finns: se PR-texten för `claude/oppna-med-vantelista` om hur offerterna slås på igen (flaggan, texterna, integritetspolicyn, cookiepolicyn och den här filen).
