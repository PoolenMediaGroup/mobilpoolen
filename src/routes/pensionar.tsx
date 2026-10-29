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
  gbText,
  kr,
  snittForstaAret,
  sortera,
} from "@/lib/mobil/berakna";
import { NEDSLACKNING } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Mobilabonnemang för pensionärer", path: "/pensionar" },
];

const SENIOR = sortera(
  PRIVATA.filter((a) => a.malgrupp?.includes("senior")),
  "snitt-ar",
);
const BILLIGAST = SENIOR[0];
const OPS = [...new Set(SENIOR.map((a) => a.operator))]
  .map((s) => operator(s)?.namn)
  .filter(Boolean) as string[];
const B10 = billigastForBehov(SENIOR, 10);
const OBEGR = billigastForBehov(
  SENIOR.filter((a) => a.gb == null),
  0,
);
const OPPNA = PRIVATA.filter((a) => !arVillkorat(a));
const B10_ALLA = billigastForBehov(OPPNA, 10);

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

/** Ålderskrav per operatör, så som operatören själv anger det i datan. */
const ALDER: Record<string, string> = {
  hallon: "riktar sig till dig över 55 (formellt ålderskrav anges inte)",
  tellus: "endast 55+",
  tele2: "65 år eller äldre",
  chilimobil: "seniorsida, ålderskrav anges inte i vår data",
};

const FAQ = [
  {
    q: "Vilket är det billigaste mobilabonnemanget för pensionärer?",
    a: BILLIGAST
      ? `${vem(BILLIGAST)} med ${BILLIGAST.gb == null ? "obegränsad" : gbText(BILLIGAST.gb)} surf, för ${kr(snittForstaAret(BILLIGAST))} i månaden i snitt första året.${B10 ? ` Med minst 10 GB är ${vem(B10)} billigast, ${kr(snittForstaAret(B10))}.` : ""}`
      : "Se listan på sidan.",
  },
  {
    q: "Vilka operatörer har seniorabonnemang?",
    a: `I jämförelsen har ${OPS.join(", ")} abonnemang för seniorer. Ålderskraven skiljer sig: Hallon och Tellus riktar sig till dig över 55, Tele2 kräver 65 år. Telia skriver att de inte har några abonnemang med seniorrabatt.`,
  },
  {
    q: "Har seniorabonnemang bindningstid?",
    a: "Det beror på operatören. Hallons, Tellus och Chilimobils seniorabonnemang har ingen bindningstid. Tele2s seniorabonnemang har 24 månaders bindningstid.",
  },
  {
    q: "Fungerar min gamla mobiltelefon fortfarande?",
    a: `Tele2, Telenor och Tre stängde 2G och 3G den ${NEDSLACKNING.n4mOchTre}. Telia behåller 2G till ${NEDSLACKNING.teliaTvaG}. En telefon som inte klarar samtal över 4G (VoLTE) kan inte ringa i Tele2s, Telenors och Tres nät, och telefoner som inte kan ringa nödsamtal över VoLTE blockerades där från 2 februari 2026.`,
    kalla: "PTS",
  },
  {
    q: "Behöver en pensionär mycket surf?",
    a: "Det beror på hur du använder mobilen. Ringer du mest och läser nyheter räcker ofta några GB, särskilt om du har wifi hemma. Videosamtal med barnbarn och streaming drar mer.",
  },
];

export const Route = createFileRoute("/pensionar")({
  head: () =>
    pageHead({
      title: "Mobilabonnemang för pensionärer 2026 | Mobilpoolen",
      description: BILLIGAST
        ? `Seniorabonnemang från ${kr(snittForstaAret(BILLIGAST))}/mån i snitt. Jämför ${SENIOR.length} abonnemang för 55+ och 65+ hos ${OPS.join(", ")}.`
        : "Jämför seniorabonnemang för 55+ och 65+.",
      canonical: "/pensionar",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilabonnemang för pensionärer och seniorer"
      ingress={
        BILLIGAST ? (
          <p>
            Billigast för seniorer är {vem(BILLIGAST)} med{" "}
            {BILLIGAST.gb == null ? "obegränsad" : gbText(BILLIGAST.gb)} för{" "}
            {kr(snittForstaAret(BILLIGAST))} i månaden i snitt första året.
            {B10 &&
              ` Med minst 10 GB är ${vem(B10)} billigast, för ${kr(snittForstaAret(B10))}.`}{" "}
            Vi jämför {SENIOR.length} seniorabonnemang hos {OPS.length} operatörer. Ålderskravet är
            55 eller 65 år beroende på operatör.
          </p>
        ) : (
          <p>Jämför seniorabonnemang.</p>
        )
      }
      nyckeltal={[
        ...(BILLIGAST
          ? [
              {
                varde: kr(snittForstaAret(BILLIGAST)),
                text: "billigaste seniorabonnemang, snitt per månad",
              },
            ]
          : []),
        ...(B10 ? [{ varde: kr(snittForstaAret(B10)), text: "billigast med minst 10 GB" }] : []),
        { varde: String(SENIOR.length), text: `seniorabonnemang hos ${OPS.length} operatörer` },
      ]}
      jamforelse={<Jamforelse forval={{ malgrupp: "senior" }} id="lista" />}
      jamforelseRubrik="Alla seniorabonnemang"
      jamforelseIngress="Sorterade efter snittpris per månad första året. Ålderskravet står i operatörens villkor."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/2g-3g-nedslackning",
          label: "2G och 3G släcks",
          text: "Fungerar din telefon eller ditt trygghetslarm?",
        },
        {
          href: "/guider/racker-5-gb-surf",
          label: "Räcker 5 GB surf?",
          text: "Så mycket surf går åt i vardagen.",
        },
        {
          href: "/guider/bedrageri-sim-swap-och-bluffsamtal",
          label: "Bluffsamtal och bedrägerier",
          text: "Så känner du igen och stoppar dem.",
        },
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Jämför med abonnemang som alla kan teckna.",
        },
      ]}
      ctaRubrik="Hitta ett seniorabonnemang som passar"
      ctaBild="aldre-par-parkbank"
      uppdaterad="2026-10-29"
    >
      <h2>Vilka operatörer har seniorabonnemang?</h2>
      <GuideTable
        head={["Operatör", "Ålderskrav", "Seniorabonnemang", "Bindningstid"]}
        rows={[...new Set(SENIOR.map((a) => a.operator))].map((slug) => {
          const lista = SENIOR.filter((a) => a.operator === slug);
          return [
            operator(slug)?.namn ?? slug,
            ALDER[slug] ?? "se operatörens villkor",
            lista.map((a) => `${gbText(a.gb)} ${kr(a.pris)}`).join(", "),
            [...new Set(lista.map((a) => bindningText(a.bindning)))].join(", "),
          ];
        })}
        brytForsta
      />
      <p>
        Priserna i tabellen är ordinarie månadspris. Flera har kampanjpris de första månaderna, och
        det räknas in i snittpriset i jämförelsen ovan. Telia skriver själva att de inte har några
        mobilabonnemang med seniorrabatt. Comviq har ingen seniorprislista som vi har kunnat hitta.
        Fello och Vimla har prislistor för 55+, men deras priser har vi inte kunnat kontrollera.
      </p>

      <h2>Är seniorabonnemang billigare än vanliga abonnemang?</h2>
      {B10 && B10_ALLA ? (
        <p>
          Med minst 10 GB kostar billigaste seniorabonnemanget {kr(snittForstaAret(B10))} i månaden
          i snitt första året. Billigaste abonnemanget som alla kan teckna kostar{" "}
          {kr(snittForstaAret(B10_ALLA))}.{" "}
          {snittForstaAret(B10) < snittForstaAret(B10_ALLA)
            ? `Seniorpriset är alltså ${kr(snittForstaAret(B10_ALLA) - snittForstaAret(B10))} billigare i månaden.`
            : "Ett vanligt abonnemang kan alltså vara lika billigt eller billigare, så jämför båda."}
        </p>
      ) : (
        <p>Jämför alltid med vanliga abonnemang, ibland är de lika billiga.</p>
      )}
      {OBEGR && (
        <p>
          Vill du ha obegränsad surf är {vem(OBEGR)} billigast bland seniorabonnemangen,{" "}
          {kr(snittForstaAret(OBEGR))} i månaden i snitt. {bindningText(OBEGR.bindning)}.
        </p>
      )}

      <h2>Hur mycket surf behöver du?</h2>
      <p>
        Om du mest ringer, skickar sms och läser nyheter i mobilen räcker ofta några GB i månaden,
        särskilt om mobilen kopplar upp sig mot wifi hemma. Videosamtal, att titta på film och att
        skicka många bilder drar mer. Du kan se hur mycket du har surfat i mobilens inställningar
        eller i operatörens app. Med sparad surf tar du med det du inte använder till nästa månad.
      </p>

      <h2>Fungerar din telefon efter att 2G och 3G stängts?</h2>
      <p>
        Tele2, Telenor och Tre stängde sina 2G- och 3G-nät den {NEDSLACKNING.n4mOchTre}. Telia
        behåller 2G till {NEDSLACKNING.teliaTvaG}. En äldre telefon som inte kan ringa över 4G
        (VoLTE) kan inte ringa i Tele2s, Telenors och Tres nät. Enligt ett föreläggande från PTS
        blockerades telefoner som inte kan ringa nödsamtal över VoLTE i de näten från 2 februari
        2026. Har du en äldre telefon eller ett trygghetslarm med SIM-kort, kontrollera med
        operatören eller leverantören. Mer i guiden om{" "}
        <Link to={"/guider/2g-3g-nedslackning" as never}>2G- och 3G-nedsläckningen</Link>.
      </p>

      <h2>Vilka seniorabonnemang har kundtjänst på telefon?</h2>
      <p>
        Vill du kunna ringa och prata med en person är det värt att kolla innan du byter. Så här
        anger operatörerna med seniorabonnemang sin kundtjänst:
      </p>
      <ul>
        {[...new Set(SENIOR.map((a) => a.operator))].map((slug) => {
          const o = operator(slug);
          return o ? (
            <li key={slug}>
              <strong>{o.namn}:</strong> {o.kundtjanst ?? "uppgift saknas"}
            </li>
          ) : null;
        })}
      </ul>

      <h2>Vad ska du tänka på när du byter?</h2>
      <ul>
        <li>
          <strong>Ringer någon och vill sälja ett abonnemang</strong> gäller avtalet bara om du
          efter samtalet accepterar erbjudandet skriftligt.
        </li>
        <li>
          <strong>Ångerrätt.</strong> Beställer du på nätet eller per telefon har du 14 dagars
          ångerrätt.
        </li>
        <li>
          <strong>Behåll numret.</strong> Be den nya operatören flytta ditt nummer. De säger upp det
          gamla abonnemanget åt dig, och avbrottet får vara högst en arbetsdag.
        </li>
        <li>
          <strong>Kundtjänst.</strong> Vill du kunna ringa och prata med någon, kolla om operatören
          har telefonsupport. Alla har inte det.
        </li>
        <li>
          <strong>Bluff-sms</strong> kan du vidarebefordra till 7726.
        </li>
      </ul>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. 2G och 3G:
        PTS och Telekområdgivarna.
      </p>
    </PelarSida>
  );
}
