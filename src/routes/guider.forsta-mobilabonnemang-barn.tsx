import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { billigastForBehov, datumText, gbText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import { MARKNAD } from "@/lib/mobil/fakta";

const SLUG = "forsta-mobilabonnemang-barn";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "avtalet", label: "Vem står på avtalet?" },
  { id: "kontantkort-eller-abonnemang", label: "Kontantkort eller abonnemang?" },
  { id: "surf", label: "Hur mycket surf behöver barnet?" },
  { id: "pris", label: "Vad kostar det?" },
  { id: "sparrar", label: "Spärrar och inställningar" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Kan ett barn teckna ett eget mobilabonnemang?",
    a: "Nej, inte på egen hand. Den som är under 18 år är omyndig, så det är vårdnadshavaren som tecknar avtalet och ansvarar för betalningen. Barnet kan använda abonnemanget och telefonnumret.",
  },
  {
    q: "Måste ett kontantkort till ett barn registreras?",
    a: "Ja. Sedan den 1 augusti 2022 måste alla kontantkort registreras med namn, adress och personnummer innan de används. Ett kontantkort som en förälder registrerat får användas av närstående, till exempel ett barn.",
  },
  {
    q: "Hur mycket surf behöver ett barn?",
    a: `Det beror på hur mycket barnet är på wifi. Snittet för alla abonnemang med samtal och data i Sverige var ${MARKNAD.surfPerManad} GB i månaden 2025 enligt PTS. Ett yngre barn som mest använder mobilen hemma klarar sig ofta med betydligt mindre.`,
  },
  {
    q: "Ska barnets abonnemang ha bindningstid?",
    a: "Helst inte. Utan bindningstid kan du byta surfmängd eller operatör när behovet ändras. Bindningstiden får aldrig vara längre än 24 månader enligt lagen om elektronisk kommunikation.",
  },
];

export const Route = createFileRoute("/guider/forsta-mobilabonnemang-barn")({
  head: () =>
    pageHead({
      title: `${guide.title} | Mobilpoolen`,
      description: guide.excerpt,
      socialTitle: guide.title,
      canonical: `/guider/${SLUG}`,
      ogType: "article",
      scripts: [
        guideBreadcrumb(guide.title, `/guider/${SLUG}`),
        articleJsonLd({
          title: guide.title,
          description: guide.excerpt,
          path: `/guider/${SLUG}`,
          publishedIso: guide.publishedIso,
          updatedIso: guide.updatedIso,
        }),
        faqJsonLd(FAQ),
      ],
    }),
  component: Page,
});

function Page() {
  // Utan bindningstid och utan ålders- eller studentkrav.
  const utanBindning = PRIVATA.filter(
    (a) =>
      operator(a.operator)?.aktiv &&
      a.bindning === 0 &&
      !a.malgrupp?.some((m) => m === "senior" || m === "student" || m === "ung"),
  );
  const behov = [1, 3, 5, 10, 20];
  const billigast = behov
    .flatMap((gb) => {
      const a = billigastForBehov(utanBindning, gb);
      return a ? [{ gb, a }] : [];
    })
    // Samma abonnemang kan vara billigast för flera behov. Visa det en gång.
    .filter((r, i, alla) => alla.findIndex((x) => x.a.id === r.a.id) === i);
  const barnAbb = PRIVATA.filter((a) => a.malgrupp?.includes("barn") && a.bindning === 0);

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang för barn", to: "/barn" }}
    >
      <P>
        Barnets första mobilabonnemang tecknas av en vårdnadshavare, eftersom den som är under 18 år
        inte kan ingå avtalet själv. Välj en liten surfmängd utan bindningstid, eller ett
        kontantkort om du vill ha full kontroll på kostnaden. Spärra betaltjänster och köp via
        mobilräkningen från början.
      </P>

      <H2 id="avtalet">Vem står på avtalet?</H2>
      <P>
        Den som är under 18 år är omyndig och kan inte själv teckna ett mobilabonnemang med faktura.
        Det är därför vårdnadshavaren som tecknar avtalet och ansvarar för att räkningen betalas.
        Comviq skriver till exempel på sin sida för barn att målsman tecknar abonnemanget.
      </P>
      <P>
        Innan avtalet gäller ska operatören ge dig en kort och lättläst avtalssammanfattning, och du
        ska bekräfta att du vill ingå avtalet. Läs den. Där står pris, surfmängd, bindningstid och
        vad som händer när surfen tar slut.
      </P>

      <H2 id="kontantkort-eller-abonnemang">Kontantkort eller abonnemang?</H2>
      <GuideTable
        head={["", "Kontantkort", "Abonnemang utan bindning"]}
        rows={[
          ["Kostnad", "Bara det du har laddat", "Fast pris varje månad"],
          ["Risk för höga räkningar", "Låg, saldot tar slut", "Beror på spärrar och tillägg"],
          ["Registrering", "Krävs sedan 1 augusti 2022", "Görs när du tecknar"],
          ["Passar", "Yngre barn, första mobilen", "Äldre barn som surfar mer"],
        ]}
      />
      <P>
        Sedan den 1 augusti 2022 måste alla kontantkort registreras innan de används, med namn,
        adress och personnummer. Identiteten kontrolleras med id-handling eller e-legitimation.
        Kortet får användas av närstående, så ett barn kan använda ett kort som föräldern har
        registrerat. Läs mer om <A href="/kontantkort">kontantkort</A>.
      </P>

      <H2 id="surf">Hur mycket surf behöver barnet?</H2>
      <P>
        Enligt PTS använde abonnemang med samtal och data i snitt {MARKNAD.surfPerManad} GB i
        månaden 2025. Det snittet gäller alla åldrar. Ett barn som är på wifi hemma och i skolan
        behöver ofta mycket mindre. Det som drar mest är video. Enligt PTS schablon motsvarar en
        timmes film i HD omkring 3 GB.
      </P>
      <UL>
        <li>
          <strong>Sms, samtal och lite chatt:</strong> några få GB räcker långt.
        </li>
        <li>
          <strong>Musik och sociala medier på bussen:</strong> räkna med mer.
        </li>
        <li>
          <strong>Video utanför wifi:</strong> då går surfen fort.
        </li>
      </UL>
      <P>
        Börja lågt och höj vid behov. Se{" "}
        <A href="/guider/hur-mycket-surf-drar-appar">hur mycket surf apparna drar</A> och{" "}
        <A href="/guider/racker-5-gb-surf">räcker 5 GB surf?</A>
      </P>

      <H2 id="pris">Vad kostar det?</H2>
      <P>
        Tabellen visar det abonnemang utan bindningstid som är billigast första året för några små
        surfmängder. Snittet räknar in kampanjpris och startavgift.
      </P>
      <GuideTable
        brytForsta
        head={["Minst", "Billigast första året", "Ordinarie pris", "Snitt år 1"]}
        rows={billigast.map(({ gb, a }) => [
          `${gb} GB`,
          `${operator(a.operator)?.namn ?? a.operator} ${a.namn} (${gbText(a.gb)})`,
          `${kr(a.pris)}/mån`,
          `${kr(snittForstaAret(a))}/mån`,
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Abonnemang
        med ålders- eller studentkrav är inte med.
      </p>
      <P>
        {barnAbb.length > 0
          ? `${barnAbb
              .map(
                (a) =>
                  `${operator(a.operator)?.namn ?? a.operator} visar ${a.namn} för ${kr(a.pris)} i månaden`,
              )
              .join(" och ")} även på sin sida för barn under 18. `
          : ""}
        Jämför fler på <A href="/barn">mobilabonnemang för barn</A> och{" "}
        <A href="/ungdom">för ungdomar</A>. Har familjen flera abonnemang, se{" "}
        <A href="/familjeabonnemang">familjeabonnemang</A>.
      </P>

      <H2 id="sparrar">Spärrar och inställningar</H2>
      <P>Gör det här innan barnet får telefonen:</P>
      <UL>
        <li>Be operatören spärra betaltjänster, betalsms och köp som läggs på mobilräkningen.</li>
        <li>Stäng av dataroaming om barnet ska resa utanför EU.</li>
        <li>Slå på föräldrakontroll i telefonen, så att köp i appar kräver ditt godkännande.</li>
        <li>Lär barnet att aldrig svara på sms med länkar från okända.</li>
      </UL>
      <Callout>
        En steg-för-steg-genomgång finns i guiden{" "}
        <A href="/guider/sparra-kop-barn-mobil">spärra köp och betalsamtal på barnens mobil</A>.
      </Callout>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: PTS, Svensk telekommarknad 2025; lagen (2022:482) om elektronisk kommunikation, 9
        kap. 24–26 §§ och 12 kap. 1 och 8 §§; operatörernas webbplatser.
      </p>
    </GuidePage>
  );
}
