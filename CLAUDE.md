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
- **Status 29 oktober 2026:** 139 privata abonnemang från 15 operatörer och 21 företagsabonnemang. Telenor, Vimla, Fello, Lingon, Chilimobil, Comviq och Telia kompletterades samma dag (`research/komplettering-a.json` och `-b.json`), som ersätter operatörens abonnemang i bygget. Halebop avvecklas (Telia, juni 2026) och är `aktiv: false`. Företagspriser hos Telia, Tele2 och Hallon anges utan uppgift om moms (`moms: "okand"`). Fellos kampanj gäller till 1 november 2026 och Comviqs till 10 november 2026: kontrollera och uppdatera efter de datumen.

- **Mobilt bredband** ligger i `src/lib/mobil/bredband-data.ts`, genererad ur `research/mobilt-bredband.json` av samma skript. Uträkningar i `src/lib/mobil/bredband.ts`. Meningar i `notis` som är markerade `[KONTROLLERA]` eller är interna anteckningar (API, PDF, orderdata) visas inte. Bredband blandas aldrig in i huvudjämförelsen av mobilabonnemang.
- **Sidor som räknas fram ur datan:** `/surf/$gb` (nivåerna i `src/lib/mobil/surf.ts`), `/kampanjer` (`src/lib/mobil/kampanjer.ts`, slutdatum i `KAMPANJ_SLUT`), `/mobilt-bredband`, `/mobil-med-abonnemang` och en sida per modell (`src/lib/mobil/telefon.ts`, data ur `research/mobil-med-abonnemang.json`). `/ungdom` är flyttad till `/studentabonnemang` med 301.
- Abonnemangs-id byts när underlaget kompletteras. Hårdkodade id i sidor och guider ska kontrolleras efter varje `bygg_data.py` (ett id som inte finns gör att en tabell blir tom utan fel).

## Uppdatera priser

1. Kontrollera priserna på operatörens egen sida.
2. Uppdatera `research/operatorer-*.json` (eller listan `F` i `scripts/bygg_data.py` för företag) med källa och datum.
3. Kör `python3 scripts/bygg_data.py` och sedan build.

## Stack

- TanStack Start (SSR) + React + Tailwind. Byggs med Nitro för Cloudflare Workers (worker `mobilpoolen`, `wrangler.jsonc`).
- Supabase är valfritt: `VITE_SUPABASE_URL` och `VITE_SUPABASE_PUBLISHABLE_KEY` vid bygget slår på besöksräkningen (`src/matning.ts`). Utan dem körs sajten utan databas.
- AI-chatten finns kvar från Larmpoolen men är avslagen (`CHATT_PA = false` i `src/lib/chatt/sajt-klient.ts`). Systemprompten i `src/lib/chatt/sajt-server.ts` måste skrivas om för mobilabonnemang innan den slås på.

## Arbetssätt i git

- Arbeta på en egen gren `claude/<namn>` och öppna en PR per avgränsat område när sajten är live. Före lansering har grunden byggts direkt på `main`.
- Grönt före merge: `bun run build`, `npx tsc --noEmit`, `npx eslint src` (0 fel), och en kontroll av title, description, canonical och sitemap.

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

- Indigo (`--primary: #3b28cc`) är enda mättade färgen, orange (`--cta`) bara för huvudknappar. Mörka sektioner i djup indigo (`--dark-section: #16133a`). Typsnitt som Elpoolen: Inter och Sora. Ordmärket "mobilpoolen." med orange punkt (`src/assets/mobilpoolen-logo.svg`).
- Inga versala etiketter ovanför rubriker. Rubriken bär sektionen själv.
- Operatörer visas med initialer (`OperatorMonogram`), inte med deras logotyper.
- Bilder bara ur bildbanken (`src/lib/bildbank.ts`). Samma bild aldrig två gånger på en sida.
