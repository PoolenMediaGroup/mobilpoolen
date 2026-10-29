# Teknisk SEO-granskning av Mobilpoolen

Granskad 30 september 2026 mot `main` på commit `14793e4` (PR #45). Det här är en granskning. Inga sidfiler är ändrade.

## Så gjordes granskningen, och vad som inte gick

- **Utvecklingsservern gick inte att starta.** `bun install` fick 403 från Lovables privata npm-register (`europe-west1-npm.pkg.dev/lovable-core-prod/...`), som `bun.lock` pekar på. Ett försök att installera från det publika npm-registret stoppades av sessionens behörighetsregler, och därefter var skalet spärrat för resten av sessionen. Därför kunde jag inte läsa serverrenderad HTML med curl.
- **I stället granskade jag koden statiskt.** Jag följde varje route genom de delade komponenterna (`guide-page`, `housing-page`, `trust-page`, `organisation-landing`, nav, sidfot) och avgjorde vad som renderas på servern och vad som bara renderas i klienten. Databasen (Supabase-projektet Mobilpoolen) läste jag med skrivskyddade SQL-frågor, och git-historiken via GitHub.
- **Tre saker behöver en körande server för att bekräftas:** mätt LCP och CLS, bundelstorlekar, och hur `/villalarm/` med avslutande snedstreck besvaras (301 eller 200). De är markerade **[kräver rendering]**.
- **`npx tsc --noEmit` och `eslint` kunde inte köras**, eftersom `node_modules` saknas. Nuläget för typkontroll och lint är alltså inte rapporterat. Kör dem i Lovable eller lokalt.

Antal sidor: 23 fristående sidor, 16 guider, 3 jämförelser och 13 bolagssidor, alltså 55 indexerbara adresser. Till det kommer fyra `/offert*`-adresser som är 301-omdirigeringar, och 404-sidan. Uppdragets 57 stämmer ungefär, beroende på vad man räknar med.

---

## Överst: det som ligger närmast akut

Inget är trasigt i den meningen att en sida kraschar, en länk leder till 404 eller schemat pekar fel. Tre saker påverkar ändå ranking eller konvertering direkt, och bör göras före lansering.

1. **Prisjämförelsen på startsidan finns inte i HTML:en som Google och AI-tjänsterna läser.** `PriceComparison` (`src/components/price-comparison.tsx:351`) och hjältens källrad (`src/routes/index.tsx:89-105`) hämtar data med `useQuery` utan loader, och `src/router.tsx` har ingen SSR-integration för react-query. Servern skickar ett 520 px högt grått block (`price-comparison.tsx:376-378`). Därför saknas i den serverrenderade HTML:en:
   - alla priser på startsidan
   - länkarna från pristabellen till de 13 bolagssidorna
   - datumet i "Priser hämtade från bolagens egna webbplatser …"

   Googlebot renderar JavaScript i efterhand, men GPTBot, ClaudeBot och PerplexityBot gör det i praktiken inte. Det är sajtens viktigaste innehåll, och det är osynligt för AI-sök. `/larmbolag` löser samma sak rätt: loader plus `initialData` (`src/routes/larmbolag.index.tsx:16-22, 59-64`). Samma mönster behövs på `/`.
2. **Den orange CTA-knappen har kontrast 2,7:1.** Vit text på `--cta #e8842c` (`src/styles.css:125`, `btn-cta` rad 179 och framåt) klarar inte ens gränsen 3:1 för stor text. Knappen finns på varje offert-CTA, i headern och på kontaktformuläret. Fokusmarkeringen på samma knapp är en orange ring med 40 procent opacitet, cirka 1,5:1. Det här är sajtens konverteringsknapp.
3. **`ScrollToTopOnLoad` drar tillbaka användaren till toppen** (`src/routes/__root.tsx:235-263`). Den scrollar till 0 vid 50, 250 och 750 ms och igen på `load` och `pageshow`. Med Usercentrics och bilder kan `load` komma flera sekunder in, när besökaren redan har börjat scrolla. `pageshow` gör att bakåtknappen tappar scrollpositionen. Med `scroll-behavior: smooth` (`styles.css:135`) syns det dessutom som en animerad ryckning. Det är svårt att se vid egen testning på snabb uppkoppling, men mobilbesökare på 4G träffas.

Förväntat och avsiktligt, inte ett fel: `noindex, nofollow` i `src/routes/__root.tsx:123` gäller alla sidor, och `pageHead` skriver inte över den. Det stämmer med CLAUDE.md fram till lansering.

---

## 1. Title och meta description

**Inga exakta dubbletter.** Varje sida har `pageHead` med egen title, description och canonical (41 routefiler). Rotens fallback-title används inte på någon indexerbar sida.

### Titlar som riskerar att kapas (över cirka 60 tecken)

| URL | Title | Tecken | Källa |
|---|---|---|---|
| /larmbolag/svenska-trygghetslosningar | Svenska Trygghetslösningar pris 2026: paket och villkor \| Mobilpoolen | 68 | `larmbolag.$slug.tsx:52` |
| /guider/larmcentral-och-certifiering | Larmcentral och certifiering: vad betyder SSF 136? \| Mobilpoolen | 63 | `guides.ts:170` |
| /jamfor | Jämför larmbolag: pris och villkor sida vid sida \| Mobilpoolen | 61 | `jamfor.index.tsx:9` |
| /guider/dorrforsaljning-och-angerratt | Köpt hemlarm vid dörren? Så fungerar ångerrätten \| Mobilpoolen | 61 | `guides.ts:122` |
| /lagenhetslarm, /basta-hemlarm, /guider/hemlarm-och-forsakring, /jamfor/sector-alarm-vs-securitas | 59 tecken | 59 | gränsfall, kapas troligen bara " \| Mobilpoolen" |

Att bara varumärket kapas är ofarligt. På de fyra första försvinner också en del av det sökbara.

### Svaga eller mallade titlar och beskrivningar

| URL | Problem | Källa |
|---|---|---|
| /faq | Title "Frågor och svar \| Mobilpoolen" saknar sökord. Hemlarm står inte med. | `faq.tsx:9` |
| /skribent/leon-hallstrom | "Leon Hallström: grundare av Mobilpoolen \| Mobilpoolen" nämner Mobilpoolen två gånger | `skribent.leon-hallstrom.tsx:11,19` |
| 13 × /larmbolag/[slug] | Samma description där bara namnet byts. Är lagligt, men Google skriver ofta om sådana. För Svenska Trygghetslösningar blir den cirka 172 tecken och kapas. | `larmbolag.$slug.tsx:53` |
| 3 × /jamfor/[slug] | Samma description där bara bolagsnamnen byts | `jamforelser.ts:49,69,89` |
| /guider/brandvarnare-och-brandlarm | Description på cirka 156 tecken, i gränsen | `guides.ts:184` |

Övriga descriptions ligger mellan cirka 90 och 150 tecken och svarar på frågan. Pelarsidorna har bra, specifika titlar.

---

## 2. Kanoniska adresser

| Kontroll | Resultat | Källa |
|---|---|---|
| Saknad canonical | Ingen indexerbar sida saknar canonical | alla routes via `pageHead` |
| Startsidans canonical utan snedstreck | **Bekräftat i koden** [rendering ej körd]. `index.tsx:75` anger `"https://mobilpoolen.se/"`, men `absoluteUrl` tar bort avslutande snedstreck, och för roten returneras `SITE_URL` utan snedstreck (`src/lib/seo.ts:15-16`). Resultatet blir `<link rel="canonical" href="https://mobilpoolen.se">`, och `og:url` får samma värde. | `seo.ts:16` |
| Konsekvens med sitemap | Sitemapen skriver `https://mobilpoolen.se/` med snedstreck (`sitemap[.]xml.ts:22` + `BASE_URL + "/"`). Organization och WebSite i roten använder `https://mobilpoolen.se` utan. | |
| Undersidor | Alla undersidor blir utan snedstreck, både de som skickar in en sökväg och de som skickar in en absolut URL. Konsekvent. | |

**Bedömning:** för roten är `https://mobilpoolen.se` och `https://mobilpoolen.se/` samma URL enligt RFC 3986, och Google behandlar dem likadant. Det är alltså ingen rankingförlust. Det är en inkonsekvens som gör att verktyg (Screaming Frog, Ahrefs) larmar och att två källor i vår egen kod säger olika saker. Minsta rättning: `seo.ts:16` returnerar `${SITE_URL}/` för roten.

**[kräver rendering]** Kontrollera med curl att `/villalarm/` (med snedstreck) svarar med 301 till `/villalarm` och inte 200. Annars blir det två adresser för varje sida, även om canonical räddar indexeringen.

---

## 3. Rubrikstruktur

**Bra som det är.** Varje sida har exakt en h1 i den serverrenderade HTML:en. Ingen sida saknar h1, och inga nivåer hoppar över ett steg. Nav, sidfot och lösenordsspärren har inga rubriker.

Små saker som ändå är fel:

| URL | Problem | Källa |
|---|---|---|
| 16 × /guider/* | Rutan "Jämför hemlarm gratis" renderas två gånger som h2, en för mobil och en för desktop, och den ena döljs med CSS. Det ger två identiska h2 i HTML:en. | `guide-page.tsx:225` och `:230` |
| / | h3 "Tips räcker en bit" står två gånger (mobil och desktop) | `index.tsx:777, 781` |
| / | h3-rubrikerna i prissektionen finns bara i klienten (se punkt 1 ovan) | `price-comparison.tsx:387, 453` |
| /om-oss | h1 ligger utanför `<main>` | `om-oss.tsx:47-58` |
| /kontakt | Två h2 som egentligen är kortetiketter ("Allmänna frågor & support") | `kontakt.tsx:110, 121` |

---

## 4. Interna länkar

### Trasiga länkar

**Inga hittade.** Alla länkmål, inklusive `/#jamfor`, `/#priser`, `/#sa-fungerar-det`, `/foretag#jamfor` och innehållsförteckningarnas ankare, pekar på routes eller id:n som finns. **`/priser` finns inte som route och ingen länk pekar dit.** Prisjämförelsen är ankaret `/#priser` på startsidan (`index.tsx:938`), och menyvalet "Priser" går till `/guider/vad-kostar-ett-hemlarm` (`site-nav.tsx:49`). `/offert*` är 301-omdirigeringar som ingen länkar till och som inte står i sitemapen, vilket är rätt.

### Klickdjup

Varje indexerbar sida ligger högst två klick från startsidan. Nivå 2 är: 8 av 13 bolagssidor (avarn-security, designlarm, garda-alarm, hemla, larmify, safeland, sakra-larm, svenska-trygghetslosningar), alla tre `/jamfor/[slug]`, `/skribent/leon-hallstrom` och nio guider. Det är bra.

### Sidor som nästan inga andra sidor länkar till (utöver nav och sidfot)

| URL | Länkar från innehåll | Nav/sidfot |
|---|---|---|
| /anvandarvillkor | **0** | bara sidfot |
| /om-oss | 1 (skribentsidan) | sidfot |
| /ordlista | 1 (`guider.index.tsx:118`) | nav + sidfot |
| /integritetspolicy | 1 | sidfot |
| /cookiepolicy | 1 | sidfot |
| /guider/larmklasser | 3 | sidfot |
| /guider/brandvarnare-och-brandlarm | 5 | nej |

Juridiska sidor behöver inga fler länkar. `/ordlista` och `/om-oss` borde däremot ha fler, eftersom de bär förtroende och besvarar definitionsfrågor.

### Strukturella hål i länkningen

- **`relatedGuides()` väljer aldrig fyra av guiderna** (`guides.ts:242-248`): pruta-pa-hemlarm, bindningstid-och-uppsagning, larmklasser och brandvarnare-och-brandlarm. Funktionen tar de tre första i samma kategori i registrets ordning, så samma guider vinner varje gång.
- **Brandvarnare är ensam i kategorin "Trygghet i hemmet"**, så dess relaterade guider faller tillbaka på kostnadsguider som inte hör ihop med ämnet.
- **De tre `/jamfor/*`-sidorna länkar inte till varandra**, bara tillbaka till `/jamfor`.
- **Klientrenderade länkar som inte finns i HTML:en:** pristabellens länkar till bolagssidorna (`price-comparison.tsx:229, 334`), och länkarna till `/guider/larmklasser`, `/guider/kamerabevakning-brf` och `/integritetspolicy` som bara syns i senare steg av offertformulären.

---

## 5. Bilder

**Bra som det är:**
- Alla redaktionella bilder går via `bild()` eller `getGuideImage()` och renderas som `<picture>` med webp först.
- Det finns inga externa bild-URL:er.
- Alla 32 nycklar i bildbanken har sina fyra filer.
- Alla `alt=""` sitter på dekorativa bilder.
- Nästan alla bilder står i en behållare med fast bildformat, så de orsakar inga layouthopp.

### Samma bild två gånger på samma sida (bryter mot CLAUDE.md)

| URL | Bild | Första plats | Andra plats |
|---|---|---|---|
| / | villa-tradgard | Bostadstyper (`index.tsx:46`) | guidekortet "Vad kostar ett hemlarm?" (`guide-images.ts:21`) |
| /villalarm | villa-tradgard | bandbild (`villalarm.tsx:97`) | relaterat kort till vad-kostar (`villalarm.tsx:35`) |
| /radhuslarm | trahus-tatort | bandbild (`radhuslarm.tsx:97`) | kortet pruta-pa-hemlarm (`guide-images.ts:39`). Känt sedan PR #27 och medvetet lämnat. |
| /guider/pruta-pa-hemlarm | villa-tradgard | CTA-band (`guide-images.ts:66`) | relaterat kort vad-kostar |
| /guider/larmcentral-och-certifiering | larmsiren-blixtljus | CTA-band (`guide-images.ts:60`) | relaterat kort hemlarm-utan-abonnemang |
| /guider/brandvarnare-och-brandlarm | larmsiren-blixtljus | CTA-band (`guide-images.ts:61`) | relaterat kort hemlarm-utan-abonnemang |

Kommentaren i `guide-images.ts:49-51` garanterar bara att CTA-bilden skiljer sig från hjältebilden. Den tar inte hänsyn till korten.

### Alt-text som skrivs om på sidan i stället för i registret

| Källa | Nyckel | Problem |
|---|---|---|
| `guide-images.ts:22-25` | larmsiren-blixtljus | "… på en husfasad, **larm utan abonnemang**". Sidans ämne har hamnat i alt-texten, vilket CLAUDE.md förbjuder. |
| `guide-images.ts:27-30`, `index.tsx:47`, `basta-hemlarm.tsx:15`, `radhuslarm.tsx:97`, `lagenhetslarm.tsx:93` | olika | Beskrivande och tillåtna enligt `bild("nyckel", "egen alt-text")`, inga problem |

### Bilder som laddas fel

| URL | Problem | Källa |
|---|---|---|
| /om-oss | Leons porträtt har `loading="lazy"` fast det sannolikt är sidans LCP. Filen är en jpg på 418 kB utan webp. | `om-oss.tsx:72-76`, `leon-portratt.jpg.asset.json:8` |
| /skribent/leon-hallstrom | Samma porträtt, lazy, troligen ovanför vecket på desktop | `skribent.leon-hallstrom.tsx:85-89` |
| /larmbolag/[slug] | Logotypen i heron är lazy, saknar mått och sitter i en kolumn med `w-fit`. När den laddas breddas kolumnen och h1 bryter om. Det ger layouthopp på desktop. | `bolagslogga.tsx:88-95`, `larmbolag.$slug.tsx:144-158` |
| alla band och hjältebilder | `fetchpriority="high"` finns ingenstans. Det finns ingen `srcSet`/`sizes`, så mobilen laddar alltid 1600 px-filen fast `-800`-filerna finns. | `housing-page.tsx:110-117`, `guide-page.tsx:104-110`, `trust-page.tsx:37-44`, `basta-hemlarm.tsx:111-117` |

---

## 6. Strukturerad data

**Bra som det är:**
- Varje FAQPage byggs av samma lista som visas, och svaren finns i den serverrenderade HTML:en.
- Inga Review, AggregateRating eller Product finns.
- Alla brödsmulor pekar på routes som finns.
- `/om-oss#leon` finns som id (`om-oss.tsx:62`).

| URL | Problem | Källa |
|---|---|---|
| / och /faq | **Fem frågor är uppmärkta som FAQPage på båda sidorna**, och "Vilket är det bästa hemlarmet 2026?" dessutom på /basta-hemlarm. Samma fråga konkurrerar med sig själv om utdraget. Håll schemat på den sida som ska ranka och visa frågan utan schema på den andra. | `index.tsx:59-76`, `faq.tsx:18` |
| /om-oss och /skribent/leon-hallstrom | Personen med `@id` `…/om-oss#leon` har `url` `/om-oss` på den ena sidan och `/skribent/leon-hallstrom` på den andra | `om-oss.tsx:27`, `skribent.leon-hallstrom.tsx:46` |
| 16 × /guider/* | Article-schemat har ingen `image`, fast varje guide har en hjältebild. `articleJsonLd` stöder fältet, men ingen guide skickar in det. | `seo.ts:96` |
| /brf, /foreningar | Frågorna står två gånger i koden, en gång som text för schemat och en gång som JSX för sidan. De stämmer i dag, men kan glida isär vid nästa redigering. | `brf.tsx:31-32`, `foreningar.tsx:28-29` |
| /faq, flikarna "Andra sidor" | Länkar till frågor som målsidan inte visar, eftersom `sidansFragor` kapar vid tre. Det gäller pruta (fråga 4-6), saga-upp-verisure (4), verisure-prishojning (4-5), hemlarm-med-kamera (4), inbrottsstatistik (4-5) och foretag (4). Den som klickar hittar inte frågan. | `faq-section.tsx:885-979` |

---

## 7. Sitemap och llms.txt

**Adresser:** sitemapen och `llms.txt` täcker samma 55 indexerbara adresser som finns som routes. Ingen adress saknas och ingen pekar på en borttagen sida. De 13 bolagsslugsen i databasen (`larmbolag.slug`) stämmer exakt med listan i `llms.txt`.

**lastmod stämmer inte.** `SIDLASTMOD = "2026-09-22"` (`sitemap[.]xml.ts:14`) gäller alla fasta sidor, jämförelser och bolagssidor. Enligt git-historiken ändrades följande efter det datumet:

| URL | Sitemap säger | Faktisk senaste innehållsändring | Commit |
|---|---|---|---|
| 13 × /larmbolag/[slug] | 2026-09-22 | 2026-09-23: ny mall, Vad du får, Så säger du upp. Därefter bara logotypens layout 24-25 sep. | #33, #37, #38, #41 |
| /villalarm, /radhuslarm, /lagenhetslarm, /fritidshuslarm | 2026-09-22 | 2026-09-23 (FAQ utökad till 7-8 frågor) | #29, 79c026d |
| / | 2026-09-22 | 2026-09-23 (FAQ och prispanel) | #31, #34 |
| /inbrottsstatistik | 2026-09-22 | 2026-09-23 (diagrammet ombyggt) | #28, #30 |
| /larmbolag, /jamfor | 2026-09-22 | 2026-09-23 (bandbild, mindre ändring) | #42 |

Guidernas lastmod kommer från `updatedIso` och stämmer. Bolagssidornas lastmod borde följa `larmbolag.innehall_kontrollerad` eller max(`v_startpaket.kontrollerad_datum`) i stället för en konstant.

**llms.txt:** komplett. Den räknar upp bolagen för hand. Sitemapen läser dem ur databasen, så om ett bolag läggs till i databasen hamnar det i sitemapen men inte i `llms.txt`.

---

## 8. Prisuppgifternas kontrolldatum

Databasen (läst 30 september 2026): alla 16 paket i `v_startpaket` har `kontrollerad_datum` **2026-09-21** och en `kalla_url`. Alla 13 rader i `larmbolag` har `innehall_kontrollerad` **2026-09-22**. Inget är äldre än nio dagar, så inget behöver kontrolleras om just nu. Tabellen `larmpris` är tom.

Sorterat med äldst först. Sidor utan datum står överst, eftersom de aldrig blir "gamla" i läsarens ögon trots att siffrorna åldras.

| URL | Pris som visas | Källa på sidan | Datum på sidan | Källa i koden |
|---|---|---|---|---|
| /guider/vad-kostar-ett-hemlarm | "cirka 175–600 kronor i månaden", startkostnad 0 till cirka 15 000 kr | **ingen** | **inget** (bara sidans "Uppdaterad 23 sep") | `guider.vad-kostar-ett-hemlarm.tsx:61-62` |
| / och /faq (frågan "Vad kostar ett hemlarm?") | samma intervall | **ingen** | **inget** | `faq-section.tsx:39` |
| /larmbolag | "X kr första året" per bolag | bara ingressen | **inget** | `larmbolag.index.tsx:101-108` |
| /larmbolag/[slug], listan "Andra larmbolag" | "X kr första året" för tre andra bolag | **ingen** | **inget** | `larmbolag.$slug.tsx:481-485` |
| /basta-hemlarm | första året per bolag | länk till bolagssidan | **inget vid priset**, bara bylinen "Uppdaterad 22 september 2026" som är hårdkodad | `basta-hemlarm.tsx:21, 206-234` |
| / (äga-hyra-kalkylatorn) | platshållare 499, 9 900, 299 kr | ingen | inget | `aga-hyra-kalkyl.tsx:126,140,148` (exempelvärden som ser ut som riktiga priser) |
| /guider/saga-upp-verisure, /guider/verisure-prishojning, /guider/saga-upp-sector-alarm, FAQ | bindningstid 12 mån, uppsägning 3 mån (villkor, inte kronor) | bolagets webbplats | 2026-09-22, hårdkodat | `faq-section.tsx:354-448` och guiderna |
| /jamfor/[slug] × 3 | startkostnad, månadsavgift, första året | `kalla_url` | 2026-09-21 ur databasen | `jamfor.$slug.tsx:295-297` |
| /larmbolag/[slug] × 13 | nyckeltal, paketkort, FAQ-svar | `kalla_url` | 2026-09-21 ur databasen | `startpaket-card.tsx:38-56`, `larmbolag.ts:146-170` |
| / (#priser) | hela pristabellen | `kalla_url` per rad | 2026-09-21 ur databasen (bara i klienten, se akutpunkt 1) | `price-comparison.tsx:245-316` |

Intervallet 175–600 kr stämmer i dag mot databasen: Svenska Alarm 175 kr är lägst och Verisure 599 kr högst. Startkostnaden 0–14 990 kr stämmer också. Men intervallet är hårdkodat och saknar datum, så det glider isär från databasen nästa gång ett pris ändras.

Brister i hur datumet räknas ut:
- `senasteKontrollerad` är det **senaste** datumet av alla rader (`prisjamforelse.ts:190`). Startsidan säger alltså att alla priser kontrollerades det datumet, även om någon rad är äldre. Det borde vara det äldsta.
- Sammanfattningen på bolagssidan tar datumet från `paket[0]` (`larmbolag.$slug.tsx:132`), även om bolaget har flera paket.
- Verisures bindningstid på `/larmbolag/verisure` kommer ur FAQ-registret med det fasta datumet 22 september. Nyckeltalen på samma sida kommer ur databasen. Efter nästa databasuppdatering visar sidan två olika datum.
- Två datumformat används: "2026-09-21" i paketkort och jämförelser, "21 september 2026" på startsidan.

---

## 9. Prestanda på de viktigaste sidorna

[kräver rendering] för siffrorna. Nedan är vad koden avgör.

| URL | Trolig LCP | Problem |
|---|---|---|
| / | h1-texten i den röda heron (`index.tsx:198-210`). Heron har ingen bild. | (1) Pristabellen och källraden renderas bara i klienten. Källraden växer från "…webbplatser" till "…webbplatser 21 september 2026" när datan kommer, och bryter troligen om, vilket ger ett litet layouthopp i heron. (2) Återkommande besökare med sparat utkast i `sessionStorage` får formuläret omritat till steg 2 efter hydrering (`offert-form.tsx:229-250`). |
| /priser | **Finns inte.** Prisjämförelsen är `/#priser` på startsidan, se ovan. | |
| /villalarm | Mobil: ingressen. Desktop: bandbilden i 21:9 (`housing-page.tsx:106-120`) | `loading="eager"` men ingen `fetchpriority`, ingen preload och ingen `srcSet`. Mobilen laddar 1600 px-filen. |
| /basta-hemlarm | Samma mönster (`basta-hemlarm.tsx:108-119`) | Samma. Datan kommer från loadern, så inget hopp. |
| /larmbolag/verisure | h1 eller ingress | Logotypen i heron är lazy och saknar mått. Den ger layouthopp på desktop (se punkt 5). |

**Globalt:**
- **Inga tunga bibliotek i någon routes bundel.** recharts, d3-geo, embla, react-day-picker, date-fns, cmdk, zod och react-hook-form importeras bara av `src/components/ui/*`, och ingen route importerar dem. De ligger alltså inte i klientkoden. `d3-geo` används inte alls längre (inbrottsstatistiken ritas med CSS sedan #28).
- **Det enda biblioteket som bara vissa sidor behöver är `@supabase/supabase-js`.** Det följer med startsidans klientkod via `PriceComparison` och `OffertForm`.
- **Oanvända beroenden gör ändå CSS:en större.** `@source "../src"` (`styles.css:2`) gör att Tailwind skannar de oanvända `ui/*`-komponenterna. Deras klasser hamnar i den stilmall som blockerar renderingen. 25 Radix-paket och ett tiotal andra beroenden i `package.json` används inte.
- **Typsnitt:** nio `@fontsource`-importer. Plus Jakarta Sans (700 och 800) används inte någonstans men laddas som `@font-face` (`styles.css:4-12`). Ingen preload finns för Sora 700 (h1) eller Inter 400.
- **Usercentrics** laddas asynkront utan preconnect (`__root.tsx:155-160`). Bannern blir ofta LCP-elementet på mobil.
- **Död kod:** `modal.tsx`, `success-modal.tsx`, `quote-controls.tsx`, `organisation-quote-page.tsx`, `illustrations.tsx` och `hooks/use-mobile.tsx` importeras inte av någon route.
- **`AutoReveal` påverkar inte LCP.** Den döljer inget serverrenderat innehåll.

---

## 10. Tillgänglighet som påverkar användbarheten

### Kontrast under WCAG AA

Kontrasten är beräknad med WCAG:s formel för relativ luminans på färgvärdena i `styles.css`.

| Var | Färgpar | Kontrast | Krav |
|---|---|---|---|
| Alla `btn-cta`: offert-CTA, header (`site-nav.tsx:257,338`), kontakt (`kontakt.tsx:241`) | vit på #e8842c | **2,70:1** (hover 3,20) | 4,5 (3,0 för stor text) |
| "Läs mer →" på guidekort (`guide-card.tsx:47`, `index.tsx:850`) | #e8842c på vit | 2,70 | 4,5 |
| Valda alternativ i offertformulären (`offert-form.tsx:106-108, 173-175, 436-439, 533-536`, `organisation-offert-form.tsx:332,447,475,552`) | #e8842c på #f5eaea | **2,30** | 4,5 |
| "Pris via offert" (`larmbolag.index.tsx:105`) | #e8842c på vit | 2,70 | 4,5 |
| "Publiceras inte" i nyckeltalen (`larmbolag.$slug.tsx:174`) | foreground/45 på vit | 2,88 | 3,0 |
| "–" för ej publicerat pris i pristabellen (`price-comparison.tsx:97`) | muted/60 på vit | 2,55 | 4,5 |
| Tidsetiketter i "När larmet går" (`home-sections.tsx:94`) | foreground/45 | 2,84 | 4,5 |
| Kommande steg i stegindikatorn (`progress-stepper.tsx:36,65`) | #9A908E | 3,1 | 4,5 |
| Rubriken ovanför partnerloggorna (`partner-logo-strip.tsx:20`) | foreground/55 | 3,89 | 4,5 |
| Kalkylatorns hjälptexter (`aga-hyra-kalkyl.tsx:61, 191, 226`) | /45 till /60 | 2,9–4,3 | 4,5 |

Godkända (kontrollerade): muted-foreground på vit är 5,9. /65 och /70 ligger på 5,4 och 6,4. Vit/70 på CTA-bandet klarar AA enligt mätningen i #36.

### Fokusmarkeringar

- **Det finns ingen global `:focus-visible`-regel.** `* { outline-ring/50 }` (`styles.css:132`) färgar webbläsarens standardring röd med 50 procent opacitet. Det ger cirka 2,7:1 mot vitt, cirka 1:1 på den röda heron och 1,4:1 på de mörkröda sektionerna och i sidfoten. Kravet är 3:1.
- **`btn-cta` tar bort ramen** och ersätter den med en orange skugga på 40 procent, cirka 1,5:1.
- **Saknar egen fokusmarkering helt:**
  - FAQ-knapparna (`faq-section.tsx:669`, `guide-page.tsx:376`)
  - alla valknappar i offertformulären
  - sidfotens länkar
  - länkarna i den röda heron (`index.tsx:252-293`)
- **Bra:** menyn i `site-nav.tsx:79,263,279,298` har `focus-visible:ring-2` med offset. Det mönstret kan återanvändas.

### Klickytor under 44 px på mobil

| Källa | Element | Ungefärlig höjd |
|---|---|---|
| `site-footer.tsx:145-153` | Juridiska länkar och "Cookieinställningar" (`text-xs`, inline) | cirka 16 px. Klarar inte ens WCAG 2.2:s minimum på 24 px. |
| `index.tsx:138-141` | Sparpillret i heron på mobil | cirka 21 px |
| `index.tsx:252-267, 288-293` | Textlänkar i heron | cirka 20 px |
| `offert-form.tsx:398-404, 766-772`, `organisation-offert-form.tsx:299-305, 690-696` | "Ändra" och "← Tillbaka" | cirka 20 px |
| `guide-page.tsx:375-376` | FAQ-frågorna på guider och pelarsidor. Utfyllnaden ligger på `<details>`, så bara textraden är klickbar. `list-none` tar bort markören för öppen eller stängd. | cirka 26 px |
| `site-footer.tsx:84,134` | Kolumnlänkar | cirka 20 px |
| `offert-form.tsx:433` | Bostadstypsknappar `h-9` | 36 px |
| `site-nav.tsx:254-261` | "Jämför gratis" i headern på mobil | cirka 38 px |
| `ordlista.tsx:517-528` | Bokstavslänkar `h-8` | 32 px |

### Formulär

- **Alla fält har en kopplad etikett.** Det gäller `htmlFor`/`id`, `fieldset`/`legend` för knappgrupper, omslutande `label` för kryssrutor och `sr-only`-etiketten i lösenordsspärren.
- **Felmeddelanden är inte kopplade till sina fält** (`aria-describedby` och `aria-invalid` saknas) i `offert-form.tsx:466-488` och i `organisation-offert-form.tsx`.
- **Fokus tappas i sista steget av båda offertformulären.** Knappens `key` byts från "next" till "submit" (`offert-form.tsx:774-793`, `organisation-offert-form.tsx:698-717`), så den fokuserade knappen tas bort och fokus hamnar på `body`. Stegbyten annonseras inte.
- **Bekräftelsen på kontaktformuläret ligger inte i en live region** (`kontakt.tsx:134`).
- **Mobilmenyn saknar fokusfälla** och flyttar inte fokus in i panelen (`site-nav.tsx:274-345`). Escape fungerar.

---

## 11. Ordet "oberoende" och påståenden om egna tester

**Oberoende:** ingen förekomst där Mobilpoolen kallar sig oberoende i något som renderas.

| Källa | Text | Bedömning |
|---|---|---|
| `src/components/faq-section.tsx:52` | "Vi kallar oss därför inte oberoende." | Förnekelse, rätt |
| `src/routes/sa-jamfor-vi.tsx:94` | "Vi kallar oss inte oberoende." | Förnekelse, rätt |
| `src/routes/sa-tjanar-vi-pengar.tsx:59` | "… vi inte är en neutral part." | Förnekelse, rätt |
| `src/routes/guider.larmcentral-och-certifiering.tsx:61` | "… granskas regelbundet av ett oberoende certifieringsorgan." | Handlar om certifieringsorganet, inte oss. Korrekt, men fastnar i ett ordfilter. |
| `README.md:123, 433, 441, 451, 473, 557` | "Strömklart är en oberoende jämförelsetjänst …" m.fl. | **README.md är specen för ett annat projekt (Strömklart, el).** Den renderas inte, men innehåller "oberoende" sex gånger och ett påhittat betyg "4,7 av 5" (rad 123). Den bör bytas mot en README för Mobilpoolen, så att ingen framtida session kopierar därifrån. |
| `CLAUDE.md:13` | Regeln själv | Rätt |

`src/integrations/supabase/types.ts` beskriver också Strömklarts databas (`contract_snapshots`, `spot_prices`). Den används inte men är samma sorts rest.

**Egna tester:** inga påståenden om att vi har testat larm. Noll träffar på "testat", "testade", "vårt test", "testvinnare", "bäst i test", "testresultat" och "vi rekommenderar". Där ämnet tas upp är det förnekelser: "Nej. Vi installerar inga larm och provar dem inte i bruk" (`faq-section.tsx:73-74`) och "Vi utser ingen vinnare" (`basta-hemlarm.tsx:123-126`). Inga `[KONTROLLERA]`-markeringar finns kvar, och Larmkollen nämns bara i förbudet i CLAUDE.md.

---

## 12. Min bedömning: fem åtgärder med störst effekt

1. **Rendera prisjämförelsen på servern** (loader plus `initialData` på `/`, som på `/larmbolag`). Sajtens starkaste argument, priser med källa, är i dag osynligt för AI-tjänsterna. Google ser det först i andra renderingsvågen, och länkarna till bolagssidorna saknas i HTML:en.
2. **Byt CTA-färgen eller textfärgen så att knappen klarar 4,5:1, och ge den en synlig fokusring.** Knappen är det enda som ger intäkter, och i dag har den lägst kontrast av allt på sidan.
3. **Ta bort `load`, `pageshow` och timrarna i `ScrollToTopOnLoad`.** Att bli dragen tillbaka till toppen mitt i läsningen är en direkt orsak till att besökare lämnar, och den träffar främst mobil.
4. **Ta ett beslut om var varje FAQ-fråga ska ha schema, och sluta märka upp samma fråga på `/`, `/faq` och `/basta-hemlarm`.** Rätta samtidigt `/faq`-länkarna till frågor som målsidan inte visar. Det här avgör vilken sida som vinner utdraget för "vad kostar ett hemlarm", som är den viktigaste frågan på sajten.
5. **Sätt datum och källa på varje pris som i dag saknar dem** (`/larmbolag`, "Andra larmbolag", `/basta-hemlarm`, intervallet 175–600 kr). Använd det äldsta datumet, inte det senaste. Det är CLAUDE.md:s eget krav, och det är det som gör att AI-svar vågar citera oss.

**Bra som det är, och inte värt tid nu:**
- rubrikstrukturen
- avsaknaden av trasiga länkar
- klickdjupet
- schemat i övrigt
- bildbanken
- att "oberoende" och testpåståenden hålls borta

Canonical utan snedstreck på startsidan är en kosmetisk inkonsekvens, inte ett rankingproblem. Rätta den på en rad när någon ändå är i `seo.ts`. Dubbelbilderna, lastmod och de fyra långa titlarna är riktiga fel men små. De kan samlas i en städ-PR efter de fem ovan.
