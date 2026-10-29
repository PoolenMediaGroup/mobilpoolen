import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  CopyTemplate,
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
import { KALLOR } from "@/lib/mobil/fakta";

const SLUG = "angerratt-mobilabonnemang";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "nar", label: "När har du ångerrätt?" },
  { id: "telefon", label: "Sålt i telefon: avtalet kräver ditt ja" },
  { id: "angra", label: "Så ångrar du ett abonnemang" },
  { id: "inte", label: "När ångerrätten inte hjälper" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Har man ångerrätt på mobilabonnemang?",
    a: "Ja, om du har tecknat abonnemanget på distans, till exempel på nätet eller i telefon. Ångerfristen är 14 dagar och börjar för tjänster den dag avtalet ingås. För en telefon börjar den när du får varan.",
    kalla: "2 kap. 10–12 §§ distansavtalslagen (2005:59)",
  },
  {
    q: "Gäller ett abonnemang som jag sa ja till i telefon?",
    a: "Inte förrän du har accepterat det skriftligt. När ett företag ringer upp dig för att sälja ska det skicka en skriftlig bekräftelse av erbjudandet, och avtalet gäller bara om du efter samtalet skriftligen accepterar det. Annars är det ogiltigt och du behöver inte betala.",
    kalla: "2 kap. 3 a § distansavtalslagen (2005:59)",
  },
  {
    q: "Vad händer om jag inte fått information om ångerrätten?",
    a: "Då förlängs ångerfristen, men som mest med ett år.",
    kalla: "2 kap. 12 § distansavtalslagen (2005:59)",
  },
  {
    q: "Har jag ångerrätt om jag tecknade abonnemanget i butik?",
    a: "Nej, ångerrätten enligt distansavtalslagen gäller avtal på distans och utanför affärslokaler. Köper du i butiken gäller operatörens egna villkor. Fråga om de har öppet köp innan du skriver på.",
  },
];

const MALL = `Hej,

Jag ångrar avtalet om mobilabonnemang som jag ingick den [datum], med stöd av ångerrätten i lagen om distansavtal.

Abonnemang/nummer: [nummer eller ordernummer]
Namn: [ditt namn]
Adress: [din adress]

Bekräfta att avtalet har hävts och att eventuella belopp jag har betalat återbetalas.

Vänliga hälsningar
[namn]`;

export const Route = createFileRoute("/guider/angerratt-mobilabonnemang")({
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
  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang i lugn och ro" }}
    >
      <P>
        Tecknar du ett mobilabonnemang på nätet eller i telefon har du 14 dagars ångerrätt. Har ett
        företag ringt upp dig och sålt abonnemanget gäller avtalet dessutom bara om du efter
        samtalet accepterar erbjudandet skriftligt. Ett muntligt ja i telefon räcker alltså inte.
        Reglerna står i distansavtalslagen.
      </P>

      <H2 id="nar">När har du ångerrätt på ett mobilabonnemang?</H2>
      <P>
        Ångerrätten gäller distansavtal, alltså när du och operatören inte träffas när avtalet
        ingås. Det gäller beställningar på webben, i appen och i telefon.
      </P>
      <GuideTable
        head={["Vad du köpt", "Ångerfrist", "Fristen börjar"]}
        rows={[
          ["Abonnemang (tjänst)", "14 dagar", "Den dag avtalet ingås"],
          ["Telefon eller annan vara", "14 dagar", "Den dag du tar emot varan"],
          ["Information om ångerrätt saknas", "Förlängs", "Högst ett år extra"],
        ]}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.distansavtal.url} target="_blank" rel="noopener nofollow">
          {KALLOR.distansavtal.namn}
        </a>
        , 2 kap. 10–12 §§.
      </p>
      <P>
        Innan avtalet ingås ska operatören också ge dig en kort och lättläst sammanfattning av
        avtalet. Avtalet gäller först när du har fått sammanfattningen och bekräftat att du vill
        ingå det (12 kap. 1 § lagen om elektronisk kommunikation). Läs den. Där står bindningstid,
        pris efter kampanjen och uppsägningstid.
      </P>

      <H2 id="telefon">Sålt i telefon: avtalet gäller först när du accepterat skriftligt</H2>
      <P>
        Sedan 2018 finns en särskild regel för telefonförsäljning. Ringer ett företag upp dig för
        att sälja något ska det bekräfta erbjudandet skriftligt eller i en annan varaktig form, till
        exempel e-post eller sms. Avtalet blir giltigt först när du efter samtalet har accepterat
        erbjudandet skriftligt.
      </P>
      <Callout>
        Har du sagt ja i telefon men aldrig accepterat skriftligt efteråt finns inget giltigt avtal.
        Då behöver du inte betala. Regeln står i 2 kap. 3 a § distansavtalslagen.
      </Callout>
      <P>Det här ska du tänka på när en säljare ringer:</P>
      <UL>
        <li>Be om erbjudandet skriftligt och läs det i lugn och ro.</li>
        <li>Jämför priset med andra abonnemang innan du accepterar.</li>
        <li>
          Var uppmärksam på om säljaren vill flytta ditt nummer. En nummerflytt avslutar ditt
          nuvarande abonnemang, och har du bindningstid kvar ska den betalas.
        </li>
        <li>
          Logga aldrig in med BankID på någons uppmaning om du inte är helt säker på vem du pratar
          med.
        </li>
      </UL>

      <H2 id="angra">Så ångrar du ett mobilabonnemang</H2>
      <OL>
        <li>
          <strong>Kontrollera datumet.</strong> Räkna 14 dagar från den dag avtalet ingicks, eller
          från dagen du fick telefonen.
        </li>
        <li>
          <strong>Meddela operatören.</strong> Använd operatörens ångerblankett om det finns en,
          eller skriv ett eget meddelande. Skicka det på ett sätt som går att spara, till exempel
          e-post eller kontaktformulär med kopia.
        </li>
        <li>
          <strong>Skicka tillbaka telefonen</strong> om du har köpt en. Följ operatörens
          instruktioner.
        </li>
        <li>
          <strong>Spara bekräftelsen.</strong> Be operatören bekräfta att avtalet har hävts.
        </li>
      </OL>
      <CopyTemplate title="Meddelande om att du ångrar ett abonnemang" text={MALL} />
      <P>
        Har numret redan flyttats till den nya operatören kan du flytta det tillbaka. Det gör du
        genom att beställa hos den operatör du vill ha och välja nummerflytt. Se{" "}
        <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>.
      </P>

      <H2 id="inte">När ångerrätten inte hjälper</H2>
      <P>
        Har de 14 dagarna gått gäller avtalets vanliga villkor. Då är det bindningstiden och
        uppsägningstiden som avgör. Som konsument får du ha högst en månads uppsägningstid, och
        bindningstiden får vara högst 24 månader. Se{" "}
        <A href="/guider/bindningstid-uppsagningstid">bindningstid och uppsägningstid</A>.
      </P>
      <P>
        Höjer operatören priset senare har du en annan rätt: att säga upp utan extra kostnad inom
        tre månader från beskedet. Det står i{" "}
        <A href="/guider/prishojning-mobilabonnemang">prishöjning på mobilabonnemang</A>. Vill du
        undvika problemet helt, välj ett abonnemang{" "}
        <A href="/utan-bindningstid">utan bindningstid</A>.
      </P>
      <P>
        Får du inte rätt hos operatören kan du vända dig till Telekområdgivarna, som ger råd till
        konsumenter om telefoni och bredband.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
