import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { BilligastTabell, billigastPerNiva } from "@/components/mobil/billigast-tabell";
import { FORETAG, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import {
  datumText,
  gbText,
  kr,
  momsText,
  prisNu,
  snittForstaAret,
  totalKostnad,
} from "@/lib/mobil/berakna";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const PATH = "/foretag/billigaste-foretagsabonnemang";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Företag", path: "/foretag" },
  { name: "Billigaste företagsabonnemang", path: PATH },
];

const opNamn = (slug: string) => operator(slug)?.namn ?? slug;
const fullNamn = (a: Abonnemang) => `${opNamn(a.operator)} ${a.namn}`;
const momsKort = (a: Abonnemang) => momsText(a.moms) ?? "moms anges inte";

const RADER = billigastPerNiva("foretag");
const OBEGR = RADER.find((r) => r.a.gb == null)?.a;
const FAST = RADER.find((r) => r.a.gb != null)?.a;
const KAMPANJER = FORETAG.filter(
  (a) => a.kampanjpris != null && (a.kampanjManader ?? 0) >= 24 && (a.bindning ?? 0) >= 24,
);

const FAQ = [
  {
    q: "Vilket är det billigaste företagsabonnemanget?",
    a:
      FAST && OBEGR
        ? `Med fast surfmängd är ${fullNamn(FAST)} (${gbText(FAST.gb)}) billigast för ${kr(snittForstaAret(FAST))} i månaden i snitt första året. Med obegränsad surf är ${fullNamn(OBEGR)} billigast för ${kr(snittForstaAret(OBEGR))} i månaden (${momsKort(OBEGR)}).`
        : "Se tabellen per surfmängd på sidan.",
    kalla: "Operatörernas webbplatser",
  },
  {
    q: "Hur räknar jag om ett pris exkl. moms till inkl. moms?",
    a: "Multiplicera med 1,25, eftersom momsen på mobilabonnemang är 25 procent. 200 kr exkl. moms blir 250 kr inkl. moms. Ett momsregistrerat företag får dra av momsen för den del som används i verksamheten.",
    kalla: "Skatteverket",
  },
  {
    q: "Varför är ordinarie pris viktigare än kampanjpriset?",
    a: "Kampanjen tar slut men abonnemanget fortsätter. Hos Tele2 och för Tre 3Företag Obegränsad Max gäller kampanjpriset i 24 månader med 24 månaders bindningstid, och sedan gäller ordinarie pris. Räkna på hela avtalstiden och på vad det kostar efteråt.",
  },
  {
    q: "Är billigast alltid bäst för ett företag?",
    a: "Inte alltid. Behöver ni växel, extra sim eller mycket surf utomlands kan ett dyrare abonnemang där det ingår bli billigare totalt. Jämför det ni faktiskt behöver.",
  },
];

export const Route = createFileRoute("/foretag_/billigaste-foretagsabonnemang")({
  head: () =>
    pageHead({
      title: "Billigaste företagsabonnemanget just nu | Mobilpoolen",
      description:
        "Billigaste mobilabonnemanget för företag per surfmängd, räknat på snittpris första året. Så jämför du exkl. och inkl. moms och undviker fällorna.",
      canonical: PATH,
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Billigaste företagsabonnemanget"
      ingress={
        <p>
          {FAST && (
            <>
              Billigast för företag med fast surfmängd är just nu {fullNamn(FAST)} för{" "}
              {kr(snittForstaAret(FAST))} i månaden i snitt första året.{" "}
            </>
          )}
          {OBEGR && (
            <>
              Med obegränsad surf är {fullNamn(OBEGR)} billigast för {kr(snittForstaAret(OBEGR))} i
              månaden ({momsKort(OBEGR)}).{" "}
            </>
          )}
          Kontrollera alltid moms, bindningstid och priset efter kampanjen.
        </p>
      }
      nyckeltal={[
        ...(FAST
          ? [
              {
                varde: kr(snittForstaAret(FAST)),
                text: `billigast med fast surf, ${fullNamn(FAST)}`,
              },
            ]
          : []),
        ...(OBEGR
          ? [
              {
                varde: kr(snittForstaAret(OBEGR)),
                text: `billigast obegränsat, ${fullNamn(OBEGR)}`,
              },
            ]
          : []),
        { varde: String(FORETAG.length), text: "företagsabonnemang i jämförelsen" },
      ]}
      jamforelse={
        <div className="space-y-12">
          <BilligastTabell kundtyp="foretag" />
          <Jamforelse kundtyp="foretag" id="lista" antalForst={8} />
        </div>
      }
      jamforelseRubrik="Billigast per surfmängd för företag"
      jamforelseIngress="Tabellen räknas fram ur operatörernas priser. Snittet första året räknar in kampanjens längd och startavgiften."
      faq={FAQ}
      lankar={[
        {
          href: "/foretag",
          label: "Mobilabonnemang för företag",
          text: "Alla företagsabonnemang.",
        },
        {
          href: "/foretag/enskild-firma",
          label: "Enskild firma",
          text: "När ett privat abonnemang räcker.",
        },
        {
          href: "/verktyg/foretagskalkylator",
          label: "Företagskalkylator",
          text: "Räkna på alla användare.",
        },
        {
          href: "/guider/moms-mobilabonnemang",
          label: "Moms på mobilabonnemang",
          text: "Exkl. eller inkl. moms.",
        },
        {
          href: "/guider/kampanjpris-efter-kampanjen",
          label: "Kampanjpris efter kampanjen",
          text: "Vad du betalar sedan.",
        },
        {
          href: "/guider/vaxel-eller-mobil",
          label: "Växel eller bara mobil?",
          text: "När en växel lönar sig.",
        },
      ]}
      ctaRubrik="Hitta rätt abonnemang för företaget"
      ctaIngress="Jämför pris över hela avtalstiden, med moms och bindning tydligt utskrivet."
      ctaBild="tomt-kontor"
      uppdaterad="2026-10-29"
    >
      <h2>Billigast per surfmängd, med moms utskriven</h2>
      <p>
        Tabellen nedan visar samma vinnare som ovan, men med vad operatören anger om moms och vad
        priset blir inkl. moms om det anges exkl. moms.
      </p>
      <table>
        <thead>
          <tr>
            <th>Surf</th>
            <th>Abonnemang</th>
            <th>Snitt år 1</th>
            <th>Moms</th>
          </tr>
        </thead>
        <tbody>
          {RADER.map(({ niva, a }) => (
            <tr key={niva}>
              <td>{niva}</td>
              <td>
                {fullNamn(a)} ({gbText(a.gb)})
              </td>
              <td>{kr(snittForstaAret(a))}</td>
              <td>
                {a.moms === "exkl"
                  ? `exkl. moms (${kr(snittForstaAret(a) * 1.25)} inkl.)`
                  : momsKort(a)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
      </p>

      <h2>Hur jämför man priser exkl. och inkl. moms?</h2>
      <p>
        Privata abonnemang anges alltid inkl. moms. Företagsabonnemang anges oftast exkl. moms, men
        inte alltid. Tre och Telavox skriver uttryckligen att priserna är exkl. moms. Telia, Tele2
        och Hallon anger inte moms alls på sina abonnemangssidor. Vi skriver därför ut vad varje
        operatör anger, i stället för att gissa.
      </p>
      <p>
        Räkneregeln är enkel: pris exkl. moms gånger 1,25 är pris inkl. moms. Om ett pris saknar
        momsuppgift, fråga operatören innan du jämför det med ett pris där momsen är angiven. Annars
        kan skillnaden bli 25 procent åt fel håll.
      </p>
      <p>
        Är företaget momsregistrerat får det dra av den ingående momsen för den del av abonnemanget
        som används i verksamheten. Används mobilen även privat dras bara verksamhetsdelen av. Läs
        mer i guiden om{" "}
        <Link to={"/guider/moms-mobilabonnemang" as never}>moms på mobilabonnemang</Link>.
      </p>

      <h2>Fallgropen: kampanj i 24 månader med bindning</h2>
      <p>
        De lägsta priserna på obegränsad surf hos de stora operatörerna är ofta kampanjpriser som
        kräver 24 månaders bindningstid. När kampanjen tar slut går priset upp till ordinarie.
      </p>
      <table>
        <thead>
          <tr>
            <th>Abonnemang</th>
            <th>Kampanj</th>
            <th>Sedan</th>
            <th>Totalt 24 mån</th>
          </tr>
        </thead>
        <tbody>
          {KAMPANJER.map((a) => (
            <tr key={a.id}>
              <td>{fullNamn(a)}</td>
              <td>
                {kr(prisNu(a))} i {a.kampanjManader} mån
              </td>
              <td>{kr(a.pris)}/mån</td>
              <td>{kr(totalKostnad(a, 24))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
      </p>
      <p>
        Kampanjen är inte dålig i sig. Den gäller lika länge som bindningstiden, så du vet vad du
        betalar under hela avtalet. Men sätt en påminnelse före bindningstidens slut. Annars
        fortsätter abonnemanget till ordinarie pris. Läs mer om vad som händer i{" "}
        <Link to={"/guider/kampanjpris-efter-kampanjen" as never}>kampanjpris efter kampanjen</Link>
        .
      </p>

      <h2>Fler saker att kontrollera innan du beställer</h2>
      <ul>
        <li>
          <strong>Bindningstid.</strong> För mikroföretag och små företag gäller högst 24 månader,
          om ni inte uttryckligen har gått med på något annat. Ett ramavtal hos Tele2 löper 24 eller
          36 månader.
        </li>
        <li>
          <strong>Uppsägningstid.</strong> Gränsen på högst en månad gäller bara konsumenter. Ett
          företag kan få längre uppsägningstid, så läs avtalet.
        </li>
        <li>
          <strong>Startavgift och aktivering.</strong> Står det inget om startavgift på operatörens
          sida, fråga.
        </li>
        <li>
          <strong>Kampanjpris utan angiven längd.</strong> Telia anger kampanjpriser på sina
          obegränsade företagsabonnemang men inte hur länge de gäller. Därför räknar vi med
          ordinarie pris för Telia.
        </li>
        <li>
          <strong>Det som ingår.</strong> Växel, extra datasim och surf utomlands kan göra ett
          dyrare abonnemang billigare totalt.
        </li>
      </ul>

      <h2>Billigast för små företag utan bindning</h2>
      <p>
        Vill du slippa bindningstid är Hallon Företag ett alternativ med fast surfmängd och utan
        bindning. Hallon kör i Tres nät och har ingen obegränsad surf och ingen växel. Har du
        enskild firma kan även ett privat abonnemang utan bindning passa. Läs mer på{" "}
        <Link to={"/foretag/enskild-firma" as never}>mobilabonnemang för enskild firma</Link>. Räkna
        på hela företaget med{" "}
        <Link to={"/verktyg/foretagskalkylator" as never}>företagskalkylatorn</Link>.
      </p>
    </PelarSida>
  );
}
