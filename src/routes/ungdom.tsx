import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { GuideTable } from "@/components/guide-page";
import { ABONNEMANG, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  datumText,
  gbText,
  kr,
  snittForstaAret,
  sortera,
} from "@/lib/mobil/berakna";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Mobilabonnemang för unga och studenter", path: "/ungdom" },
];

/** Abonnemang med student- eller ungdomspris. Telias 10 GB har ingen ungdomsrabatt. */
const arUng = (a: Abonnemang) =>
  Boolean(a.malgrupp?.some((m) => m === "student" || m === "ung")) &&
  !/ingen ungdomsrabatt/i.test(a.notis ?? "");

const UNGA = sortera(PRIVATA.filter(arUng), "snitt-ar");
const OPS = [...new Set(UNGA.map((a) => a.operator))]
  .map((s) => operator(s)?.namn)
  .filter(Boolean) as string[];
const B20 = billigastForBehov(UNGA, 20);
const B50 = billigastForBehov(UNGA, 50);
const OPPNA = PRIVATA.filter((a) => !arVillkorat(a));
const B20_ALLA = billigastForBehov(OPPNA, 20);
const B50_ALLA = billigastForBehov(OPPNA, 50);

/** Telia: 50 kr/mån rabatt för under 28 år på 20 GB och uppåt (Telias webbplats, 2026-10-29). */
const TELIA_RABATT = 50;
const TELIA_UNG = ["telia-mobil-20-gb", "telia-obegransad", "telia-obegransad-plus"]
  .map((id) => ABONNEMANG.find((a) => a.id === id))
  .filter((a): a is Abonnemang => !!a);

const HALLON_STUDENT = UNGA.find((a) => a.operator === "hallon" && a.gb === 20);
const HALLON_VANLIG = PRIVATA.find((a) => a.id === "hallon-hallon-10-gb");

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

const FAQ = [
  {
    q: "Vilket är det billigaste studentabonnemanget?",
    a: B20
      ? `Med minst 20 GB är ${vem(B20)} billigast, för ${kr(snittForstaAret(B20))} i månaden i snitt första året. Jämför med ${B20_ALLA ? `${kr(snittForstaAret(B20_ALLA))} för billigaste abonnemanget som alla kan teckna` : "vanliga abonnemang"}.`
      : "Se listan på sidan.",
  },
  {
    q: "Har Telia rabatt för unga?",
    a: `Ja. Telia ger ${TELIA_RABATT} kr i månaden i rabatt för den som är under 28 år på abonnemang med 20 GB och mer. Mobil 20 GB kostar då ${kr((TELIA_UNG[0]?.pris ?? 0) - TELIA_RABATT)} i stället för ${kr(TELIA_UNG[0]?.pris ?? 0)}. På 10 GB finns ingen ungdomsrabatt.`,
    kalla: "Telias webbplats, kontrollerad 2026-10-29",
  },
  {
    q: "Vilka operatörer har studentabonnemang?",
    a: `I jämförelsen har ${OPS.join(", ")} abonnemang med student- eller ungdomspris. Fello och Vimla har också studentpriser, men dem har vi inte kunnat kontrollera.`,
  },
  {
    q: "Hur visar jag att jag är student?",
    a: "Det skiljer sig mellan operatörerna och framgår inte alltid av deras sidor. Räkna med att operatören kan be dig visa att du studerar, och läs villkoren innan du beställer.",
  },
  {
    q: "Vad händer när jag inte längre är student?",
    a: "Det står i operatörens villkor. Räkna med att priset kan gå över till ordinarie pris. Ett abonnemang utan bindningstid kan du byta när som helst.",
  },
];

export const Route = createFileRoute("/ungdom")({
  head: () =>
    pageHead({
      title: "Mobilabonnemang för unga och studenter 2026 | Mobilpoolen",
      description: B20
        ? `Studentabonnemang med minst 20 GB från ${kr(snittForstaAret(B20))}/mån i snitt. Jämför ${UNGA.length} abonnemang för unga och studenter och Telias rabatt under 28 år.`
        : "Jämför mobilabonnemang för unga och studenter och Telias rabatt under 28 år.",
      canonical: "/ungdom",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilabonnemang för unga och studenter"
      ingress={
        <p>
          Som student eller ung får du ofta mer surf för pengarna. Med minst 20 GB är{" "}
          {B20 ? vem(B20) : ""} billigast för {B20 ? kr(snittForstaAret(B20)) : ""} i månaden i
          snitt första året
          {B20 && B20_ALLA
            ? `, mot ${kr(snittForstaAret(B20_ALLA))} för billigaste abonnemanget som alla kan teckna`
            : ""}
          . Vi jämför {UNGA.length} abonnemang med student- eller ungdomspris hos {OPS.length}{" "}
          operatörer. Telia ger dessutom {TELIA_RABATT} kr rabatt i månaden för den som är under 28
          år.
        </p>
      }
      nyckeltal={[
        ...(B20
          ? [
              {
                varde: kr(snittForstaAret(B20)),
                text: "billigast med minst 20 GB, snitt per månad",
              },
            ]
          : []),
        ...(B50 ? [{ varde: kr(snittForstaAret(B50)), text: "billigast med minst 50 GB" }] : []),
        { varde: `${TELIA_RABATT} kr`, text: "Telias rabatt per månad under 28 år, från 20 GB" },
      ]}
      jamforelse={<Jamforelse urval={arUng} forval={{ villkorade: true }} id="lista" />}
      jamforelseRubrik="Abonnemang med student- eller ungdomspris"
      jamforelseIngress="Listan visar bara abonnemang som operatören säljer till studenter eller unga. Kontrollera villkoren för vem som får teckna dem."
      faq={FAQ}
      lankar={[
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Jämför med abonnemang som alla kan teckna.",
        },
        {
          href: "/utan-bindningstid",
          label: "Utan bindningstid",
          text: "Byt när studierna tar slut.",
        },
        {
          href: "/barn",
          label: "Mobilabonnemang för barn",
          text: "För den som är under 18 år.",
        },
        {
          href: "/guider/surfa-i-eu",
          label: "Surfa i EU",
          text: "Utbytesstudier och resor: vad gäller?",
        },
        {
          href: "/operatorer/telia",
          label: "Telia",
          text: "Alla Telias abonnemang och villkor.",
        },
      ]}
      ctaRubrik="Hitta billigaste studentabonnemanget"
      ctaBild="vanner-middag-utomhus"
      uppdaterad="2026-10-29"
    >
      <h2>Vilka operatörer har studentabonnemang?</h2>
      <p>
        I jämförelsen har {OPS.join(", ")} abonnemang med student- eller ungdomspris. Fello och
        Vimla har också egna prislistor för studenter, men deras priser har vi inte kunnat
        kontrollera. Telia har ingen särskild studentprislista i jämförelsen men ger rabatt till den
        som är under 28 år.
      </p>

      <h2>Hur mycket billigare är ett studentabonnemang?</h2>
      {B20 && B20_ALLA && (
        <p>
          Med minst 20 GB kostar billigaste student- eller ungdomsabonnemanget{" "}
          {kr(snittForstaAret(B20))} i månaden i snitt första året. Billigaste abonnemanget som alla
          kan teckna kostar {kr(snittForstaAret(B20_ALLA))}.
          {B50 &&
            B50_ALLA &&
            ` Med minst 50 GB är det ${kr(snittForstaAret(B50))} mot ${kr(snittForstaAret(B50_ALLA))}.`}
        </p>
      )}
      {HALLON_STUDENT && HALLON_VANLIG && HALLON_VANLIG.pris === HALLON_STUDENT.pris && (
        <p>
          Hos Hallon får du dubbel surf som student till samma pris. {HALLON_STUDENT.namn} kostar{" "}
          {kr(HALLON_STUDENT.pris)} ordinarie, samma som vanliga {HALLON_VANLIG.namn}.
        </p>
      )}

      <h2>Telias rabatt för dig under 28 år</h2>
      <p>
        Telia ger {TELIA_RABATT} kr i månaden i rabatt för den som är under 28 år på abonnemang med
        20 GB och mer. På 10 GB finns ingen ungdomsrabatt. Så här blir priserna:
      </p>
      <GuideTable
        head={["Abonnemang", "Ordinarie", "Under 28 år"]}
        rows={TELIA_UNG.map((a) => [
          `Telia ${a.namn} (${a.gb == null ? "obegränsad" : gbText(a.gb)})`,
          kr(a.pris),
          kr(a.pris - TELIA_RABATT),
        ])}
      />
      <p>
        Telia har sitt eget nät, och 5G ingår i alla abonnemang. Startavgiften på 299 kr enligt
        prislistan slopas vid köp på nätet.
      </p>

      <h2>Vad ska du tänka på som student?</h2>
      <ul>
        <li>
          <strong>Vem får teckna.</strong> Läs villkoren. Hur operatören kontrollerar att du
          studerar framgår inte alltid av webbplatsen.
        </li>
        <li>
          <strong>Kampanjens längd.</strong> Flera studentabonnemang har ett lågt pris några
          månader. Snittpriset första året visar vad det kostar på riktigt.
        </li>
        <li>
          <strong>Bindningstid.</strong> Kampanjpriser kan kräva bindning. Utan bindning kan du byta
          när studierna tar slut eller när ett bättre pris dyker upp.
        </li>
        <li>
          <strong>EU-surf.</strong> Ska du plugga utomlands en termin, kolla hur mycket som gäller i
          EU. Roam like at home gäller i hela EU och EES, men stora abonnemang kan ha en gräns.
        </li>
      </ul>

      <h2>Vilket studentabonnemang ger mest surf för pengarna?</h2>
      <p>
        Räknat som kronor per GB vid ordinarie pris ger de stora surfmängderna mest för pengarna.
        {(() => {
          const perGb = [...UNGA]
            .filter((a) => a.gb != null && a.gb > 0)
            .sort((x, y) => x.pris / x.gb! - y.pris / y.gb!)[0];
          return perGb
            ? ` Lägst pris per GB har ${vem(perGb)}, ${gbText(perGb.gb)} för ${kr(perGb.pris)} i månaden ordinarie.`
            : "";
        })()}{" "}
        Men mer surf än du använder är bortkastade pengar. Ett abonnemang där surfen sparas gör att
        det du inte använder följer med till nästa månad, och Hallon skriver att all oanvänd surf
        sparas. Hur mycket du behöver kan du räkna ut i{" "}
        <Link to={"/verktyg/hur-mycket-surf-behover-jag" as never}>surfräknaren</Link>.
      </p>

      <h2>Gäller studentpriset utan bindningstid?</h2>
      <p>
        {UNGA.filter((a) => a.bindning === 0).length} av de {UNGA.length} abonnemangen med student-
        eller ungdomspris har ingen bindningstid. De som har bindning är kampanjvarianter där det
        låga priset de första månaderna kräver att du stannar i 12 månader. Räkna på snittpriset för
        året innan du binder dig.
      </p>

      <h2>Ska du plugga utomlands?</h2>
      <p>
        Inom EU, EES och Norge gäller Roam like at home till 2032, så du surfar och ringer som
        hemma. På stora abonnemang får operatören sätta en gräns för EU-surfen, och den står vid
        varje abonnemang i jämförelsen. Hos Comviq anges upp till 40 GB i EU för
        studentabonnemangen. Ska du vara borta länge kan operatören enligt reglerna för rimlig
        användning ta ut tillägg om du surfar mer utomlands än hemma under en längre tid. Läs mer i
        guiden om att <Link to={"/guider/surfa-i-eu" as never}>surfa i EU</Link>.
      </p>

      <h2>Under 18 år?</h2>
      <p>
        Den som är under 18 år kan inte teckna ett abonnemang själv. En vårdnadshavare står på
        avtalet. Comviq visar sitt studentabonnemang även för barn och skriver att målsman tecknar.
        Läs mer på sidan om <Link to={"/barn" as never}>mobilabonnemang för barn</Link>.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
      </p>
    </PelarSida>
  );
}
