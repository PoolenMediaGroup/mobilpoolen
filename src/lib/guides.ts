// Innehållsbank: registret över alla guider och deras kategorier.
// Nya guider läggs till här och får en egen route under src/routes/guider.<slug>.tsx

export const GUIDE_CATEGORIES = [
  "Pris och avtal",
  "Surf och nät",
  "Byta och säga upp",
  "Utland",
  "Familj och målgrupper",
  "Säkerhet och rättigheter",
  "För företag",
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];

export type GuideMeta = {
  slug: string;
  title: string;
  excerpt: string;
  category: GuideCategory;
  readingTime: string;
  published: string;
  updated: string;
  publishedIso: string;
  updatedIso: string;
  /** true = brödtexten är inte skriven än */
  placeholder?: boolean;
};

const LANSERING = "29 oktober 2026";
const LANSERING_ISO = "2026-10-29";

export const GUIDES: GuideMeta[] = [
  {
    slug: "kampanjpris-efter-kampanjen",
    title: "Kampanjpris på mobilabonnemang: vad betalar du sedan?",
    excerpt:
      "Så räknar du ut vad ett kampanjpris kostar på ett och två år, varför ordinarie pris avgör och hur du undviker att betala fullt pris efter kampanjen.",
    category: "Pris och avtal",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "bindningstid-uppsagningstid",
    title: "Bindningstid och uppsägningstid på mobilabonnemang",
    excerpt:
      "Vad lagen säger om bindningstid och uppsägningstid, vad det kostar att bryta ett avtal i förtid och när bindningstid kan löna sig.",
    category: "Pris och avtal",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "sank-mobilrakningen",
    title: "Sänk mobilräkningen: 10 sätt att betala mindre",
    excerpt:
      "Tio konkreta sätt att sänka kostnaden för mobilen, från rätt surfmängd och byte av operatör till familjerabatt och att stänga av tjänster du inte använder.",
    category: "Pris och avtal",
    readingTime: "8 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "prishojning-mobilabonnemang",
    title: "Prishöjning på mobilabonnemanget: dina rättigheter",
    excerpt:
      "Operatören får höja priset, men måste säga till en månad innan. Så fungerar rätten att säga upp avtalet när villkoren ändras, även med bindningstid.",
    category: "Pris och avtal",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "angerratt-mobilabonnemang",
    title: "Ångerrätt på mobilabonnemang och telefonförsäljning",
    excerpt:
      "14 dagars ångerrätt vid köp på nätet och i telefon, varför ett telefonsamtal inte räcker för att ingå avtal och så ångrar du ett abonnemang.",
    category: "Pris och avtal",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "mobil-med-eller-utan-abonnemang",
    title: "Köpa mobil med eller utan abonnemang: räkna på totalen",
    excerpt:
      "Så jämför du en telefon på delbetalning med abonnemang mot att köpa mobilen själv och ta ett billigt abonnemang. Med räkneexempel över 24 månader.",
    category: "Pris och avtal",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "kontantkort-eller-abonnemang",
    title: "Kontantkort eller abonnemang: vad är billigast för dig?",
    excerpt:
      "Skillnaden mellan kontantkort och abonnemang i pris, registrering, surf och flexibilitet, och för vem kontantkort fortfarande är det bästa valet.",
    category: "Pris och avtal",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "forhandla-med-operatoren",
    title: "Förhandla med operatören: så får du ett bättre pris",
    excerpt:
      "Så förbereder du samtalet, vad du kan be om och när det är bättre att byta direkt i stället för att pruta på det abonnemang du har.",
    category: "Pris och avtal",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "hur-mycket-surf-drar-appar",
    title: "Hur mycket surf drar Netflix, Spotify och sociala medier?",
    excerpt:
      "Dataåtgång per timme för film, musik och vanliga appar enligt tjänsterna själva, och hur du räknar fram hur mycket surf du behöver i månaden.",
    category: "Surf och nät",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "racker-5-gb-surf",
    title: "Räcker 5 GB surf i månaden?",
    excerpt:
      "Vem 5 GB räcker för, vad det motsvarar i timmar video och musik, och när det lönar sig att ta mer surf i stället för att fylla på.",
    category: "Surf och nät",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "basta-tackning-sverige",
    title: "Vilket mobilnät har bäst täckning i Sverige?",
    excerpt:
      "Vad mätningarna från PTS, Opensignal och andra faktiskt säger om Telias, Tele2s, Telenors och Tres nät, och hur du tar reda på täckningen där du bor.",
    category: "Surf och nät",
    readingTime: "8 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "vilket-nat-anvander-operatoren",
    title: "Vilket nät använder din operatör? Hallon, Vimla, Comviq med flera",
    excerpt:
      "Lista över vilket av de fyra mobilnäten varje operatör kör i, och varför samma nät ger samma täckning till lägre pris.",
    category: "Surf och nät",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "virtuella-operatorer",
    title: "Virtuella operatörer: sämre eller bara billigare?",
    excerpt:
      "Vad en virtuell operatör (MVNO) är, vad som skiljer dem från nätägarna och när ett billigare varumärke ger exakt samma nät.",
    category: "Surf och nät",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "behover-jag-5g",
    title: "Behöver du 5G? Vad det ger och vad som krävs",
    excerpt:
      "Vad 5G ger i praktiken, vilka abonnemang och telefoner som har det och hur stor del av Sverige som täcks i dag.",
    category: "Surf och nät",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "vad-ar-esim",
    title: "Vad är eSIM? Så fungerar det och vilka operatörer har det",
    excerpt:
      "Hur eSIM fungerar, vilka telefoner som stöder det, hur du aktiverar och flyttar det och vilka operatörer som erbjuder eSIM.",
    category: "Surf och nät",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "sparad-surf-dubbel-surf",
    title: "Sparad surf och dubbel surf: vad betyder det?",
    excerpt:
      "Hur sparad surf (rollover) och kampanjer med dubbel surf fungerar, vilka operatörer som har det och när det faktiskt sparar pengar.",
    category: "Surf och nät",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "nar-surfen-tar-slut",
    title: "När surfen tar slut: strypt hastighet och påfyllning",
    excerpt:
      "Vad som händer när månadens surf är slut, vad strypt hastighet räcker till och om det är billigare att fylla på eller byta abonnemang.",
    category: "Surf och nät",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "wifi-samtal-och-dalig-tackning",
    title: "Dålig täckning inomhus? Wifi-samtal och andra lösningar",
    excerpt:
      "Så felsöker du dålig täckning hemma: wifi-samtal, byte av nät, inställningar i telefonen och när en förstärkare är tillåten.",
    category: "Surf och nät",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "2g-3g-nedslackning",
    title: "2G och 3G släcks ner: fungerar din telefon fortfarande?",
    excerpt:
      "Tele2, Telenor och Tre har stängt 2G och 3G och Telia stänger 2G 2027. Så kontrollerar du om telefonen klarar 4G och VoLTE.",
    category: "Surf och nät",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "byta-operator-behalla-nummer",
    title: "Byta operatör och behålla numret: steg för steg",
    excerpt:
      "Så byter du mobiloperatör utan att tappa numret. Den nya operatören sköter flytten, avbrottet får vara högst en arbetsdag och flytten är gratis från den gamla.",
    category: "Byta och säga upp",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "byta-operator-med-bindningstid",
    title: "Byta operatör med bindningstid kvar: vad kostar det?",
    excerpt:
      "Bindningstid hindrar inte en nummerflytt, men den återstående tiden ska betalas. Så räknar du ut om det lönar sig att byta direkt eller vänta.",
    category: "Byta och säga upp",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "halebop-laggs-ned",
    title: "Halebop läggs ned: vad gäller och vart ska du byta?",
    excerpt:
      "Telia avvecklar Halebop och flyttar kunderna. Vad det innebär för pris, nummer och villkor, och vilka alternativ som finns i samma nät.",
    category: "Byta och säga upp",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "surfa-i-eu",
    title: "Surfa i EU: så mycket ingår och vad det kostar",
    excerpt:
      "Roam like at home gäller till 2032. Så räknas EU-surfen ut på obegränsade abonnemang, vilka länder som ingår och vad som händer när den tar slut.",
    category: "Utland",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "surfa-utanfor-eu",
    title: "Surfa utanför EU: USA, Thailand, Turkiet och Storbritannien",
    excerpt:
      "Varför roaming utanför EU kan bli dyrt, hur du undviker en chockräkning och när ett rese-eSIM eller lokalt SIM-kort är billigare.",
    category: "Utland",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "ringa-utomlands-billigt",
    title: "Ringa till utlandet billigt från Sverige",
    excerpt:
      "Pristaket för samtal till andra EU-länder, vad samtal till resten av världen kostar och när appar eller operatörer med utlandsfokus är billigast.",
    category: "Utland",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "forsta-mobilabonnemang-barn",
    title: "Barnets första mobilabonnemang: ålder, spärrar och pris",
    excerpt:
      "Vad du ska tänka på när barnet får sin första mobil: kontantkort eller abonnemang, kostnadstak, spärrar för köp och surf, och vem som står på avtalet.",
    category: "Familj och målgrupper",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "sparra-kop-barn-mobil",
    title: "Spärra köp och betalsamtal på barnens mobil",
    excerpt:
      "Så spärrar du betalsms, köp via mobilräkningen och betalnummer hos operatören, och vilka inställningar i telefonen som skyddar mot dyra överraskningar.",
    category: "Familj och målgrupper",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "bedrageri-sim-swap-och-bluffsamtal",
    title: "Bluffsamtal, bluff-sms och SIM-kapning: så skyddar du dig",
    excerpt:
      "Hur bedragare använder mobilen, vad operatörerna blockerar enligt PTS regler och vad du gör om du misstänker att numret har kapats.",
    category: "Säkerhet och rättigheter",
    readingTime: "7 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "klaga-pa-operatoren",
    title: "Klaga på operatören: så går du tillväga",
    excerpt:
      "Från reklamation hos operatören till Telekområdgivarna och Allmänna reklamationsnämnden. Med en mall för reklamationen.",
    category: "Säkerhet och rättigheter",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "mobilmarknaden-i-siffror",
    title: "Mobilmarknaden i siffror 2026: abonnemang, surf och marknadsandelar",
    excerpt:
      "Statistik om den svenska mobilmarknaden från PTS: antal abonnemang, marknadsandelar per operatör, surf per månad och hur många som använder 5G.",
    category: "Säkerhet och rättigheter",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "privat-eller-foretagsabonnemang",
    title: "Privat- eller företagsabonnemang: skillnaderna",
    excerpt:
      "Vad som skiljer ett företagsabonnemang från ett privat: moms, avtalsvillkor, konsumentskydd, fakturering och vad som passar enskild firma.",
    category: "För företag",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "moms-mobilabonnemang",
    title: "Moms på mobilabonnemang: ex eller inkl. moms?",
    excerpt:
      "När företaget får dra av momsen på mobilabonnemanget, hur privat användning påverkar avdraget och hur du jämför priser exkl. och inkl. moms.",
    category: "För företag",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "jobbmobil-formansskatt",
    title: "Jobbmobil och förmånsskatt: vad säger Skatteverket?",
    excerpt:
      "När en mobil med abonnemang är ett skattefritt arbetsredskap och när privata samtal och tjänster blir en skattepliktig förmån.",
    category: "För företag",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "avdrag-mobilabonnemang-enskild-firma",
    title: "Mobilabonnemang i enskild firma: avdrag och uttag",
    excerpt:
      "Så gör du avdrag för mobilabonnemanget i enskild firma, vad som gäller när du även ringer privat och hur ett AB skiljer sig.",
    category: "För företag",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "vaxel-eller-mobil",
    title: "Växel eller bara mobil? Mobilväxel för småföretag",
    excerpt:
      "När ett småföretag klarar sig med vanliga mobilabonnemang och när en mobil växel lönar sig. Med funktioner och priser från operatörerna.",
    category: "För företag",
    readingTime: "6 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "delad-surf-foretag",
    title: "Delad surf för företag: så fungerar poolad surf",
    excerpt:
      "Hur delad (poolad) surf fungerar i företagsabonnemang, vilka operatörer som erbjuder det och när det blir billigare än separata surfpaket.",
    category: "För företag",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
  {
    slug: "overlata-abonnemang-till-foretag",
    title: "Flytta numret från privat till företag: överlåtelse",
    excerpt:
      "Så överlåter du ett mobilabonnemang mellan privatperson och företag, vad som händer med bindningstiden och hur du behåller numret.",
    category: "För företag",
    readingTime: "5 min",
    published: LANSERING,
    updated: LANSERING,
    publishedIso: LANSERING_ISO,
    updatedIso: LANSERING_ISO,
  },
];

/** Guider vars brödtext inte är skriven än (noindex, döljs i listningar). */
export function isPlaceholderGuide(slug: string) {
  return Boolean(getGuide(slug)?.placeholder);
}

/** Publicerade guider med riktigt innehåll. */
export const PUBLISHED_GUIDES: GuideMeta[] = GUIDES.filter((g) => !g.placeholder);

export function getGuide(slug: string) {
  return GUIDES.find((g) => g.slug === slug);
}

export function relatedGuides(slug: string, count = 3): GuideMeta[] {
  const current = getGuide(slug);
  const others = PUBLISHED_GUIDES.filter((g) => g.slug !== slug);
  const sameCat = others.filter((g) => g.category === current?.category);
  const rest = others.filter((g) => g.category !== current?.category);
  return [...sameCat, ...rest].slice(0, count);
}

/** Guider i en viss kategori, i registrets ordning. */
export function guiderIKategori(kategori: GuideCategory, count = 6): GuideMeta[] {
  return PUBLISHED_GUIDES.filter((g) => g.category === kategori).slice(0, count);
}

/** Deterministisk platshållarfärg när guiden saknar bild, ur sajtens tokens. */
export function guidePlaceholderColors(slug: string) {
  const palettes = [
    { from: "var(--dark-section)", to: "var(--primary)" },
    { from: "var(--primary)", to: "var(--highlight)" },
    { from: "var(--foreground)", to: "var(--muted-foreground)" },
    { from: "var(--border)", to: "var(--muted)" },
  ];
  let h = 0;
  for (const ch of slug) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return palettes[h % palettes.length]!;
}
