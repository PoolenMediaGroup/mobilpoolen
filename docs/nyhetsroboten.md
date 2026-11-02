# Nyhetsroboten

Roboten håller /nyheter på mobilpoolen.se levande. Den körs som en schemalagd uppgift i Claude, fyra gånger om dagen, och gör allt själv: bevakar källor, skriver, låter en separat agent faktagranska, öppnar PR, mergar och kontrollerar live-sajten. Samma upplägg som Elpoolens nyhetsrobot.

Registret är `src/lib/nyheter.ts`. Läs kommentaren överst i filen och de befintliga nyheterna innan du skriver. Alla regler i CLAUDE.md gäller (inga påhittade uppgifter, källa och datum för allt, aldrig "oberoende", inga andra jämförelsesajters priser eller texter, inga tankstreck i löptext).

Så länge registret är tomt är /nyheter noindex och syns inte i meny eller sitemap. Den första nyheten slår på allt automatiskt. Lägg då också till avsnittet `## Nyheter` i `public/llms.txt` (före `## Om tjänsten`) med en rad för /nyheter och en rad per nyhet.

## 1. Bevaka

Leta efter sådant som hänt sedan den senaste nyheten i registret (högsta `handelseIso`). Är registret tomt: titta tillbaka två veckor. Ordning:

1. **Operatörerna själva:** pressmeddelanden och nyhetsrum hos Telia, Tele2, Telenor och Tre, och deras varumärken (Comviq, Halebop, Hallon, Vimla, Fello med flera). Använd bolagens egna sidor, MFN, Cision och Mynewsdesk. Det som räknas: prishöjningar på befintliga abonnemang, nya eller nedlagda abonnemang och varumärken, ändrade villkor (bindningstid, uppsägning, EU-surf, sparad surf), nätnedstängningar (2G, 3G), större driftstörningar med officiellt besked, uppköp och sammanslagningar som ändrar vad kunden får.
2. **Myndigheter och politik:** pts.se (mätningar, täckning, beslut, nummerflytt, tillsyn), konsumentverket.se, arn.se (vägledande beslut), regeringen.se och riksdagen.se (lagar om elektronisk kommunikation, moms, förmånsskatt på mobil), skatteverket.se, EU-kommissionen och BEREC (roaming, reglering).
3. **Mätningar och undersökningar:** Svenskt Kvalitetsindex (SKI Mobil), Opensignals rapporter för Sverige, PTS Svensk telekommarknad. Bara när en ny rapport publicerats.
4. **Vår egen data:** `research/prisandringar.json` (loggen över prisändringar som `scripts/bygg_data.py` skriver) och `research/prisindex-historik.json`. En nyhet när en ny månad i prisindex visar en tydlig rörelse i medianpriset, eller när en operatör höjt eller sänkt ett ordinarie pris. Siffror räknas ur filerna, aldrig för hand. Ändra inte prisdatan i nyhetskörningen.

Skriv bara om det som påverkar en svensk privat- eller företagskund med mobilabonnemang: vad det kostar, vad som ingår, villkor, byten och uppsägning, nät och täckning, regler och skydd mot bedrägerier. Inget om aktiekurser, kvartalsrapporter utan kundpåverkan, telefonlanseringar eller utlandet utan tydlig koppling till svenska kunder.

Hittar du inget nytt som klarar kraven: gör ingenting och avsluta. En tom körning är rätt utfall. Skriv aldrig en nyhet för att fylla på.

## 2. Uppdatera befintliga nyheter

Gå igenom nyheter där något var "inte klart" (till exempel ett datum för en prishöjning, ett förslag som inte beslutats, en nedstängning utan slutdatum). Har källan ändrats: uppdatera texten, lägg till den nya källan, sätt `uppdateradIso` till dagens datum. Skriv i texten vad som är nytt.

## 3. Skriva

- 150 till 400 ord. Ingress först, med det viktigaste och en siffra. Sedan "Det här är klart" eller motsvarande punktlista, och alltid ett sista avsnitt "Vad det betyder för dig".
- Bara fakta som står i källan eller i vår data. Inga egna förklaringar till varför en operatör gör något. Ingen spekulation om framtida priser. Citera inte andra jämförelsesajter (till exempel Mobilabonnemang.se, Mobilio, Ziffra, Compricer, Billigastemobilabonnemang) och länka inte till dem. Nyhetssajter får användas för att hitta en nyhet, men källan i nyheten ska vara originalet.
- Politik: neutralt och sakligt. Skriv vad som föreslagits eller beslutats och av vem, aldrig om det är bra eller dåligt.
- Priser anges i kronor per månad med moms för privatpersoner (skriv ut om ett pris är utan moms). Datum skrivs "30 oktober 2026".
- Fyll alla fält: `slug` (kort, utan å, ä, ö, med årtal eller månad om det behövs för att vara unik), `titel`, `seoTitel` (högst 46 tecken), `ingress` (högst 155 tecken), `avsandare`, `kategori`, `nyckeltal` (en siffra som säger mest, högst cirka 10 tecken i `varde`), datumen, `kallor` med datum, och 2 till 4 `relaterat` till sidor som finns (till exempel operatörens sida `/operatorer/<slug>`, `/saga-upp/<slug>`, en guide, `/prisindex`, `/kampanjer`, `/nat/<id>`).
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
