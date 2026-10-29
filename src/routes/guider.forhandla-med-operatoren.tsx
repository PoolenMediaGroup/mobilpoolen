import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  OL,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { MOBILNAT, PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, gbText, kr, snittForstaAret, totalKostnad } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "forhandla-med-operatoren";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "forbered", label: "Förbered dig innan du ringer" },
  { id: "be-om", label: "Vad kan du be om?" },
  { id: "samtalet", label: "Så för du samtalet" },
  { id: "byta-direkt", label: "När är det bättre att byta direkt?" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Går det att förhandla om priset på mobilabonnemanget?",
    a: "Det kan gå, men det finns ingen rätt till ett lägre pris. Det som ger dig ett starkt läge är att du vet vad samma surf kostar hos andra operatörer och att du kan byta. Har du ingen bindningstid kan du flytta numret när som helst.",
  },
  {
    q: "Vad gör jag om operatören säger nej?",
    a: "Byt, om du har hittat ett billigare abonnemang och saknar bindningstid. Beställ hos den nya operatören och välj nummerflytt. Den gamla operatören får inte ta betalt för att lämna ifrån sig numret.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
  {
    q: "Kan jag sänka surfmängden mitt i bindningstiden?",
    a: "Det beror på operatören. Telia skriver till exempel att det går att sänka surfmängden när du har 90 dagar eller mindre kvar av bindningstiden. Fråga din operatör vad som gäller.",
  },
  {
    q: "Ska jag acceptera ett nytt erbjudande med bindningstid?",
    a: "Bara om du har räknat på hela bindningstiden och jämfört med abonnemang utan bindning. En ny bindningstid gör att du inte kan byta utan att betala resten, om inte operatören ändrar villkoren till din nackdel.",
    kalla: "12 kap. 8 och 12 §§ lagen (2022:482) om elektronisk kommunikation",
  },
];

export const Route = createFileRoute("/guider/forhandla-med-operatoren")({
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

function namn(a: Abonnemang) {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

function natFor(a: Abonnemang) {
  const o = operator(a.operator);
  return o ? MOBILNAT[o.nat].kortText : "";
}

/** Abonnemang utan bindning som alla kan teckna, hos aktiva operatörer. */
const FRIA = PRIVATA.filter(
  (a) =>
    !a.kontantkort &&
    a.bindning === 0 &&
    operator(a.operator)?.aktiv &&
    !(a.malgrupp ?? []).some((m) => m !== "familj"),
);

/** Billigast i samma nät som `ref`, med minst lika mycket surf, på ordinarie pris. */
function billigastISammaNat(ref: Abonnemang) {
  const nat = operator(ref.operator)?.nat;
  return FRIA.filter(
    (a) =>
      a.operator !== ref.operator &&
      operator(a.operator)?.nat === nat &&
      (ref.gb == null ? a.gb == null : a.gb == null || a.gb >= ref.gb),
  ).sort((a, b) => a.pris - b.pris)[0];
}

function Page() {
  // Underlag att ta med till samtalet: vanliga abonnemang hos nätägarna och det
  // billigaste i samma nät, både ordinarie och snitt första året.
  const underlag = ["telia-mobil-20-gb", "tele2-mobil-obegransad", "tre-25-gb"]
    .map((id) => PRIVATA.find((a) => a.id === id))
    .filter((a): a is Abonnemang => !!a)
    .map((a) => ({ a, alt: billigastISammaNat(a) }))
    .filter((r): r is { a: Abonnemang; alt: Abonnemang } => !!r.alt);

  const exempel = underlag[0];

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Ta fram ditt jämförpris" }}
    >
      <P>
        Du får bäst läge i en förhandling med operatören om du vet exakt vad samma surf kostar hos
        andra och kan byta direkt. Ta reda på din förbrukning, ta fram ett konkret erbjudande och
        kolla om du har bindningstid. Säger operatören nej och du saknar bindning är det ofta
        enklare att flytta numret än att pruta.
      </P>

      <H2 id="forbered">Förbered dig innan du ringer</H2>
      <OL>
        <li>
          <strong>Kolla din förbrukning.</strong> Titta i mobilens inställningar hur mycket du
          surfat de senaste månaderna. Använd{" "}
          <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf behöver jag</A>.
        </li>
        <li>
          <strong>Läs din faktura.</strong> Notera vad du betalar i dag, inklusive tillval som
          streaming, extra SIM-kort och pappersfaktura.
        </li>
        <li>
          <strong>Kolla bindningstiden.</strong> Står det när den går ut? Utan bindning kan du byta
          när du vill, och det är ditt starkaste kort.
        </li>
        <li>
          <strong>Ta fram ett jämförpris.</strong> Hitta det billigaste abonnemanget med den surf du
          behöver, helst i samma nät, så att täckningen inte blir en invändning.
        </li>
      </OL>
      <P>Så här kan underlaget se ut för några vanliga abonnemang hos nätägarna:</P>
      <GuideTable
        brytForsta
        head={["Du har", "Ordinarie pris", "Samma nät, utan bindning", "Ordinarie", "Snitt år 1"]}
        rows={underlag.map(({ a, alt }) => [
          `${namn(a)} (${gbText(a.gb)})`,
          `${kr(a.pris)}/mån`,
          `${namn(alt)} (${gbText(alt.gb)}, ${natFor(alt)})`,
          `${kr(alt.pris)}/mån`,
          `${kr(snittForstaAret(alt))}/mån`,
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Snitt år 1
        räknar med kampanjpris och startavgift.
      </p>

      <H2 id="be-om">Vad kan du be om?</H2>
      <UL>
        <li>
          <strong>Ett lägre månadspris</strong> på samma abonnemang.
        </li>
        <li>
          <strong>Ett nyare abonnemang.</strong> Operatörerna byter ut sina abonnemang, och äldre
          varianter kan vara dyrare än dagens. Fråga vad de har i dag med samma surf.
        </li>
        <li>
          <strong>Mindre surf.</strong> Använder du mindre än du betalar för är det enklaste sättet
          att sänka priset. Telia skriver till exempel att du kan sänka surfmängden när du har 90
          dagar eller mindre kvar av bindningstiden.
        </li>
        <li>
          <strong>Mer surf till samma pris</strong> om du faktiskt behöver mer.
        </li>
        <li>
          <strong>Att ta bort tillval</strong> du inte använder.
        </li>
        <li>
          <strong>Familjepris</strong> om flera i hushållet har samma operatör. Se{" "}
          <A href="/familjeabonnemang">familjeabonnemang</A>.
        </li>
      </UL>

      <H2 id="samtalet">Så för du samtalet</H2>
      <P>
        Var konkret och vänlig. Det är lättare för kundtjänst att hjälpa dig om du säger exakt vad
        du vill ha.
      </P>
      {exempel ? (
        <Callout>
          Exempel: "Jag har {namn(exempel.a)} för {kr(exempel.a.pris)} i månaden. Hos{" "}
          {operator(exempel.alt.operator)?.namn} får jag {gbText(exempel.alt.gb)} i samma nät för{" "}
          {kr(exempel.alt.pris)} utan bindningstid. Kan ni ge mig ett pris som är i närheten, annars
          tänker jag flytta numret."
        </Callout>
      ) : null}
      <UL>
        <li>Be om att få erbjudandet skriftligt innan du säger ja.</li>
        <li>
          Fråga om det nya erbjudandet har bindningstid, hur länge priset gäller och vad det kostar
          efteråt.
        </li>
        <li>
          Räkna på hela perioden. Ett lägre pris i sex månader med ny bindningstid på 24 månader kan
          bli dyrare än att byta.
        </li>
      </UL>
      <P>
        Får du ett erbjudande med ny bindningstid, läs{" "}
        <A href="/guider/bindningstid-uppsagningstid">bindningstid och uppsägningstid</A> först.
        Bindningstiden får vara högst 24 månader.
      </P>

      <H2 id="byta-direkt">När är det bättre att byta direkt?</H2>
      <P>Ofta är ett byte både snabbare och billigare än en förhandling. Byt direkt om:</P>
      <UL>
        <li>du saknar bindningstid och har hittat ett billigare abonnemang,</li>
        <li>operatören bara erbjuder ett lägre pris mot ny bindningstid,</li>
        <li>skillnaden är stor, som i tabellen ovan.</li>
      </UL>
      {exempel ? (
        <P>
          I exemplet ovan är skillnaden {kr(exempel.a.pris - exempel.alt.pris)} i månaden på
          ordinarie pris. Det blir {kr((exempel.a.pris - exempel.alt.pris) * 12)} på ett år, och
          första året med kampanj blir skillnaden{" "}
          {kr(totalKostnad(exempel.a, 12) - totalKostnad(exempel.alt, 12))}.
        </P>
      ) : null}
      <P>
        Ett byte är enkelt: du beställer hos den nya operatören, väljer att flytta numret och den
        nya operatören sköter resten. Avbrottet får vara högst en arbetsdag. Steg för steg i{" "}
        <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>. Har du
        bindningstid kvar, räkna först i{" "}
        <A href="/guider/byta-operator-med-bindningstid">byta operatör med bindningstid</A>. Fler
        sätt att spara finns i <A href="/guider/sank-mobilrakningen">sänk mobilräkningen</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
