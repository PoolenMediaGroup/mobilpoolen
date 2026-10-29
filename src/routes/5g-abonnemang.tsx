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
} from "@/lib/mobil/berakna";
import { KALLOR, MARKNAD, OPENSIGNAL, TACKNING } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "5G-abonnemang", path: "/5g-abonnemang" },
];

const OPPNA = PRIVATA.filter((a) => !arVillkorat(a));
const FEMG = OPPNA.filter((a) => a.femg);
const UTAN_5G = OPPNA.filter((a) => !a.femg);
const OPS_UTAN_5G = [...new Set(UTAN_5G.map((a) => operator(a.operator)?.namn))].filter(
  Boolean,
) as string[];
const BILLIGAST = billigastForBehov(FEMG, 0);
const B10 = billigastForBehov(FEMG, 10);
const OBEGR = billigastForBehov(
  FEMG.filter((a) => a.gb == null),
  0,
);
const FEMG_DL = OPENSIGNAL.find((r) => r.kategori.startsWith("5G nedladdning"));
const FEMG_UL = OPENSIGNAL.find((r) => r.kategori.startsWith("5G uppladdning"));

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

const FAQ = [
  {
    q: "Vilket är det billigaste 5G-abonnemanget?",
    a: BILLIGAST
      ? `${vem(BILLIGAST)} med ${BILLIGAST.gb == null ? "obegränsad" : gbText(BILLIGAST.gb)} surf, för ${kr(snittForstaAret(BILLIGAST))} i månaden i snitt första året.${B10 ? ` Med minst 10 GB är ${vem(B10)} billigast, ${kr(snittForstaAret(B10))}.` : ""}`
      : "Se listan på sidan.",
  },
  {
    q: "Hur bra är 5G-täckningen i Sverige?",
    a: `I september 2025 aktiverade Tele2 och Telenor 5G i hela sitt gemensamma nät, som då täckte ${TACKNING.n4m5gYta} procent av Sveriges landyta och ${TACKNING.n4m5gBefolkning} procent av befolkningen. Telias 4G- och 5G-nät når ${TACKNING.telia4g5gBefolkning} procent av befolkningen enligt Telia.`,
    kalla: "Tele2 pressmeddelande september 2025, Telia",
  },
  {
    q: "Hur många använder 5G?",
    a: `${MARKNAD.femgAbonnemang} mobilabonnemang använde 5G-nätet under 2025, ungefär ${MARKNAD.femgAndel} procent av alla abonnemang.`,
    kalla: "PTS, Svensk telekommarknad 2025",
  },
  {
    q: "Kostar 5G extra?",
    a: `Nej, inte hos de flesta. ${FEMG.length} av ${OPPNA.length} abonnemang i jämförelsen har 5G utan tillägg. Det som skiljer är ofta maxhastigheten, som vissa operatörer begränsar.`,
  },
  {
    q: "Behöver jag 5G?",
    a: "Inte för att ringa eller surfa i vardagen. 4G räcker för det mesta. 5G ger mer kapacitet där många surfar samtidigt och högre hastighet där det finns täckning. Har abonnemanget 5G utan extra kostnad finns ingen anledning att välja bort det, men telefonen måste stödja 5G.",
  },
];

export const Route = createFileRoute("/5g-abonnemang")({
  head: () =>
    pageHead({
      title: "5G-abonnemang 2026: billigaste med 5G | Mobilpoolen",
      description: BILLIGAST
        ? `Billigaste 5G-abonnemanget kostar ${kr(snittForstaAret(BILLIGAST))}/mån i snitt. Jämför ${FEMG.length} abonnemang med 5G och se täckningen i näten.`
        : "Jämför abonnemang med 5G och se täckningen i näten.",
      canonical: "/5g-abonnemang",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="5G-abonnemang: jämför billigaste med 5G"
      ingress={
        <p>
          {FEMG.length} av {OPPNA.length} abonnemang i jämförelsen har 5G utan extra kostnad.
          Billigast är {BILLIGAST ? vem(BILLIGAST) : "–"} för{" "}
          {BILLIGAST ? kr(snittForstaAret(BILLIGAST)) : ""} i månaden i snitt första året
          {B10 ? `, och med minst 10 GB ${vem(B10)} för ${kr(snittForstaAret(B10))}` : ""}. Tele2s
          och Telenors gemensamma 5G-nät täcker {TACKNING.n4m5gYta} procent av Sveriges yta, och{" "}
          {MARKNAD.femgAndel} procent av abonnemangen använde 5G 2025.
        </p>
      }
      nyckeltal={[
        { varde: `${MARKNAD.femgAndel} %`, text: "av alla mobilabonnemang använde 5G 2025 (PTS)" },
        {
          varde: `${TACKNING.n4m5gYta} %`,
          text: "av landytan har 5G i Tele2s och Telenors nät sedan september 2025",
        },
        ...(BILLIGAST
          ? [
              {
                varde: kr(snittForstaAret(BILLIGAST)),
                text: "billigaste 5G-abonnemanget, snitt per månad",
              },
            ]
          : []),
      ]}
      jamforelse={
        <div className="space-y-12">
          <BilligastTabell filter={(a) => a.femg && !arVillkorat(a)} />
          <Jamforelse forval={{ bara5g: true }} id="lista" />
        </div>
      }
      jamforelseRubrik="Billigast med 5G per surfmängd"
      jamforelseIngress="Tabellen visar billigaste abonnemanget med 5G på varje surfnivå. Under den finns hela listan, där filtret för 5G redan är på."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/behover-jag-5g",
          label: "Behöver jag 5G?",
          text: "Vad 5G ger i praktiken, och när det inte spelar roll.",
        },
        {
          href: "/nat",
          label: "Mobilnät och täckning",
          text: "Vad PTS och Opensignal säger om näten.",
        },
        {
          href: "/guider/2g-3g-nedslackning",
          label: "2G och 3G släcks",
          text: "Vad nedsläckningen betyder för din telefon.",
        },
        {
          href: "/obegransad-surf",
          label: "Obegränsad surf",
          text: "Billigaste obegränsade, och vilka som har hastighetstak.",
        },
        {
          href: "/esim",
          label: "eSIM",
          text: "Vilka operatörer som har eSIM.",
        },
      ]}
      ctaRubrik="Hitta billigaste abonnemanget med 5G"
      ctaBild="mobilmast-bla-himmel"
      uppdaterad="2026-10-29"
    >
      <h2>Vilka abonnemang har 5G?</h2>
      <p>
        De flesta. {FEMG.length} av {OPPNA.length} abonnemang som alla kan teckna i jämförelsen har
        5G enligt operatören.{" "}
        {OPS_UTAN_5G.length > 0 &&
          `För abonnemangen hos ${OPS_UTAN_5G.join(" och ")} anger operatören inte att 5G ingår, så de syns inte när filtret för 5G är på.`}{" "}
        I de abonnemang som har 5G ingår det i priset. Det som skiljer är maxhastigheten, som flera
        operatörer begränsar till exempelvis 100 Mbit/s.
      </p>
      {OBEGR && (
        <p>
          Billigaste obegränsade abonnemanget med 5G är {vem(OBEGR)} för{" "}
          {kr(snittForstaAret(OBEGR))} i månaden i snitt första året
          {OBEGR.hastighet ? `, med maxhastighet ${OBEGR.hastighet}` : ""}.
        </p>
      )}

      <h2>Hur bra är 5G-täckningen?</h2>
      <p>
        I september 2025 aktiverade Tele2 och Telenor 5G i hela sitt gemensamma nät, som byggs av
        Net4Mobility. 5G-täckningen ökade då från 25 till {TACKNING.n4m5gYta} procent av Sveriges
        landyta och når {TACKNING.n4m5gBefolkning} procent av befolkningen, samma utbredning som 4G.
        Täckningen gäller även operatörer som kör i Tele2s och Telenors nät, till exempel Comviq, om
        deras abonnemang har 5G.
      </p>
      <p>
        Telia anger att dess 4G- och 5G-nät når {TACKNING.telia4g5gBefolkning} procent av
        befolkningen och över {TACKNING.telia4g5gYta} procent av landytan. Telia redovisar inte ren
        5G-täckning separat i den källa vi har. För Tres 5G-täckning har vi ingen siffra i procent.
      </p>
      <p>
        Enligt PTS fanns grundläggande mobiltäckning utomhus på {TACKNING.ptsYta} procent av
        Sveriges yta i november 2025. Den siffran räknar alla nät tillsammans, inte 5G för sig.
      </p>

      <h2>Hur snabbt är 5G?</h2>
      <p>
        I Opensignals mätning från december 2025, med data från juli till september 2025, hade{" "}
        {FEMG_DL ? `${FEMG_DL.vinnare} snabbast nedladdning över 5G, ${FEMG_DL.varde}` : ""}
        {FEMG_UL ? `, och ${FEMG_UL.vinnare} snabbast uppladdning, ${FEMG_UL.varde}` : ""}. Det är
        medelvärden från användarnas telefoner, inte det högsta som går. Ett abonnemang med
        hastighetstak får aldrig högre fart än taket, oavsett nät.
      </p>

      <h2>Vilka 5G-abonnemang har hastighetstak?</h2>
      <p>
        Att 5G ingår betyder inte att du får full fart. Flera operatörer anger en maxhastighet.
        {(() => {
          const tak = FEMG.filter((a) =>
            /100\s*Mbit|150\s*Mbit|10\s*Mbit/i.test(a.hastighet ?? ""),
          );
          const ops = [...new Set(tak.map((a) => operator(a.operator)?.namn))].filter(Boolean);
          return ops.length
            ? ` Bland 5G-abonnemangen i jämförelsen anger ${ops.join(", ")} ett tak på 150 Mbit/s eller lägre för minst ett abonnemang.`
            : "";
        })()}{" "}
        Det räcker för det mesta i en mobil, men du får inte de högsta hastigheterna som 5G-näten
        klarar. Maxhastigheten står i detaljerna för varje abonnemang i jämförelsen.
      </p>

      <h2>Hur många använder 5G?</h2>
      <p>
        Enligt PTS använde {MARKNAD.femgAbonnemang} mobilabonnemang 5G-nätet under 2025, ungefär{" "}
        {MARKNAD.femgAndel} procent av alla. Ungefär 30 procent av all mobil datatrafik gick i
        5G-näten. Samtal går fortfarande över 4G (VoLTE). Inga operatörer erbjöd samtal i 5G-nätet
        2025.
      </p>

      <h2>Behöver du 5G?</h2>
      <p>
        För samtal, sociala medier och musik räcker 4G gott. 5G märks mest där många surfar
        samtidigt, som på arenor och stationer, och när du laddar ner stora filer. Eftersom 5G ingår
        utan extra kostnad i de flesta abonnemang behöver du sällan välja. Telefonen måste dock
        stödja 5G för att du ska få det. Mer i guiden{" "}
        <Link to={"/guider/behover-jag-5g" as never}>behöver jag 5G</Link>.
      </p>

      <h2>Vad betyder 2G- och 3G-nedsläckningen?</h2>
      <p>
        Tele2, Telenor och Tre stängde 2G och 3G den 1 december 2025, och Telia behåller 2G till
        slutet av 2027. En telefon som inte kan ringa över 4G kan inte ringa i Tele2s, Telenors och
        Tres nät. Har du en äldre telefon, läs guiden om{" "}
        <Link to={"/guider/2g-3g-nedslackning" as never}>2G- och 3G-nedsläckningen</Link>.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.{" "}
        <a href={KALLOR.n4m5g.url} target="_blank" rel="noopener nofollow">
          {KALLOR.n4m5g.namn}
        </a>
        .{" "}
        <a href={KALLOR.ptsMarknad.url} target="_blank" rel="noopener nofollow">
          {KALLOR.ptsMarknad.namn}
        </a>
        .{" "}
        <a href={KALLOR.ptsTackning.url} target="_blank" rel="noopener nofollow">
          {KALLOR.ptsTackning.namn}
        </a>
        .{" "}
        <a href={KALLOR.opensignal.url} target="_blank" rel="noopener nofollow">
          {KALLOR.opensignal.namn}
        </a>
        .
      </p>
    </PelarSida>
  );
}
