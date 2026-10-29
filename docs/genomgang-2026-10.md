# Genomgång av Mobilpoolen, oktober 2026

Gjord 1 oktober 2026 på grenen `claude/genomgang-okt`. Sajten är inte lanserad: `noindex, nofollow` och lösenordsspärren är orörda.

## Sammanfattning

- Kontaktformuläret var trasigt. Det anropade en funktion som inte fanns och gav 404, så inga meddelanden kom fram. Nu går det till en ny funktion som är driftsatt och testad.
- Offertformuläret saknade spamskydd. Nu finns honeypot i formulären och en spärr i databasen som stoppar fler än 3 förfrågningar per e-post eller telefon på 10 minuter och fler än 30 totalt.
- De publika rollerna i databasen hade full skrivrätt på alla tabeller. RLS skyddade raderna, men TRUNCATE omfattas inte av RLS. Nu har de bara läsrätt på det sajten visar och rätt att lägga in förfrågningar.
- Mörka sektioner och sidfot var vinröda. Varumärkesfakta säger marinblått, så de är nu marinblå (#0B1F3A). Kontrasten är kontrollerad.
- 5 nya sidor och 11 förstärkta. Inga priser, belopp eller villkor utan källa: det som inte gick att belägga är markerat [KONTROLLERA] och listat nedan.
- Det viktigaste inför lansering ligger utanför koden. Inga larmbolag är markerade som partner, tabellen `offertutskick` är tom och det finns ingen process som skickar förfrågningar vidare. Sajten lovar att två till tre bolag hör av sig inom ett dygn.

## Verifiering

| Kontroll | Resultat |
|---|---|
| `bun run build` | Grönt |
| `npx tsc --noEmit` | 0 fel |
| `npx eslint .` | 0 fel, 7 varningar (alla fanns före, react-refresh i shadcn-filer och faq-section) |
| Crawl av alla sitemap-URL:er och alla interna länkar mot SSR-servern | 252 sidor, alla 200, alla i sitemap, ingen sida utanför sitemap, inga trasiga interna länkar |
| Title, meta description, canonical | Exakt en av varje på alla sidor, inga dubbletter av title |
| H1 | Exakt en på alla sidor |
| Bilder utan width/height | 0 (var 247 sidor av 247) |
| Okänd URL | HTTP 404 med egen 404-sida och titeln "Sidan finns inte" |
| Säkerhetsheaders | nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy, HSTS på alla serverrenderade svar |
| RLS som anonym (curl mot REST) | Läsa förfrågningar: nekas. Ändra larmbolag: nekas. Förfrågan utan samtycke: nekas. För långa fält: nekas. Spärren testad i en transaktion som rullades tillbaka: 3 ok, den fjärde stoppas. |
| Formulären i Chromium (Playwright) | 50 av 50 tester gröna: validering per steg, tangentbord, 375 px, honeypot, laddningsläge, nätverksfel, spärr, dubbelklick |

### Testinskick som gjordes (kan raderas)

1. Privat offertförfrågan 1 oktober 16:16, namn "Test Claude genomgång", e-post hallstrom.leon+mobilpoolentest@gmail.com.
2. BRF-förfrågan 1 oktober 16:17, organisation "Test BRF Claude genomgång", samma kontaktuppgifter.
3. Två meddelanden via kontaktformuläret till info@mobilpoolen.se, båda märkta som test.

Notismejlen för 1 och 2 har gått till reg.offert@mobilpoolen.se.

## Fynd per nivå

Status: **Åtgärdat** = fixat i den här PR:en. **Leon** = kräver beslut eller åtkomst. **Kvar** = inte gjort.

### Kritiskt

| # | Fil | Problem | Åtgärd | Status |
|---|---|---|---|---|
| K1 | `src/routes/kontakt.tsx` | Formuläret anropade edge function `kontakt` i Mobilpoolens projekt, som inte finns (404). Inga meddelanden kom fram. | Ny funktion `mobilpoolen-kontakt` i Elpoolens projekt, där Resend finns (samma upplägg som offertnotisen). Honeypot, validering, CORS, gräns per IP. Källkod i `supabase/functions/mobilpoolen-kontakt/`. Sidan visar svenska fel per felkod. | Åtgärdat, driftsatt och testat |
| K2 | Databasen, `offertforfragan` | Inget spamskydd. Formuläret skriver direkt till tabellen med den publika nyckeln, så en bot kunde fylla tabellen och skicka hundratals notismejl. | Trigger `offertforfragan_spamskydd`: gräns per e-post/telefon och totalt, plus längdgränser. Honeypot i alla tre offertflödena. Migration `20261001120000`. | Åtgärdat, i drift |
| K3 | Affär | Inga bolag har `partner = true`, `offertutskick` är tom och det finns ingen process för att skicka förfrågningar vidare. Tackvyn lovar att två till tre bolag hör av sig inom ett dygn. | Avtal och utskicksrutin måste finnas före lansering. Se lanseringschecklistan. | Leon |
| K4 | `src/styles.css` m.fl. | Mörka sektioner och sidfot var vinröda (#3f0e10). Varumärkesfakta: marinblått. | Tokens och alla hårdkodade överlägg bytta till #0B1F3A. CTA-text på orange 6,11:1 (hover 5,16:1). | Åtgärdat |

### Högt

| # | Fil | Problem | Åtgärd | Status |
|---|---|---|---|---|
| H1 | Databasen | `anon` och `authenticated` hade INSERT, UPDATE, DELETE och TRUNCATE på alla tabeller och vyer. | Minsta rättigheter: SELECT på larmbolag, startpaket och två vyer, INSERT på offertforfragan. Migration `20261001120100`. Vakthundens kontroller fungerar fortfarande. | Åtgärdat, i drift |
| H2 | `supabase/functions/mobilpoolen-offertnotis` | Inget bekräftelsemejl till besökaren. | Version 4 skickar bekräftelse med vad som händer nu, vad besökaren skickade, ersättningsupplysning och hur förfrågan dras tillbaka. | **Ej driftsatt.** Leon godkänner texten först |
| H3 | Alla sidor | Ingen bild hade width/height (layoutskift, CLS). | Mått från de faktiska filerna (`src/lib/bildbank-matt.ts`), lazy under vecket, `fetchPriority` på hjältebilder. | Åtgärdat |
| H4 | `/integritetspolicy` | Märkt "Utkast", saknade Resend, rättslig grund per ändamål och överföring utanför EU. | Kompletterad. Utkastmarkeringen står kvar. Sex punkter [KONTROLLERA]. | Delvis, Leon och jurist |
| H5 | Databasen | Policyn lovar radering efter 12 månader, men inget raderar (pg_cron finns inte i projektet). | Beslut om lagringstid, sedan schemalagd radering, t.ex. pg_cron eller ett schemalagt jobb i Elpoolens projekt. | Leon |
| H6 | `/sa-tjanar-vi-pengar`, `/om-oss` | Ersättningsmodellen beskrevs olika: "när du tecknar avtal via oss" eller "per förmedlad förfrågan". | Neutral text och [KONTROLLERA] tills modellen är bestämd. | Leon |
| H7 | Tunna sidor | /foretag, /brf och /foreningar hade 258 till 351 ord, utan brödsmulor och utan datum. Om oss, Så tjänar vi pengar och Så jämför vi hade 170 till 243 ord. | Förstärkta till 409 till 970 ord, med BreadcrumbList, WebPage eller AboutPage, dateModified och ansvarig. | Åtgärdat |
| H8 | Databasen, `larmbolag` | Svenska Alarm saknar bindningstid och uppsägningstid i databasen, men bolagets supportsida säger "inga bindningstider" och tre månaders uppsägning (kontrollerat igen 1 oktober). Nya guiden om bindningstid visar därför "Publiceras inte". | Lägg in värdena med rätt källa. Tabellen har bara en källkolumn per bolag (`innehall_kalla`, i dag villalarmsidan), så källan per fält behöver lösas först. | Leon |
| H9 | Mätning | Ingen analys och inga formulärhändelser. | `src/lib/sparning.ts` lägger händelser i dataLayer bara efter samtycke i Usercentrics (statistics eller marketing). Inga personuppgifter skickas. Ingen tagg laddas än. | Åtgärdat, verktyg väljs av Leon |

### Medel

| # | Fil | Problem | Åtgärd | Status |
|---|---|---|---|---|
| M1 | `src/routes/__root.tsx` | 404-sidan fick startsidans title. | Rättat villkoret (`globalNotFound`). | Åtgärdat |
| M2 | Pelarsidorna /villalarm, /lagenhetslarm, /radhuslarm, /fritidshuslarm | Saknade Article med author och dateModified. | Lagt till med befintligt datum 22 september. | Åtgärdat |
| M3 | Formulären | Briefens "när"-fråga saknades. | Frivillig fråga "När vill du ha larmet?" i privat- och organisationsflödet. Ny kolumn `onskad_start`, migration `20261001120200`. | Åtgärdat |
| M4 | Formulären | Briefen nämner larmcentral och smart lås som funktioner. Formuläret frågar inte efter dem. | Inte tillagt, eftersom formuläret ska ha så få fält som möjligt. Alternativet är att göra om steg 3 till en flervalslista. | Leon |
| M5 | `src/server.ts` | Inga säkerhetsheaders. | Tillagda. X-Frame-Options hoppas över för Lovables förhandsvisning. | Åtgärdat |
| M6 | Statiska filer | Headers gäller inte /assets och robots.txt. Ingen CSP. | Förslag: `public/_headers` och en CSP som Report-Only (utkast finns i PR-texten). | Kvar |
| M7 | Klientbunten | supabase-js (51 kB gzip) laddas i webbläsaren eftersom loaders anropar Supabase på båda sidor. Huvudbunten är 128 kB gzip. | Flytta läsningar till `createServerFn`. | Kvar |
| M8 | Typsnitt | Plus Jakarta Sans laddades men användes inte (ordmärket är en SVG). Alla teckenuppsättningar laddades. | Borttagen, och bara latin laddas. 31 till 7 @font-face. | Åtgärdat |
| M9 | Mobil 375 px | Klickytor under 44 px i sidfot, meny, brödsmulor, innehållsförteckning och pristabell. | Höjda till 44 px. Ingen horisontell scroll på 13 testade sidor. | Åtgärdat |
| M10 | `/` | Orange "Läs mer →" på vita kort gav 2,7:1. | text-primary, 7,75:1. | Åtgärdat |
| M11 | `/foretag` | Närbild (`passerkort-lasare`) som 21:9-band, mot CLAUDE.md. Banken saknar en scenbild för företag. | /foreningar fick scenbild i CTA-bandet. /foretag kräver ny bild i banken. | Delvis, Leon |
| M12 | Usercentrics | Inställningen listar CookieYes och Unsplash som tjänster. Det verkar vara rester. | Rensa i Usercentrics. | Leon |
| M13 | Fem tunna guider | husdjur 340, larmcentral 420, försäkring 433, utan abonnemang 489, brandlarm 566 ord. Flera saknade FAQPage. | Förstärkta till 1 090 till 1 356 ord med FAQ, källor och datum. | Åtgärdat |
| M14 | `public/llms.txt`, `robots.txt` | llms.txt kallade tjänsten jämförelsetjänst utan affärsmodell. Google-Extended var inte nämnd. | Ny inledning med affärsmodell, bolagsuppgifter och ansvarig. Google-Extended och Applebot-Extended tillagda. | Åtgärdat |

### Lågt

| # | Fil | Problem | Åtgärd | Status |
|---|---|---|---|---|
| L1 | `src/routes/cookiepolicy.tsx` | Tankstreck i löptext, två lagringsnycklar saknades. | Rättat. | Åtgärdat |
| L2 | `src/components/site-footer.tsx` | Bolagsadress saknades, och "Så fungerar det" låg dubbelt. | Adress tillagd, dubbletten borttagen. | Åtgärdat |
| L3 | `offert-form.tsx`, `organisation-offert-form.tsx` | En dold `sr-only` med samtyckestexten gör att skärmläsare läser texten två gånger. | Ta bort spannet om det inte har något annat syfte. | Kvar |
| L4 | `/larmbolag/svenska-trygghetslosningar` | Title 68 tecken, meta 172 tecken, eftersom bolagsnamnet är långt. | Kortare mall för långa namn. | Kvar |
| L5 | `/guider/kamerabevakning-brf` | Ingen FAQPage. | Lägg till frågor i registret. | Kvar |
| L6 | `faq-section.tsx` / `guider.vaktarutryckning.tsx` | FAQ:n på /jamfor/securitas-vs-avarn säger fria utryckningar "i STORA". Nya guiden säger LILLA och STORA enligt Securitas abonnemangssida. Det motsäger inte varandra, men är otydligt. | Kontrollera mot securitashome.se och skriv lika. | Leon |
| L7 | `src/components/password-gate.tsx` | Lösenordet står i klientkoden. | Godtagbart för en tillfällig spärr. Tas bort vid lansering. | Kvar |
| L8 | `.env`, `supabase/config.toml`, `src/integrations/supabase` | Lovable Cloud-projektet (jxifsjatetmgnjelvhjh) finns kvar i genererad kod för auth-middleware. Ingen data går dit: alla läsningar och skrivningar går till Mobilpoolens egen databas. | Låt stå, Lovable genererar det. | Kvar |
| L9 | Sidan för Leons porträtt | Bilden ger 404 lokalt (Lovable-asset). | Kontrollera efter publicering. | Kvar |
| L10 | Ingen | Larmkollen förekommer inte någonstans i koden eller HTML:en. "Oberoende" förekommer bara som "vi kallar oss inte oberoende" och om certifieringsorgan. | Ingen åtgärd. | OK |

## Nya sidor

Alla följer Fas 4 med en H1, title under 62 tecken, meta under 160 tecken, canonical, Article, BreadcrumbList och FAQPage, ingress som svarar direkt, uppdateringsdatum med ansvarig och CTA högt upp, i mitten och i slutet med ersättningsraden.

| Sida | Huvudsökord | Ord | Vad som saknades i sökresultatet |
|---|---|---|---|
| /guider/vaktarutryckning | väktarutryckning, vad kostar väktarutryckning | 1 606 | Bara forum och testsajter. Ingen förklarade förloppet eller vad som kostar extra per bolag. |
| /guider/smarta-las-och-hemlarm | smarta lås hemlarm | 1 727 | Produkttester av lås, men ingen sida om kopplingen till larmbolag, låsklass och försäkring. |
| /guider/flytta-med-hemlarm | flytta med larm | 1 657 | Allmänna flyttchecklistor, men ingen jämförelse av bolagens flyttvillkor. |
| /guider/hemlarm-utan-bindningstid | hemlarm utan bindningstid | 1 139 | Ingen sida listade bolag med källa och datum. Datat hämtas ur databasen i loadern. |
| /sa-fungerar-mobilpoolen | så fungerar Mobilpoolen | 757 | Förtroendesida i fem steg, från förfrågan till offert. Länkad från sidfot, Om oss och villkoren. |

Gjort i befintliga sidor i stället för nya, för att undvika kannibalisering:
- "Larm med eller utan larmcentral" och "gör det själv-larm" ligger i /guider/hemlarm-utan-abonnemang.
- "Så fungerar en larmcentral" ligger i /guider/larmcentral-och-certifiering.
- "Hemlarm pris" täcks av /guider/vad-kostar-ett-hemlarm och kalkylatorn, som uppdaterades samma dag i en annan PR.
- Ordlista, Kontakt, kalkylator, jämförelsesidorna och bolagssidorna fanns redan.

## [KONTROLLERA]: alla punkter

| Sida | Påstående | Varför |
|---|---|---|
| /guider/vaktarutryckning | Vad Svenska Alarm tar för en onödig utryckning | Supportsidan säger att det kostar men anger inget belopp |
| /guider/smarta-las-och-hemlarm | Vilka låskrav privata hemförsäkringar har på ytterdörren | Hittade bara krav för företag (Länsförsäkringar skyddsklass 2) |
| /guider/hemlarm-och-forsakring | Rabatt hos If och Dina Försäkringar | Deras sidor gav 404, villkoren hittades inte |
| /sa-tjanar-vi-pengar | Hur ersättningen räknas (per förfrågan, per avtal eller annat) | Motstridiga uppgifter på sajten, se H6 |
| /sa-fungerar-mobilpoolen | Vilka kriterier som styr vilka bolag som får förfrågan | Det finns ingen sådan logik än |
| /integritetspolicy | Rättslig grund för bekräftelsemejlet | Samtycke eller berättigat intresse |
| /integritetspolicy | Vilka uppgifter som ingår i faktureringsunderlaget till larmbolagen | Beror på avtalen |
| /integritetspolicy | Var Lovable driftar sajten | Inte kontrollerat |
| /integritetspolicy | Grund för överföring till USA (Resend, Lovable) | Dataskyddsramverket eller standardavtalsklausuler |
| /integritetspolicy | 12 månaders lagring och hur radering går till | Ingen radering finns (H5) |
| /integritetspolicy | Lagringstid för kontaktmeddelanden | Inte beslutad |

Uppgifter som inte gick att belägga och därför **togs bort** i stället för att markeras:
- Tidigare krav i larmcentralsguiden ("minst två personer", "dubbla strömkällor").
- "Ersättningen skiljer sig inte nämnvärt mellan bolagen" på /sa-tjanar-vi-pengar.
- Verisures och Securitas Homes flyttkostnad. Texten säger "fråga bolaget".

## Beslut du behöver ta

1. **Avtal och utskick (K3).** Vilka bolag förfrågningar ska gå till, hur de skickas och om "inom ett dygn" i tackvyn kan lovas. Kontaktsidan lovar också svar "oftast inom 24 timmar".
2. **Bekräftelsemejlet (H2).** Godkänn texten i `supabase/functions/mobilpoolen-offertnotis/index.ts` (funktionen `kundmejl`). Sedan driftsätts den med ett kommando, och tackvyn och policyn kan säga "svara på bekräftelsen för att ångra".
3. **Ersättningsmodellen (H6),** så att /sa-tjanar-vi-pengar, villkoren och mejlet säger samma sak.
4. **Lagringstid och radering (H5).** Förslag: 12 månader för förfrågningar och kontaktmeddelanden, med automatisk radering.
5. **Integritetspolicyn:** juristgranskning, och när utkastmarkeringen tas bort.
6. **Mätverktyg (H9).** GA4 via GTM eller ett cookiefritt alternativ. Det läggs som tjänst i Usercentrics och i cookiepolicyn innan det slås på.
7. **Svenska Alarms villkor i databasen (H8),** och hur källa per fält ska lagras.
8. **Designfrågor efter marinblått:**
   - Ska den varma rosa accenten (#FFD2C7) på mörka ytor och den rosa tonen i ljusa ytor stå kvar, eller bytas mot en kallare accent som Elpoolens?
   - Ska knappen ha Sora och 56 px som på Elpoolen?
9. **Formulärets funktionsfrågor (M4):** behåll tre ja/nej-frågor, eller en flervalslista med larmcentral, kamera, brandskydd, väktare, smart lås och husdjur.
10. **Bildbyten:**
    - Godkänn att /guider/saga-upp-sector-alarm fått hjältebilden `familj-brygga-solnedgang` (låsbilden behövdes i guiden om smarta lås).
    - Ta fram en scenbild för /foretag.
11. **Nya titlar:** "Hemlarm utan abonnemang eller med larmcentral?" och "Larmcentral: så fungerar den och vad är SSF 136?".
12. **Testraderna** i `offertforfragan` kan raderas.

## Lanseringschecklista

**Före lansering**
- [ ] Avtal med larmbolag klara, `partner` satt i `larmbolag`, rutin för utskick och loggning i `offertutskick`.
- [ ] Bekräftelsemejlet (version 4) godkänt och driftsatt. Testa med ett riktigt inskick.
- [ ] Ersättningsmodellen bekräftad och [KONTROLLERA] borta från /sa-tjanar-vi-pengar och /sa-fungerar-mobilpoolen.
- [ ] Integritetspolicyn granskad, [KONTROLLERA] lösta, utkastrutan borttagen.
- [ ] Radering efter beslutad lagringstid på plats.
- [ ] Övriga [KONTROLLERA] i guiderna lösta eller meningarna borttagna (inga markeringar ska synas live).
- [ ] Testrader raderade ur `offertforfragan`.
- [ ] Usercentrics rensad (CookieYes, Unsplash), mätverktyg valt och inlagt som tjänst, cookiepolicyn uppdaterad.
- [ ] Brevlådorna info@, samarbeten@ och reg.offert@mobilpoolen.se tar emot (kontaktfunktionen och notisen skickar dit).

**Lanseringsdagen**
- [ ] Merga PR #51 (tar bort global noindex) och ta bort `PasswordGate` ur `__root.tsx`.
- [ ] Publicera i Lovable och kontrollera med curl att `<meta name="robots">` inte längre är noindex på en guide, en pelare och startsidan.
- [ ] Kontrollera https://mobilpoolen.se/robots.txt, /sitemap.xml (252 URL:er) och /llms.txt.
- [ ] Kontrollera att www.mobilpoolen.se och http omdirigerar med 301 till https://mobilpoolen.se.
- [ ] Kontrollera säkerhetsheaders på produktion med `curl -sI https://mobilpoolen.se/`.
- [ ] Skicka ett riktigt test via offertformuläret och kontaktformuläret från produktionsdomänen (CORS).

**Search Console och Bing (förberett)**
- [ ] Lägg till domänegendom mobilpoolen.se i Google Search Console (DNS TXT hos domänleverantören).
- [ ] Skicka in https://mobilpoolen.se/sitemap.xml.
- [ ] Begär indexering av startsidan, de fem pelarna (/, /villalarm, /lagenhetslarm, /foretag, /guider/vad-kostar-ett-hemlarm) och de nya guiderna.
- [ ] Bing Webmaster Tools: importera från Search Console. Skicka IndexNow med nyckeln i `public/8f3c2a9e5d7b4e1f9a6c0b2d4e8f1a3c.txt`.
- [ ] Efter en vecka: kontrollera täckningsrapporten, Core Web Vitals och att FAQ, brödsmulor och Article valideras i Rich Results Test.

## Designavvikelser mot Elpoolen

| Del | Elpoolen | Mobilpoolen nu | Bedömning |
|---|---|---|---|
| Primärfärg | Petrol #0E6C7E | Krimson #A4161A | Enligt varumärket |
| Mörka sektioner och sidfot | Mörk petrol #103D47 | Marinblå #0B1F3A (var vinröd) | Rättat enligt varumärket |
| Hero | Petrol med vit text | Krimson med vit text, 7,75:1 | Enligt varumärket |
| CTA | Orange #E8842C med **vit** text (2,70:1, klarar inte AA) | Orange med marinblå text (6,11:1) | Avsiktlig avvikelse för tillgänglighet. Elpoolen bör följa efter. |
| CTA-typsnitt och höjd | Sora, minst 56 px, radie 14 px | Inter, 48 px, radie 12 px | Avvikelse, beslut 8 |
| Radie | 0,875rem | 0,75rem | Liten avvikelse |
| Bakgrund | Tonad #F1F8F9 | Vit, ljusa ytor med rosa ton | Avvikelse, beslut 8 |
| Typsnitt | Inter, Sora, Plus Jakarta Sans | Inter och Sora. Ordmärket är SVG, så Plus Jakarta Sans behövs inte. | Enligt varumärket |

## Inventering (Fas 1)

### Teknik

- **Stack:** TanStack Start med SSR, React 19, Tailwind 4, Nitro med Cloudflare som mål, byggt i Lovable.
- **Supabase:** Mobilpoolens projekt ceafpihnphtcysdnowdg i eu-north-1.
- **Tabeller, alla med RLS:**
  - `larmbolag` (13), `startpaket` (16), `standardpaket`, `paketkomponent`, `larmpris`, `prisandring`, `offertforfragan` och `offertutskick` (tom).
  - Vyerna `v_startpaket` och `v_prisjamforelse` har security_invoker.
  - Triggers på `offertforfragan`: `offertforfragan_normalisera`, `offertforfragan_notis` (pg_net till Elpoolens projekt) och den nya `offertforfragan_spamskydd`.
- **Edge functions:** inga i Mobilpoolens projekt. I Elpoolens projekt finns:
  - `mobilpoolen-offertnotis` (version 3 i drift)
  - `mobilpoolen-vakthund`
  - `mobilpoolen-kontakt` (ny)
- **Formulär:**
  - Privat offert i heron på startsidan (5 steg).
  - Organisationsflöden i heron på /foretag, /brf och /foreningar (6 steg).
  - Kontakt.
  - Lösenordsspärren.
- **Externa skript:** bara Usercentrics (web.cmp.usercentrics.eu). Ingen analys.
- **Sitemap:** `src/routes/sitemap[.]xml.ts`, 252 URL:er med lastmod. Guider tas från `guides.ts`, jämförelser från `jamforelser.ts` och kommuner från `inbrottsstatistik-kommuner.ts`.
- **robots.txt:** tillåter alla och AI-botar. Sitemap anges.
- **llms.txt:** listar alla publicerade sidor.

### Sidor efter genomgången

Alla sidor serverrenderas, och innehåll från databasen hämtas i routens loader. "Länkar in" räknar sidor som länkar hit. 251 betyder att sidan ligger i navet eller sidfoten.

| URL | Title (tecken) | Meta (tecken) | H1 | Ord | SSR | Sitemap | Länkar in/ut |
|---|---|---|---|---|---|---|---|
| / | Jämför hemlarm 2026 – priser och offerter · Mobilpoolen (54) | 146 | Jämför larm. Hitta ert bästa pris. | 1822 | ja | ja | 251/51 |
| /anvandarvillkor | Användarvillkor · Mobilpoolen (28) | 78 | Användarvillkor | 401 | ja | ja | 251/40 |
| /basta-hemlarm | Bästa hemlarm 2026: jämför publicerade villkor · Mobilpoolen (59) | 143 | Bästa hemlarm 2026: så väljer du rätt för din bostad | 895 | ja | ja | 251/51 |
| /brf | Larm för BRF: trapphus, förråd och garage · Mobilpoolen (54) | 138 | Larm för BRF:er. Hitta ert bästa pris. | 776 | ja | ja | 251/41 |
| /cookiepolicy | Cookiepolicy · Mobilpoolen (25) | 82 | Cookiepolicy | 247 | ja | ja | 251/39 |
| /faq | Frågor och svar · Mobilpoolen (28) | 79 | Frågor och svar | 1938 | ja | ja | 251/63 |
| /foreningar | Larm för föreningar: klubblokal och förråd · Mobilpoolen (55) | 146 | Larm för föreningar. Hitta ert bästa pris. | 683 | ja | ja | 251/41 |
| /foretag | Företagslarm: jämför offerter för företag · Mobilpoolen (54) | 141 | Företagslarm. Hitta ert bästa pris. | 970 | ja | ja | 251/42 |
| /fritidshuslarm | Fritidshuslarm: pris, täckning och skydd 2026 · Mobilpoolen (58) | 149 | Larm till fritidshuset: skydda huset när ingen är där | 1358 | ja | ja | 251/46 |
| /guider | Guider om hemlarm · Mobilpoolen (30) | 105 | Guider & råd | 1060 | ja | ja | 251/57 |
| /guider/bindningstid-och-uppsagning | Bindningstid och uppsägning av hemlarm · Mobilpoolen (51) | 108 | Bindningstid och uppsägning av hemlarm | 677 | ja | ja | 34/41 |
| /guider/brandvarnare-och-brandlarm | Brandvarnare och brandlarm i hemmet · Mobilpoolen (48) | 133 | Brandvarnare och brandlarm i hemmet | 1109 | ja | ja | 12/45 |
| /guider/byta-larmbolag | Byta larmbolag: så gör du steg för steg · Mobilpoolen (52) | 142 | Byta larmbolag: så gör du steg för steg | 931 | ja | ja | 251/46 |
| /guider/dorrforsaljning-och-angerratt | Köpt hemlarm vid dörren? Så fungerar ångerrätten · Mobilpoolen (61) | 111 | Köpt hemlarm vid dörren? Så fungerar ångerrätten | 606 | ja | ja | 19/42 |
| /guider/flytta-med-hemlarm | Flytta med hemlarm: vad händer med avtalet? · Mobilpoolen (56) | 140 | Flytta med hemlarm: vad händer med avtalet? | 1657 | ja | ja | 4/47 |
| /guider/forebygga-inbrott | Förebygga inbrott: så skyddar du hemmet · Mobilpoolen (52) | 142 | Förebygga inbrott: så skyddar du hemmet | 1533 | ja | ja | 4/44 |
| /guider/grannsamverkan | Grannsamverkan: så startar ni i området · Mobilpoolen (52) | 147 | Grannsamverkan: så startar ni i området | 1027 | ja | ja | 4/43 |
| /guider/hemlarm-med-kamera | Hemlarm med kamera: så fungerar det · Mobilpoolen (48) | 118 | Hemlarm med kamera: så fungerar det | 1026 | ja | ja | 13/43 |
| /guider/hemlarm-och-forsakring | Hemlarm och hemförsäkring: blir det billigare? · Mobilpoolen (59) | 128 | Hemlarm och hemförsäkring: blir det billigare? | 1212 | ja | ja | 20/44 |
| /guider/hemlarm-och-husdjur | Hemlarm och husdjur: undvik falsklarm · Mobilpoolen (50) | 138 | Hemlarm och husdjur: undvik falsklarm | 1090 | ja | ja | 8/43 |
| /guider/hemlarm-utan-abonnemang | Hemlarm utan abonnemang eller med larmcentral? · Mobilpoolen (59) | 145 | Hemlarm utan abonnemang eller med larmcentral? | 1294 | ja | ja | 251/48 |
| /guider/hemlarm-utan-bindningstid | Hemlarm utan bindningstid: vilka bolag har det? · Mobilpoolen (60) | 125 | Hemlarm utan bindningstid: vilka bolag har det? | 1139 | ja | ja | 16/50 |
| /guider/hyra-eller-kopa-hemlarm | Hyra eller köpa hemlarm: vad passar dig? · Mobilpoolen (53) | 147 | Hyra eller köpa hemlarm: vad passar dig? | 1335 | ja | ja | 7/43 |
| /guider/kamerabevakning-brf | Kamerabevakning i BRF: det här gäller · Mobilpoolen (50) | 126 | Kamerabevakning i BRF: det här gäller | 438 | ja | ja | 251/43 |
| /guider/kameraovervakning-hemma-regler | Kamera hemma: vad får du filma? · Mobilpoolen (44) | 106 | Kamera hemma: vad får du filma? | 530 | ja | ja | 14/42 |
| /guider/larmcentral-och-certifiering | Larmcentral: så fungerar den och vad är SSF 136? · Mobilpoolen (61) | 133 | Larmcentral: så fungerar den och vad är SSF 136? | 1356 | ja | ja | 17/44 |
| /guider/larmklasser | Larmklass 1 till 4: vad betyder det? · Mobilpoolen (49) | 110 | Larmklass 1 till 4: vad betyder det? | 446 | ja | ja | 251/42 |
| /guider/pruta-pa-hemlarm | Pruta på hemlarm: så får du ner priset · Mobilpoolen (51) | 127 | Pruta på hemlarm: så får du ner priset | 1026 | ja | ja | 26/45 |
| /guider/saga-upp-garda-alarm | Säga upp Garda Alarm: så gör du · Mobilpoolen (44) | 142 | Säga upp Garda Alarm: så gör du steg för steg | 904 | ja | ja | 251/44 |
| /guider/saga-upp-sector-alarm | Säga upp Sector Alarm: så gör du · Mobilpoolen (45) | 142 | Säga upp Sector Alarm: så gör du steg för steg | 834 | ja | ja | 251/44 |
| /guider/saga-upp-securitas-home | Säga upp Securitas Home: så gör du · Mobilpoolen (47) | 151 | Säga upp Securitas Home: så gör du steg för steg | 999 | ja | ja | 251/44 |
| /guider/saga-upp-svenska-alarm | Säga upp Svenska Alarm: så gör du · Mobilpoolen (46) | 148 | Säga upp Svenska Alarm: så gör du steg för steg | 857 | ja | ja | 251/43 |
| /guider/saga-upp-verisure | Säga upp Verisure: så gör du · Mobilpoolen (41) | 137 | Säga upp Verisure: så gör du steg för steg | 930 | ja | ja | 251/44 |
| /guider/smarta-las-och-hemlarm | Smarta lås och hemlarm: så fungerar det ihop · Mobilpoolen (57) | 144 | Smarta lås och hemlarm: så fungerar det ihop | 1727 | ja | ja | 5/47 |
| /guider/vad-ingar-i-ett-hemlarm | Vad ingår i ett hemlarm? Delarna förklarade · Mobilpoolen (56) | 146 | Vad ingår i ett hemlarm? Delarna förklarade | 1381 | ja | ja | 8/47 |
| /guider/vad-kostar-ett-hemlarm | Vad kostar ett hemlarm? · Mobilpoolen (36) | 127 | Vad kostar ett hemlarm? | 741 | ja | ja | 251/42 |
| /guider/vaktarutryckning | Väktarutryckning: vad ingår och vad kostar det? · Mobilpoolen (60) | 152 | Väktarutryckning: vad ingår och vad kostar det? | 1606 | ja | ja | 5/47 |
| /guider/verisure-prishojning | Verisure har höjt priset: vad du kan göra · Mobilpoolen (54) | 128 | Verisure har höjt priset: vad du kan göra | 893 | ja | ja | 5/43 |
| /inbrottsstatistik | Inbrott i Sverige: statistik · Mobilpoolen (41) | 147 | Inbrott i Sverige: statistik | 641 | ja | ja | 251/40 |
| /inbrottsstatistik/kommuner | Inbrott per kommun: statistik 2025 · Mobilpoolen (47) | 128 | Bostadsinbrott per kommun | 837 | ja | ja | 180/218 |
| /integritetspolicy | Integritetspolicy · Mobilpoolen (30) | 94 | Integritetspolicy | 960 | ja | ja | 251/39 |
| /jamfor | Jämför larmbolag: pris och villkor sida vid sida · Mobilpoolen (61) | 147 | Jämför larmbolag mot varandra | 309 | ja | ja | 251/45 |
| /jamfor/sector-alarm-vs-securitas | Sector Alarm eller Securitas Home? Jämför pris · Mobilpoolen (59) | 153 | Sector Alarm vs Securitas Home: pris, bindningstid och villk | 1005 | ja | ja | 5/42 |
| /jamfor/securitas-vs-avarn | Securitas Home eller Avarn Security? Jämför pris · Mobilpoolen (61) | 157 | Securitas Home vs Avarn Security: pris, bindningstid och vil | 1116 | ja | ja | 4/43 |
| /jamfor/verisure-vs-avarn | Verisure eller Avarn Security? Jämför pris · Mobilpoolen (55) | 151 | Verisure vs Avarn Security: pris, bindningstid och villkor | 1098 | ja | ja | 4/43 |
| /jamfor/verisure-vs-larmgiganten | Verisure eller Larmgiganten? Jämför pris · Mobilpoolen (53) | 149 | Verisure vs Larmgiganten: pris, bindningstid och villkor | 1107 | ja | ja | 4/42 |
| /jamfor/verisure-vs-sector-alarm | Verisure eller Sector Alarm? Jämför pris · Mobilpoolen (53) | 147 | Verisure vs Sector Alarm: pris, bindningstid och villkor | 1020 | ja | ja | 7/42 |
| /jamfor/verisure-vs-securitas | Verisure eller Securitas Home? Jämför pris · Mobilpoolen (55) | 149 | Verisure vs Securitas Home: pris, bindningstid och villkor | 1006 | ja | ja | 6/42 |
| /kontakt | Kontakta oss · Mobilpoolen (25) | 111 | Kontakta oss | 93 | ja | ja | 251/39 |
| /lagenhetslarm | Lägenhetslarm: pris, regler och vad som behövs · Mobilpoolen (59) | 119 | Lägenhetslarm: behöver du ett, och vad kostar det? | 1377 | ja | ja | 251/45 |
| /larmbolag | Larmbolag: publicerade priser och villkor · Mobilpoolen (54) | 96 | Larmbolagen vi jämför | 263 | ja | ja | 251/47 |
| /larmbolag/avarn-security | Avarn Security pris 2026: paket och villkor · Mobilpoolen (56) | 148 | Avarn Security : pris, villkor och vad du får | 796 | ja | ja | 17/45 |
| /larmbolag/designlarm | Designlarm pris 2026: paket och villkor · Mobilpoolen (52) | 140 | Designlarm : pris, villkor och vad du får | 889 | ja | ja | 17/42 |
| /larmbolag/garda-alarm | Garda Alarm pris 2026: paket och villkor · Mobilpoolen (53) | 142 | Garda Alarm : pris, villkor och vad du får | 888 | ja | ja | 9/42 |
| /larmbolag/hemla | Hemla pris 2026: paket och villkor · Mobilpoolen (47) | 130 | Hemla : pris, villkor och vad du får | 785 | ja | ja | 6/43 |
| /larmbolag/larmgiganten | Larmgiganten pris 2026: paket och villkor · Mobilpoolen (54) | 144 | Larmgiganten : pris, villkor och vad du får | 1021 | ja | ja | 251/44 |
| /larmbolag/larmify | Larmify pris 2026: paket och villkor · Mobilpoolen (49) | 134 | Larmify : pris, villkor och vad du får | 890 | ja | ja | 5/43 |
| /larmbolag/safeland | Safeland pris 2026: paket och villkor · Mobilpoolen (50) | 136 | Safeland : pris, villkor och vad du får | 799 | ja | ja | 5/43 |
| /larmbolag/sakra-larm | Säkra Larm pris 2026: paket och villkor · Mobilpoolen (52) | 140 | Säkra Larm : pris, villkor och vad du får | 856 | ja | ja | 5/43 |
| /larmbolag/sector-alarm | Sector Alarm pris 2026: paket och villkor · Mobilpoolen (54) | 144 | Sector Alarm : pris, villkor och vad du får | 944 | ja | ja | 251/44 |
| /larmbolag/securitashome | Securitas Home pris 2026: paket och villkor · Mobilpoolen (56) | 148 | Securitas Home : pris, villkor och vad du får | 910 | ja | ja | 251/45 |
| /larmbolag/svenska-alarm | Svenska Alarm pris 2026: paket och villkor · Mobilpoolen (55) | 146 | Svenska Alarm : pris, villkor och vad du får | 942 | ja | ja | 251/42 |
| /larmbolag/svenska-trygghetslosningar | Svenska Trygghetslösningar pris 2026: paket och villkor · Mobilpoolen (68) | 172 | Svenska Trygghetslösningar : pris, villkor och vad du får | 812 | ja | ja | 5/43 |
| /larmbolag/verisure | Verisure pris 2026: paket och villkor · Mobilpoolen (50) | 136 | Verisure : pris, villkor och vad du får | 992 | ja | ja | 251/48 |
| /om-oss | Om Mobilpoolen: vilka vi är och hur vi arbetar · Mobilpoolen (58) | 129 | Om Mobilpoolen | 409 | ja | ja | 251/40 |
| /ordlista | Ordlista för hemlarm: alla ord förklarade · Mobilpoolen (54) | 118 | Ordlista för hemlarm | 1318 | ja | ja | 251/48 |
| /radhuslarm | Radhuslarm: pris, skydd och vad du behöver · Mobilpoolen (55) | 128 | Radhuslarm: så skyddar du radhuset och vad det kostar | 1227 | ja | ja | 251/45 |
| /sa-fungerar-mobilpoolen | Så fungerar Mobilpoolen: förfrågan till offert · Mobilpoolen (58) | 132 | Så fungerar Mobilpoolen | 757 | ja | ja | 251/41 |
| /sa-jamfor-vi | Så jämför vi hemlarm: källor och kontrolldatum · Mobilpoolen (59) | 153 | Så jämför vi hemlarm | 734 | ja | ja | 251/48 |
| /sa-tjanar-vi-pengar | Så tjänar Mobilpoolen pengar: vem betalar? · Mobilpoolen (54) | 135 | Så tjänar Mobilpoolen pengar | 488 | ja | ja | 251/40 |
| /skribent/leon-hallstrom | Leon Hallström: grundare av Mobilpoolen · Mobilpoolen (51) | 132 | Leon Hallström, grundare av Mobilpoolen | 288 | ja | ja | 47/39 |
| /verktyg/hemlarm-kalkylator | Hemlarm kalkylator: räkna ut vad hemlarmet kostar · Mobilpoolen (62) | 153 | Hemlarm kalkylator: räkna ut vad ditt larm kostar | 624 | ja | ja | 251/40 |
| /villalarm | Villalarm: pris, utrustning och skydd 2026 · Mobilpoolen (55) | 130 | Villalarm: så skyddar du villan och vad det kostar | 1602 | ja | ja | 251/48 |
| /inbrottsstatistik/[kommun] (179 sidor) | Inbrott i [kommun]: statistik 2025 | 120 till 160 | Hur många bostadsinbrott sker i [kommun]? | 454 till 560 | ja | ja | 1 till 3/ca 40 |
