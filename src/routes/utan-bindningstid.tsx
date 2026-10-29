import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { BilligastTabell } from "@/components/mobil/billigast-tabell";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  datumText,
  gbText,
  kr,
  snittForstaAret,
  totalKostnad,
} from "@/lib/mobil/berakna";
import { KALLOR } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Utan bindningstid", path: "/utan-bindningstid" },
];

const OPPNA = PRIVATA.filter((a) => !arVillkorat(a));
const UTAN = OPPNA.filter((a) => a.bindning === 0);
const MED = OPPNA.filter((a) => a.bindning != null && a.bindning > 0);
const OKAND = OPPNA.filter((a) => a.bindning == null);
const OPS_UTAN = [...new Set(UTAN.map((a) => a.operator))]
  .map((s) => operator(s))
  .filter((o): o is NonNullable<typeof o> => !!o);
const OPS_HELT_UTAN = OPS_UTAN.filter(
  (o) => !OPPNA.some((a) => a.operator === o.slug && a.bindning !== 0),
);

const B10 = billigastForBehov(UTAN, 10)!;
const B20 = billigastForBehov(UTAN, 20)!;
const OBEGR = billigastForBehov(
  UTAN.filter((a) => a.gb == null),
  0,
);
const BUNDEN20 = billigastForBehov(MED, 20);

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

const FAQ = [
  {
    q: "Vilket är det billigaste mobilabonnemanget utan bindningstid?",
    a: `Med minst 10 GB är ${vem(B10)} billigast utan bindningstid, för ${kr(snittForstaAret(B10))} i månaden i snitt första året. Med minst 20 GB är det ${vem(B20)} för ${kr(snittForstaAret(B20))}.`,
  },
  {
    q: "Är abonnemang utan bindningstid dyrare?",
    a: BUNDEN20
      ? `Inte nödvändigtvis. Billigaste bundna abonnemanget med minst 20 GB kostar ${kr(totalKostnad(BUNDEN20, 24))} på 24 månader, billigaste obundna ${kr(totalKostnad(B20, 24))}. Kampanjpriser kräver ofta bindning, men ordinarie pris avgör i längden.`
      : "Inte nödvändigtvis. Kampanjpriser kräver ofta bindning, men ordinarie pris avgör vad abonnemanget kostar i längden.",
  },
  {
    q: "Hur lång uppsägningstid har ett abonnemang utan bindningstid?",
    a: "Högst en månad för en konsument enligt 12 kap. 13 § lagen om elektronisk kommunikation. Vissa operatörer har kortare, och några har ingen uppsägningstid alls utan avslutar vid månadsskiftet.",
    kalla: "Lag (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Hur lång bindningstid får ett mobilabonnemang ha?",
    a: "Högst 24 månader för konsumenter enligt 12 kap. 8 § lagen om elektronisk kommunikation. Samma gräns gäller mikroföretag, småföretag och ideella organisationer om de inte uttryckligen avstått.",
    kalla: "Lag (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Kan jag byta operatör och behålla numret om jag har bindningstid?",
    a: "Ja. Bindningstiden hindrar inte att du flyttar numret, men du måste betala den återstående bindningstiden till den gamla operatören. Den gamla operatören får inte ta betalt för att lämna ifrån sig numret.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
];

export const Route = createFileRoute("/utan-bindningstid")({
  head: () =>
    pageHead({
      title: "Mobilabonnemang utan bindningstid 2026 | Mobilpoolen",
      description: `Jämför ${UTAN.length} mobilabonnemang utan bindningstid. Billigast med minst 10 GB: ${vem(B10)} för ${kr(snittForstaAret(B10))}/mån i snitt första året.`,
      canonical: "/utan-bindningstid",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilabonnemang utan bindningstid"
      ingress={
        <p>
          {UTAN.length} av {OPPNA.length} abonnemang i jämförelsen har ingen bindningstid. Med minst
          10 GB är {vem(B10)} billigast för {kr(snittForstaAret(B10))} i månaden i snitt första året
          {OBEGR
            ? `, och obegränsad surf utan bindning kostar från ${kr(snittForstaAret(OBEGR))} hos ${operator(OBEGR.operator)?.namn}`
            : ""}
          . Utan bindning kan du säga upp med högst en månads uppsägningstid och byta när ett bättre
          pris dyker upp.
        </p>
      }
      nyckeltal={[
        {
          varde: String(UTAN.length),
          text: `abonnemang utan bindningstid hos ${OPS_UTAN.length} operatörer`,
        },
        { varde: kr(snittForstaAret(B10)), text: "billigast med minst 10 GB, snitt per månad" },
        ...(OBEGR
          ? [{ varde: kr(snittForstaAret(OBEGR)), text: "billigast med obegränsad surf" }]
          : []),
      ]}
      jamforelse={
        <div className="space-y-12">
          <BilligastTabell filter={(a) => a.bindning === 0 && !arVillkorat(a)} />
          <Jamforelse forval={{ utanBindning: true }} id="lista" />
        </div>
      }
      jamforelseRubrik="Billigast utan bindningstid per surfmängd"
      jamforelseIngress="Tabellen visar billigaste abonnemanget utan bindningstid på varje surfnivå. Under den finns hela listan, där filtret för ingen bindningstid redan är på."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/bindningstid-uppsagningstid",
          label: "Bindningstid och uppsägningstid",
          text: "Vad lagen säger och hur du räknar.",
        },
        {
          href: "/guider/byta-operator-med-bindningstid",
          label: "Byta operatör med bindningstid",
          text: "Vad det kostar att bryta i förtid.",
        },
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Med och utan bindning, per surfmängd.",
        },
        {
          href: "/saga-upp",
          label: "Säga upp abonnemang",
          text: "Uppsägningstid och kanaler per operatör.",
        },
      ]}
      ctaRubrik="Hitta ett abonnemang du kan lämna när du vill"
      ctaBild="flyttkartong-nyckel"
      uppdaterad="2026-10-29"
    >
      <h2>Vad betyder ingen bindningstid?</h2>
      <p>
        Ett abonnemang utan bindningstid kan du säga upp när du vill. Det upphör när
        uppsägningstiden har gått, som för en konsument är högst en månad enligt 12 kap. 13 § lagen
        om elektronisk kommunikation. Med bindningstid har du lovat att betala ett visst antal
        månader, oftast 12 eller 24, och säger du upp tidigare får du betala resten.
      </p>
      <p>
        Bindningstiden får vara högst 24 månader för en konsument (12 kap. 8 §). När den har gått ut
        och avtalet förlängs automatiskt kan du säga upp med högst en månads uppsägningstid.
      </p>

      <h2>Vilka operatörer har inga abonnemang med bindningstid?</h2>
      <p>
        Bland operatörerna i jämförelsen har {OPS_HELT_UTAN.map((o) => o.namn).join(", ")} bara
        abonnemang utan bindningstid.{" "}
        {OPS_UTAN.filter((o) => !OPS_HELT_UTAN.includes(o)).length > 0 &&
          `${OPS_UTAN.filter((o) => !OPS_HELT_UTAN.includes(o))
            .map((o) => o.namn)
            .join(", ")} har både och, där kampanjpriset ofta kräver bindning.`}{" "}
        {OKAND.length > 0 &&
          `För ${OKAND.length} abonnemang, hos ${[...new Set(OKAND.map((a) => operator(a.operator)?.namn))].join(" och ")}, framgår bindningstiden inte av operatörens sida. De syns inte när filtret för ingen bindningstid är på.`}
      </p>

      <h2>Är det dyrare utan bindningstid?</h2>
      <p>
        Inte alltid. Operatörerna lockar med kampanjpriser som kräver bindning, men efter kampanjen
        gäller ordinarie pris. Därför räknar vi på hela perioden.
        {BUNDEN20 &&
          ` Med minst 20 GB kostar billigaste bundna abonnemanget, ${vem(BUNDEN20)}, ${kr(totalKostnad(BUNDEN20, 24))} på 24 månader. Billigaste utan bindning, ${vem(B20)}, kostar ${kr(totalKostnad(B20, 24))}.`}{" "}
        Skillnaden avgör om friheten kostar något, och hur mycket.
      </p>

      <h2>Vad ska du tänka på när du väljer abonnemang utan bindning?</h2>
      <ul>
        <li>
          <strong>Kampanjens längd.</strong> Många obundna abonnemang har ett lågt pris några
          månader. Snittpriset första året visar vad det kostar på riktigt.
        </li>
        <li>
          <strong>Uppsägningstiden.</strong> Den är högst en månad, men vissa operatörer avslutar
          vid nästa månadsskifte och några har ingen uppsägningstid alls.
        </li>
        <li>
          <strong>Sparad surf.</strong> Hos till exempel Fello försvinner sparad surf när du säger
          upp. Det spelar roll om du har sparat mycket.
        </li>
        <li>
          <strong>Telefon på avbetalning.</strong> Hos Comviq och Telia följer 24 månaders bindning
          med om du köper telefonen via operatören, även om abonnemanget annars är obundet.
        </li>
      </ul>

      <h2>Hur byter du operatör utan bindningstid?</h2>
      <p>
        Beställ det nya abonnemanget och be om att flytta ditt nummer. Den nya operatören sköter
        flytten och säger upp det gamla abonnemanget åt dig. Avbrottet får vara högst en arbetsdag,
        och den gamla operatören får inte ta betalt för att lämna ifrån sig numret. Vill du ha kvar
        numret ska du inte säga upp själv först. Steg för steg står i guiden om att{" "}
        <Link to={"/guider/byta-operator-behalla-nummer" as never}>
          byta operatör och behålla numret
        </Link>
        .
      </p>
      <p>
        Beställer du på nätet eller per telefon har du 14 dagars ångerrätt enligt
        distansavtalslagen. Ringer en säljare upp dig gäller avtalet först när du har accepterat
        erbjudandet skriftligt efter samtalet.
      </p>

      <h2>Billigast utan bindningstid per surfmängd</h2>
      <ul>
        {[5, 10, 20, 50].map((gb) => {
          const a = billigastForBehov(UTAN, gb);
          return a ? (
            <li key={gb}>
              Minst {gb} GB: {vem(a)} ({a.gb == null ? "obegränsad" : gbText(a.gb)}),{" "}
              {kr(snittForstaAret(a))} i månaden i snitt första året.
            </li>
          ) : null;
        })}
        {OBEGR && (
          <li>
            Obegränsad surf: {vem(OBEGR)}, {kr(snittForstaAret(OBEGR))} i månaden i snitt första
            året.
          </li>
        )}
      </ul>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Lagregler:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        .
      </p>
    </PelarSida>
  );
}
