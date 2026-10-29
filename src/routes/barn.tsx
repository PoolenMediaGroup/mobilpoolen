import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
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
  { name: "Mobilabonnemang för barn", path: "/barn" },
];

const BARN = sortera(
  PRIVATA.filter((a) => a.malgrupp?.includes("barn")),
  "snitt-ar",
);
const BARN_BILLIGAST = BARN[0];
const OBUNDNA = PRIVATA.filter((a) => !arVillkorat(a) && a.bindning === 0);
/** Små surfmängder utan bindningstid: upp till 5 GB. */
const SMA = sortera(
  OBUNDNA.filter((a) => a.gb != null && a.gb <= 5),
  "snitt-ar",
);
const SMA_BILLIGAST = SMA[0];
const B5 = billigastForBehov(OBUNDNA, 5);
const B10 = billigastForBehov(OBUNDNA, 10);
const KK = sortera(
  PRIVATA.filter((a) => a.kontantkort),
  "snitt-ar",
)[0];

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

const FAQ = [
  {
    q: "Vilket är det billigaste mobilabonnemanget för barn?",
    a: SMA_BILLIGAST
      ? `Utan bindningstid och med upp till 5 GB är ${vem(SMA_BILLIGAST)} billigast, för ${kr(snittForstaAret(SMA_BILLIGAST))} i månaden i snitt första året.${BARN_BILLIGAST ? ` Det enda abonnemanget i jämförelsen som operatören själv visar för barn är ${vem(BARN_BILLIGAST)}, ${kr(snittForstaAret(BARN_BILLIGAST))} i snitt.` : ""}`
      : "Ett litet abonnemang utan bindningstid räcker oftast. Se listan på sidan.",
  },
  {
    q: "Kan ett barn teckna ett eget mobilabonnemang?",
    a: "Nej, den som är under 18 år kan inte själv ingå ett abonnemangsavtal. En vårdnadshavare tecknar abonnemanget och står på avtalet och fakturan. Comviq skriver till exempel att målsman tecknar för den som är under 18.",
  },
  {
    q: "Hur mycket surf behöver ett barn?",
    a: "Det beror på ålder och hur mycket barnet är på wifi. För ett första abonnemang räcker ofta några GB, eftersom det mesta av surfandet sker hemma och i skolan. Har abonnemanget sparad surf tar barnet med sig det som blir över.",
  },
  {
    q: "Kontantkort eller abonnemang till barnet?",
    a: "Med kontantkort kan det aldrig kosta mer än det som laddats. Kontantkortet måste registreras, och det får användas av en närstående till den som det är registrerat på. Ett abonnemang med fast pris och utan bindning är ett alternativ som är lika förutsägbart.",
    kalla: "Lag (2022:482) om elektronisk kommunikation, 9 kap. 24–26 §§",
  },
  {
    q: "Hur spärrar jag köp i barnets mobil?",
    a: "Det finns två ställen: köpspärrar i telefonen och i appbutiken, och spärrar hos operatören för betaltjänster och köp som läggs på mobilfakturan. Hur du gör steg för steg står i vår guide om att spärra köp i barnets mobil.",
  },
];

export const Route = createFileRoute("/barn")({
  head: () =>
    pageHead({
      title: "Mobilabonnemang för barn 2026: billigaste valen | Mobilpoolen",
      description: SMA_BILLIGAST
        ? `Mobilabonnemang till barn från ${kr(snittForstaAret(SMA_BILLIGAST))}/mån utan bindningstid. Så väljer du surf, spärrar köp och vem som ska stå på avtalet.`
        : "Mobilabonnemang till barn: så väljer du surf, spärrar köp och vem som ska stå på avtalet.",
      canonical: "/barn",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilabonnemang för barn"
      ingress={
        <p>
          Ett barn behöver sällan mycket surf. Utan bindningstid och med upp till 5 GB är{" "}
          {SMA_BILLIGAST ? vem(SMA_BILLIGAST) : "ett litet abonnemang"} billigast för{" "}
          {SMA_BILLIGAST ? kr(snittForstaAret(SMA_BILLIGAST)) : ""} i månaden i snitt första året.
          {B10 && ` Med minst 10 GB är ${vem(B10)} billigast, för ${kr(snittForstaAret(B10))}.`} Det
          är vårdnadshavaren som tecknar avtalet, och spärrar för köp ställer du in i telefonen och
          hos operatören.
        </p>
      }
      nyckeltal={[
        ...(SMA_BILLIGAST
          ? [
              {
                varde: kr(snittForstaAret(SMA_BILLIGAST)),
                text: "billigast upp till 5 GB utan bindning, snitt per månad",
              },
            ]
          : []),
        ...(B10
          ? [{ varde: kr(snittForstaAret(B10)), text: "billigast med minst 10 GB utan bindning" }]
          : []),
        { varde: "18 år", text: "innan barnet kan teckna ett abonnemang själv" },
      ]}
      jamforelse={
        <div className="space-y-12">
          <Jamforelse forval={{ surf: "upp-till-5", utanBindning: true }} id="lista" />
          {BARN.length > 0 && (
            <div>
              <h2 className="mb-3 text-[24px] font-bold sm:text-[28px]">
                Abonnemang som operatören visar för barn
              </h2>
              <p className="mb-6 max-w-[680px] text-[16px] text-foreground/75">
                Comviq visar sitt studentabonnemang även på sin sida för barn, och där tecknar
                målsman för den som är under 18. Andra operatörer har inga särskilda barnabonnemang
                i vår jämförelse.
              </p>
              <Jamforelse forval={{ malgrupp: "barn" }} visaFilter={false} id="barnabonnemang" />
            </div>
          )}
        </div>
      }
      jamforelseRubrik="Små abonnemang utan bindningstid"
      jamforelseIngress="Upp till 5 GB och ingen bindningstid är förvalt. Ändra filtret om barnet behöver mer surf."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/forsta-mobilabonnemang-barn",
          label: "Första mobilabonnemanget till barnet",
          text: "Ålder, surf, telefon och avtal steg för steg.",
        },
        {
          href: "/guider/sparra-kop-barn-mobil",
          label: "Spärra köp i barnets mobil",
          text: "Spärrar i telefonen och hos operatören.",
        },
        {
          href: "/familjeabonnemang",
          label: "Familjeabonnemang",
          text: "Pris per medlem hos operatörerna.",
        },
        {
          href: "/kontantkort",
          label: "Kontantkort",
          text: "Betala i förväg och slippa överraskningar.",
        },
        {
          href: "/ungdom",
          label: "Ungdom och student",
          text: "Rabatterade abonnemang när barnet blir äldre.",
        },
      ]}
      ctaRubrik="Hitta ett första abonnemang till barnet"
      ctaBild="barn-cyklar-alle"
      uppdaterad="2026-10-29"
    >
      <h2>Vilket mobilabonnemang passar ett barn?</h2>
      <p>
        Ett abonnemang med liten surfmängd, fast pris och ingen bindningstid är en bra start. Barnet
        använder oftast wifi hemma och i skolan, så mobilsurfen behövs mest på vägen dit och hem.
        Utan bindningstid kan du byta till mer surf, eller mindre, när du ser hur mycket som går åt.
      </p>
      {SMA.length > 0 && (
        <p>
          Bland abonnemangen utan bindningstid med upp till 5 GB kostar de billigaste{" "}
          {SMA.slice(0, 3)
            .map((a) => `${vem(a)} (${gbText(a.gb)}, ${kr(snittForstaAret(a))})`)
            .join(", ")}{" "}
          i månaden i snitt första året.
          {B5 && ` Med minst 5 GB är ${vem(B5)} billigast.`}
        </p>
      )}

      <h2>Är sparad surf bra för barn?</h2>
      <p>
        Ja, ofta. Med sparad surf följer det barnet inte använder med till nästa månad. Ett barn som
        surfar lite en månad och mer nästa, till exempel på lovet, slipper då att surfen tar slut.{" "}
        {SMA.filter((a) => a.sparadSurf || /sparad surf/i.test(a.notis ?? "")).length > 0
          ? `Bland de små abonnemangen utan bindning anger ${[
              ...new Set(
                SMA.filter((a) => a.sparadSurf || /sparad surf/i.test(a.notis ?? "")).map(
                  (a) => operator(a.operator)?.namn,
                ),
              ),
            ].join(" och ")} att surfen sparas.`
          : ""}{" "}
        Hos Comviq sparas surfen bara på abonnemang med 12 GB eller mer. Läs mer i guiden om{" "}
        <Link to={"/guider/sparad-surf-dubbel-surf" as never}>sparad surf och dubbel surf</Link>.
      </p>

      <h2>Vem ska stå på barnets abonnemang?</h2>
      <p>
        Den som är under 18 år kan inte själv teckna ett abonnemang. En vårdnadshavare tecknar
        avtalet och står på fakturan. Det betyder också att det är den vuxna som ansvarar för det
        som debiteras, även köp och betaltjänster som läggs på mobilräkningen.
      </p>
      <p>
        När barnet fyller 18 kan abonnemanget överlåtas så att barnet själv står på det. Fråga
        operatören hur det går till.
      </p>

      <h2>Hur håller du koll på kostnaderna?</h2>
      <ul>
        <li>
          <strong>Fast pris utan extra surf.</strong> Välj ett abonnemang där surfen saktas ned
          eller tar slut i stället för att det kostar mer. Kontrollera vad operatören gör när surfen
          är slut.
        </li>
        <li>
          <strong>Spärra betaltjänster.</strong> Be operatören spärra köp som läggs på
          mobilfakturan, till exempel betal-sms och tredjepartstjänster.
        </li>
        <li>
          <strong>Köpspärr i telefonen.</strong> Både iPhone och Android har föräldrakontroller där
          köp i appar måste godkännas av en vuxen.
        </li>
        <li>
          <strong>Utlandssamtal.</strong> Samtal och sms till utlandet ingår inte alltid. Hos Hallon
          ingår de till exempel inte. Spärra dem om barnet inte behöver ringa utomlands.
        </li>
      </ul>
      <p>
        Hur du ställer in spärrarna står i guiden om att{" "}
        <Link to={"/guider/sparra-kop-barn-mobil" as never}>spärra köp i barnets mobil</Link>.
      </p>

      <h2>Kontantkort eller abonnemang till barnet?</h2>
      <p>
        Med kontantkort betalar du i förväg och det kan aldrig kosta mer än det som laddats.
        {KK &&
          ` Billigaste kontantkortspaketet i jämförelsen är ${vem(KK)} med ${KK.gb == null ? "obegränsad" : gbText(KK.gb)} för ${kr(KK.pris)} per 30 dagar.`}{" "}
        Sedan 1 augusti 2022 måste alla kontantkort registreras med namn, adress och personnummer.
        Ett kort som är registrerat på en förälder får användas av en närstående, alltså av barnet.
      </p>
      <p>
        Ett abonnemang med fast pris och utan bindningstid är lika förutsägbart, och slipper att
        någon behöver ladda. Läs mer på sidan om{" "}
        <Link to={"/kontantkort" as never}>kontantkort</Link>.
      </p>

      <h2>När är barnet redo för en egen mobil?</h2>
      <p>
        Det finns ingen ålder som gäller för alla. Fundera på vad mobilen ska användas till, om
        barnet tar sig själv till skolan och hur ni vill hantera skärmtid. Börja gärna med en liten
        surfmängd och utöka när det behövs. Fler tips finns i guiden om{" "}
        <Link to={"/guider/forsta-mobilabonnemang-barn" as never}>
          första mobilabonnemanget till barnet
        </Link>
        .
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
        Registrering av kontantkort: lagen (2022:482) om elektronisk kommunikation, 9 kap. 24–26 §§.
      </p>
    </PelarSida>
  );
}
