import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Repeat, Search, Tag } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { CtaBand } from "@/components/cta-band";
import { absoluteUrl, breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";
import { bild } from "@/lib/bildbank";
import { storMatt } from "@/lib/bildbank-matt";
import { OPERATORER } from "@/lib/mobil/data";
import {
  MARKNAD,
  NEDSLACKNING,
  OPENSIGNAL,
  SKI_PRIVAT,
  TACKNING,
  decimal,
} from "@/lib/mobil/fakta";

const TITLE = "Ordlista för mobilabonnemang";
const DESC =
  "Bindningstid, nummerportering, MVNO, fair use, eSIM och VoLTE. Orden du möter när du jämför mobilabonnemang, förklarade på vanlig svenska.";
const UPPDATERAD = "29 oktober 2026";
const HEROBILD = bild("kvinna-soffa-mobil");

type Term = { term: string; definition: string; href?: string };

const aktiva = OPERATORER.filter((o) => o.aktiv);
const medEsim = aktiva.filter((o) => o.esim === true).length;
const medWifiSamtal = aktiva.filter((o) => o.wifiSamtal === true).length;
const nedladdning = OPENSIGNAL.find((r) => r.kategori === "Nedladdningshastighet");
const skiBransch = SKI_PRIVAT.find((r) => r.namn === "Branschen");
const skiHogst = SKI_PRIVAT[0];

/* Orden står i bokstavsordning i listan, sorteringen sköts i koden. */
const TERMS: Term[] = [
  {
    term: "2G och 3G",
    definition: `Äldre generationers mobilnät. Tele2, Telenor och Tre stängde sina 2G- och 3G-nät ${NEDSLACKNING.n4mOchTre}. Telia behåller 2G till ${NEDSLACKNING.teliaTvaG}. En telefon som bara klarar 2G eller 3G kan inte ringa i de nät som stängts.`,
    href: "/guider/2g-3g-nedslackning",
  },
  {
    term: "4G",
    definition: `Fjärde generationens mobilnät, även kallat LTE. Det bär fortfarande de flesta samtalen: 2025 gick omkring ${MARKNAD.volteAndel} procent av samtalsminuterna över 4G, enligt PTS.`,
  },
  {
    term: "5G",
    definition: `Femte generationens mobilnät, med mer kapacitet och lägre latens än 4G. Både telefonen och abonnemanget måste ha stöd för 5G. Enligt PTS använde ${MARKNAD.femgAndel} procent av mobilabonnemangen 5G-nätet under 2025.`,
    href: "/5g-abonnemang",
  },
  {
    term: "ARN",
    definition:
      "Allmänna reklamationsnämnden, den statliga myndighet som prövar tvister mellan konsumenter och företag, till exempel när du och operatören inte kommer överens. Nämndens beslut är rekommendationer.",
    href: "/guider/klaga-pa-operatoren",
  },
  {
    term: "Avtalssammanfattning",
    definition:
      "En kort och lättläst sammanfattning av avtalet som operatören avgiftsfritt ska ge dig innan du tecknar. Avtalet gäller först när du har fått sammanfattningen och bekräftat att du vill ingå det (12 kap. 1 § lagen om elektronisk kommunikation).",
  },
  {
    term: "Bindningstid",
    definition:
      "Den tid du har lovat att behålla abonnemanget. För konsumenter får den vara högst 24 månader (12 kap. 8 § lagen om elektronisk kommunikation). Samma tak gäller mikroföretag, småföretag och ideella organisationer om de inte uttryckligen avstått. Byter du i förtid ska återstående bindningstid normalt betalas.",
    href: "/guider/bindningstid-uppsagningstid",
  },
  {
    term: "Datakort",
    definition:
      "Ett extra SIM-kort, ibland kallat extra-SIM, som surfar på samma abonnemang, till exempel i en surfplatta eller en klocka. Om det kostar något och hur surfen delas skiljer sig mellan operatörerna.",
  },
  {
    term: "Delad surf",
    definition:
      "Surf som flera SIM-kort eller användare delar på, till exempel i en familj eller på ett företag. Hela gruppen drar från samma surfpott.",
    href: "/guider/delad-surf-foretag",
  },
  {
    term: "Dubbel surf",
    definition:
      "Ett erbjudande där du får dubbelt så mycket surf som abonnemanget normalt har. Kontrollera om det gäller hela avtalstiden eller bara en kampanjperiod.",
    href: "/guider/sparad-surf-dubbel-surf",
  },
  {
    term: "eSIM",
    definition: `Ett SIM-kort som är inbyggt i telefonen och laddas ner i stället för att sättas i. Telefonen måste ha stöd för eSIM. ${medEsim} av de ${aktiva.length} operatörer vi följer anger på sina egna sidor att de erbjuder eSIM.`,
    href: "/esim",
  },
  {
    term: "EU-surf",
    definition:
      "Surfen du kan använda i EU och EES enligt reglerna om Roam like at home. Har du obegränsad eller mycket stor surf hemma får operatören sätta ett tak, se fair use. Hur mycket EU-surf som ingår står vid varje abonnemang i jämförelsen.",
    href: "/guider/surfa-i-eu",
  },
  {
    term: "Fair use",
    definition:
      "Regeln som låter operatören begränsa EU-surfen för stora eller obegränsade abonnemang. Gränsen ska vara minst 2 × (månadspriset exklusive moms ÷ grossisttaket per GB). Grossisttaket var 1,30 euro per GB 2025 och blir 1,00 euro per GB från 2027.",
    href: "/guider/surfa-i-eu",
  },
  {
    term: "FWA",
    definition:
      "Fixed Wireless Access, mobilt bredband till en fast adress. En router tar emot internet via mobilnätet i stället för via fiber eller kabel. Enligt PTS fanns omkring 420 000 FWA-abonnemang 2025, och de använde i snitt 374 GB i månaden.",
  },
  {
    term: "GB",
    definition: `Gigabyte, måttet på datamängd. Surfen i ett abonnemang anges i GB per månad. Abonnemang med samtal och data använde i snitt ${MARKNAD.surfPerManad} GB i månaden 2025, enligt PTS.`,
    href: "/verktyg/hur-mycket-surf-behover-jag",
  },
  {
    term: "Kampanjpris",
    definition:
      "Ett rabatterat månadspris som gäller några månader. Sedan går abonnemanget över till ordinarie pris. Räkna därför på hela året, inte på första månaden.",
    href: "/guider/kampanjpris-efter-kampanjen",
  },
  {
    term: "Kontantkort",
    definition:
      "Ett förbetalt SIM-kort utan faktura och oftast utan bindningstid. Du fyller på när du vill. Sedan 1 augusti 2022 måste alla kontantkort registreras med kontrollerad identitet innan de används.",
    href: "/kontantkort",
  },
  {
    term: "Latens",
    definition:
      "Fördröjningen i nätet, alltså hur lång tid det tar för data att gå fram och tillbaka. Mäts i millisekunder (ms). Låg latens märks mest i samtal, videomöten och spel.",
  },
  {
    term: "Mbit/s",
    definition: `Megabit per sekund, måttet på hastighet. Åtta megabit motsvarar en megabyte. ${nedladdning ? `I Opensignals mätning från december 2025 hade ${nedladdning.vinnare} högst genomsnittlig nedladdningshastighet, ${nedladdning.varde}.` : ""}`,
  },
  {
    term: "Mobilt bredband",
    definition:
      "Internet via mobilnätet med ett datasim i en router, en dongel eller en surfplatta, i stället för fast bredband. Abonnemangen har ofta bara surf, utan samtal och sms.",
  },
  {
    term: "MVNO",
    definition:
      "Mobile Virtual Network Operator, en virtuell operatör. Den äger inget eget nät utan hyr kapacitet hos någon av de fyra operatörer som äger mobilnät i Sverige: Telia, Tele2, Telenor och Tre.",
    href: "/guider/virtuella-operatorer",
  },
  {
    term: "Net4Mobility",
    definition:
      "Nätbolaget som Tele2 och Telenor äger tillsammans. Det bygger deras gemensamma nät för 4G och 5G och använder 700 MHz för täckning över stora ytor och 3 500 MHz för kapacitet i tätorter.",
    href: "/nat",
  },
  {
    term: "Nummerportering",
    definition:
      "Att flytta ditt nummer till en ny operatör. Avbrottet får vara högst en arbetsdag, och rätten gäller minst en månad efter att avtalet upphört. Den gamla operatören tar inte betalt för att lämna ifrån sig numret. Bindningstid hindrar inte en portering, men återstående tid ska betalas (PTSFS 2022:4).",
    href: "/guider/byta-operator-behalla-nummer",
  },
  {
    term: "Obegränsad surf",
    definition:
      "Abonnemang utan fast surfgräns i Sverige. Inom EU kan operatören ha en gräns enligt fair use, och villkoren kan innehålla andra begränsningar. Läs dem innan du väljer.",
    href: "/obegransad-surf",
  },
  {
    term: "Operatörslås",
    definition:
      "En spärr som gör att telefonen bara fungerar med en viss operatörs SIM-kort. När bindningstiden för ett abonnemang med subventionerad telefon har gått ut ska operatören på begäran ta bort låset kostnadsfritt (12 kap. 15 § lagen om elektronisk kommunikation).",
  },
  {
    term: "Ordinarie pris",
    definition:
      "Månadspriset som gäller när kampanjen är slut. Det är oftast det pris du betalar längst, och därför det som avgör vad abonnemanget kostar över tid.",
    href: "/guider/kampanjpris-efter-kampanjen",
  },
  {
    term: "PTS",
    definition:
      "Post- och telestyrelsen, myndigheten som har tillsyn över telemarknaden. PTS skriver föreskrifter (PTSFS), till exempel om nummerportering, och tar fram statistik och kartläggningar av mobiltäckningen.",
  },
  {
    term: "PUK-kod",
    definition:
      "Koden som låser upp SIM-kortet om du har skrivit fel PIN-kod för många gånger. Du hittar den på SIM-kortets hållare eller hos operatören. Skriver du fel PUK-kod för många gånger behöver du ett nytt SIM-kort.",
  },
  {
    term: "Roam like at home",
    definition:
      "EU-regeln som gör att du kan ringa, sms:a och surfa i andra EU-länder utan extra kostnad, som hemma. Den gäller i EU samt Island, Liechtenstein och Norge, och är förlängd till 2032.",
    href: "/guider/surfa-i-eu",
  },
  {
    term: "Roaming",
    definition:
      "Att använda mobilen i ett annat lands mobilnät. Inom EU och EES gäller Roam like at home. Utanför kan det kosta extra, och priset bestämmer din operatör.",
    href: "/guider/surfa-utanfor-eu",
  },
  {
    term: "SIM-kort",
    definition:
      "Kortet som kopplar telefonen till ditt abonnemang och ditt nummer. Finns som fysiskt kort i olika storlekar och som eSIM.",
    href: "/esim",
  },
  {
    term: "SKI",
    definition: `Svenskt Kvalitetsindex, som mäter kundnöjdhet. I SKI Mobil 2025 var branschsnittet för privatkunder ${skiBransch ? decimal(skiBransch.varde) : ""}, och ${skiHogst.namn} hade högst nöjdhet med ${decimal(skiHogst.varde)}.`,
  },
  {
    term: "Snittpris första året",
    definition:
      "Måttet vi sorterar jämförelsen efter: kampanjpriset för de månader det gäller, ordinarie pris resten av året och eventuell startavgift, delat med tolv. Det gör kampanjer och fasta priser jämförbara.",
    href: "/sa-jamfor-vi",
  },
  {
    term: "Sparad surf",
    definition:
      "Surf du inte har använt under en månad följer med till nästa. Hur länge den sparade surfen gäller skiljer sig mellan operatörerna.",
    href: "/guider/sparad-surf-dubbel-surf",
  },
  {
    term: "Startavgift",
    definition:
      "En engångsavgift när du tecknar abonnemanget. En del operatörer tar bort den om du beställer på nätet. Vi räknar in den i snittpriset första året.",
  },
  {
    term: "Strypt hastighet",
    definition:
      "När surfen för månaden är slut sänks hastigheten kraftigt i stället för att du betalar extra. Den gäller tills nästa månad börjar eller tills du köper mer surf.",
    href: "/guider/nar-surfen-tar-slut",
  },
  {
    term: "Surfpott",
    definition:
      "Surfmängden som ingår i abonnemanget varje månad. Med delad surf är det en gemensam pott som flera SIM-kort drar från.",
  },
  {
    term: "Telekområdgivarna",
    definition:
      "Kostnadsfri vägledning för konsumenter med frågor om telefoni, bredband och tv. Hit kan du vända dig om du har problem med din operatör. Telekområdgivarna avgör inte tvister, det gör ARN.",
    href: "/guider/klaga-pa-operatoren",
  },
  {
    term: "Täckning",
    definition: `Hur väl mobilnätet når fram där du är. Enligt PTS fanns grundläggande täckning utomhus på ${TACKNING.ptsYta} procent av Sveriges yta i november 2025. Inomhus kan täckningen vara sämre.`,
    href: "/guider/basta-tackning-sverige",
  },
  {
    term: "Uppsägningstid",
    definition:
      "Hur länge avtalet fortsätter efter att du sagt upp det. För konsumenter högst en månad (12 kap. 13 § lagen om elektronisk kommunikation). Har du bindningstid behöver du inte säga upp tidigare än en månad före bindningstidens slut.",
    href: "/guider/bindningstid-uppsagningstid",
  },
  {
    term: "Villkorsändring",
    definition:
      "När operatören höjer priset eller ändrar villkoren. Du ska få besked minst en månad innan, och om ändringen inte enbart är till din fördel kan du säga upp avtalet utan extra kostnad inom tre månader från beskedet (12 kap. 12 § lagen om elektronisk kommunikation).",
    href: "/guider/prishojning-mobilabonnemang",
  },
  {
    term: "VoLTE",
    definition:
      "Voice over LTE, samtal över 4G-nätet. Sedan 2G och 3G stängts behöver telefonen VoLTE för att ringa i Tele2s, Telenors och Tres nät. Telefoner som inte kan ringa nödsamtal över VoLTE blockerades där från 2 februari 2026 efter ett föreläggande från PTS.",
    href: "/guider/2g-3g-nedslackning",
  },
  {
    term: "Wifi-samtal",
    definition: `Samtal som går via wifi i stället för mobilnätet, till exempel där täckningen inomhus är dålig. Både telefonen och operatören måste ha stöd för det. ${medWifiSamtal} av de ${aktiva.length} operatörer vi följer anger att de har wifi-samtal.`,
    href: "/guider/wifi-samtal-och-dalig-tackning",
  },
  {
    term: "Ångerrätt",
    definition:
      "Tecknar du på nätet eller per telefon har du 14 dagars ångerrätt enligt distansavtalslagen, räknat från att avtalet ingås. Ringer en säljare upp dig gäller avtalet bara om du skriftligen accepterar erbjudandet efter samtalet.",
    href: "/guider/angerratt-mobilabonnemang",
  },
];

const LETTERS = [
  "0–9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Å",
  "Ä",
  "Ö",
];

/* Å, Ä och Ö måste få egna ankare. Slås de ihop med A och O krockar länkarna. */
const LETTER_IDS: Record<string, string> = { "0–9": "siffror", Å: "aa", Ä: "ae", Ö: "oe" };
const letterId = (letter: string) => LETTER_IDS[letter] ?? letter.toLocaleLowerCase("sv-SE");

const termId = (term: string) =>
  term
    .toLocaleLowerCase("sv-SE")
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const forstaBokstaven = (term: string) =>
  /^[0-9]/.test(term) ? "0–9" : (term[0]?.toLocaleUpperCase("sv-SE") ?? "");

const SORTERADE = [...TERMS].sort((a, b) => a.term.localeCompare(b.term, "sv"));

/* Tre ord som styr vad abonnemanget faktiskt kostar. Lyfts fram högst upp. */
const NYCKELORD = [
  {
    term: "Bindningstid",
    Icon: Clock,
    text: "Hur länge du sitter fast om priset höjs eller ett bättre erbjudande dyker upp.",
  },
  {
    term: "Ordinarie pris",
    Icon: Tag,
    text: "Priset efter kampanjen. Det du betalar längst och det som avgör kostnaden.",
  },
  {
    term: "Nummerportering",
    Icon: Repeat,
    text: "Du behåller numret när du byter, och avbrottet får vara högst en arbetsdag.",
  },
];

export const Route = createFileRoute("/ordlista")({
  head: () =>
    pageHead({
      title: `${TITLE}: alla ord förklarade | Mobilpoolen`,
      description: DESC,
      socialTitle: TITLE,
      canonical: "/ordlista",
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: TITLE, path: "/ordlista" },
        ]),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: TITLE,
          description: DESC,
          url: absoluteUrl("/ordlista"),
          hasDefinedTerm: SORTERADE.map((item) => ({
            "@type": "DefinedTerm",
            name: item.term,
            description: item.definition,
            url: `${absoluteUrl("/ordlista")}#${termId(item.term)}`,
          })),
        }),
      ],
    }),
  component: Page,
});

function Page() {
  const [fraga, setFraga] = useState("");

  const traffar = useMemo(() => {
    const q = fraga.trim().toLocaleLowerCase("sv-SE");
    if (!q) return SORTERADE;
    return SORTERADE.filter(
      (item) =>
        item.term.toLocaleLowerCase("sv-SE").includes(q) ||
        item.definition.toLocaleLowerCase("sv-SE").includes(q),
    );
  }, [fraga]);

  const bokstaverMedTraff = useMemo(
    () => new Set(traffar.map((item) => forstaBokstaven(item.term))),
    [traffar],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden bg-dark-section text-footer-foreground">
          <picture>
            <source srcSet={HEROBILD.webp} type="image/webp" />
            <img
              src={HEROBILD.jpg}
              alt={HEROBILD.alt}
              {...storMatt(HEROBILD.nyckel)}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </picture>
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(100deg, color-mix(in srgb, var(--dark-section) 94%, transparent) 0%, color-mix(in srgb, var(--dark-section) 86%, transparent) 46%, color-mix(in srgb, var(--dark-section) 52%, transparent) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-[1140px] px-6 py-16 lg:py-24">
            <h1 className="max-w-[18ch] font-bold text-white">{TITLE}</h1>
            <p className="mt-5 max-w-[56ch] text-[18px] leading-relaxed text-dark-muted">
              Orden du möter när du jämför mobilabonnemang, från bindningstid och kampanjpris till
              MVNO, fair use och VoLTE. Varje ord är förklarat på vanlig svenska, och där det finns
              en lagregel eller en siffra står källan med.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-white/75">
              <span>{SORTERADE.length} ord</span>
              <span aria-hidden>·</span>
              <span>A till Ö</span>
              <span aria-hidden>·</span>
              <span>Uppdaterad {UPPDATERAD}</span>
            </div>
          </div>
        </section>

        <section className="bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-[1140px] px-6">
            <div className="max-w-[68ch] space-y-5 text-[17.5px] leading-[1.7]">
              <p>
                Operatörerna har ett eget språk. Ett erbjudande kan lova dubbel surf, fri
                startavgift och 5G utan att det framgår vad du betalar när kampanjen är slut eller
                hur länge du är bunden.
              </p>
              <p>
                Orden avgör också vad du betalar. Skillnaden mellan kampanjpris och ordinarie pris
                kan vara stor över ett år, och bindningstiden avgör om du kan byta när ett bättre
                erbjudande kommer. Lagreglerna om bindningstid, uppsägning och nummerportering
                gäller alla operatörer, och de står här med paragraf.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {NYCKELORD.map(({ term, Icon, text }) => (
                <a
                  key={term}
                  href={`#${termId(term)}`}
                  className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
                >
                  <span className="icon-badge icon-badge-cta">
                    <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="mt-3.5 flex items-center gap-1.5 text-[16.5px] font-bold">
                    {term}
                    <ArrowRight
                      className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1.5 block text-[14.5px] leading-relaxed text-muted-foreground">
                    {text}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky top-12 z-30 border-y border-border bg-surface/95 backdrop-blur md:top-[58px]">
          <div className="mx-auto max-w-[1140px] px-6 py-3.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <label className="relative flex-1 md:max-w-[320px]" htmlFor="ordsok">
                <span className="sr-only">Sök i ordlistan</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="ordsok"
                  type="search"
                  value={fraga}
                  onChange={(e) => setFraga(e.target.value)}
                  placeholder="Sök ord, till exempel eSIM"
                  className="h-11 w-full rounded-lg border border-input-border bg-background pl-9 pr-3 text-[15px] outline-none focus-visible:border-primary"
                />
              </label>
              {/* På mobil en rad som rullar i sidled, så att den klistrade listen inte
                  blir fyra rader hög när bokstäverna får 44 px klickyta. */}
              <nav
                aria-label="Hoppa till bokstav"
                className="-mx-1 flex w-full gap-1 overflow-x-auto px-1 md:mx-0 md:w-auto md:flex-wrap md:overflow-visible md:px-0"
              >
                {LETTERS.map((letter) =>
                  bokstaverMedTraff.has(letter) ? (
                    <a
                      key={letter}
                      href={`#bokstav-${letterId(letter)}`}
                      className="inline-flex h-11 min-w-9 shrink-0 items-center justify-center rounded-md text-[13.5px] font-semibold text-primary hover:bg-muted md:h-8 md:min-w-8"
                    >
                      {letter}
                    </a>
                  ) : (
                    <span
                      key={letter}
                      aria-disabled="true"
                      className="inline-flex h-11 min-w-9 shrink-0 items-center justify-center rounded-md text-[13.5px] text-muted-foreground/40 md:h-8 md:min-w-8"
                    >
                      {letter}
                    </span>
                  ),
                )}
              </nav>
            </div>
          </div>
        </div>

        <section className="surface-soft py-14 lg:py-20">
          <div className="mx-auto max-w-[1140px] px-6">
            {traffar.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-[17px] font-semibold">Inget ord matchar ”{fraga}”.</p>
                <button
                  type="button"
                  onClick={() => setFraga("")}
                  className="mt-3 text-[15px] font-semibold text-primary hover:underline"
                >
                  Visa alla ord
                </button>
              </div>
            ) : (
              LETTERS.filter((letter) => bokstaverMedTraff.has(letter)).map((letter) => (
                <section
                  key={letter}
                  id={`bokstav-${letterId(letter)}`}
                  className="mb-12 scroll-mt-32"
                >
                  <h2 className="mb-5 flex items-center gap-4 text-[26px] font-extrabold">
                    <span>{letter}</span>
                    <span aria-hidden className="h-px flex-1 bg-border" />
                  </h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {traffar
                      .filter((item) => forstaBokstaven(item.term) === letter)
                      .map((item) => (
                        <article
                          key={item.term}
                          id={termId(item.term)}
                          className="scroll-mt-32 rounded-2xl border border-border bg-surface p-5"
                        >
                          <h3 className="text-[17px] font-bold">{item.term}</h3>
                          <p className="mt-2 text-[15.5px] leading-relaxed text-muted-foreground">
                            {item.definition}
                          </p>
                          {item.href ? (
                            <Link
                              to={item.href as never}
                              className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline"
                            >
                              Läs mer
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                          ) : null}
                        </article>
                      ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>

        <CtaBand
          rubrik="Nu vet du vad orden betyder. Se vad de kostar."
          ingress="Jämför alla abonnemang på en gång, sorterat efter vad du betalar på ett år."
          knapptext="Jämför mobilabonnemang →"
          hash="alla"
          bildnyckel="vanner-middag-utomhus"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
