import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { OPERATORER, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  datumText,
  gbText,
  kr,
  sortera,
  snittForstaAret,
} from "@/lib/mobil/berakna";
import { KALLOR } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Kontantkort", path: "/kontantkort" },
];

const KK = sortera(
  PRIVATA.filter((a) => a.kontantkort),
  "snitt-ar",
);
const BILLIGAST = KK[0];
const MEST = [...KK].sort((x, y) => (y.gb ?? Infinity) - (x.gb ?? Infinity))[0];
const KK10 = billigastForBehov(KK, 10);
const KK20 = billigastForBehov(KK, 20);
const ABB = PRIVATA.filter((a) => !a.kontantkort && !arVillkorat(a) && a.bindning === 0);
const ABB10 = billigastForBehov(ABB, 10);
const ABB20 = billigastForBehov(ABB, 20);
/** Operatörer som enligt sin egen webbplats säljer kontantkort. */
const SALJER_KK = OPERATORER.filter((o) => o.kontantkort === true && o.aktiv);

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

const FAQ = [
  {
    q: "Vilket är det billigaste kontantkortet?",
    a: BILLIGAST
      ? `Av de kontantkortspaket vi har kunnat kontrollera är ${vem(BILLIGAST)} billigast, ${kr(BILLIGAST.pris)} för ${BILLIGAST.gb == null ? "obegränsad" : gbText(BILLIGAST.gb)} och 30 dagar. ${KK10 ? `Med minst 10 GB är ${vem(KK10)} billigast, för ${kr(KK10.pris)}.` : ""}`
      : "Se listan på sidan.",
  },
  {
    q: "Måste man registrera kontantkort?",
    a: "Ja. Sedan 1 augusti 2022 måste alla kontantkort registreras innan de används. Operatören registrerar namn, adress och personnummer, samordningsnummer eller organisationsnummer, och kontrollerar identiteten med id-handling eller e-legitimation.",
    kalla: "Lag (2022:482) om elektronisk kommunikation, 9 kap. 24–25 §§",
  },
  {
    q: "Får någon annan använda mitt kontantkort?",
    a: "Tillfälligt, eller om det är en närstående. Annars ska kortet registreras om på den som använder det. Används det av någon annan utan ny registrering ska tjänsten stängas av.",
    kalla: "Lag (2022:482) om elektronisk kommunikation, 9 kap. 26 §",
  },
  {
    q: "Är kontantkort billigare än abonnemang?",
    a:
      KK20 && ABB20
        ? `Ibland. Med minst 20 GB kostar billigaste kontantkortet ${kr(snittForstaAret(KK20))} i månaden och billigaste abonnemanget utan bindning ${kr(snittForstaAret(ABB20))} i snitt första året. Abonnemang har ofta kampanjpriser i början.`
        : "Ibland. Jämför snittpriset för året, eftersom abonnemang ofta har kampanjpriser i början.",
  },
  {
    q: "Kan jag behålla mitt nummer när jag byter från kontantkort?",
    a: "Ja. Numret kan flyttas till ett abonnemang eller ett annat kontantkort. Den nya operatören sköter flytten, och resterande saldo på kontantkortet ska betalas tillbaka om du begär det.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
];

export const Route = createFileRoute("/kontantkort")({
  head: () =>
    pageHead({
      title: "Kontantkort 2026: jämför priser och surf | Mobilpoolen",
      description: BILLIGAST
        ? `Kontantkort från ${kr(BILLIGAST.pris)} per 30 dagar. Jämför paketen, se vad registreringskravet innebär och när ett abonnemang utan bindning är billigare.`
        : "Jämför kontantkort, registreringskravet och kontantkort mot abonnemang.",
      canonical: "/kontantkort",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Kontantkort: jämför priser och surf"
      ingress={
        <p>
          Billigaste kontantkortspaketet vi har kunnat kontrollera är{" "}
          {BILLIGAST ? `${vem(BILLIGAST)} för ${kr(BILLIGAST.pris)}` : "–"} per 30 dagar med{" "}
          {BILLIGAST ? (BILLIGAST.gb == null ? "obegränsad" : gbText(BILLIGAST.gb)) : ""} surf.
          {KK20 && ` Med minst 20 GB är ${vem(KK20)} billigast, för ${kr(KK20.pris)}.`} Med
          kontantkort betalar du i förväg och har ingen bindningstid. Sedan 1 augusti 2022 måste
          alla kontantkort registreras med id.
        </p>
      }
      nyckeltal={[
        ...(BILLIGAST
          ? [{ varde: kr(BILLIGAST.pris), text: "billigaste kontantkortspaketet per 30 dagar" }]
          : []),
        ...(MEST?.gb
          ? [
              {
                varde: gbText(MEST.gb),
                text: `mest surf i ett paket, ${kr(MEST.pris)} per 30 dagar`,
              },
            ]
          : []),
        { varde: "1 aug 2022", text: "sedan dess måste alla kontantkort registreras" },
      ]}
      jamforelse={<Jamforelse urval={(a) => Boolean(a.kontantkort)} id="lista" />}
      jamforelseRubrik="Kontantkortspaket i jämförelsen"
      jamforelseIngress="Paketen gäller 30 dagar och förnyas automatiskt om saldot räcker. Pris per månad är priset för 30 dagar."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/kontantkort-eller-abonnemang",
          label: "Kontantkort eller abonnemang?",
          text: "Vad som passar dig, och vad det kostar.",
        },
        {
          href: "/utan-bindningstid",
          label: "Utan bindningstid",
          text: "Abonnemang som du kan säga upp när du vill.",
        },
        {
          href: "/operatorer/lycamobile",
          label: "Lyca Mobile",
          text: "Alla paket och villkor.",
        },
        {
          href: "/guider/ringa-utomlands-billigt",
          label: "Ringa utomlands billigt",
          text: "Paket med internationella minuter.",
        },
        {
          href: "/barn",
          label: "Mobil till barn",
          text: "Kontantkort eller abonnemang till barnet?",
        },
      ]}
      ctaRubrik="Kontantkort eller abonnemang?"
      ctaIngress="Jämför alla abonnemang och kontantkort på en gång och se vad du betalar på ett år."
      ctaBild="kort-laptop-betalning"
      uppdaterad="2026-10-29"
    >
      <h2>Vad är ett kontantkort?</h2>
      <p>
        Ett kontantkort är ett SIM-kort som du betalar i förväg. Du laddar pengar eller köper ett
        paket med surf och samtal, och när det är slut kan du inte använda mer förrän du laddar
        igen. Det finns ingen faktura och ingen bindningstid. Därför kan det aldrig kosta mer än du
        själv har lagt in.
      </p>

      <h2>Vilka kontantkort finns i jämförelsen?</h2>
      <p>
        Just nu har vi kunnat kontrollera kontantkortspaketen hos Lyca Mobile, som uppges köra i
        Telenors nät. Operatören har inte själv bekräftat vilket nät det är. Paketen gäller 30 dagar
        och innehåller fria samtal och sms i Sverige och EU-roaming. Flera paket har också
        internationella minuter till ett antal länder:
      </p>
      <ul>
        {KK.map((a) => (
          <li key={a.id}>
            {a.namn}: {gbText(a.gb)} för {kr(a.pris)} per 30 dagar
            {a.euGb != null ? `, ${a.euGb} GB i EU` : ""}.
          </li>
        ))}
      </ul>
      <p>
        Även{" "}
        {SALJER_KK.filter((o) => o.slug !== "lycamobile")
          .map((o) => o.namn)
          .join(", ")}{" "}
        har också kontantkort enligt våra uppgifter, men deras kontantkortspriser har vi inte kunnat
        kontrollera än.
      </p>

      <h2>Måste man registrera kontantkort?</h2>
      <p>
        Ja. Sedan 1 augusti 2022 måste alla kontantkort, både för mobil och mobilt bredband,
        registreras innan de används. Operatören registrerar namn, postadress och personnummer,
        samordningsnummer eller organisationsnummer. Identiteten kontrolleras med giltig id-handling
        eller e-legitimation. Kort som köptes före 1 augusti 2022 fick användas oregistrerade till 1
        februari 2023 eller till nästa påfyllning.
      </p>
      <p>
        Kortet får användas tillfälligt av någon annan och av en närstående till den som det är
        registrerat på. Annars ska det registreras om. När registreringskravet infördes fanns cirka
        2,8 miljoner aktiva kontantkort i Sverige, ungefär vart femte mobilabonnemang.
      </p>

      <h2>Kontantkort eller abonnemang?</h2>
      <p>
        Med ett abonnemang betalar du i efterskott på en faktura. Utan bindningstid är det nästan
        lika flexibelt som ett kontantkort.
        {KK10 &&
          ABB10 &&
          ` Med minst 10 GB kostar billigaste kontantkortet, ${vem(KK10)}, ${kr(snittForstaAret(KK10))} i månaden. Billigaste abonnemanget utan bindning, ${vem(ABB10)}, kostar ${kr(snittForstaAret(ABB10))} i snitt första året.`}
      </p>
      <p>Kontantkort passar dig som</p>
      <ul>
        <li>vill ha full kontroll och aldrig betala mer än du laddat</li>
        <li>inte vill eller kan få en faktura</li>
        <li>ringer mycket till utlandet och vill ha internationella minuter</li>
        <li>behöver ett nummer en kortare tid</li>
      </ul>
      <p>
        Ett abonnemang passar bättre om du vill slippa ladda, vill ha kampanjpriser eller vill att
        surfen sparas länge. Läs mer i guiden{" "}
        <Link to={"/guider/kontantkort-eller-abonnemang" as never}>
          kontantkort eller abonnemang
        </Link>
        .
      </p>

      <h2>Vad ska du tänka på med kontantkort?</h2>
      <ul>
        <li>
          <strong>30 dagar, inte en kalendermånad.</strong> Paketen förnyas var 30:e dag, vilket
          blir lite mer än tolv gånger om året.
        </li>
        <li>
          <strong>Automatisk förnyelse.</strong> Hos Lyca Mobile förnyas paketet automatiskt om
          saldot räcker. Det går att stänga av i My Lyca.
        </li>
        <li>
          <strong>Förbrukning utöver paketet</strong> debiteras enligt standardpris, så håll koll om
          du ringer utanför det som ingår.
        </li>
        <li>
          <strong>Saldo vid byte.</strong> Flyttar du numret till en annan operatör ska resterande
          saldo betalas tillbaka om du begär det.
        </li>
      </ul>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
        Registrering:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 9 kap. 24–26 §§. Antal kontantkort 2022: SVT Nyheter.
      </p>
    </PelarSida>
  );
}
