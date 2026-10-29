import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  H3,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { bindningText, datumText, gbText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "sparad-surf-dubbel-surf";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

/** Operatörer vars kampanj med dubbel surf vi har kunnat kontrollera. */
const DUBBEL_OPERATORER = ["hallon", "comviq"];

const allmant = (a: Abonnemang) =>
  !a.malgrupp?.some((m) => m === "senior" || m === "student" || m === "ung");

/** Abonnemang med dubbel surf enligt kampanjtexten, för alla kunder. */
const DUBBEL = PRIVATA.filter(
  (a) =>
    DUBBEL_OPERATORER.includes(a.operator) &&
    a.gb != null &&
    allmant(a) &&
    /dubbel surf/i.test(a.kampanjText ?? ""),
).sort((a, b) => a.operator.localeCompare(b.operator) || (a.gb ?? 0) - (b.gb ?? 0));

const namn = (a: Abonnemang) => `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;

/** Hallon: dubbel surf så länge man inte byter prisplan. Comviq: i 12 månader. */
function hurLange(a: Abonnemang): string {
  if (a.operator === "hallon") return "Tills du byter prisplan";
  if (a.operator === "comviq") return "12 månader";
  return "Framgår inte";
}

const TOC = [
  { id: "sparad-surf", label: "Vad är sparad surf?" },
  { id: "vem-har", label: "Vilka har sparad surf?" },
  { id: "dubbel-surf", label: "Vad är dubbel surf?" },
  { id: "kampanjer", label: "Dubbel surf just nu" },
  { id: "lonar-sig", label: "Sparar det pengar?" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad betyder sparad surf?",
    a: "Sparad surf betyder att den surf du inte använder under en månad flyttas över till nästa. Hur mycket som får sparas och hur länge skiljer sig mellan operatörerna. Hos de flesta försvinner den sparade surfen om du säger upp abonnemanget.",
  },
  {
    q: "Vad betyder dubbel surf?",
    a: "Dubbel surf är en kampanj där du får dubbelt så mycket surf som abonnemanget normalt har, till samma pris. Kampanjen gäller en begränsad tid eller så länge du behåller samma abonnemang, beroende på operatören.",
  },
  {
    q: "Har Comviq sparad surf?",
    a: "Ja, på abonnemang med 12 GB eller mer enligt Comviq. Det minsta abonnemanget med 5 GB har inte sparad surf.",
    kalla: `Comviqs webbplats, kontrollerad ${datumText(SENAST_KONTROLLERAD)}`,
  },
  {
    q: "Har Tre sparad surf?",
    a: "Nej. Enligt Tres prislista förs surf som inte används inte över till nästa månad. Hallon, som ägs av samma bolag och kör i samma nät, har däremot sparad surf.",
    kalla: `Tres prislista och Hallons webbplats, kontrollerade ${datumText(SENAST_KONTROLLERAD)}`,
  },
];

export const Route = createFileRoute("/guider/sparad-surf-dubbel-surf")({
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
  // Hallons minsta abonnemang med dubbel surf jämfört med abonnemanget som har samma surf ordinarie.
  const hallonFem = DUBBEL.find((a) => a.operator === "hallon");
  const hallonMotsvarande = hallonFem
    ? PRIVATA.find((a) => a.operator === "hallon" && allmant(a) && a.gb === (hallonFem.gb ?? 0) * 2)
    : undefined;

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang med mer surf" }}
    >
      <P>
        Sparad surf betyder att surf du inte använder flyttas till nästa månad. Dubbel surf är en
        kampanj där du får dubbelt så mycket surf till samma pris. Hallon, Comviq, Telia och Fello
        har sparad surf i olika former. Hallon och Comviq har just nu kampanjer med dubbel surf.
        Båda kan ge mer surf för pengarna, men villkoren skiljer.
      </P>

      <H2 id="sparad-surf">Vad är sparad surf?</H2>
      <P>
        Med sparad surf, ibland kallad surfpott eller rollover, försvinner inte det du har kvar när
        månaden är slut. Har du ett abonnemang med 10 GB och använder 6 GB får du med dig resten
        till nästa månad.
      </P>
      <P>Det som skiljer mellan operatörerna:</P>
      <UL>
        <li>
          <strong>Hur mycket som får sparas.</strong> Vissa har ett tak, till exempel 50 eller 100
          GB.
        </li>
        <li>
          <strong>Hur länge.</strong> Hos vissa ligger sparad surf kvar en viss tid, till exempel 90
          dagar.
        </li>
        <li>
          <strong>Vilka abonnemang.</strong> Ibland gäller det bara större surfmängder.
        </li>
        <li>
          <strong>Vad som händer vid uppsägning.</strong> Den sparade surfen följer inte med till en
          ny operatör.
        </li>
      </UL>

      <H2 id="vem-har">Vilka operatörer har sparad surf?</H2>
      <P>Så här beskriver operatörerna det på sina egna sidor:</P>
      <GuideTable
        brytForsta
        head={["Operatör", "Sparad surf enligt operatören"]}
        rows={[
          ["Hallon", "Ja, oanvänd surf sparas till nästa månad"],
          ["Comviq", "Ja, på abonnemang med 12 GB eller mer"],
          ["Telia", "Surfpott: sparad surf upp till 50 GB på 10 GB och 20 GB"],
          [
            "Fello",
            "Upp till 100 GB på abonnemang från 2 juni 2025. Försvinner när abonnemanget sägs upp",
          ],
          ["Tellus Mobil", "Sparad surf i 90 dagar"],
          ["Lyca Mobile", "Outnyttjad data sparas enligt paketsidorna"],
          ["Tre", "Nej, oanvänd surf förs inte över till nästa månad"],
        ]}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser och prislistor, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}. Övriga operatörer anger inte sparad surf eller så har vi
        inte kunnat kontrollera det.
      </p>
      <P>
        Notera att Hallon och Tre ägs av samma bolag och kör i samma nät, men bara Hallon har sparad
        surf. Det är ett bra exempel på att villkoren skiljer även inom samma nät. Mer om det i
        guiden <A href="/guider/vilket-nat-anvander-operatoren">vilket nät använder operatören</A>.
      </P>

      <H2 id="dubbel-surf">Vad är dubbel surf?</H2>
      <P>
        Dubbel surf är en kampanj för att locka nya kunder. Du betalar för en viss surfmängd men får
        dubbelt så mycket. Det finns två saker att hålla koll på:
      </P>
      <UL>
        <li>
          <strong>Hur länge kampanjen gäller.</strong> Hos Comviq gäller dubbel surf i 12 månader.
          Hos Hallon gäller den så länge du inte byter prisplan.
        </li>
        <li>
          <strong>Om den kräver bindningstid.</strong> Comviqs kampanj kräver 12 månaders
          bindningstid. Hallons abonnemang har ingen bindningstid.
        </li>
      </UL>
      <Callout>
        Hos Hallon försvinner dubbel surf om du byter prisplan. Välj därför en surfmängd du tror att
        du kommer att stanna på.
      </Callout>

      <H2 id="kampanjer">Dubbel surf just nu</H2>
      <P>
        Här är abonnemangen med dubbel surf hos Hallon och Comviq som alla kan teckna. Surfmängden
        med kampanjen står i andra kolumnen.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Med dubbel surf", "Hur länge", "Snitt år 1", "Bindningstid"]}
        rows={DUBBEL.map((a) => [
          namn(a).replace(" (kampanj)", ""),
          gbText((a.gb ?? 0) * 2),
          hurLange(a),
          `${kr(snittForstaAret(a))}/mån`,
          bindningText(a.bindning),
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
        Snittpriset räknar med kampanjpriset de första månaderna. Kampanjer ändras ofta, kontrollera
        hos operatören innan du beställer.
      </p>
      <H3>Andra kampanjer med dubbel surf</H3>
      <P>
        Fello anger dubbel surf i 24 månader för nya beställningar, i en kampanj som gäller till och
        med 1 november 2026. Fellos aktuella surfmängder och priser har vi inte kunnat läsa, så
        Fello finns inte i tabellen. Läs alltid kampanjvillkoren hos operatören. Vad som händer med
        priset efteråt beskrivs i guiden om{" "}
        <A href="/guider/kampanjpris-efter-kampanjen">kampanjpris efter kampanjen</A>.
      </P>

      <H2 id="lonar-sig">Sparar sparad surf och dubbel surf pengar?</H2>
      <P>
        <strong>Sparad surf</strong> sparar pengar om din förbrukning varierar. En lugn månad
        betalar för en intensiv, så du kan välja en mindre surfmängd utan att få slut. Använder du
        ungefär lika mycket varje månad gör det mindre skillnad.
      </P>
      <P>
        <strong>Dubbel surf</strong> sparar pengar om du annars hade behövt ett större abonnemang.
        {hallonFem && hallonMotsvarande && (
          <>
            {" "}
            Med Hallons kampanj får du till exempel {gbText((hallonFem.gb ?? 0) * 2)} för{" "}
            {kr(hallonFem.pris)} i månaden ordinarie, medan abonnemanget med{" "}
            {gbText(hallonMotsvarande.gb)} kostar {kr(hallonMotsvarande.pris)} ordinarie.
          </>
        )}{" "}
        Använder du inte surfen gör kampanjen ingen skillnad alls.
      </P>
      <P>
        Börja med att ta reda på hur mycket du använder. Se{" "}
        <A href="/guider/hur-mycket-surf-drar-appar">hur mycket surf olika appar drar</A> eller
        räkna med verktyget{" "}
        <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf behöver jag</A>. Tar surfen
        slut ändå, läs <A href="/guider/nar-surfen-tar-slut">när surfen tar slut</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
