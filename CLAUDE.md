# Mobilpoolen – instruktioner för Claude Code

## Högsta prioritet: SEO och ärlighet

Varje ändring ska göra Mobilpoolen mer synlig i Google, Bing och AI-tjänster (ChatGPT, Perplexity, Gemini, Claude). Målet nås med den bästa svenska sidan för varje sökning, inte med volym. Tunt eller omskrivet innehåll straffas. Hellre en riktigt bra sida än tio svaga.

## Om Mobilpoolen

- Jämförelsetjänst för mobilabonnemang, privat och företag. Drivs av PMG Poolen Media Group AB (559602-5287). Syskonsajt till Elpoolen och Larmpoolen. Grundare och skribent: Leon Hallström.
- Besökaren jämför här och beställer direkt hos operatören. Vi säljer inga abonnemang och tar inte emot beställningar.
- **Vi har inga avtal med operatörer och får ingen ersättning (per 29 oktober 2026).** `OFFERT_OPPEN = false` i `src/lib/lansering.ts`. Ersättningsraden (`<Ersattningsrad partner={o.partner} />`) visas bara när flaggan är på och just den operatören har `partner: true`. Skriv inget som påstår att vi får ersättning.
- När avtal finns: sätt `partner: true` på operatören i datan, slå på `OFFERT_OPPEN`, uppdatera /sa-tjanar-vi-pengar, villkoren och integritetspolicyn. Knappen till en partner får då `rel="sponsored"` automatiskt. **Ordningen i jämförelsen får aldrig påverkas av ersättning.**
- Skriv ALDRIG "oberoende" om Mobilpoolen. Inga egna betyg, stjärnor eller "testvinnare", ingen Review/AggregateRating. Vi har granskat villkor och priser, inte testat abonnemangen. Kundnöjdhet = Svenskt Kvalitetsindex, nät = PTS och Opensignal, alltid med källa och period.
- Svenska, du-tilltal, sakligt och varmt. Inga tankstreck i löptext, korta meningar.

## Data: priser och operatörer

- All prisdata ligger i `src/lib/mobil/operatorer-data.ts`, som genereras av `scripts/bygg_data.py` ur researchfilerna i `research/`. Typerna står i `src/lib/mobil/typer.ts`, uträkningarna i `src/lib/mobil/berakna.ts`, nät och uppslag i `src/lib/mobil/data.ts`.
- Varje abonnemang har `kalla` (operatörens egen sida) och varje operatör `kontrollerad` (ISO-datum). Använd aldrig andra jämförelsesajters priser.
- Okänd uppgift = `null`, aldrig en gissning. `bindning: null` visas som "Bindningstid framgår inte" och faller bort när man filtrerar på utan bindningstid.
- Abonnemang med ålders- eller studentkrav (`malgrupp` innehåller senior, student eller ung) döljs i de allmänna listorna och visas med `forval={{ villkorade: true }}` eller `malgrupp`.
- Standardsortering: snittpris per månad första året (`snittForstaAret`), med kampanjens längd och startavgift. Totalkostnad 24 mån finns i detaljerna.
- Priser i löptext ska räknas fram ur datan, inte skrivas för hand, så att texten följer priserna.
- Kontrollerade marknadsfakta (PTS, Opensignal, SKI, LEK, roaming) ligger i `src/lib/mobil/fakta.ts` med källor. Ändra där, så ändras de överallt.
- **Status 29 oktober 2026:** 139 privata abonnemang från 15 operatörer och 21 företagsabonnemang. Telenor, Vimla, Fello, Lingon, Chilimobil, Comviq och Telia kompletterades samma dag (`research/komplettering-a.json` och `-b.json`), som ersätter operatörens abonnemang i bygget. Halebop avvecklas (Telia, juni 2026) och är `aktiv: false`. Företagspriser hos Telia, Tele2 och Hallon anges utan uppgift om moms (`moms: "okand"`). Priskontrollen 3 november 2026: Fello har ny kampanj (20 kr i 3 mån + 100 GB extra i 12 mån, slutdatum framgår inte). Tele2:s kampanjer efter 2 november: 15 GB 199 kr i 24 mån utan bindning, Obegränsad Max 449 kr i 24 mån med bindning, inget slutdatum. Comviqs med 12 mån bindning gäller t.o.m. 10 november 2026: kontrollera och uppdatera efter det datumet. Priskontrollen 4 november 2026: Hallon har en Black Weeks-deal (9–49 kr/mån i 4 mån och extra surfpott 60–100 GB, ingen dubbel surf längre; mobilt bredband 19–59 kr/mån i 3 mån), slutdatum framgår inte: kontrollera dagligen och återställ när den är slut. Tellus har ett nytt 100 GB för 18-54 år (349 kr). Lingons prissida svarade inte. Priskontrollen 6 november 2026: Tele2 Företag höjde kampanjpriserna med 10 kr (60 GB 269, Obegränsad 289, Obegränsad Max 299 kr/mån i 24 mån med bindning; sidans dolda prisdata kallar beloppen exkl. moms, men sidan skriver det inte ut). Övriga oförändrade, Comviqs 12-månaderskampanj gäller fortfarande t.o.m. 10 november. Priskontrollen 7 november 2026: Lycamobile Fast Pris 199 (30 GB) har ett introduktionspris för nya kunder online, 99,50 kr/30 dagar i tre månader med automatisk förnyelse (visas avrundat till 100 kr). Tre Företag Obegränsad Max visar nu "Tidigare pris 399 kr/mån" bredvid kampanjpriset 299 kr; priset efter 24 månader (449 kr i datan) framgår inte längre och är inte ändrat. Fellos sida för mobilt bredband renderades tom, priserna bekräftades i Fellos produkt-API men inte kampanjens längd.

- **Mobilt bredband** ligger i `src/lib/mobil/bredband-data.ts`, genererad ur `research/mobilt-bredband.json` av samma skript. Uträkningar i `src/lib/mobil/bredband.ts`. Meningar i `notis` som är markerade `[KONTROLLERA]` eller är interna anteckningar (API, PDF, orderdata) visas inte. Bredband blandas aldrig in i huvudjämförelsen av mobilabonnemang.
- **Sidor som räknas fram ur datan:** `/surf/$gb` (nivåerna i `src/lib/mobil/surf.ts`), `/kampanjer` (`src/lib/mobil/kampanjer.ts`, slutdatum i `KAMPANJ_SLUT`), `/mobilt-bredband`, `/mobil-med-abonnemang` och en sida per modell (`src/lib/mobil/telefon.ts`, data ur `research/mobil-med-abonnemang.json`). `/ungdom` är flyttad till `/studentabonnemang` med 301.
- Abonnemangs-id byts när underlaget kompletteras. Hårdkodade id i sidor och guider ska kontrolleras efter varje `bygg_data.py` (ett id som inte finns gör att en tabell blir tom utan fel).

## Uppdatera priser

1. Kontrollera priserna på operatörens egen sida.
2. Uppdatera `research/operatorer-*.json` (eller listan `F` i `scripts/bygg_data.py` för företag) med källa och datum.
3. Kör `python3 scripts/bygg_data.py`, sedan `bun scripts/prisindex_manad.ts` och sedan build.

`bygg_data.py` jämför med förra körningen (`research/senaste-priser.json`) och loggar varje ändring av pris, kampanjpris, kampanjlängd och startavgift i `research/prisandringar.json`. De senaste ändringarna visas på /prisindex. Ta inte bort loggen eller utgångsläget: de är historiken.

`prisindex_manad.ts` sparar månadens prisindex i `research/prisindex-historik.json`. Samma månad skrivs över, tidigare månader ändras aldrig. Från två sparade månader visar /prisindex hur medianpriserna har utvecklats. Kör prisuppdateringen minst en gång i månaden, annars blir det hål i serien.

En schemalagd uppgift kontrollerar alla priser mot operatörernas sajter varje morgon (Leons beslut 2 november 2026), eftersom startsidan säger "Priser kontrolleras dagligen". Stoppas den dagliga kontrollen: ändra texten i heron.

## Mobilpoolen Autopilot

- Gratis bevakning av kundens abonnemang: /autopilot (formulär i tre steg), /autopilot/bekrafta, /autopilot/avsluta och /autopilot/villkor. Samma modell som Elpoolen Autopilot innan fullmaktsbytet är öppet: vi mejlar, kunden byter själv.
- Ligger i PMG:s gemensamma Supabase-projekt (Elpoolen) med egna tabeller `mobilpoolen_autopilot_*` och funktionerna `mobilpoolen-autopilot` och `mobilpoolen-autopilot-paminnelser`. Inget eget projekt, eftersom det kostar 10 dollar i månaden. SQL och funktioner i `supabase/autopilot/` och `supabase/functions/mobilpoolen-autopilot*`. Drift och uppsättning i `supabase/autopilot/README.md`.
- `AUTOPILOT_URL` och `AUTOPILOT_NYCKEL` i `src/lib/autopilot.ts`. Är de null visar formuläret att Autopilot öppnar snart.
- Samtyckestexterna står både i `src/lib/autopilot.ts` och i `supabase/functions/mobilpoolen-autopilot/index.ts`. Servern sparar sin egen kopia. Ändra båda.
- Ingen fullmakt ges i formuläret, bara ett intresse. Skriv inte att vi byter åt kunden. Inga sms skickas än, bara samtycket sparas.
- Förslagen i mejlen kommer från `/api/autopilot/forslag` (`src/lib/mobil/autopilot-forslag.ts`), så de följer prisdatan.
- Ändringar som rör formuläret, kunddata, mejlutskicken eller databasens struktur: beskriv dem tydligt i PR-texten. Claude mergar själv när allt är grönt (se Arbetssätt i git).

## Nyheter

- /nyheter, /nyheter/<slug> och /nyheter/rss.xml byggs ur registret `src/lib/nyheter.ts` (samma uppbyggnad som Elpoolens). Så länge det är tomt är /nyheter noindex och syns inte i meny eller sitemap.
- Nyhetsroboten är en schemalagd uppgift som körs fyra gånger om dagen och följer `docs/nyhetsroboten.md`. Ändra reglerna där och i kommentaren i `nyheter.ts` samtidigt.

## Stack

- TanStack Start (SSR) + React + Tailwind. Byggs med Nitro för Cloudflare Workers (worker `mobilpoolen`, `wrangler.jsonc`).
- Supabase är valfritt: `VITE_SUPABASE_URL` och `VITE_SUPABASE_PUBLISHABLE_KEY` vid bygget slår på besöksräkningen (`src/matning.ts`). Utan dem körs sajten utan databas.
- AI-chatten är påslagen sedan 1 november 2026 (`CHATT_PA = true` i `src/lib/chatt/sajt-klient.ts`), samma knapp och motor som på Elpoolen och Larmpoolen. Systemprompten i `src/lib/chatt/sajt-server.ts` är skriven för mobilabonnemang och Autopilot, och reglerna i den här filen gäller även prompten. Motorn (`protokoll`, `motor`, `las-sida`, `sidtext`, `skydd`, `klient`, `forhamtning` och chattkomponenterna) är likadan i syskonrepona: ändra i alla tre. Kräver hemligheten `ANTHROPIC_API_KEY` på workern `mobilpoolen` i Cloudflare; utan den svarar chatten att den inte är igång. Valfritt: `CHATT_MODELL`, `CHATT_DAGSTAK`, `CHATT_DB_NYCKEL`. Integritetspolicyn beskriver chatten under `#ai-chatt`.

## Arbetssätt i git

- Arbeta på en egen gren `claude/<namn>` och öppna en PR per avgränsat område när sajten är live. Före lansering har grunden byggts direkt på `main`.
- Grönt före merge: `bun run build`, `npx tsc --noEmit`, `npx eslint src` (0 fel), och en kontroll av title, description, canonical och sitemap.
- **Claude mergar själv** när allt är grönt, utan att fråga (Leons beslut 1 november 2026). Det gäller även ändringar som rör Autopilot. Säg i svaret vad som gick live, och kontrollera live-sajten efter merge.

## SEO-byggstenar

- `src/lib/seo.ts`: `pageHead`, `faqJsonLd`, `breadcrumbJsonLd`, `guideBreadcrumb`, `articleJsonLd`, `jsonLdScript`.
- `src/lib/guides.ts`: registret för guider. `src/components/guide-page.tsx`: guidelayout.
- `src/components/mobil/pelar-sida.tsx`: mall för pelarsidor. `jamforelse.tsx`, `billigast-tabell.tsx`, `spar-kalkyl.tsx`: jämförelsens byggstenar.
- `src/lib/mobil/sidtexter.ts`: frågor och texter som räknas fram ur datan, och listan `PAR` över jämförelsesidor (`/jamfor/a-vs-b`).
- `src/lib/sidor.ts`: fasta sidor i sitemap. Dynamiska sidor läggs till automatiskt i `src/routes/sitemap[.]xml.ts`.
- `public/llms.txt` ska lista alla publicerade sidor.

## Checklista för varje ny eller ändrad sida

1. Sökord och intention (se `research/seo.md`). Ingen kannibalisering.
2. Title max ~60 tecken med sökordet först, description max ~155, slug utan å/ä/ö, en H1.
3. Ingressen svarar direkt på frågan, med siffror ur datan.
4. FAQ med 3–6 riktiga frågor, samma lista till `faqJsonLd`.
5. Källa och datum vid varje pris och fakta. Går det inte att belägga: skriv det inte.
6. Intern länkning: pelare ↔ kluster, operatör ↔ nät ↔ jämförelser.
7. Uppdatera `src/lib/sidor.ts`, `public/llms.txt` och datum när innehåll ändras.

## Design
- **Menyn och heron ser likadana ut på alla skärmstorlekar** på Elpoolen, Larmpoolen och Mobilpoolen (Leons beslut 2 november 2026). Variabeln `--hz` i `src/styles.css` skalar `.nav-skala` och `.hero-skala` med `zoom` i steg om 32 px, från 0,717 vid 1024 px till 1,8 vid 2576 px (1 mellan 1392 och 1455 px). Heron fyller skärmen: `lg:min-h-[calc(100svh-128px-var(--nav-extra,0px))]` och centreras vertikalt. Samma uppbyggnad på alla tre: H1 52 px med radavstånd 1,1, tre gröna bockar (#5BE39B), en diskret statusrad med källa och datum, två korta länkar under. Ändras skalningen eller heron på en sajt, ändra på alla tre.
- **Sidfoten har sex länkar i varje kolumn** på Elpoolen, Larmpoolen och Mobilpoolen (Leons beslut 2 november 2026), så att kolumnerna blir lika långa på alla sajter. Ny länk i en kolumn: ta bort en annan i samma kolumn. Om oss är densamma på alla tre: Om <sajten>, Så fungerar det, Så jämför vi, Så tjänar vi pengar (Elpoolen: Energispartips), Frågor och svar, Kontakt. Testet `tests/sidfot.test.ts` kontrollerar antalet.

- Indigo (`--primary: #3b28cc`) är enda mättade färgen, orange (`--cta`) bara för huvudknappar. Mörka sektioner i djup indigo (`--dark-section: #16133a`). Typsnitt som Elpoolen: Inter och Sora. Ordmärket "mobilpoolen." med orange punkt (`src/assets/mobilpoolen-logo.svg`).
- Inga versala etiketter ovanför rubriker. Rubriken bär sektionen själv.
- Operatörer visas med sin logotyp (beslut av Leon 1 nov 2026), som på Elpoolen. Filerna ligger i `public/logos/`, registret i `src/lib/mobil/logotyper.ts`. `OperatorMonogram` visar logotypen i en vit bricka och faller tillbaka på initialer när logotyp saknas (katshing, Halebop). Logoraden under startsidans hero är `OperatorLogoRad`. Ny operatör: hämta logotypen från operatörens egen webbplats och lägg till den i registret.
- Bilder bara ur bildbanken (`src/lib/bildbank.ts`). Samma bild aldrig två gånger på en sida.
