# Mobilpoolen – SEO-research (mobilpoolen.se)

Datum: 2026-10-29. Marknad: Sverige, Google.se och AI-svar (ChatGPT, Gemini, Claude, Perplexity, Google AI Overviews).
Mål: billigare mobilabonnemang för privatpersoner och företag.

**Metodnot:** Konkurrentanalysen bygger på WebSearch och WebFetch av konkurrenternas sidor i oktober 2026. Compricer.se och Prisjakt.nu gick inte att hämta i den här sessionen (blockerade). Det som står om dem är därför markerat som *ej verifierat* och behöver kollas manuellt. **Alla sökvolymer är uppskattningar** (hög/medel/låg) utifrån vilka sidor som rankar, hur ofta frågorna dyker upp i forum och resultatbilden i SERP. Verifiera med Google Keyword Planner, Ahrefs/Semrush eller Search Console när sajten har data. Ingen konkurrenttext är kopierad.

---

## 0. Marknadsfakta att bygga på (verifierat okt 2026)

- **Fyra nät:** Telia, Tele2, Telenor och Tre. Resten är varumärken eller MVNO:er i någon av dessa:
  - Telias nät: Telia, Fello.
  - Tele2:s nät: Tele2, Comviq, Tellus, Plus46.
  - Telenors nät: Telenor, Vimla, Nestor Mobil.
  - Tres nät: Tre, Hallon, Chilimobil.
  - Lycamobile finns också. Kontrollera dess värdnät före publicering.
  - Källor: test.se och boio.se.
- **Halebop är nedlagt.** Telia meddelade 2 juni 2026 att varumärket avvecklas och att kunderna flyttas till Telia ([M3](https://www.m3.se/article/3154242/halebop-gar-i-graven-kunderna-flyttas-over-till-telia.html)). Det skapar en innehållsmöjlighet: "Halebop läggs ned – vad gäller och vart ska du byta?". Flera konkurrenter listar fortfarande Halebop.
- **Nummerflytt:** Den nya operatören sköter flytten och den är gratis. Avbrottet får vara högst en arbetsdag, och numret ska kunna flyttas i minst en månad efter att avtalet upphört. Bindningstiden hindrar inte flytten, men den återstående tiden ska betalas. Bindningstiden får vara högst 24 månader, och uppsägningstiden för konsumenter högst en månad ([Telekområdgivarna](https://telekomradgivarna.se/en/sa-funkar-det/switching-mobile-operator-and-transferring-your-number/), [Boio](https://boio.se/mobilabonnemang/byta-operator)).
- **Nätkvalitet:** I Opensignals rapport från dec 2025 (mätperiod jul–sep 2025) fick Telenor flest utmärkelser. Telia vann Coverage Experience och Tele2 vann 5G Download Speed ([Opensignal](https://insights.opensignal.com/reports/2025/12/sweden/mobile-network-experience)). Använd som extern källa, inte som eget betyg.
- **Kundnöjdhet:** Enligt SKI Mobil 2025 är Vimla och Fello i topp bland privatkunderna (över 80, branschsnitt 66,5), och Telia är bäst bland företagskunderna ([SKI](https://www.kvalitetsindex.se/wp-content/uploads/2025/10/ski-mobil-2025.pdf)).
- **Företag och skatt:** En mobil med abonnemang är ett skattefritt arbetsredskap om den är nödvändig i arbetet. Privata tjänster som faktureras separat och betalas av arbetsgivaren är en skattepliktig förmån ([Skatteverket](https://skatteverket.se/foretag/arbetsgivare/lonochersattning/formaner/arbetsredskap.4.3016b5d91791bf546791ad4.html)).

---

## 1. Konkurrenter

### 1.1 Översikt

| Sajt | Typ | Affärsmodell | Styrka | Svaghet / lucka |
|---|---|---|---|---|
| **test.se** | Listjämförelse med filter och mycket programmatiska undersidor | Affiliate (inferens: `/re/`-redirects med spårning) | Bred täckning av sidtyper: operatör, student, senior, ungdom, familj, fri surf, utan surf, iPhone, Samsung, företag, mobilt bredband, "mobiloperatörer i X:s nät". Bra filter (telefon, GB, nät, målgrupp). | Brödtexten säger emot korten i pris (inaktuell). Företagssidan saknar uppgift om moms, antal användare, delad surf och växel. Operatörssidor nås via både `/operator/x/` och `?operator=x`, vilket ger risk för duplicerat innehåll. |
| **boio.se** | Jämförelse plus guider, del av en bredare "boende"-portal (el, bredband, bolån) | Affiliate med öppen redovisning ("Så tjänar vi pengar" och annonsmärkning). Ersättning från Vimla, Tele2, Tre, Comviq, Hallon, Fello och Lycamobile. | **Starkast metodik:** rankar på totalpris första året, visar år 2, visar kontrolldatum och källa per abonnemang och har en metodsida. Bra informationssidor (byta operatör, eSIM, kontantkort, pensionär, barn). | Inget företagsspår. Inga operatör A vs B-sidor. Inga verktyg utöver en surfguide. Inget om nätkvalitet med data. |
| **giraffy.com/se** | Internationell jämförelseplattform | Affiliate (Commission Factory och Admitad i metataggar) | Många erbjudanden (57 från 12 operatörer) med daglig uppdatering. Operatörsprofiler. Reseesim. | Datafel (fel nät för Hallon och Vimla). Mallad text. Inga filter. Svag svensk lokal trovärdighet. |
| **testkompassen.se** | "Bäst i test"-listicle | Affiliate (`ref=`) | Tydlig topplista med "bäst för X". Viktad metod publicerad. | Påhittade betyg (9,7 osv.) utan redovisade delpoäng, "vi har testat" utan egna tester och tomma prisfält. **Det här ska vi inte göra**, men det visar att det finns efterfrågan på "bäst för X". |
| **bast-i-test.se** | Generisk testportal | Affiliate och annonser (inferens) | Hög domänbredd. Rankar på "bäst i test 2026". | Tunn mobilsida utan synlig jämförelsedata. Dubbla URL:er. |
| **global.techradar.com/sv-se** | Teknikmedia, "Bästa mobilabonnemang 2026" | Affiliate (redovisat) | Stark domän. Indelning i kategorier (mycket surf, lite surf, pris, student/senior). | Uppdelad på flera sidor. Publicerad 2021 med ny årstitel. Få operatörsdetaljer. |
| **businesswith.se** | B2B-katalog för företagstelefoni | Leadgenerering och leverantörslistning (inferens) | Fångar "företagstelefoni" och växel. Har en guidewizard efter företagsstorlek. | Inga priser. Blandar växelleverantörer med mobiloperatörer. Ingen förklaring av sitt BW Score. **Stor lucka för billiga företagsabonnemang för småföretag.** |
| **surf.nu**, **jämför-mobilabonnemang.se** | Mindre nischsajter som marknadsförs med pressmeddelanden (2024 och apr 2026) | Affiliate (antaget) | Exakt matchande domännamn. | Ej analyserade i detalj. Låg auktoritet (pressmeddelandelänkar). |
| **m3.se/mobilabonnemang** | Mediahub | Annonser och sponsrat | Nyheter (t.ex. Halebop). | Sidan har `noindex` och konkurrerar därför inte organiskt med hubben. Artiklarna rankar dock för nyhetsfrågor. |
| **Compricer** *(ej verifierat)* | Bred privatekonomijämförelse | Affiliate och leads | Varumärke och auktoritet. Har historiskt jämfört mobil och mobilt bredband. | Kontrollera manuellt om mobiljämförelsen fortfarande finns och hur djup den är. |
| **Prisjakt** *(ej verifierat)* | Pris- och produktjämförelse | CPC och affiliate | Stark för "mobil + abonnemang" och telefonpaket. | Kontrollera om de har en ren abonnemangsjämförelse. Troligen svagare på rena SIM-only-abonnemang. |
| Operatörerna själva och Elgiganten/Mediamarkt | Sälj | – | Rankar på "[operatör] abonnemang", täckningskarta och telefon med abonnemang. | Inte neutrala. Säger aldrig vem som är billigast. |

Övrigt i SERP: forumtrådar på Sweclockers och Rika Tillsammans ("vad betalar ni för ert mobilabonnemang?") och Privata Affärer/Börskollen ("mest prisvärda för tre konsumenttyper"). Det visar att användarna vill ha **segmenterade svar** (vardag, senior, egenföretagare) och **pris för år 1 jämfört med därefter**.

### 1.2 Vanliga sidtyper hos konkurrenterna

| Sidtyp | test.se | boio | giraffy | testkompassen | techradar |
|---|---|---|---|---|---|
| Huvudjämförelse med filter | Ja | Ja (utan reglage) | Ja (inga filter) | – | – |
| Billigaste | Ja | Ja | – | – | Delvis |
| Utan bindningstid | (filter) | Ja | – | – | – |
| Obegränsad surf | Ja (fri-surf) | Ja | – | – | Ja |
| Målgrupp (barn, ungdom, student, senior, familj) | Ja | Ja | – | – | Delvis |
| Operatörssidor | Ja | Ja | Ja | Avsnitt | – |
| A vs B | **Nej** | **Nej** | **Nej** | **Nej** | **Nej** |
| Företag | Tunn | **Nej** | – | – | – |
| Byta operatör, eSIM, kontantkort | – | Ja | – | – | – |
| Verktyg/kalkylator | – | Surfguide (text) | – | – | – |
| Metodsida, "så tjänar vi pengar" | – | Ja | – | Metod (med betyg) | Affiliate-not |
| Telefon + abonnemang | Ja (iPhone, Samsung) | – | – | – | – |

### 1.3 Innehållsluckor som Mobilpoolen kan fylla

1. **A vs B-jämförelser.** Ingen av de analyserade konkurrenterna har dedikerade sidor som "Hallon vs Comviq" eller "Telia vs Tele2". Sökningarna finns (forumtrådar) men SERP:en fylls av forum, och det är lätt att vinna.
2. **Företag på riktigt.** Moms (ex/inkl), pris per användare, poolad/delad surf, växel och mobilsvar, förmånsbeskattning, avdrag för enskild firma och AB, fakturering och bindning för företag. test.se är tunn och businesswith saknar priser.
3. **Totalkostnad över 24 månader.** Boio räknar år 1 och år 2 var för sig. Ingen visar "så mycket betalar du över 24 månader" inklusive startavgift och kampanjslut, eller "efter kampanjen"-pris som standardvy.
4. **Verktyg.** Ingen har en riktig kalkylator för surfbehov, "betalar jag för mycket", familjens totalkostnad eller företagskostnad per anställd.
5. **Nät med källhänvisning.** En tydlig "vilket nät använder X" och nätkvalitet med Opensignal/PTS som källor, i stället för påhittade täckningsbetyg.
6. **Aktualitet.** Halebops nedläggning och prisändringar. En "Prisändringar och nyheter"-logg med datum ger ett färskhetssignal och är citerbart för AI.
7. **Ärlig metod.** Testkompassens påhittade betyg visar hur det inte ska göras. En verifierbar kriteriemodell (se avsnitt 4) blir både E-E-A-T-styrka och en tydlig skillnad mot konkurrenterna.
8. **Säga upp [operatör].** Steg för steg per operatör (uppsägningstid, hur, kontantkort, eSIM). Det har hög intention inför ett byte, och konkurrenterna saknar det.
9. **Familj och företag med flera SIM.** En "räkna ut för hela hushållet"-funktion saknas helt.
10. **Strukturerade fakta för AI.** Korta, daterade faktablock ("Per 2026-10-29: billigaste 10 GB utan bindning är X kr/mån") med källa. AI-svar gynnar daterade, entydiga påståenden.

### 1.4 Positionering (förslag)

"Vi räknar på vad du faktiskt betalar – efter kampanjen." Kärnan är totalpris över 12 och 24 månader, nät som källhänvisad fakta, öppen redovisning av ersättningar och ett eget företagsspår för enskild firma och små AB (1–20 anställda).

---

## 2. Sökordskarta

Volym är **uppskattad** och relativ: **H** = hög, **M** = medel, **L** = låg.
Intention: **T** = transaktionell/kommersiell (vill byta eller jämföra), **I** = informationell, **N** = navigerande.
Sluggarna saknar å, ä och ö.

### 2.1 Huvudkluster

| Kluster | Huvudsökord | Varianter / synonymer | Volym (uppsk.) | Intention | Slug |
|---|---|---|---|---|---|
| Jämför (pelare) | jämför mobilabonnemang | mobilabonnemang jämförelse, jämföra abonnemang mobil, mobilabonnemang | H | T | `/` (startsida) eller `/jamfor-mobilabonnemang` |
| Billigast | billigaste mobilabonnemang | billigt mobilabonnemang, billigaste abonnemanget 2026, billig surf | H | T | `/billigaste-mobilabonnemang` |
| Bäst | bästa mobilabonnemang | mobilabonnemang bäst i test, bästa operatör, bästa mobilabonnemang 2026 | H | T | `/basta-mobilabonnemang` |
| Utan bindning | mobilabonnemang utan bindningstid | abonnemang utan bindningstid, ingen bindningstid | M–H | T | `/utan-bindningstid` |
| Obegränsad surf | obegränsad surf | mobilabonnemang obegränsad surf, fri surf, billigaste obegränsad surf | H | T | `/obegransad-surf` |
| Företag | mobilabonnemang företag | företagsabonnemang mobil, mobil företag | M–H | T | `/foretag` |
| Företag billigt | billigt mobilabonnemang företag | billigaste företagsabonnemang, mobilabonnemang enskild firma | M | T | `/foretag/billigaste-foretagsabonnemang` |
| Barn | mobilabonnemang barn | första mobilabonnemang barn, abonnemang till barn, ungdomsabonnemang | M | T | `/barn` |
| Ungdom | mobilabonnemang ungdom | abonnemang under 26 | L–M | T | `/ungdom` |
| Pensionär | mobilabonnemang pensionär | senior abonnemang, mobilabonnemang äldre | M | T | `/pensionar` |
| Student | mobilabonnemang student | studentabonnemang, studentrabatt mobil | M | T | `/student` |
| Kontantkort | kontantkort | billigaste kontantkort, kontantkort med surf, kontantkort vs abonnemang | M–H | T/I | `/kontantkort` + guide `/guider/kontantkort-eller-abonnemang` |
| Familj | familjeabonnemang | familjeabonnemang mobil, dela surf familj | M | T | `/familjeabonnemang` |
| eSIM | esim | vad är esim, esim operatörer, aktivera esim iphone | M–H | I/T | `/esim` + guider |
| 5G | 5g abonnemang | billigaste 5g abonnemang, 5g täckning | M | T/I | `/5g-abonnemang` |
| Lite eller ingen surf | mobilabonnemang utan surf | abonnemang endast samtal, lite surf | L–M | T | `/utan-surf` |
| Mobilt bredband (avgränsa) | mobilt bredband | surfabonnemang, 4g router abonnemang, mobilt bredband obegränsat | H | T | `/mobilt-bredband` (**egen silo, se not**) |
| Byta operatör | byta operatör behålla nummer | flytta nummer, nummerflytt, byta mobilabonnemang | M | I/T | `/guider/byta-operator-behalla-nummer` |
| Säga upp | säga upp [operatör] | säga upp telia abonnemang, säga upp comviq | M (summa) | I/N | `/saga-upp/[operator]` |
| Utlandssurf | surfa utomlands | eu-surf, roaming, surfa i usa, resesim | M | I | `/guider/surfa-utomlands` |

**Not om mobilt bredband och surfabonnemang:** Det är en egen produktkategori (router eller dongel, datasim, 4G/5G som hemmabredband). Den har hög volym men en annan intention. Förslag: lansera först en avgränsad sida `/mobilt-bredband` som förklarar skillnaden och visar en enkel lista. Bygg ut till en egen silo senare (eller i ett eget Poolen-varumärke). Blanda inte in mobilt bredband i huvudjämförelsen, eftersom det förstör jämförbarheten.

### 2.2 Modifierare som multiplicerar sidor (programmatiskt, med försiktighet)

- **Surfmängd:** `/surf/10-gb`, `/surf/20-gb`, `/surf/50-gb`, `/surf/100-gb` ("billigaste 10 gb surf", L–M per sida).
- **Nät:** `/nat/telia`, `/nat/tele2`, `/nat/telenor`, `/nat/tre` ("operatörer i telias nät", "billigaste i telias nät", L–M).
- **Årstal:** Titlar med "2026" och "november 2026" uppdateras månadsvis.
- Bygg bara en sådan sida om den har unik data (egen lista, ett eget faktablock och en egen FAQ). Annars noindex, eller välj att inte bygga den.

### 2.3 Operatörsspecifika sökord

Operatörer att täcka: Telia, Tele2, Telenor, Tre, Comviq, Hallon, Vimla, Fello, Chilimobil, Tellus, Plus46, Nestor Mobil, Lycamobile, plus Halebop (arkiv och nyhet).

| Mönster | Exempel | Volym (uppsk.) | Intention | Slug |
|---|---|---|---|---|
| [operatör] abonnemang | comviq abonnemang, hallon abonnemang | M–H (storoperatörer H, men operatören själv tar #1) | N/T | `/operatorer/comviq` |
| [operatör] omdöme / recension / erfarenhet | vimla omdöme, hallon recension | L–M | I/T | samma sida, avsnitt `#omdome` (en URL per operatör) |
| [operatör] täckning | hallon täckning, vimla täckning | L–M | I | avsnitt plus guide "Vilket nät använder X" |
| [operatör] kampanj / erbjudande / rabattkod | comviq kampanj | M | T | avsnitt `#kampanjer` (uppdateras månadsvis) |
| [operatör] företag | telia företag mobil, tele2 företag | M | T | `/foretag/operatorer/telia` |
| säga upp [operatör] | säga upp hallon | L–M | I | `/saga-upp/hallon` |
| [operatör] kundtjänst / telefonnummer | – | M | N | **Undvik** (navigerande, låg affärsnytta) |
| [operatör] esim | hallon esim | L | I | avsnitt eller guide |

**Mest relevanta A vs B-par** (prioriterade efter sannolik sökvolym och köpintention):

| Prio | Par | Varför | Slug |
|---|---|---|---|
| 1 | Hallon vs Comviq | De två mest diskuterade lågprismärkena, i olika nät (Tre/Tele2) | `/jamfor/hallon-vs-comviq` |
| 1 | Telia vs Tele2 | De två största operatörerna | `/jamfor/telia-vs-tele2` |
| 1 | Telia vs Telenor | Täckning mot pris | `/jamfor/telia-vs-telenor` |
| 1 | Vimla vs Hallon | Båda utan bindning och populära | `/jamfor/vimla-vs-hallon` |
| 2 | Tele2 vs Telenor | | `/jamfor/tele2-vs-telenor` |
| 2 | Tre vs Telia | | `/jamfor/tre-vs-telia` |
| 2 | Comviq vs Tele2 | Samma nät, varumärke mot ägare | `/jamfor/comviq-vs-tele2` |
| 2 | Hallon vs Tre | Samma nät | `/jamfor/hallon-vs-tre` |
| 2 | Fello vs Telia | Samma nät, "Telia billigare?" | `/jamfor/fello-vs-telia` |
| 2 | Vimla vs Telenor | Samma nät | `/jamfor/vimla-vs-telenor` |
| 2 | Vimla vs Comviq | | `/jamfor/vimla-vs-comviq` |
| 3 | Chilimobil vs Hallon | | `/jamfor/chilimobil-vs-hallon` |
| 3 | Fello vs Vimla | SKI-vinnarna | `/jamfor/fello-vs-vimla` |
| 3 | Tellus vs Comviq | | `/jamfor/tellus-vs-comviq` |
| 3 | Halebop vs Fello ("vart ska Halebop-kunder gå?") | Aktualitet 2026 | `/jamfor/halebop-alternativ` |

Regler: En kanonisk URL per par i bokstavsordning **eller** efter populäraste namnet först. Välj en regel och 301-omdirigera den omvända ordningen (`comviq-vs-hallon` → `hallon-vs-comviq`). Börja med prio 1 och 2 (11 sidor).

### 2.4 Long tail och frågor (People Also Ask-typ)

Alla har uppskattad volym L–M. Varje fråga besvaras med ett kort svar högst upp (40–60 ord, citerbart för AI) och fördjupning under.

**Pris och val**
- Vilket är det billigaste mobilabonnemanget just nu?
- Vad kostar ett mobilabonnemang i genomsnitt per månad?
- Vad är ett rimligt pris för ett mobilabonnemang?
- Vad händer när kampanjpriset tar slut?
- Är det värt att byta operatör varje år?
- Vilket abonnemang är billigast för 10 GB, 20 GB eller 50 GB?
- Lönar det sig med obegränsad surf?

**Surf**
- Hur mycket surf behöver jag?
- Hur mycket surf drar Spotify, Netflix, Youtube, Tiktok eller Instagram?
- Räcker 5 GB i månaden?
- Vad är sparad surf (surfrullning)?
- Vad betyder dubbel surf?
- Vad händer när surfen tar slut?
- Vad är strypt hastighet?

**Nät och täckning**
- Vilket nät har bäst täckning i Sverige?
- Vilket nät använder Hallon, Vimla, Comviq och Fello?
- Är virtuella operatörer sämre?
- Har jag 5G där jag bor?
- Behöver jag ny mobil för 5G?

**Byte och uppsägning**
- Hur lång tid tar det att flytta nummer?
- Kan jag byta operatör om jag har bindningstid?
- Måste jag säga upp det gamla abonnemanget själv?
- Kostar det något att flytta nummer?
- Kan jag behålla numret från kontantkort?
- Vad är ångerrätt på mobilabonnemang?
- Hur lång uppsägningstid har mobilabonnemang?

**eSIM**
- Vad är eSIM och hur fungerar det?
- Vilka operatörer har eSIM?
- Kan jag ha två nummer i samma mobil?
- Hur flyttar jag eSIM till ny mobil?

**Utland**
- Kostar det att surfa i EU?
- Hur mycket EU-surf ingår?
- Vad kostar det att ringa till utlandet?
- Ingår Norge, Schweiz och Storbritannien i EU-surf?

**Målgrupp**
- Vid vilken ålder ska barn få mobilabonnemang?
- Kan man spärra surf och köp på barnens abonnemang?
- Vilket abonnemang är bäst för pensionärer?
- Hur får jag studentrabatt?

**Företag**
- Kan jag ha företagsabonnemang som enskild firma?
- Är mobilabonnemanget avdragsgillt?
- Är det förmån att ha jobbmobil privat?
- Kan man dra moms på mobilabonnemang?
- Vad är skillnaden mellan privat- och företagsabonnemang?
- Behöver vi växel eller räcker mobilabonnemang?
- Hur fungerar delad surf (poolad surf) för företag?

**Telefon och abonnemang**
- Ska jag köpa mobil med eller utan abonnemang?
- Är det billigare att delbetala mobilen via operatören?
- Vad är restvärde vid uppsägning?

---

## 3. Sitemap för Mobilpoolen

### 3.1 Toppnivå och pelarsidor

```
/                                   Pelare: Jämför mobilabonnemang (verktyg + lista + faktablock)
/billigaste-mobilabonnemang         Pelare: Billigast (12 och 24 mån totalpris)
/basta-mobilabonnemang              Pelare: Bäst för X (kriteriebaserat, se avsnitt 4)
/utan-bindningstid
/obegransad-surf
/surf/{5-gb|10-gb|20-gb|50-gb|100-gb}
/utan-surf
/5g-abonnemang
/esim
/kontantkort
/familjeabonnemang
/barn
/ungdom
/student
/pensionar
/mobilt-bredband                    (avgränsad, se not)

/foretag                            Pelare: Mobilabonnemang för företag
/foretag/billigaste-foretagsabonnemang
/foretag/enskild-firma
/foretag/smaforetag                 (1–20 anställda)
/foretag/obegransad-surf
/foretag/vaxel-och-mobilsvar
/foretag/operatorer/{telia|tele2|telenor|tre|...}
/foretag/kalkylator                 (kostnad per anställd)

/operatorer                         Hub: alla operatörer + vilket nät
/operatorer/{slug}                  telia, tele2, telenor, tre, comviq, hallon, vimla,
                                    fello, chilimobil, tellus, plus46, nestor-mobil, lycamobile
/operatorer/halebop                 (arkiv: nedlagt 2026, vart byta)

/nat                                Hub: de fyra näten + Opensignal/PTS-data
/nat/{telia|tele2|telenor|tre}      operatörer i respektive nät + billigaste

/jamfor                             Hub: alla A vs B
/jamfor/{a}-vs-{b}

/saga-upp                           Hub
/saga-upp/{operator}

/verktyg                            Hub
/verktyg/hur-mycket-surf-behover-jag
/verktyg/betalar-jag-for-mycket
/verktyg/familjekalkylator
/verktyg/foretagskalkylator         (= /foretag/kalkylator, välj en kanonisk)
/verktyg/kampanjkalkylator          (pris efter kampanjen över 24 mån)
/verktyg/vilket-nat-har-jag         (länkar till operatörernas täckningskartor och PTS)

/guider                             Hub (kategoriserad)
/guider/{slug}

/nyheter                            Prisändringar, nya operatörer, nedläggningar (daterade)
/prisindex                          Månatligt "Mobilpoolens prisindex" (egen data, citerbart)

/sa-jamfor-vi                       Metod (kriterier, datakällor, uppdateringsfrekvens)
/sa-tjanar-vi-pengar                Ersättningsredovisning (krav för förtroende och E-E-A-T)
/om-oss                             Personer, ansvarig utgivare, kontakt
/ordlista                           Begrepp (DefinedTerm-vänligt)
/vanliga-fragor
```

*Om "Så tjänar vi pengar":* Elpoolen tog bort den sektionen ur Om oss. För Mobilpoolen rekommenderas en egen sida eller i varje fall en tydlig redovisning. Annonsmärkning av betalda länkar krävs ändå enligt marknadsföringslagen, och öppen redovisning stärker både förtroendet och AI-citeringen.

### 3.2 Mall per sidtyp (minsta innehåll)

**Jämförelse- och listsidor (t.ex. /billigaste, /obegransad-surf)**
1. H1 med datum ("uppdaterad 2026-10-29").
2. Faktablock i 2–3 meningar med siffror (citerbart).
3. Tabell med följande kolumner:
   - operatör och nät
   - surf
   - pris månad 1–kampanjslut
   - pris därefter
   - totalpris 12 och 24 mån
   - bindning och uppsägning
   - startavgift
   - EU-surf
   - 5G och eSIM
   - sparad surf
   - källa och kontrolldatum
4. "Så valde vi" i korthet med länk till /sa-jamfor-vi.
5. Segmentrekommendationer ("Billigast om du vill …").
6. FAQ med 4–8 frågor.
7. Interna länkar till verktyg, A vs B och guider.

**Operatörssidor (/operatorer/x)**
- Nät (med källa), alla aktuella abonnemang (tabell) och kampanjer just nu.
- Villkor: bindning, uppsägning, startavgift, EU-surf, eSIM, 5G, sparad surf, familjerabatt, studentrabatt.
- Kundnöjdhet enligt SKI (citat med år och källa), nätdata enligt Opensignal (operatörsnivå, med period).
- "Passar dig om" och "passar dig inte om", baserat på fakta och utan betyg.
- Hur du byter till och säger upp (länk till /saga-upp/x).
- Alternativ i samma nät (länkar) och de vanligaste A vs B.
- FAQ.

**A vs B (/jamfor/a-vs-b)**
- Kort dom per behov: "Välj A om … välj B om …" (inte ett totalbetyg).
- Sida-vid-sida-tabell med samma surfnivåer (t.ex. 10, 30 GB och obegränsat), pris och totalkostnad.
- Nät och täckningsfakta, villkor och extra (eSIM, EU-surf, familj).
- Kundnöjdhet enligt SKI om den finns för båda.
- FAQ.

**Säga upp (/saga-upp/x)**
- Uppsägningstid, kanaler (app, Mina sidor, telefon) och vad som gäller vid bindning.
- Nummerflytt i stället för uppsägning: den nya operatören sköter flytten.
- Kontantkort, eSIM och slutfaktura för telefon.
- Spara bekräftelsen.
- Länk till billigaste alternativ.

### 3.3 Guider (52 idéer)

| # | Titel | Slug | Huvudsökord | Intention |
|---|---|---|---|---|
| 1 | Hur mycket surf behöver du? Räkna på din vardag | `/guider/hur-mycket-surf-behover-jag` | hur mycket surf behöver jag | I → T |
| 2 | Så mycket surf drar Netflix, Spotify, Youtube och Tiktok | `/guider/hur-mycket-surf-drar-appar` | hur mycket surf drar netflix | I |
| 3 | Räcker 5 GB surf i månaden? | `/guider/racker-5-gb-surf` | räcker 5 gb surf | I |
| 4 | Kampanjpris – vad betalar du när kampanjen tar slut? | `/guider/kampanjpris-efter-kampanjen` | kampanjpris mobilabonnemang | I/T |
| 5 | Bindningstid och uppsägningstid – så funkar reglerna | `/guider/bindningstid-uppsagningstid` | bindningstid mobilabonnemang | I |
| 6 | Byta operatör och behålla numret – steg för steg | `/guider/byta-operator-behalla-nummer` | byta operatör behålla nummer | I/T |
| 7 | Hur lång tid tar en nummerflytt? | `/guider/hur-lang-tid-tar-nummerflytt` | nummerflytt hur lång tid | I |
| 8 | Byta operatör med bindningstid kvar – vad kostar det? | `/guider/byta-operator-med-bindningstid` | byta operatör bindningstid | I |
| 9 | Kontantkort eller abonnemang – vad är billigast för dig? | `/guider/kontantkort-eller-abonnemang` | kontantkort eller abonnemang | I/T |
| 10 | Flytta numret från kontantkort till abonnemang | `/guider/kontantkort-till-abonnemang` | flytta nummer kontantkort | I |
| 11 | Vad är eSIM? Så fungerar det | `/guider/vad-ar-esim` | vad är esim | I |
| 12 | Vilka operatörer har eSIM? | `/guider/operatorer-med-esim` | vilka operatörer har esim | I/T |
| 13 | Så aktiverar du eSIM på iPhone och Android | `/guider/aktivera-esim` | aktivera esim iphone | I |
| 14 | Två nummer i samma mobil (dual SIM) | `/guider/tva-nummer-samma-mobil` | två nummer i samma mobil | I |
| 15 | Vilket nät har bäst täckning i Sverige? | `/guider/basta-tackning-sverige` | bäst täckning mobil | I/T |
| 16 | Vilket nät använder din operatör? (Hallon, Vimla, Comviq …) | `/guider/vilket-nat-anvander-operatoren` | vilket nät använder hallon | I |
| 17 | Virtuella operatörer – sämre eller bara billigare? | `/guider/virtuella-operatorer` | virtuell operatör | I |
| 18 | 5G – behöver du det och vad krävs? | `/guider/behover-jag-5g` | 5g abonnemang | I |
| 19 | Dålig täckning hemma? Så felsöker du (wifi-samtal, nätbyte) | `/guider/dalig-tackning-hemma` | dålig täckning hemma | I |
| 20 | Wifi-samtal – vilka operatörer stöder det? | `/guider/wifi-samtal` | wifi samtal | I |
| 21 | Surfa i EU – så mycket ingår och vad det kostar | `/guider/surfa-i-eu` | surfa i eu | I |
| 22 | Surfa utanför EU – USA, Thailand, Turkiet | `/guider/surfa-utanfor-eu` | surfa i usa | I |
| 23 | Rese-eSIM eller roaming – vad är billigast? | `/guider/rese-esim-eller-roaming` | resesim | I/T |
| 24 | Ringa till utlandet billigt | `/guider/ringa-utomlands-billigt` | ringa till utlandet billigt | I/T |
| 25 | Sparad surf och dubbel surf – vad betyder det? | `/guider/sparad-surf-dubbel-surf` | sparad surf | I |
| 26 | När surfen tar slut – strypt hastighet och påfyllning | `/guider/nar-surfen-tar-slut` | surfen tagit slut | I |
| 27 | Barnets första mobilabonnemang – ålder, spärrar och pris | `/guider/forsta-mobilabonnemang-barn` | mobilabonnemang barn | I/T |
| 28 | Spärra köp och surf på barnens mobil | `/guider/sparra-kop-barn-mobil` | spärra köp mobil barn | I |
| 29 | Mobilabonnemang för pensionärer – det här behöver du | `/guider/mobilabonnemang-pensionar-guide` | mobilabonnemang pensionär | I/T |
| 30 | Familjeabonnemang – lönar det sig att samla alla? | `/guider/lonar-sig-familjeabonnemang` | familjeabonnemang | I/T |
| 31 | Studentrabatt på mobilabonnemang – så får du den | `/guider/studentrabatt-mobil` | studentrabatt mobilabonnemang | I/T |
| 32 | Mobil med eller utan abonnemang – räkna på totalen | `/guider/mobil-med-eller-utan-abonnemang` | mobil med abonnemang | I/T |
| 33 | Delbetala mobilen via operatören – fällor och restvärde | `/guider/delbetala-mobil-operator` | delbetala mobil | I |
| 34 | Ångerrätt på mobilabonnemang | `/guider/angerratt-mobilabonnemang` | ångerrätt mobilabonnemang | I |
| 35 | Prishöjning på ditt abonnemang – dina rättigheter | `/guider/prishojning-mobilabonnemang` | prishöjning mobilabonnemang | I |
| 36 | Så sänker du din mobilräkning – 10 konkreta steg | `/guider/sank-mobilrakningen` | sänka mobilräkning | I/T |
| 37 | Förhandla med din operatör (retention-erbjudanden) | `/guider/forhandla-med-operatoren` | förhandla mobilabonnemang | I |
| 38 | Halebop läggs ned – vad gäller och vart ska du byta? | `/guider/halebop-laggs-ned` | halebop läggs ner | I/T (nyhet) |
| 39 | Ordlista: GB, 4G/5G, VoLTE, MVNO, porting | `/ordlista` | mobil ordlista | I |
| 40 | Mobilabonnemang för företag – komplett guide | `/foretag/guide` | mobilabonnemang företag | I/T |
| 41 | Företagsabonnemang som enskild firma | `/guider/foretagsabonnemang-enskild-firma` | mobilabonnemang enskild firma | I/T |
| 42 | Är mobilabonnemanget avdragsgillt? (EF och AB) | `/guider/avdrag-mobilabonnemang` | avdragsgillt mobilabonnemang | I |
| 43 | Jobbmobil och förmånsskatt – vad säger Skatteverket? | `/guider/jobbmobil-formanskatt` | jobbmobil förmån | I |
| 44 | Moms på mobilabonnemang – ex eller inkl? | `/guider/moms-mobilabonnemang` | moms mobilabonnemang | I |
| 45 | Privat- eller företagsabonnemang – skillnaderna | `/guider/privat-eller-foretagsabonnemang` | privat eller företagsabonnemang | I/T |
| 46 | Delad (poolad) surf för företag | `/guider/delad-surf-foretag` | delad surf företag | I/T |
| 47 | Växel eller bara mobil? Mobilsvar och molnväxel för småföretag | `/guider/vaxel-eller-mobil` | mobilväxel småföretag | I/T |
| 48 | Flytta företagets nummer – överlåtelse från privat till företag | `/guider/overlata-nummer-till-foretag` | överlåta abonnemang | I |
| 49 | Mobilt bredband eller fast bredband? | `/guider/mobilt-eller-fast-bredband` | mobilt bredband eller fiber | I/T |
| 50 | Säkerhet: SIM-swap, spam-samtal och bedrägerier | `/guider/sim-swap-bedrageri` | sim swap | I |
| 51 | Gammal mobil och 2G/3G-nedsläckningen – fungerar din? | `/guider/3g-nedslackning` | 3g släcks ner | I |
| 52 | Klagomål på operatören – Telekområdgivarna och ARN | `/guider/klaga-pa-operatoren` | klaga på operatör | I |

*Kontrollera före publicering:* nr 20 (vilka operatörer stöder wifi-samtal) och nr 51 (datum för respektive operatörs nedsläckning) kräver aktuella uppgifter från operatörerna. Påstå ingenting utan källa.

### 3.4 Verktyg

| Verktyg | Slug | Input | Output | SEO-sökord |
|---|---|---|---|---|
| **Hur mycket surf behöver jag?** | `/verktyg/hur-mycket-surf-behover-jag` | Timmar per dag med video, musik, sociala medier, videosamtal och navigering, plus wifi-andel hemma | GB per månad med intervall, och rekommenderad surfnivå med länk till filtrerad lista | hur mycket surf behöver jag, surfkalkylator |
| **Betalar jag för mycket?** | `/verktyg/betalar-jag-for-mycket` | Nuvarande operatör, pris per månad, GB, bindning kvar, faktisk förbrukning | Besparing över 12 och 24 mån mot billigaste likvärdiga, inklusive kostnad för kvarvarande bindning | betalar jag för mycket mobil, spara på mobilabonnemang |
| **Kampanjkalkylator** | `/verktyg/kampanjkalkylator` | Två till tre abonnemang med kampanjpris, kampanjlängd, ordinarie pris och startavgift | Totalkostnad över 12 och 24 mån samt brytpunkt | kampanjpris jämför |
| **Familjekalkylator** | `/verktyg/familjekalkylator` | Antal personer och surfbehov per person | Billigaste kombination: ett familjepaket eller olika operatörer per person | familjeabonnemang jämför |
| **Företagskalkylator** | `/foretag/kalkylator` | Antal användare, surf per användare, behov av växel eller delad surf | Kostnad ex moms per användare och totalt per år | mobilabonnemang företag pris |
| **Vilket nät har jag?** | `/verktyg/vilket-nat-har-jag` | Operatör | Nät, länkar till täckningskartor och PTS samt alternativ i samma nät | vilket nät använder |

Tekniskt: rendera resultatet server-side eller med indexerbar standardtext, så att sidan inte blir tom för Googlebot och AI-crawlers. Ge varje verktyg en förklarande text, en metod och en FAQ. Schema: `WebApplication` (eller `SoftwareApplication`) **utan** rating.

### 3.5 Egen data som magnet för länkar och AI-citat

- **Mobilpoolens prisindex** (`/prisindex`), månatligt: median och billigaste pris per surfnivå, andel kampanjer och genomsnittlig prisökning efter kampanj. Publicera med datum och en nedladdningsbar CSV. Det ger pressutskick och citat i AI-svar.
- **Prisändringslogg** (`/nyheter`): "2026-10-xx: Operatör X höjde Y från A till B kr".
- **Rapport "Kampanjfällan 2026"**: hur mycket mer kunderna betalar år 2. Den kan bli en pressrelease.

---

## 4. Tester och recensioner – ärlig metod

### 4.1 Principer (krav)

1. **Inga påhittade betyg, inga stjärnor och ingen `AggregateRating` eller `Review`-schema** med egna poäng. Vi har inga användarrecensioner och gör inga egna nätmätningar.
2. **"Recension" ersätts med "granskning".** Formulera inte "vi har testat" om vi inte gjort det. Skriv "vi har granskat villkor och priser per [datum]".
3. **Varje påstående har en källa och ett datum** (operatörens prislista eller villkor, PTS, Opensignal, SKI, Telekområdgivarna).
4. **Inget totalbetyg.** I stället "bäst för"-utnämningar som följer direkt av mätbara kriterier ("billigast 20 GB över 24 mån utan bindning").
5. **Ersättning påverkar inte ordningen.** Det ska redovisas på varje lista ("Annons" vid betalda länkar) och på `/sa-tjanar-vi-pengar`. Standardsortering är totalpris. Om det finns en sorterad "rekommenderad"-ordning ska kriterierna stå öppet.

### 4.2 Verifierbara kriterier (Mobilpoolens kontrollista)

Varje operatör granskas på samma fasta punkter. Varje punkt är ja/nej eller ett tal med källa. Inget viktat poängtal.

| Område | Kriterium | Datakälla | Visas som |
|---|---|---|---|
| Pris | Totalpris 12 och 24 mån för 5, 10, 20, 50 GB och obegränsat (inklusive startavgift och kampanjslut) | Operatörens webb och prislista (PDF), skärmdump arkiveras | kr |
| Pris | Pris efter kampanj jämfört med kampanjpris | Samma | kr och % |
| Flexibilitet | Bindningstid, uppsägningstid, möjlighet att byta surfnivå per månad | Allmänna villkor | månader, ja/nej |
| Transparens | Pris efter kampanj tydligt angivet på produktsidan | Egen kontroll med datum | ja/nej |
| Avgifter | Startavgift, SIM- eller eSIM-avgift, avgift för pappersfaktura | Prislista | kr |
| Funktioner | eSIM, 5G ingår, wifi-samtal, VoLTE, sparad surf, extra-SIM eller delad surf | Operatörens webb | ja/nej |
| Utland | EU-surf i GB (fair use), pris utanför EU | Prislista | GB, kr/MB |
| Nät | Vilket nät (värdnät) | Operatör och PTS | text |
| Nätkvalitet (extern) | Opensignals utmärkelser för värdnätet, med period | Opensignal-rapport | citat med datum |
| Täckning (extern) | PTS mobiltäckningskartläggning | PTS | länk och citat |
| Kundnöjdhet (extern) | SKI-index för operatören, privat och företag, med år | SKI | index plus branschsnitt |
| Kundtjänst | Kanaler (chatt, telefon, app) och öppettider | Operatörens webb | lista |
| Konsumentskydd | Kostnadstak eller spärrar, och kontroll mot barn | Operatörens webb | ja/nej |
| Företag | Momsredovisning, pris per användare, delad surf, växel, fakturering | Företagsprislista | kr ex moms, ja/nej |

**Bäst för-utnämningar** (härleds automatiskt ur datan och uppdateras med datum):
- Billigast totalt 24 mån för 10, 20 och 50 GB samt obegränsat.
- Billigast utan bindningstid.
- Lägst prishöjning efter kampanj (stabilast pris).
- Flest funktioner för pengarna (räkna ja-svar på funktionslistan, visat som "8 av 9 funktioner", inte som betyg).
- Högst kundnöjdhet enligt SKI 2025, ett externt citat och inte vårt betyg.
- Billigast för företag per användare ex moms.

### 4.3 Process och E-E-A-T

- **Uppdatering:** priserna kontrolleras minst varannan vecka (helst automatiskt plus manuell stickprovskontroll). Varje rad visar "kontrollerad [datum]".
- **Arkiv:** skärmdump och PDF av prislistan sparas per kontroll (bevis vid fel och tidsserie för prisindex).
- **Felrapportering:** knappen "Rapportera fel pris" på varje rad. Rättelselogg på `/sa-jamfor-vi`.
- **Författare och granskare:** namn och roll på varje guide (Organization och Person-schema). Ansvarig utgivare på Om oss.
- **Schema som får användas:**
  - `Organization`, `WebSite`, `BreadcrumbList`, `Article` med `dateModified`, `FAQPage` (bara för synlig FAQ).
  - `ItemList` för listorna.
  - `Product` eller `Offer` med pris och valuta (utan rating) **om** datan är korrekt och synlig. Annars hoppa över.
  - `HowTo` är inte längre rikt resultat i Google, men är ofarligt.
  - `DefinedTerm` på ordlistan.
- **Får inte användas:** `AggregateRating`, `Review` med egna poäng och stjärnor i titel eller beskrivning.

### 4.4 AI-synlighet (GEO)

- Inled varje sida med ett **daterat svarsblock** på 2–3 meningar med siffror och källa.
- Använd tabeller i HTML (inte bilder) och frågebaserade H2:or som matchar listan i 2.4.
- Ha en `/sa-jamfor-vi`-sida och en `llms.txt` som pekar på pelarsidor, metod och prisindex.
- Släpp inte in crawlers i onödigt JavaScript. Server-rendera listorna (viktigt om sajten byggs i Lovable/Vite som Elpoolen: överväg prerender eller SSR).
- Bygg omnämnanden genom prisindexet och pressmeddelanden, ett citat i Privata Affärer eller Börskollen, samt aktiva och ärliga svar i Rika Tillsammans och Sweclockers (det är källor som AI ofta hämtar ur).

---

## 5. Prioriterad lanseringsordning (förslag)

1. **Vecka 1–2:**
   - `/`, `/billigaste-mobilabonnemang`, `/utan-bindningstid`, `/obegransad-surf`
   - `/sa-jamfor-vi`, `/sa-tjanar-vi-pengar`, `/om-oss`
   - 13 operatörssidor och `/operatorer/halebop`
2. **Vecka 3–4:**
   - `/foretag` med 3 undersidor och kalkylator
   - Verktygen surfbehov och "betalar jag för mycket"
   - 4 A vs B (prio 1)
   - Guiderna 1, 4, 6, 9, 11, 15, 16 och 38
3. **Månad 2:**
   - Målgruppssidorna (barn, pensionär, student, familj, ungdom), `/esim`, `/kontantkort`, `/5g-abonnemang`
   - Resterande A vs B (prio 2)
   - 10 guider till
   - `/saga-upp` för de 8 största operatörerna
4. **Månad 3 och framåt:**
   - Prisindex (månatligt), surfnivå- och nätsidor
   - Resterande guider
   - `/mobilt-bredband` (avgränsad)

---

## Källor

- test.se mobilabonnemang: https://www.test.se/mobilabonnemang/
- test.se företagsabonnemang: https://www.test.se/foretagsabonnemang/
- test.se operatörer i Telias nät: https://www.test.se/mobilabonnemang/mobiloperatorer-i-telias-nat/
- Boio billigaste: https://boio.se/mobilabonnemang/billigaste
- Boio byta operatör: https://boio.se/mobilabonnemang/byta-operator
- Boio pensionär: https://boio.se/mobilabonnemang/pensionar
- Boio Så tjänar vi pengar: https://boio.se/mobilabonnemang/sa-tjanar-vi-pengar
- Giraffy: https://giraffy.com/se/sv/mobile/mobile-sims
- Testkompassen: https://www.testkompassen.se/kategorier/privatekonomi/abonnemang/mobilabonnemang
- Bäst i test: https://www.bast-i-test.se/abonnemang/mobilabonnemang.html
- TechRadar SE: https://global.techradar.com/sv-se/best/basta-mobilabonnemangen
- BusinessWith: https://businesswith.se/foretagstelefoni/
- M3 mobilabonnemang (noindex): https://www.m3.se/mobilabonnemang
- M3 om Halebop: https://www.m3.se/article/3154242/halebop-gar-i-graven-kunderna-flyttas-over-till-telia.html
- Pressmeddelande Surf.nu: https://www.realtid.se/pressmeddelande/mobilabonnemang-jamfor-priser-surf-och-villkor/
- Pressmeddelande jämför-mobilabonnemang.se: https://www.mynewsdesk.com/se/contentalot/pressreleases/jaemfoer-mobilabonnemang-och-hitta-raett-alternativ-foer-dina-behov-3443877
- Börskollen/Privata Affärer: https://www.borskollen.se/nyheter/27/granskningen-visar-mest-prisvarda-mobilabonnemangen-for-tre-olika-konsumenttyper
- Telekområdgivarna: https://telekomradgivarna.se/en/sa-funkar-det/switching-mobile-operator-and-transferring-your-number/
- Opensignal Sverige dec 2025: https://insights.opensignal.com/reports/2025/12/sweden/mobile-network-experience
- SKI Mobil 2025: https://www.kvalitetsindex.se/wp-content/uploads/2025/10/ski-mobil-2025.pdf
- Skatteverket arbetsredskap: https://skatteverket.se/foretag/arbetsgivare/lonochersattning/formaner/arbetsredskap.4.3016b5d91791bf546791ad4.html
