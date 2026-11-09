# Nyhetsroboten

Roboten håller /nyheter på mobilpoolen.se levande. Den körs som en schemalagd uppgift i Claude, en gång om dagen, och gör allt själv: bevakar källor, skriver, låter en separat agent faktagranska, öppnar PR, mergar och kontrollerar live-sajten. Samma upplägg som Elpoolens nyhetsrobot.

Registret är `src/lib/nyheter.ts`. Läs kommentaren överst i filen och de befintliga nyheterna innan du skriver. Alla regler i CLAUDE.md gäller (inga påhittade uppgifter, källa och datum för allt, aldrig "oberoende", inga andra jämförelsesajters priser eller texter, inga tankstreck i löptext).

Så länge registret är tomt är /nyheter noindex och syns inte i meny eller sitemap. Den första nyheten slår på allt automatiskt. Lägg då också till avsnittet `## Nyheter` i `public/llms.txt` (före `## Om tjänsten`) med en rad för /nyheter och en rad per nyhet.

## 1. Bevaka

Leta efter sådant som hänt sedan den senaste nyheten i registret (högsta `handelseIso`). Är registret tomt: titta tillbaka två veckor. Ordning:

1. **Operatörerna själva:** pressmeddelanden och nyhetsrum hos Telia, Tele2, Telenor och Tre, och deras varumärken (Comviq, Halebop, Hallon, Vimla, Fello med flera). Använd bolagens egna sidor, MFN, Cision och Mynewsdesk. Det som räknas: prishöjningar på befintliga abonnemang, nya eller nedlagda abonnemang och varumärken, ändrade villkor (bindningstid, uppsägning, EU-surf, sparad surf), nätnedstängningar (2G, 3G), större driftstörningar med officiellt besked, uppköp och sammanslagningar som ändrar vad kunden får.
2. **Myndigheter och politik:** pts.se (mätningar, täckning, beslut, nummerflytt, tillsyn), konsumentverket.se, arn.se (vägledande beslut), regeringen.se och riksdagen.se (lagar om elektronisk kommunikation, moms, förmånsskatt på mobil), skatteverket.se, EU-kommissionen och BEREC (roaming, reglering).
3. **Mätningar och undersökningar:** Svenskt Kvalitetsindex (SKI Mobil), Opensignals rapporter för Sverige, PTS Svensk telekommarknad. Bara när en ny rapport publicerats.
4. **Vår egen data:** `research/prisandringar.json` och `research/prisindex-historik.json`. Månadsartikeln om prisindex är ett fast format (se B nedan). Utanför den blir det en händelsenyhet bara när en operatör höjt eller sänkt ett ordinarie pris på ett sätt som påverkar många kunder. Siffror räknas ur filerna, aldrig för hand. Ändra inte prisdatan i nyhetskörningen.

Skriv bara om det som påverkar en svensk privat- eller företagskund med mobilabonnemang: vad det kostar, vad som ingår, villkor, byten och uppsägning, nät och täckning, regler och skydd mot bedrägerier. Inget om aktiekurser, kvartalsrapporter utan kundpåverkan, telefonlanseringar eller utlandet utan tydlig koppling till svenska kunder.

Hittar du inget nytt som klarar kraven, och inget fast format eller säsongstips är aktuellt enligt avsnittet "Fler artiklar, utan massproduktion": gör ingenting och avsluta. En tom körning är rätt utfall. Skriv aldrig en nyhet för att fylla på.

## Fler artiklar, utan massproduktion

Leons beslut 9 november 2026: flödet ska bli större, men aldrig på bekostnad av kvaliteten. Tunt eller massproducerat innehåll kan dra ned hela sajtens ranking. Varje körning går därför igenom tre sorters artiklar, i den här ordningen, och sätter `typ` på varje ny artikel.

### A. Händelsenyheter (`typ: "nyhet"`)

Det som står under 1. Bevaka, med samma krav som förut. Nytt: använd nyhetsmedierna för att **hitta** händelser. Sök med WebSearch (senaste veckan) på sajtens ämnen hos etablerade svenska medier: SVT, Sveriges Radio, TT, DN, SvD, GP, Sydsvenskan, Expressen, Aftonbladet, DI och Ny Teknik, samt teknikmedier som M3 och Feber (aldrig jämförelsesajter). Gå alltid vidare till originalkällan och använd den i `kallor`. Finns ingen originalkälla på nätet (till exempel ett besked som bara lämnats till ett medium) får mediet stå som källa, med "enligt <medium>" i texten. Aldrig jämförelsesajter eller konkurrenter som källa, och aldrig en text som bara återger en annan aktörs undersökning som inte går att läsa själv.

### B. Fasta format (`typ: "fast"`)

1. **Mobilpriserna i <månad>**: när en ny komplett månad finns i `research/prisindex-historik.json`. Medianpris per surfnivå och förändring mot månaden före, plus de ordinarie prisändringar som `research/prisandringar.json` loggat under månaden (operatör, abonnemang, från och till). Kategori "Priser och villkor". Länka till /prisindex och jämförelsen (/). Siffrorna räknas ur filerna med kod. Ändra inte prisdatan i nyhetskörningen.

Regler för de fasta formaten:
- En artikel per format och månad, bara när månaden är komplett i datan. Siffrorna räknas ur datan med kod, aldrig för hand. Spara frågan och svaret så att granskaren kan kontrollera dem.
- Ingressen säger vad som är nytt den här månaden. Skriv aldrig om förra månadens text med nya siffror.
- Artikeln handlar om förändringen. Länka till datasidan med hela serien i stället för att upprepa den.

### C. Säsongstips (`typ: "tips"`, kategori "Tips och råd")

Högst ett per vecka, och bara med en **datumkrok**: något som händer just nu eller inom fyra veckor (en säsong, en deadline, en regel som börjar gälla, en kampanjperiod). Kalendern nedan är förslag på krokar, inte fakta. Varje uppgift kontrolleras mot källa samma dag.

Innan du skriver: gå igenom guiderna (`src/routes/guider.*`), datasidorna och nyheterna.
- Finns en guide som svarar på samma fråga: skriv inget tips. Är guiden inaktuell eller saknar något som gäller nu: uppdatera guiden i stället (egen PR enligt CLAUDE.md) och skriv det i rapporten.
- Ett tips får aldrig vara en sammanfattning av en egen guide. Det ska ha minst två konkreta uppgifter som gäller just nu, med källa och datum eller ur vår data, och länka till den guide som går djupare.
- Rubriken säger vad som är aktuellt nu, inte en evig fråga ("Så sparar du el", "Bästa tipsen" och liknande är förbjudna rubriker).

Krokar att pröva:
- Januari till mars: aviserade prishöjningar på befintliga abonnemang (bara de som operatören själv har publicerat) och vad du kan göra enligt villkoren.
- Mars till maj: avdrag och moms för mobilabonnemang i enskild firma inför deklarationen.
- Juni till augusti: resor, EU-surf och surf utanför EU, med operatörernas aktuella villkor.
- Augusti: skolstart och barnets första mobilabonnemang.
- November: Black Friday-kampanjer som operatörerna själva har publicerat, och vad kampanjpriset blir efter kampanjen.
- December: resor över jul och nyår, julklappsmobiler med eller utan abonnemang.

## Tak och kvalitet (gäller A, B och C)

- **Taken är kod.** `tests/nyhetstak.test.ts` fäller bygget: högst 3 artiklar per dag och 8 per sju dagar totalt, högst ett fast format per månad, högst ett tips per vecka och fyra per månad, högst tre fasta och tips tillsammans per vecka. Höj aldrig ett tak för att få in en artikel. Tycker du att ett tak skaver: skriv det i rapporten till Leon.
- **Prioritet när taket är nått:** händelsenyheter före fasta format före tips. Ett tips som inte får plats skrivs inte och sparas inte till nästa vecka.
- **Unikhet:** samma huvudsökord som en befintlig guide, datasida eller nyhet de senaste tolv månaderna betyder att du inte skriver (undantag: de fasta formaten, som har månaden i rubriken). Ny utveckling i en gammal nyhet: uppdatera den (steg 2) i stället för att skriva en ny.
- **Värde:** varje artikel ska innehålla något som inte redan står på sajten: en ny daterad uppgift ur en källa, en ny siffra ur vår data eller ett datum som spelar roll för läsaren. Skriv i PR-beskrivningen vad det är. Kan du inte peka på det: skriv inte.
- **Ingen utfyllnad.** Längden är ett tak, inte ett mål. Hellre 180 bra ord än 400 svaga. Inga allmänna råd som passar på vilken sajt som helst.
- **Variation:** börja inte två artiklar i rad på samma sätt och använd inte samma rubrikmall två gånger samma månad (utom de fasta formaten).
- Alla tre sorterna går genom samma skrivregler, bildregler, faktagranskning, PR och livekontroll som nyheterna nedan. Faktagranskaren ska också pröva kraven på unikhet och värde.
- Rapporten säger för varje artikel vilken sort den är och vad som är nytt i den.

## 2. Uppdatera befintliga nyheter

Gå igenom nyheter där något var "inte klart" (till exempel ett datum för en prishöjning, ett förslag som inte beslutats, en nedstängning utan slutdatum). Har källan ändrats: uppdatera texten, lägg till den nya källan, sätt `uppdateradIso` till dagens datum. Skriv i texten vad som är nytt.

## 3. Skriva

- 150 till 400 ord. Ingress först, med det viktigaste och en siffra. Sedan "Det här är klart" eller motsvarande punktlista, och alltid ett sista avsnitt "Vad det betyder för dig".
- Bara fakta som står i källan eller i vår data. Inga egna förklaringar till varför en operatör gör något. Ingen spekulation om framtida priser. Citera inte andra jämförelsesajter (till exempel Mobilabonnemang.se, Mobilio, Ziffra, Compricer, Billigastemobilabonnemang) och länka inte till dem. Nyhetssajter får användas för att hitta en nyhet, men källan i nyheten ska vara originalet.
- Politik: neutralt och sakligt. Skriv vad som föreslagits eller beslutats och av vem, aldrig om det är bra eller dåligt.
- Priser anges i kronor per månad med moms för privatpersoner (skriv ut om ett pris är utan moms). Datum skrivs "30 oktober 2026".
- Fyll alla fält: `slug` (kort, utan å, ä, ö, med årtal eller månad om det behövs för att vara unik), `titel`, `seoTitel` (högst 46 tecken), `ingress` (högst 155 tecken), `avsandare`, `kategori`, `typ`, `nyckeltal` (en siffra som säger mest, högst cirka 10 tecken i `varde`), datumen, `kallor` med datum, och 2 till 4 `relaterat` till sidor som finns (till exempel operatörens sida `/operatorer/<slug>`, `/saga-upp/<slug>`, en guide, `/prisindex`, `/kampanjer`, `/nat/<id>`).
- **Bild:** välj en bild ur bildbanken (`src/lib/bildbank.ts`, se taggarna) som passar ämnet utan att påstå något falskt, och som inte redan används av någon av de tre senaste nyheterna. Saknas en bra bild: hoppa över `bild`, då visas nyckeltalet på indigo bakgrund. Står en PIXABAY_KEY i uppgiftens instruktion får du i stället hämta ett eget foto från Pixabay (Pixabay Content License, utan varumärken, logotyper, läsbar text eller personer i närbild) och lägga in det enligt kommentaren överst i `bildbank.ts` (fyra filer, rad i `BILDER` med `fotograf` och `kalla`, mått i `bildbank-matt.ts`). Titta på bilden (Read) innan du väljer den.
- Länka in i texten till minst en egen sida, och till jämförelsen (`/`) när det passar.
- Svenska enligt CLAUDE.md: kort, tydlig, du-tilltal, inga bindestreck eller tankstreck i löptext, inga emojis.
- Lägg en rad under `## Nyheter` i `public/llms.txt`.

## 4. Granska och publicera

1. Gren `claude/nyhet-<slug>` (flera nyheter i samma körning får ligga i samma gren).
2. `bun run build`, `npx tsc --noEmit`, `npx eslint src` (0 fel) och `bun test`. Starta sajten lokalt med `npx wrangler dev -c .output/server/wrangler.json --ip 127.0.0.1 --port 4321` och kontrollera med curl att nyheten finns i HTML:en, att title, description och canonical stämmer, och att den finns i /sitemap.xml och /nyheter/rss.xml.
3. **Faktagranskning:** starta en separat agent som inte har sett ditt arbete. Ge den bara filen och uppdraget att kontrollera varje siffra, datum och namn mot källorna och vår data. Rätta allt den hittar. Kan något inte verifieras: ta bort det.
4. Öppna PR med kort beskrivning på svenska (vad, källor, vilka beslut du tagit) via REST-API:t (`gh api repos/PoolenMediaGroup/mobilpoolen/pulls`) och merga själv när allt är grönt (`gh api -X PUT repos/PoolenMediaGroup/mobilpoolen/pulls/<nr>/merge -f merge_method=squash`). Pusha aldrig direkt till main.
5. Vänta tills Cloudflare har publicerat (några minuter) och kontrollera att nyheten finns live på mobilpoolen.se.

Merga inte själv, utan lämna PR:en öppen till Leon, om nyheten handlar om Mobilpoolen själv, om något juridiskt oklart, eller om den kan uppfattas som negativ om en enskild operatör utan att en myndighet eller operatören själv står som källa.

Visar nyheten att en operatörs priser eller villkor i vår jämförelse inte längre stämmer: ändra inte prisdatan, skriv i rapporten "[KONTROLLERA] priserna för <operatör>".

## 5. Rapportera

Avsluta med en mening per publicerad eller uppdaterad nyhet (rubrik och länk), plus eventuella [KONTROLLERA]-punkter, eller "Inga nya nyheter" om körningen var tom.
