// Nyhetsflödet: registret över alla nyheter på /nyheter.
//
// En nyhet är kort (150 till 400 ord), skriven med egna ord och bygger bara på
// källor som går att länka till, i första hand PTS, Konsumentverket, regeringen
// och riksdagen, EU-kommissionen, operatörernas egna pressmeddelanden och vår
// egen prisdata. Varje källa har ett datum.
//
// Lägg till en nyhet genom att lägga en post i NYHETER_OSORTERADE. Den blir då
// synlig på /nyheter, /nyheter/<slug>, i sitemap.xml och i rss.xml.
// Lägg också en rad under "Nyheter" i public/llms.txt.
//
// Nyhetsroboten (schemalagd uppgift, se docs/nyhetsroboten.md) skriver nyheter
// enligt samma regler. Ändra reglerna här och i docs/nyhetsroboten.md samtidigt.
//
// Så länge registret är tomt är /nyheter noindex och står varken i sitemap,
// meny eller llms.txt. Den första nyheten slår på allt automatiskt.
//
// Länkar i brödtexten skrivs [text](/sökväg). Interna sökvägar blir Link,
// adresser som börjar med https:// blir vanliga länkar.
//
// Datumen:
// - handelseIso är dagen källan publicerades. Listan sorteras på den.
// - publiceradIso och uppdateradIso är när Mobilpoolen publicerade och senast
//   ändrade texten. De går in i NewsArticle, sitemap och RSS.

import type { Bildnyckel } from "@/lib/bildbank";

export type NyhetBlock =
  | { typ: "p"; text: string }
  | { typ: "h2"; text: string; id?: string }
  | { typ: "ul"; punkter: string[] };

export type NyhetKalla = {
  /** Vem som publicerat, till exempel "PTS" eller "Telia". */
  utgivare: string;
  /** Titel på dokumentet eller sidan. */
  titel: string;
  url: string;
  /** När källan publicerades eller uppdaterades, i klartext. */
  datum: string;
};

export const NYHET_KATEGORIER = [
  "Priser och villkor",
  "Operatörer",
  "Nät och täckning",
  "Regler och konsument",
  "Tips och råd",
] as const;
export type NyhetKategori = (typeof NYHET_KATEGORIER)[number];

export type NyhetTyp = "nyhet" | "fast" | "tips";

export type Nyhet = {
  slug: string;
  /** Rubriken på sidan (H1). */
  titel: string;
  /** Kort rubrik till <title>. Högst 46 tecken, så att " | Mobilpoolen" ryms inom 60. */
  seoTitel: string;
  /** Ingressen. Visas överst och används som meta description, högst 155 tecken. */
  ingress: string;
  /** Avsändaren som visas i listan bredvid datumet, till exempel "PTS". */
  avsandare: string;
  kategori: NyhetKategori;
  /**
   * Foto ur bildbanken (src/lib/bildbank.ts). Saknas det visas bara nyckeltalet
   * på en indigo bakgrund. Samma bild ska inte användas på två nyheter i rad.
   */
  bild?: Bildnyckel;
  /** Den viktigaste siffran i nyheten, visas stort på kortet. */
  nyckeltal: { varde: string; text: string };
  handelseIso: string;
  publiceradIso: string;
  uppdateradIso: string;
  /**
   * Vilken sorts artikel det är. Styr taket i tests/nyhetstak.test.ts.
   * "nyhet" (standard): något som hänt, med källa. "fast": ett återkommande
   * dataformat, högst ett per format och månad. "tips": säsongstips med
   * datumkrok, högst ett per vecka. Se docs/nyhetsroboten.md.
   */
  typ?: NyhetTyp;
  innehall: NyhetBlock[];
  kallor: NyhetKalla[];
  /** Våra egna sidor som hör ihop med nyheten, 2 till 4 stycken. */
  relaterat: { href: string; label: string }[];
};

const NYHETER_OSORTERADE: Nyhet[] = [
  {
    slug: "black-week-2026-mobilabonnemang",
    titel: "Black Week 2026: så mycket betalar du när kampanjmånaderna är slut",
    seoTitel: "Black Week 2026: mobilabonnemang",
    ingress:
      "Hallons Black Weeks pågår till 2 december. 5 GB kostar 9 kr/mån i fyra månader och sedan 109 kr. Första året blir snittet 76 kr i månaden.",
    avsandare: "Mobilpoolen",
    kategori: "Tips och råd",
    typ: "tips",
    bild: "shoppingkassar-paket",
    nyckeltal: { varde: "109 kr", text: "per månad efter fyra månader för 9 kr (Hallon 5 GB)" },
    handelseIso: "2026-11-10",
    publiceradIso: "2026-11-10",
    uppdateradIso: "2026-11-12",
    innehall: [
      {
        typ: "p",
        text: "Black Friday infaller den 27 november 2026, men Hallons kampanj på mobilabonnemang pågår i flera veckor. Hallon startade sina Black Weeks den 3 november och skriver att de pågår till och med 2 december. Kampanjpriset gäller i fyra månader och bara när du tecknar ett nytt abonnemang.",
      },
      { typ: "h2", text: "Det här gäller just nu" },
      {
        typ: "ul",
        punkter: [
          "Hallon 5 GB: 9 kr/mån i fyra månader, sedan 109 kr/mån. 60 GB extra surfpott.",
          "Hallon 100 GB: 49 kr/mån i fyra månader, sedan 359 kr/mån. 100 GB extra surfpott.",
          "Bredvid varje Black Weeks-pris visar Hallon ett tidigare lägsta pris som är 10 kr högre per månad, till exempel 19 kr i stället för 9 kr för 5 GB. Under fyra månader blir skillnaden 40 kr.",
        ],
      },
      { typ: "h2", text: "Nytt 12 november: Comviq och Tele2 har startat" },
      {
        typ: "ul",
        punkter: [
          "Comviq har startat sina Black Weeks: 75 % rabatt i sex månader, med eller utan bindningstid. 5 GB kostar 29 kr/mån och sedan 129 kr/mån. 100 GB kostar 89 kr/mån och sedan 359 kr/mån. Med 12 månaders bindningstid får du också dubbel surf i 12 månader. Kampanjen gäller nya kunder och dig som byter från kontantkort. Slutdatum framgår inte.",
          "Tele2 har startat Black Cheap Weeks med samma pris i 24 månader och 24 månaders bindningstid. 15 GB kostar 199 kr/mån med dubbel surf (30 GB), och Obegränsad 299 kr/mån. Tele2 visar 329 respektive 479 kr/mån som tidigare pris. Slutdatum framgår inte.",
          "Telenor skriver fortfarande att Black Week närmar sig.",
        ],
      },
      { typ: "h2", text: "Vad det betyder för dig" },
      {
        typ: "p",
        text: "Räkna på hela året, inte på första fakturan. Efter fyra månader stiger Hallons pris med mellan 100 och 310 kr i månaden, beroende på surfmängd. För 100 GB blir snittet första året 256 kr i månaden. Hallon har ingen bindningstid, så du kan byta igen när kampanjen är slut. Comviqs 5 GB utan bindningstid ger 79 kr i månaden i snitt första året, mot 76 kr för Hallons 5 GB. Hos Tele2 är du i stället bunden i 24 månader.",
      },
      {
        typ: "p",
        text: "Jämför snittpriset första året i [jämförelsen](/), se alla [kampanjer just nu](/kampanjer) och läs [vad som händer när kampanjpriset tar slut](/guider/kampanjpris-efter-kampanjen).",
      },
    ],
    kallor: [
      {
        utgivare: "Hallon",
        titel: "Mobilabonnemang",
        url: "https://www.hallon.se/mobilabonnemang",
        datum: "kontrollerad 12 november 2026",
      },
      {
        utgivare: "Hallon",
        titel: "Black Friday och Black Week 2026",
        url: "https://www.hallon.se/black-friday",
        datum: "kontrollerad 12 november 2026",
      },
      {
        utgivare: "Telenor",
        titel: "Mobilabonnemang",
        url: "https://www.telenor.se/handla/mobilabonnemang/",
        datum: "kontrollerad 12 november 2026",
      },
      {
        utgivare: "Comviq",
        titel: "Black Weeks",
        url: "https://www.comviq.se/erbjudanden/black-friday",
        datum: "kontrollerad 12 november 2026",
      },
      {
        utgivare: "Comviq",
        titel: "Mobilabonnemang",
        url: "https://www.comviq.se/mobilabonnemang",
        datum: "kontrollerad 12 november 2026",
      },
      {
        utgivare: "Tele2",
        titel: "Mobilabonnemang: Black Cheap Weeks",
        url: "https://www.tele2.se/mobilabonnemang",
        datum: "kontrollerad 12 november 2026",
      },
    ],
    relaterat: [
      { href: "/kampanjer", label: "Kampanjer just nu" },
      { href: "/guider/kampanjpris-efter-kampanjen", label: "När kampanjpriset tar slut" },
      { href: "/verktyg/kampanjkalkylator", label: "Kampanjkalkylatorn" },
      { href: "/operatorer/hallon", label: "Hallon: priser och villkor" },
    ],
  },
  {
    slug: "comviq-bas-dagsavgift-kontantkort",
    titel: "Comviq tar 1,50 kr om dagen på kontantkort utan prisplan",
    seoTitel: "Comviq inför dagsavgift på Bas",
    ingress:
      "Sedan 1 oktober 2026 drar Comviq 1,50 kr om dagen från saldot på kontantkort som ligger på Bas utan aktiv prisplan. En hel månad blir 46,50 kr.",
    avsandare: "Comviq",
    kategori: "Priser och villkor",
    bild: "spargris-tra",
    nyckeltal: { varde: "1,50 kr", text: "om dagen på Bas utan prisplan" },
    handelseIso: "2026-10-01",
    publiceradIso: "2026-11-02",
    uppdateradIso: "2026-11-02",
    innehall: [
      {
        typ: "p",
        text: "Comviq har infört en daglig avgift för kontantkortskunder som ligger på Bas utan någon aktiv prisplan. Avgiften gäller från den 1 oktober 2026 och dras direkt från saldot, för att hålla numret aktivt enligt Comviq.",
      },
      { typ: "h2", text: "Det här gäller" },
      {
        typ: "ul",
        punkter: [
          "Avgiften är 1,50 kr om dagen. Under en månad med 31 dagar blir det 46,50 kr, utöver vad du betalar för samtal, sms och surf.",
          "Har du en aktiv prisplan betalar du ingen dagsavgift så länge prisplanen gäller. När en prisplans giltighetstid går ut hamnar kortet på Bas.",
          "När saldot är 10 kr eller lägre skickar Comviq en påminnelse via sms.",
          "Når saldot 0 kr och du inte tankar inom 7 dagar spärras numret. Du behåller numret och det öppnas igen när du tankar. Nödsamtal till 112 fungerar alltid.",
        ],
      },
      { typ: "h2", text: "Vad det betyder för dig" },
      {
        typ: "p",
        text: "Har du ett Comviq-kontantkort som mest ligger i en låda, eller som bara används ibland, kan saldot nu ta slut av sig självt. Kolla saldot och om du har en prisplan som gäller. Ringer och surfar du lite kan ett annat kontantkort eller ett billigt abonnemang utan bindningstid bli billigare. Jämför på sidan om [kontantkort](/kontantkort) och läs [kontantkort eller abonnemang](/guider/kontantkort-eller-abonnemang).",
      },
    ],
    kallor: [
      {
        utgivare: "Comviq",
        titel: "Avgift för kontantkort Bas",
        url: "https://www.comviq.se/bas-avgift",
        datum: "gäller från 1 oktober 2026",
      },
    ],
    relaterat: [
      { href: "/kontantkort", label: "Jämför kontantkort" },
      { href: "/guider/kontantkort-eller-abonnemang", label: "Kontantkort eller abonnemang?" },
      { href: "/operatorer/comviq", label: "Comviq: priser och villkor" },
    ],
  },
  {
    slug: "ski-mobil-2026-fello-nojdast",
    titel: "SKI Mobil 2026: Fello har nöjdast privatkunder",
    seoTitel: "SKI Mobil 2026: Fello nöjdast",
    ingress:
      "Fello får 81,0 i SKI Mobil 2026, nästan 15 enheter över branschsnittet 66,2. Bland företagen är Telia högst med 69,2.",
    avsandare: "Svenskt Kvalitetsindex",
    kategori: "Operatörer",
    bild: "diagram-papper",
    nyckeltal: { varde: "81,0", text: "Fellos kundnöjdhet bland privatkunder" },
    handelseIso: "2026-10-05",
    publiceradIso: "2026-11-02",
    uppdateradIso: "2026-11-02",
    innehall: [
      {
        typ: "p",
        text: "Svenskt Kvalitetsindex (SKI) publicerade sin årliga mätning av mobiloperatörerna den 5 oktober 2026. Undersökningen bygger på 2 698 intervjuer som gjordes i september 2026.",
      },
      { typ: "h2", text: "Det här visar mätningen" },
      {
        typ: "ul",
        punkter: [
          "Fello har högst kundnöjdhet bland privatkunder med 81,0 av 100.",
          "Branschsnittet för privatkunder ökar från 65,8 i fjol till 66,2.",
          "Bland företagskunder är branschsnittet 67,0, i stort sett samma som i fjol (67,1). Telia är högst med 69,2.",
          "Information i samband med prishöjningar får särskilt svaga omdömen.",
          "Ungefär var fjärde företagskund har haft avbrott eller driftstörningar det senaste året. Informationen under störningen och tiden till åtgärd får lägre betyg än den vanliga tekniska kvaliteten.",
        ],
      },
      { typ: "h2", text: "Vad det betyder för dig" },
      {
        typ: "p",
        text: "Kundnöjdhet säger något om hur andra kunder upplever service, pris och nät, men inte vad du själv kommer att betala. Fello går i Telias nät. Jämför därför både pris efter kampanjen och vilket nät som fungerar där du bor. Se [Fello](/operatorer/fello) och [alla operatörer](/operatorer), eller [jämför abonnemangen](/) direkt.",
      },
      {
        typ: "p",
        text: "Höjer operatören priset under avtalstiden har du ofta rätt att säga upp avtalet. Läs mer i guiden om [prishöjning på mobilabonnemang](/guider/prishojning-mobilabonnemang).",
      },
    ],
    kallor: [
      {
        utgivare: "Svenskt Kvalitetsindex",
        titel: "SKI Mobil 2026",
        url: "https://www.kvalitetsindex.se/wp-content/uploads/2026/10/ski-mobil-2026.pdf",
        datum: "5 oktober 2026",
      },
      {
        utgivare: "Svenskt Kvalitetsindex",
        titel: "SKI Mobiloperatörer",
        url: "https://www.kvalitetsindex.se/branschundersokningar/mobilkunderna/",
        datum: "5 oktober 2026",
      },
    ],
    relaterat: [
      { href: "/operatorer/fello", label: "Fello: priser och villkor" },
      { href: "/basta-mobilabonnemang", label: "Bästa mobilabonnemang" },
      { href: "/guider/mobilmarknaden-i-siffror", label: "Mobilmarknaden i siffror" },
    ],
  },
  {
    slug: "telia-internetfilter-bedragerisajter",
    titel: "Telia blockerar kända bedrägerisajter för alla mobilkunder",
    seoTitel: "Telia blockerar bedrägerisajter",
    ingress:
      "Sedan 5 oktober 2026 stoppar Telia kända bedrägeri- och nätfiskesajter i mobilnätet. Tjänsten Internetfilter ingår utan extra kostnad.",
    avsandare: "Telia",
    kategori: "Operatörer",
    bild: "kort-laptop-betalning",
    nyckeltal: { varde: "0 kr", text: "Internetfilter ingår för Telias mobilkunder" },
    handelseIso: "2026-10-05",
    publiceradIso: "2026-11-02",
    uppdateradIso: "2026-11-02",
    innehall: [
      {
        typ: "p",
        text: "Telia har lanserat Internetfilter, en tjänst som automatiskt blockerar kända bedrägerisajter innan du hinner öppna dem. Den gäller för Telias mobilkunder från den 5 oktober 2026.",
      },
      { typ: "h2", text: "Det här är klart" },
      {
        typ: "ul",
        punkter: [
          "Filtret blockerar kända bedrägeri- och nätfiskesajter (phishing) i mobiltrafiken.",
          "Det körs direkt i Telias nät och jämför mot register över kända bluffsajter som uppdateras löpande. Du behöver inte göra något själv.",
          "Tjänsten ingår utan extra kostnad och påverkar inte surfhastigheten, enligt Telia.",
          "Vill du inte ha den kan du stänga av den via Telias självbetjäning eller kundservice.",
          "I Norge har Telias kunder redan tjänsten. Där stoppas nästan 24 miljoner försök i månaden att nå skadliga sajter eller genomföra attacker med skadlig kod.",
        ],
      },
      {
        typ: "p",
        text: "Enligt Telia gäller skyddet mobiltrafik.",
      },
      { typ: "h2", text: "Vad det betyder för dig" },
      {
        typ: "p",
        text: "Är du Telia-kund får du skyddet automatiskt. Det stoppar bara sajter som redan är kända, så en ny bluffsida kan slinka igenom. Klicka inte på länkar i oväntade sms och mejl, även om de ser ut att komma från banken eller ett paketbolag. I guiden om [bedrägerier, SIM-swap och bluffsamtal](/guider/bedrageri-sim-swap-och-bluffsamtal) finns fler råd. Priser och villkor hos Telia hittar du på [Telias operatörssida](/operatorer/telia).",
      },
    ],
    kallor: [
      {
        utgivare: "Telia",
        titel:
          "Telia stoppar bedrägerisajter automatiskt för alla mobilkunder i ny säkerhetstjänst",
        url: "https://press.telia.se/pressreleases/telia-stoppar-bedraegerisajter-automatiskt-foer-alla-mobilkunder-i-ny-saekerhetstjaenst-3470701",
        datum: "5 oktober 2026",
      },
    ],
    relaterat: [
      {
        href: "/guider/bedrageri-sim-swap-och-bluffsamtal",
        label: "Bedrägerier, SIM-swap och bluffsamtal",
      },
      { href: "/operatorer/telia", label: "Telia: priser och villkor" },
      { href: "/nat/telia", label: "Telias mobilnät" },
    ],
  },
  {
    slug: "nya-mobilnummer-078-oktober-2026",
    titel: "Nya mobilnummer börjar på 078 från 1 oktober",
    seoTitel: "Nya mobilnummer på 078",
    ingress:
      "Från 1 oktober 2026 får operatörerna dela ut mobilnummer som börjar på 078. Det ger nio miljoner nya nummer. Befintliga nummer berörs inte.",
    avsandare: "PTS",
    kategori: "Regler och konsument",
    bild: "esim-simkort-verktyg",
    nyckeltal: { varde: "9 miljoner", text: "nya mobilnummer i 078-serien" },
    handelseIso: "2026-05-13",
    publiceradIso: "2026-11-02",
    uppdateradIso: "2026-11-02",
    innehall: [
      {
        typ: "p",
        text: "Post- och telestyrelsen (PTS) har beslutat att nummerserien 078 ska användas för mobiltelefoni från den 1 oktober 2026. Det frigör nio miljoner nya mobilnummer. Från början skulle ändringen gälla från 1 augusti, men PTS flyttade datumet efter dialog med marknadsaktörerna för att undvika risken för driftstörningar under sommaren.",
      },
      { typ: "h2", text: "Det här är klart" },
      {
        typ: "ul",
        punkter: [
          "Nummer som börjar på 0780, 0781, 0782 och 0784 till 0789 blir vanliga mobilnummer, med samma längd som andra mobilnummer.",
          "Serien 0783 används för GSM-R, ett kommunikationssystem för järnvägen.",
          "Operatörernas interna tjänster, som tidigare låg i 078, flyttas till den nya serien 0578.",
          "Ändringen gäller bara 078-serien, så befintliga mobilnummer berörs inte.",
        ],
      },
      { typ: "h2", text: "Vad det betyder för dig" },
      {
        typ: "p",
        text: "Får du ett nytt abonnemang kan numret börja på 078, och det fungerar som vilket mobilnummer som helst. Du kan också ta med det om du byter operatör, se [byta operatör och behålla numret](/guider/byta-operator-behalla-nummer). Ringer någon från ett 078-nummer är det alltså ett vanligt mobilnummer. Det säger ingenting om vem som ringer, så var lika försiktig som annars med samtal du inte väntat dig.",
      },
    ],
    kallor: [
      {
        utgivare: "PTS",
        titel: "Nytt datum för när mobilnummer i 078-serien kan börja användas",
        url: "https://pts.se/nyheter-och-pressmeddelanden/nytt-datum-for-nar-mobilnummer-i-078-serien-kan-borja-anvandas/",
        datum: "13 maj 2026",
      },
      {
        utgivare: "PTS",
        titel: "PTS skapar nio miljoner nya mobilnummer",
        url: "https://pts.se/nyheter-och-pressmeddelanden/pts-skapar-nio-miljoner-nya-mobilnummer/",
        datum: "16 december 2025",
      },
      {
        utgivare: "PTS",
        titel: "Beslut om ändring av telefoninummerplanen avseende 078-serien",
        url: "https://pts.se/contentassets/e920f15d3440474794a204021098488d/beslut-om-andring-av-telefoninummerplanen-avseende-078-serien.pdf",
        datum: "trädde i kraft 1 februari 2026",
      },
    ],
    relaterat: [
      { href: "/guider/byta-operator-behalla-nummer", label: "Byta operatör och behålla numret" },
      {
        href: "/guider/bedrageri-sim-swap-och-bluffsamtal",
        label: "Bedrägerier, SIM-swap och bluffsamtal",
      },
      { href: "/operatorer", label: "Alla operatörer" },
    ],
  },
];

/** Alla nyheter, nyast först (efter dagen källan publicerades). */
export const NYHETER: Nyhet[] = [...NYHETER_OSORTERADE].sort(
  (a, b) =>
    b.handelseIso.localeCompare(a.handelseIso) || b.publiceradIso.localeCompare(a.publiceradIso),
);

/** Sant när det finns minst en nyhet. Styr sitemap, meny och noindex på /nyheter. */
export const HAR_NYHETER = NYHETER.length > 0;

export function getNyhet(slug: string): Nyhet | undefined {
  return NYHETER.find((n) => n.slug === slug);
}

/** Senaste ändringen i flödet. Används som lastmod för /nyheter. */
export const NYHETER_SENAST_ANDRAD: string =
  NYHETER.map((n) => n.uppdateradIso)
    .sort()
    .at(-1) ?? "2026-11-02";

/** "2026-10-14" blir "14 oktober 2026". */
export function nyhetsdatum(iso: string): string {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString("sv-SE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Stockholm",
  });
}

export type Textdel = { text: string; href?: string };

/** Delar upp "[text](/sökväg)" i text och länkar. */
export function textdelar(text: string): Textdel[] {
  // Tusentalsavgränsare som hårt mellanslag, så att "1 081 kr" inte bryts.
  text = text.replace(/(\d) (\d{3})(?!\d)/g, "$1 $2");
  const delar: Textdel[] = [];
  const re = /\[([^\]]+)\]\(([^)\s]+)\)/g;
  let senast = 0;
  for (const m of text.matchAll(re)) {
    const start = m.index ?? 0;
    if (start > senast) delar.push({ text: text.slice(senast, start) });
    delar.push({ text: m[1]!, href: m[2]! });
    senast = start + m[0].length;
  }
  if (senast < text.length) delar.push({ text: text.slice(senast) });
  return delar;
}

/** Texten utan länkmarkering, för RSS och räkning av ord. */
export function rentext(text: string): string {
  return textdelar(text)
    .map((d) => d.text)
    .join("");
}

/** Bakgrund per kategori för nyckeltalskortet. Alla i sajtens indigoskala. */
export const KATEGORI_BAKGRUND: Record<NyhetKategori, string> = {
  "Priser och villkor": "linear-gradient(135deg, #3b28cc 0%, #2a1c94 100%)",
  Operatörer: "linear-gradient(135deg, #2a1f6e 0%, #16133a 100%)",
  "Nät och täckning": "linear-gradient(135deg, #4a3fb0 0%, #2b2470 100%)",
  "Regler och konsument": "linear-gradient(135deg, #241d5c 0%, #110e2c 100%)",
  "Tips och råd": "linear-gradient(135deg, #5a4fd0 0%, #362c9a 100%)",
};
