import { createFileRoute } from "@tanstack/react-router";
import { A, Callout, FaqAccordion, GuidePage, GuideTable, H2, P, UL } from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, gbText, kr, snittForstaAret, totalKostnad } from "@/lib/mobil/berakna";

const SLUG = "kampanjpris-efter-kampanjen";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "sa-fungerar", label: "Så fungerar ett kampanjpris" },
  { id: "rakna", label: "Räkna på hela året" },
  { id: "just-nu", label: "Kampanjerna just nu" },
  { id: "efter", label: "När kampanjen tar slut" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad händer när kampanjpriset på mobilabonnemanget tar slut?",
    a: "Abonnemanget går automatiskt över till ordinarie pris, som står i avtalet och på operatörens sida. Du får ingen ny bekräftelse. Har abonnemanget ingen bindningstid kan du byta till en annan operatör när kampanjen är slut.",
  },
  {
    q: "Måste operatören säga till när kampanjen tar slut?",
    a: "Nej, inte om kampanjens längd och priset efteråt stod i avtalet från början. Det är en del av det du godkände. Höjer operatören ordinarie priset är det däremot en villkorsändring som du ska få besked om en månad innan.",
  },
  {
    q: "Kan jag ta en ny kampanj hos samma operatör?",
    a: "Oftast inte. Kampanjerna gäller i regel nya kunder eller nya abonnemang. Däremot kan du byta till en annan operatör och ta med numret, och sedan byta tillbaka senare om du vill.",
  },
  {
    q: "Är ett kampanjpris med bindningstid en bra affär?",
    a: "Det kan vara det, om kampanjen gäller lika länge som bindningstiden. Tele2 har till exempel kampanjpriser som gäller i 24 månader med 24 månaders bindningstid. Räkna på totalkostnaden och jämför med abonnemang utan bindning.",
  },
];

export const Route = createFileRoute("/guider/kampanjpris-efter-kampanjen")({
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
  // Abonnemang med kampanj just nu, billigast snittpris först.
  const kampanjer = PRIVATA.filter((a) => a.kampanjpris != null && a.kampanjManader)
    .sort((a, b) => snittForstaAret(a) - snittForstaAret(b))
    .slice(0, 10);

  return (
    <GuidePage
      title="Kampanjpris på mobilabonnemang: vad betalar du sedan?"
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför pris efter kampanjen" }}
    >
      <P>
        Ett kampanjpris gäller bara de första månaderna. Sedan betalar du ordinarie pris, som ofta är
        flera gånger högre. Räkna därför alltid på vad abonnemanget kostar under ett helt år, eller
        hela bindningstiden. Det är det som avgör om kampanjen är bra, inte priset första månaden.
      </P>

      <H2 id="sa-fungerar">Så fungerar ett kampanjpris</H2>
      <P>
        Operatörerna lockar nya kunder med ett lågt pris i några månader. Det finns i huvudsak två
        sorter:
      </P>
      <UL>
        <li>
          <strong>Korta kampanjer utan bindningstid.</strong> Ett mycket lågt pris i tre eller fyra
          månader, sedan ordinarie pris. Du kan säga upp när du vill. Hallon är ett exempel.
        </li>
        <li>
          <strong>Långa kampanjer med bindningstid.</strong> Ett lägre pris i upp till 24 månader mot
          att du binder dig lika länge. Tele2 har sådana erbjudanden.
        </li>
      </UL>
      <P>
        Det finns också kampanjer som kräver bindningstid trots att själva kampanjpriset bara gäller
        några månader. Läs alltid vad som gäller efter kampanjen innan du beställer. Om du ångrar dig
        har du 14 dagars <A href="/guider/angerratt-mobilabonnemang">ångerrätt</A> när du köper på
        nätet.
      </P>

      <H2 id="rakna">Räkna på hela året</H2>
      <P>
        Lägg ihop kampanjmånaderna och de ordinarie månaderna, och dela med tolv. Lägg till
        startavgiften om operatören tar en.
      </P>
      <Callout>
        Exempel: 29 kronor i 4 månader och sedan 159 kronor. Första året kostar 4 × 29 + 8 × 159 = 1
        388 kronor, alltså 116 kronor i månaden i snitt. Andra året kostar 12 × 159 = 1 908 kronor.
      </Callout>
      <P>
        Det är därför vår <A href="/">jämförelse</A> sorterar på snittpriset första året. Ett
        abonnemang med ett ordinarie pris på 109 kronor och en kampanj på 19 kronor kan vara billigare
        över ett år än ett med en ännu lägre kampanj men högre ordinarie pris.
      </P>

      <H2 id="just-nu">Kampanjerna just nu</H2>
      <P>
        Här är de abonnemang med kampanjpris som har lägst snittpris första året. Siffrorna räknas
        fram ur operatörernas egna uppgifter.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Kampanj", "Sedan", "Snitt år 1", "Totalt 24 mån"]}
        rows={kampanjer.map((a) => [
          `${operator(a.operator)?.namn ?? a.operator} ${a.namn} (${gbText(a.gb)})`,
          `${kr(a.kampanjpris ?? 0)} i ${a.kampanjManader} mån`,
          `${kr(a.pris)}/mån`,
          `${kr(snittForstaAret(a))}/mån`,
          kr(totalKostnad(a, 24)),
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser och prislistor, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}. Kampanjer ändras ofta, kontrollera hos operatören innan du
        beställer.
      </p>

      <H2 id="efter">När kampanjen tar slut</H2>
      <P>Du har tre val när kampanjmånaderna är över:</P>
      <UL>
        <li>
          <strong>Behåll abonnemanget</strong> om ordinarie pris fortfarande är bra för den surf du
          använder.
        </li>
        <li>
          <strong>Byt till en mindre surfmängd</strong> hos samma operatör om du inte använder allt.
          Se <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf du behöver</A>.
        </li>
        <li>
          <strong>Byt operatör</strong> och ta med numret. Den nya operatören sköter flytten. Läs{" "}
          <A href="/guider/byta-operator-behalla-nummer">så byter du operatör</A>.
        </li>
      </UL>
      <P>
        Sätt en påminnelse i kalendern för månaden innan kampanjen slutar. Har du bindningstid är det
        bindningstidens slut som gäller, och du får inte behöva säga upp tidigare än en månad innan.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
