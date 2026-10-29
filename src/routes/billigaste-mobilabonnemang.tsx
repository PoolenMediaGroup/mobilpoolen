import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { BilligastTabell } from "@/components/mobil/billigast-tabell";
import { GuideTable } from "@/components/guide-page";
import { MOBILNAT, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  bindningText,
  datumText,
  gbText,
  kr,
  prisNu,
  snittForstaAret,
  tackerBehov,
  totalKostnad,
} from "@/lib/mobil/berakna";
import { MARKNAD } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Billigaste mobilabonnemang", path: "/billigaste-mobilabonnemang" },
];

/** Abonnemang som alla kan köpa, utan ålders- eller studentkrav. */
const OPPNA = PRIVATA.filter((a) => !arVillkorat(a));

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}${a.kontantkort ? " (kontantkort)" : ""}`;
}

const BILLIGAST = billigastForBehov(OPPNA, 0)!;
const B10 = billigastForBehov(OPPNA, 10)!;
const B20 = billigastForBehov(OPPNA, 20)!;
const OBEGR = billigastForBehov(
  OPPNA.filter((a) => a.gb == null),
  0,
)!;

const UTAN10 = billigastForBehov(
  OPPNA.filter((a) => a.bindning === 0),
  10,
)!;
const UTAN_OBEGR = billigastForBehov(
  OPPNA.filter((a) => a.bindning === 0 && a.gb == null),
  0,
)!;

type Behov = number | "obegransad";

function iBehov(a: Abonnemang, behov: Behov): boolean {
  return behov === "obegransad" ? a.gb == null : tackerBehov(a, behov);
}

/** Billigast över 24 månader för ett behov och en bindningstid. */
function billigast24(behov: Behov, bindning: number): Abonnemang | undefined {
  return OPPNA.filter((a) => a.bindning === bindning && iBehov(a, behov)).sort(
    (x, y) => totalKostnad(x, 24) - totalKostnad(y, 24),
  )[0];
}

const BINDNINGSRADER = ([10, 20, "obegransad"] as Behov[]).map((behov) => {
  const per = [0, 12, 24].map((b) => billigast24(behov, b));
  const kostnader = per.map((a) => (a ? totalKostnad(a, 24) : Number.POSITIVE_INFINITY));
  const minst = Math.min(...kostnader);
  return { behov, per, obundenBilligast: kostnader[0] === minst };
});
const OBUNDEN_VINNER = BINDNINGSRADER.filter((r) => r.obundenBilligast).length;

/** Kampanjen med störst hopp från kampanjpris till ordinarie pris. */
const FALLA = OPPNA.filter((a) => a.kampanjpris != null && (a.kampanjManader ?? 0) > 0).sort(
  (x, y) => y.pris - prisNu(y) - (x.pris - prisNu(x)),
)[0];

const UTNAMNINGAR: { om: string; a: Abonnemang | null }[] = [
  { om: "ringa och surfa lite (minst 1 GB)", a: billigastForBehov(OPPNA, 1) },
  {
    om: `surfa som en genomsnittlig svensk (${MARKNAD.surfPerManad} GB i månaden enligt PTS)`,
    a: billigastForBehov(OPPNA, MARKNAD.surfPerManad),
  },
  { om: "streama mycket (minst 50 GB)", a: billigastForBehov(OPPNA, 50) },
  { om: "aldrig behöva tänka på surfen (obegränsad)", a: OBEGR },
  {
    om: `slippa bindningstid och ha minst ${MARKNAD.surfPerManad} GB`,
    a: billigastForBehov(
      OPPNA.filter((a) => a.bindning === 0),
      MARKNAD.surfPerManad,
    ),
  },
  {
    om: `ha abonnemang med faktura i stället för kontantkort, minst ${MARKNAD.surfPerManad} GB`,
    a: billigastForBehov(
      OPPNA.filter((a) => !a.kontantkort),
      MARKNAD.surfPerManad,
    ),
  },
  {
    om: `vara i Telias nät, minst ${MARKNAD.surfPerManad} GB`,
    a: billigastForBehov(
      OPPNA.filter((a) => operator(a.operator)?.nat === "telia"),
      MARKNAD.surfPerManad,
    ),
  },
];

const FAQ = [
  {
    q: "Vilket är det billigaste mobilabonnemanget just nu?",
    a: `Räknat som snittpris per månad första året är ${vem(BILLIGAST)} billigast, för ${kr(snittForstaAret(BILLIGAST))} i månaden med ${BILLIGAST.gb == null ? "obegränsad" : gbText(BILLIGAST.gb)} surf. Med minst 10 GB är ${vem(B10)} billigast för ${kr(snittForstaAret(B10))} i månaden.`,
  },
  {
    q: "Vilket är det billigaste abonnemanget med obegränsad surf?",
    a: `${vem(OBEGR)} kostar ${kr(snittForstaAret(OBEGR))} i månaden i snitt första året. ${bindningText(OBEGR.bindning)}.${OBEGR.hastighet ? ` Hastigheten är ${OBEGR.hastighet}, så kontrollera att den räcker för dig.` : ""}`,
  },
  {
    q: "Är billigast i början också billigast i längden?",
    a: "Inte alltid. Ett kampanjpris gäller oftast några månader, sedan betalar du ordinarie pris. Därför jämför vi snittpriset under första året och visar kostnaden för 24 månader i detaljerna för varje abonnemang.",
  },
  {
    q: "Lönar det sig att binda sig för att få ett lägre pris?",
    a: `I jämförelsen just nu är ett abonnemang utan bindningstid billigast över 24 månader i ${OBUNDEN_VINNER} av ${BINDNINGSRADER.length} surfnivåer vi räknat på (10 GB, 20 GB och obegränsat). Bindningstiden får vara högst 24 månader enligt lagen om elektronisk kommunikation.`,
  },
  {
    q: "Varför är vissa operatörer inte med i jämförelsen?",
    a: "Vi visar bara priser som vi har kunnat kontrollera på operatörens egen webbplats. Halebop avvecklas och finns därför inte med. Saknas en operatör beror det på att vi inte har kunnat kontrollera dess priser.",
  },
];

export const Route = createFileRoute("/billigaste-mobilabonnemang")({
  head: () =>
    pageHead({
      title: "Billigaste mobilabonnemanget 2026 per surfmängd | Mobilpoolen",
      description: `Billigaste mobilabonnemanget just nu: ${vem(BILLIGAST)} för ${kr(snittForstaAret(BILLIGAST))}/mån i snitt. Jämför per surfmängd, med och utan bindningstid.`,
      canonical: "/billigaste-mobilabonnemang",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Billigaste mobilabonnemanget 2026"
      ingress={
        <p>
          Billigast just nu är {vem(BILLIGAST)} för {kr(snittForstaAret(BILLIGAST))} i månaden i
          snitt första året. Med minst 10 GB är {vem(B10)} billigast för {kr(snittForstaAret(B10))},
          och den billigaste obegränsade surfen kostar {kr(snittForstaAret(OBEGR))} hos{" "}
          {operator(OBEGR.operator)?.namn}. Vi räknar in kampanjens längd och startavgiften, så ett
          kort kampanjpris väger inte tyngre än det är.
        </p>
      }
      nyckeltal={[
        {
          varde: kr(snittForstaAret(BILLIGAST)),
          text: `billigaste abonnemanget, snitt per månad första året`,
        },
        { varde: kr(snittForstaAret(B20)), text: "billigast med minst 20 GB surf" },
        { varde: kr(snittForstaAret(OBEGR)), text: "billigast med obegränsad surf" },
      ]}
      jamforelse={
        <div className="space-y-12">
          <BilligastTabell />
          <Jamforelse id="lista" />
        </div>
      }
      jamforelseRubrik="Billigast per surfmängd"
      jamforelseIngress="Tabellen visar det abonnemang som har lägst snittpris första året på varje surfnivå. Under den finns hela jämförelsen, där du kan filtrera på surf, bindningstid och nät."
      faq={FAQ}
      lankar={[
        {
          href: "/utan-bindningstid",
          label: "Utan bindningstid",
          text: "Billigaste abonnemangen som du kan säga upp när du vill.",
        },
        {
          href: "/obegransad-surf",
          label: "Obegränsad surf",
          text: "Vad obegränsat kostar och vad som begränsar det.",
        },
        {
          href: "/guider/kampanjpris-efter-kampanjen",
          label: "Kampanjpris efter kampanjen",
          text: "Så räknar du ut vad ett kampanjpris kostar på två år.",
        },
        {
          href: "/verktyg/hur-mycket-surf-behover-jag",
          label: "Hur mycket surf behöver jag?",
          text: "Räkna fram din surfmängd innan du väljer.",
        },
        {
          href: "/sa-jamfor-vi",
          label: "Så jämför vi",
          text: "Metoden, källorna och vad vi inte räknar med.",
        },
      ]}
      ctaRubrik="Hitta det billigaste för just din surf"
      ctaBild="kundvagnar-rad"
      uppdaterad="2026-10-29"
    >
      <h2>Vilket är det billigaste mobilabonnemanget just nu?</h2>
      <p>
        Det beror på hur mycket du surfar. Räknat som snittpris per månad under första året är{" "}
        {vem(BILLIGAST)} billigast av alla {OPPNA.length} abonnemang som vem som helst kan teckna i
        jämförelsen. Det har {BILLIGAST.gb == null ? "obegränsad" : gbText(BILLIGAST.gb)} surf.
        Surfar du mer än så ändras svaret, och därför visar tabellen ovan det billigaste på varje
        surfnivå.
      </p>
      <p>
        Snittpriset är summan av alla månadsavgifter under tolv månader plus startavgiften, delat
        med tolv. Ett abonnemang som kostar lite i tre månader och mycket sedan får alltså ett
        snittpris som speglar hela året. Abonnemang med ålders- eller studentkrav räknas inte in
        här. De har egna sidor för{" "}
        <Link to={"/studentabonnemang" as never}>unga och studenter</Link> och för{" "}
        <Link to={"/pensionar" as never}>pensionärer</Link>.
      </p>

      <h2>Billigast om du vill …</h2>
      <ul>
        {UTNAMNINGAR.filter((u) => u.a).map((u) => (
          <li key={u.om}>
            <strong>{u.om}:</strong> {vem(u.a!)}, {u.a!.gb == null ? "obegränsad" : gbText(u.a!.gb)}{" "}
            för {kr(snittForstaAret(u.a!))} i månaden i snitt första året.
          </li>
        ))}
      </ul>
      <p>
        Varje utnämning följer av ett enda kriterium: lägst snittpris första året bland de
        abonnemang som uppfyller villkoret. Inga egna betyg och ingen viktning.
      </p>

      <h2>Vilket abonnemang är billigast utan bindningstid?</h2>
      <p>
        Utan bindningstid är {vem(UTAN10)} billigast med minst 10 GB, för{" "}
        {kr(snittForstaAret(UTAN10))} i månaden. Vill du ha obegränsad surf utan att binda dig är{" "}
        {vem(UTAN_OBEGR)} billigast för {kr(snittForstaAret(UTAN_OBEGR))}. Hela listan finns på
        sidan om <Link to={"/utan-bindningstid" as never}>mobilabonnemang utan bindningstid</Link>.
      </p>

      <h2>Är det billigare med 12 eller 24 månaders bindningstid?</h2>
      <p>
        Tabellen visar det billigaste abonnemanget över 24 månader för tre surfbehov, uppdelat på
        hur länge du binder dig. Vi räknar 24 månader för alla, även för abonnemang med kortare
        bindning, så att kostnaderna går att jämföra rakt av.
      </p>
      <GuideTable
        head={["Surf", "Ingen bindning", "12 mån bindning", "24 mån bindning"]}
        rows={BINDNINGSRADER.map((r) => [
          r.behov === "obegransad" ? "Obegränsad" : `Minst ${r.behov} GB`,
          ...r.per.map((a) =>
            a ? `${vem(a)}: ${kr(totalKostnad(a, 24))}` : "Inget i jämförelsen",
          ),
        ])}
        brytForsta
      />
      <p>
        {OBUNDEN_VINNER === BINDNINGSRADER.length
          ? "På alla tre nivåerna är det billigaste abonnemanget utan bindningstid också billigast över två år. Du betalar alltså inget extra för friheten att säga upp."
          : OBUNDEN_VINNER === 0
            ? "På alla tre nivåerna är ett bundet abonnemang billigast över två år. Räkna ändå på vad det kostar om du vill byta innan bindningstiden gått ut."
            : `På ${OBUNDEN_VINNER} av ${BINDNINGSRADER.length} nivåer är det billigaste abonnemanget utan bindningstid också billigast över två år. Där bindning lönar sig gäller det bara om du stannar hela perioden.`}{" "}
        Bindningstiden får vara högst 24 månader för en konsument enligt 12 kap. 8 § lagen om
        elektronisk kommunikation.
      </p>

      {FALLA && (
        <>
          <h2>Kampanjfällan: vad händer när kampanjpriset tar slut?</h2>
          <p>
            Störst skillnad mellan kampanjpris och ordinarie pris i jämförelsen just nu har{" "}
            {vem(FALLA)}. Det kostar {kr(prisNu(FALLA))} i månaden i {FALLA.kampanjManader} månader
            och därefter {kr(FALLA.pris)}. Snittet första året blir {kr(snittForstaAret(FALLA))} i
            månaden, och andra året betalar du{" "}
            {kr(totalKostnad(FALLA, 24) - totalKostnad(FALLA, 12))} totalt.
          </p>
          <p>
            Kampanjen är inte dålig i sig. Den är billig om du säger upp eller byter när den tar
            slut. Men det är ordinarie pris som avgör vad abonnemanget kostar i längden. Skriv upp
            datumet när kampanjen slutar, så att du hinner bestämma dig. Läs mer i guiden om{" "}
            <Link to={"/guider/kampanjpris-efter-kampanjen" as never}>
              kampanjpris efter kampanjen
            </Link>
            .
          </p>
        </>
      )}

      <h2>Hur mycket surf behöver du egentligen?</h2>
      <p>
        Enligt PTS använde ett abonnemang med samtal och data i snitt {MARKNAD.surfPerManad} GB i
        månaden 2025. Många klarar sig med mindre, särskilt om mobilen kopplar upp sig mot wifi
        hemma och på jobbet. Betalar du för obegränsat men surfar som snittet kan du ofta spara
        flera hundra kronor i månaden. Skillnaden mellan billigaste 20 GB och billigaste obegränsade
        är just nu {kr(snittForstaAret(OBEGR) - snittForstaAret(B20))} i månaden. I{" "}
        <Link to={"/verktyg/hur-mycket-surf-behover-jag" as never}>surfräknaren</Link> kan du räkna
        fram ditt eget behov.
      </p>
      <p>
        Vet du redan hur mycket du behöver? Se billigaste abonnemangen med{" "}
        <Link to={"/surf/10-gb" as never}>10 GB</Link>,{" "}
        <Link to={"/surf/20-gb" as never}>20 GB</Link>,{" "}
        <Link to={"/surf/50-gb" as never}>50 GB</Link> och{" "}
        <Link to={"/surf/100-gb" as never}>100 GB</Link>, eller alla{" "}
        <Link to={"/kampanjer" as never}>kampanjer just nu</Link>.
      </p>

      <h2>Spelar det någon roll vilket nät det billigaste abonnemanget har?</h2>
      <p>
        Alla operatörer kör i något av fyra nät:{" "}
        {Object.values(MOBILNAT)
          .map((n) => n.namn)
          .join(", ")}
        . Ett billigt abonnemang i samma nät som ett dyrt har samma täckning. Skillnaderna ligger i
        maxhastighet, EU-surf, kundtjänst och om 5G ingår. Kolla täckningen där du bor och var du
        brukar vara innan du byter. Mer om näten finns på sidan om{" "}
        <Link to={"/nat" as never}>mobilnät och täckning</Link>.
      </p>

      <h2>Så räknar vi fram det billigaste</h2>
      <p>
        Priserna kommer från operatörernas egna webbplatser och prislistor. Vi sorterar på snittpris
        första året, och ersättning påverkar aldrig ordningen. Vi har inga avtal med operatörerna.
        Hur vi gör, och vad vi inte räknar med, står på sidan{" "}
        <Link to={"/sa-jamfor-vi" as never}>så jämför vi</Link>.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Surf per
        abonnemang: PTS, Svensk telekommarknad 2025.
      </p>
    </PelarSida>
  );
}
