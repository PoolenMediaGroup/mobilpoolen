import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { GuideTable } from "@/components/guide-page";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  bindningText,
  datumText,
  kr,
  snittForstaAret,
  sortera,
} from "@/lib/mobil/berakna";
import { KALLOR, MARKNAD } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Obegränsad surf", path: "/obegransad-surf" },
];

const OBEGR = sortera(
  PRIVATA.filter((a) => a.gb == null && !arVillkorat(a)),
  "snitt-ar",
);
const BILLIGAST = OBEGR[0];
const UTAN = OBEGR.find((a) => a.bindning === 0);
const DYRAST = OBEGR[OBEGR.length - 1];
const OPS = new Set(OBEGR.map((a) => a.operator)).size;
const B20 = billigastForBehov(
  PRIVATA.filter((a) => !arVillkorat(a) && a.gb != null),
  20,
);
const EU_GB = OBEGR.filter((a) => a.euGb != null).map((a) => a.euGb as number);

/** Obegränsade abonnemang där operatören anger en maxhastighet i Mbit/s under 1000. */
const STRYPTA = OBEGR.filter((a) => {
  const m = a.hastighet?.match(/(\d+)\s*Mbit/i);
  return m != null && Number(m[1]) < 1000;
});

const CHILI = OBEGR.filter((a) => a.operator === "chilimobil");
const TELLUS = OBEGR.find((a) => a.operator === "tellus" && a.notis);

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

const FAQ = [
  {
    q: "Vad kostar det billigaste abonnemanget med obegränsad surf?",
    a: `${vem(BILLIGAST)} kostar ${kr(snittForstaAret(BILLIGAST))} i månaden i snitt första året. ${bindningText(BILLIGAST.bindning)}.${BILLIGAST.hastighet ? ` Maxhastigheten är ${BILLIGAST.hastighet}.` : ""}`,
  },
  ...(UTAN
    ? [
        {
          q: "Vilket är det billigaste obegränsade abonnemanget utan bindningstid?",
          a: `${vem(UTAN)} för ${kr(snittForstaAret(UTAN))} i månaden i snitt första året.`,
        },
      ]
    : []),
  {
    q: "Är obegränsad surf verkligen obegränsad?",
    a: "I Sverige ja, men inte alltid i full fart. Vissa operatörer sätter ett tak för hastigheten, och några har en gräns för rimlig användning. Inom EU får operatören begränsa surfen till en mängd som räknas fram ur månadspriset.",
  },
  {
    q: "Hur mycket kan jag surfa i EU med obegränsad surf?",
    a: "Det beror på operatören. EU-reglerna tillåter en gräns som är minst två gånger månadspriset exklusive moms delat med grossisttaket per GB. Taket var 1,30 euro per GB 2025 och blir 1,00 euro från 2027. Operatörens EU-surf står vid varje abonnemang i jämförelsen.",
    kalla: "Your Europe, roaming i EU",
  },
  {
    q: "Behöver jag obegränsad surf?",
    a: `Ett abonnemang med samtal och data använde i snitt ${MARKNAD.surfPerManad} GB i månaden 2025 enligt PTS. Surfar du mindre än så kan ett abonnemang med fast surfmängd vara billigare. Streamar du mycket över mobilnätet kan obegränsat löna sig.`,
    kalla: "PTS, Svensk telekommarknad 2025",
  },
];

export const Route = createFileRoute("/obegransad-surf")({
  head: () =>
    pageHead({
      title: "Obegränsad surf: billigaste abonnemangen 2026 | Mobilpoolen",
      description: `Obegränsad surf från ${kr(snittForstaAret(BILLIGAST))}/mån i snitt. Jämför ${OBEGR.length} abonnemang, se vilka som har hastighetstak och hur mycket du får surfa i EU.`,
      canonical: "/obegransad-surf",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Obegränsad surf: jämför billigaste abonnemangen"
      ingress={
        <p>
          Billigast med obegränsad surf är {vem(BILLIGAST)} för {kr(snittForstaAret(BILLIGAST))} i
          månaden i snitt första året.
          {UTAN && UTAN.id !== BILLIGAST.id
            ? ` Utan bindningstid är ${vem(UTAN)} billigast för ${kr(snittForstaAret(UTAN))}.`
            : ""}{" "}
          Vi jämför {OBEGR.length} obegränsade abonnemang hos {OPS} operatörer. Kolla
          maxhastigheten: {STRYPTA.length} av dem har ett tak under 1000 Mbit/s.
        </p>
      }
      nyckeltal={[
        { varde: kr(snittForstaAret(BILLIGAST)), text: "billigaste obegränsade, snitt per månad" },
        ...(UTAN
          ? [{ varde: kr(snittForstaAret(UTAN)), text: "billigast utan bindningstid" }]
          : []),
        { varde: String(OBEGR.length), text: `obegränsade abonnemang hos ${OPS} operatörer` },
      ]}
      jamforelse={<Jamforelse forval={{ surf: "obegransad" }} id="lista" />}
      jamforelseRubrik="Alla abonnemang med obegränsad surf"
      jamforelseIngress="Sorterade efter snittpris per månad första året. Öppna detaljerna för att se maxhastighet, EU-surf och vad abonnemanget kostar på två år."
      faq={FAQ}
      lankar={[
        {
          href: "/surf/100-gb",
          label: "100 GB surf",
          text: "Billigaste abonnemangen med 100 GB, om obegränsat är mer än du behöver.",
        },
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Billigast per surfmängd, om du inte behöver obegränsat.",
        },
        {
          href: "/utan-bindningstid",
          label: "Utan bindningstid",
          text: "Abonnemang som du kan säga upp när du vill.",
        },
        {
          href: "/guider/surfa-i-eu",
          label: "Surfa i EU",
          text: "Så fungerar gränsen för rimlig användning.",
        },
        {
          href: "/guider/nar-surfen-tar-slut",
          label: "När surfen tar slut",
          text: "Vad som händer och vad extra surf kostar.",
        },
        {
          href: "/verktyg/hur-mycket-surf-behover-jag",
          label: "Hur mycket surf behöver jag?",
          text: "Räkna ut om du behöver obegränsat.",
        },
      ]}
      ctaRubrik="Hitta billigaste obegränsade surfen"
      ctaBild="husbil-natt"
      uppdaterad="2026-10-29"
    >
      <h2>Vad kostar obegränsad surf?</h2>
      <p>
        Billigaste obegränsade abonnemanget i jämförelsen kostar {kr(snittForstaAret(BILLIGAST))} i
        månaden i snitt första året och det dyraste {kr(snittForstaAret(DYRAST))}. De dyraste har
        ofta streamingtjänster inbakade, som {vem(DYRAST)}. Priset hänger alltså mer på hastighet,
        bindning och tillägg än på själva surfen.
      </p>
      {B20 && (
        <p>
          Billigaste abonnemanget med minst 20 GB, {vem(B20)}, kostar {kr(snittForstaAret(B20))} i
          månaden. Skillnaden mot billigaste obegränsade är{" "}
          {kr(snittForstaAret(BILLIGAST) - snittForstaAret(B20))} i månaden. Räcker 20 GB för dig
          sparar du alltså pengar på en fast surfmängd.
        </p>
      )}

      <h2>Är obegränsad surf alltid obegränsad?</h2>
      <p>
        I Sverige får du surfa hur mycket du vill, men inte alltid i full fart. Flera operatörer
        sätter ett tak för hastigheten. Det spelar mindre roll för sociala medier och musik, men
        märks när du laddar ner stora filer eller delar surfen med en dator.
      </p>
      {STRYPTA.length > 0 && (
        <GuideTable
          head={["Abonnemang", "Maxhastighet", "Snitt år 1"]}
          rows={STRYPTA.map((a) => [vem(a), a.hastighet ?? "", kr(snittForstaAret(a))])}
        />
      )}

      {CHILI.length > 0 && (
        <>
          <h3>Chilimobil: du betalar för hastigheten, inte för surfen</h3>
          <p>
            Hos Chilimobil har alla abonnemang fri surf, och priset styrs av hur snabbt du får
            surfa. I jämförelsen finns{" "}
            {CHILI.map((a) => `${a.hastighet ?? a.namn} (${kr(snittForstaAret(a))}/mån)`).join(
              ", ",
            )}
            . 10 Mbit/s räcker för att streama video i normal kvalitet på mobilen men blir långsamt
            för stora nedladdningar. 100 Mbit/s märks sällan som en begränsning i mobilen.
            Hastigheten är ett tak, inte en garanti.
          </p>
        </>
      )}

      {TELLUS?.notis && (
        <>
          <h3>Gräns för rimlig användning i Sverige</h3>
          <p>
            Några operatörer har en gräns även hemma. Tellus Mobil anger för{" "}
            {TELLUS.namn.toLowerCase()}: {TELLUS.notis.charAt(0).toLowerCase()}
            {TELLUS.notis.slice(1)}.
          </p>
        </>
      )}

      <h2>Hur mycket kan du surfa i EU med obegränsad surf?</h2>
      <p>
        Inom EU, Island, Liechtenstein och Norge gäller Roam like at home till 2032. Du surfar till
        samma pris som hemma, men på obegränsade och stora abonnemang får operatören sätta en gräns
        för rimlig användning. Gränsen ska vara minst två gånger månadspriset exklusive moms delat
        med grossisttaket per GB. Taket var 1,30 euro per GB 2025 och sjunker till 1,00 euro från
        2027.
      </p>
      <p>
        Därför har obegränsade abonnemang oftast en fast mängd EU-surf. Hur mycket står vid varje
        abonnemang i jämförelsen.
        {EU_GB.length > 0 &&
          ` Bland de obegränsade varierar EU-surfen mellan ${Math.min(...EU_GB)} och ${Math.max(...EU_GB)} GB i månaden, där operatören anger den.`}{" "}
        Läs mer i guiden om att <Link to={"/guider/surfa-i-eu" as never}>surfa i EU</Link>.
      </p>

      <h2>Behöver du obegränsad surf?</h2>
      <p>
        Enligt PTS använde ett abonnemang med samtal och data i snitt {MARKNAD.surfPerManad} GB i
        månaden 2025. Det är ett snitt, och många surfar mycket mer eller mycket mindre. Obegränsat
        passar dig som:
      </p>
      <ul>
        <li>streamar video över mobilnätet varje dag</li>
        <li>delar surfen med en dator eller surfplatta</li>
        <li>saknar bra wifi hemma eller på jobbet</li>
        <li>inte vill hålla koll på hur mycket du har kvar</li>
      </ul>
      <p>
        Surfar du mest på wifi räcker ofta ett abonnemang med fast surfmängd. Med sparad surf tar du
        dessutom med det du inte använder till nästa månad. Hur mycket olika appar drar står i
        guiden om <Link to={"/guider/hur-mycket-surf-drar-appar" as never}>surf per app</Link>.
      </p>

      <h2>Med eller utan bindningstid?</h2>
      <p>
        {OBEGR.filter((a) => a.bindning === 0).length} av de {OBEGR.length} obegränsade abonnemangen
        har ingen bindningstid, {OBEGR.filter((a) => a.bindning != null && a.bindning > 0).length}{" "}
        har bindningstid och för {OBEGR.filter((a) => a.bindning == null).length} framgår
        bindningstiden inte av operatörens sida. Kampanjpriser på obegränsat kräver ofta 24 månaders
        bindning. Räkna då på vad abonnemanget kostar efter kampanjen och om du kan tänka dig att
        stanna hela tiden.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Roaming:{" "}
        <a href={KALLOR.roaming.url} target="_blank" rel="noopener nofollow">
          {KALLOR.roaming.namn}
        </a>
        . Surf per abonnemang: PTS, Svensk telekommarknad 2025.
      </p>
    </PelarSida>
  );
}
