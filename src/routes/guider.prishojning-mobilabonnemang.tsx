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
import { PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { KALLOR } from "@/lib/mobil/fakta";
import { datumText, kr } from "@/lib/mobil/berakna";

const SLUG = "prishojning-mobilabonnemang";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "far-de", label: "Får operatören höja priset?" },
  { id: "besked", label: "Vad beskedet ska innehålla" },
  { id: "saga-upp", label: "Säga upp vid prishöjning" },
  { id: "inte-hojning", label: "När det inte räknas som höjning" },
  { id: "vad-gora", label: "Så gör du när priset höjs" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Får operatören höja priset under bindningstiden?",
    a: "Operatören kan ändra villkoren, men måste ge dig besked minst en månad innan. Är ändringen inte enbart till din fördel får du säga upp avtalet utan extra kostnad inom tre månader från beskedet, även om du har bindningstid kvar.",
    kalla: "12 kap. 12 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Hur lång tid har jag på mig att säga upp efter en prishöjning?",
    a: "Tre månader från det att du fick beskedet. Säger du upp inom den tiden ska det ske utan extra kostnad.",
    kalla: "12 kap. 12 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Räknas det som prishöjning när kampanjpriset tar slut?",
    a: "Nej. Om kampanjens längd och priset efteråt stod i avtalet från början är det en del av det du godkände. Då har du ingen särskild rätt att säga upp, utöver den vanliga uppsägningstiden och eventuell bindningstid.",
  },
  {
    q: "Kan jag behålla numret om jag säger upp på grund av prishöjningen?",
    a: "Ja. Det smidigaste är att beställa hos den nya operatören och flytta numret. Den gamla operatören får inte ta betalt för att lämna ifrån sig numret.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
];

const MALL = `Hej,

Jag har fått ert besked om ändrade villkor för mitt abonnemang med nummer [ditt nummer], daterat [datum].

Ändringen är inte enbart till min fördel. Jag säger därför upp avtalet med stöd av 12 kap. 12 § lagen om elektronisk kommunikation, utan extra kostnad för återstående bindningstid.

Bekräfta uppsägningen och vilket datum avtalet upphör.

Vänliga hälsningar
[namn och personnummer eller kundnummer]`;

export const Route = createFileRoute("/guider/prishojning-mobilabonnemang")({
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
  // Exempel: Tre 25 GB har 24 månaders bindningstid. Vad är kvar att betala
  // efter 6 månader, och vad slipper du betala om du säger upp vid en höjning?
  const tre = PRIVATA.find((a) => a.id === "tre-25-gb");
  const kvarManader = tre?.bindning ? tre.bindning - 6 : 0;

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför innan du bestämmer dig" }}
    >
      <P>
        Operatören får höja priset på ditt mobilabonnemang, men måste ge dig besked minst en månad
        innan. Är ändringen inte enbart till din fördel får du säga upp avtalet utan extra kostnad
        inom tre månader från beskedet. Det gäller även om du har bindningstid kvar. Reglerna står i
        12 kap. 12 § lagen om elektronisk kommunikation.
      </P>

      <H2 id="far-de">Får operatören höja priset?</H2>
      <P>
        Ja. Ett abonnemang är ett löpande avtal, och operatörerna har klausuler i sina villkor som
        låter dem ändra pris och innehåll. Lagen hindrar inte höjningen. Den ger dig i stället rätt
        att få veta i god tid och att lämna avtalet utan kostnad.
      </P>
      <P>
        Hallon skriver till exempel i sina allmänna villkor att ändringar till kundens nackdel
        aviseras minst en månad i förväg. Det motsvarar lagens krav.
      </P>

      <H2 id="besked">Vad ska beskedet om prishöjning innehålla?</H2>
      <P>Enligt lagen ska beskedet uppfylla tre krav:</P>
      <GuideTable
        head={["Krav", "Vad det betyder"]}
        rows={[
          [
            "Minst en månad innan",
            "Ändringen får inte börja gälla tidigare än en månad efter beskedet.",
          ],
          [
            "Varaktigt medium",
            "Till exempel e-post, sms eller brev. Något du kan spara, inte bara en text på webbplatsen.",
          ],
          [
            "Information om uppsägning",
            "Beskedet ska tala om att du har rätt att säga upp avtalet.",
          ],
        ]}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 12 kap. 12 §.
      </p>
      <P>Spara beskedet. Datumet på det avgör när dina tre månader börjar räknas.</P>

      <H2 id="saga-upp">Kan jag säga upp med bindningstid vid prishöjning?</H2>
      <P>
        Ja. Du får säga upp avtalet utan extra kostnad inom tre månader från beskedet. Det betyder
        att du slipper betala resten av bindningstiden, som du annars hade fått betala om du bytt
        operatör i förtid.
      </P>
      {tre && tre.bindning ? (
        <Callout>
          Exempel: Du har Tre 25 GB för {kr(tre.pris)} i månaden med {tre.bindning} månaders
          bindningstid och har betalat i 6 månader. Säger du upp utan en villkorsändring återstår{" "}
          {kvarManader} månader, alltså {kr(tre.pris * kvarManader)}. Höjer Tre priset och du säger
          upp inom tre månader från beskedet ska du inte behöva betala den återstående
          bindningstiden.
        </Callout>
      ) : null}
      <p className={KALLRAD}>
        Pris: operatörens webbplats, kontrollerad {datumText(SENAST_KONTROLLERAD)}. Exemplet är
        räknat på ordinarie månadspris.
      </p>
      <P>
        Har du köpt en telefon med subvention i abonnemanget får operatören begära kompensation för
        telefonen om du behåller den. Den får högst vara det lägsta av telefonens tidsproportionella
        restvärde och summan av återstående avgifter (12 kap. 16 § LEK). Läs mer om{" "}
        <A href="/guider/mobil-med-eller-utan-abonnemang">mobil med eller utan abonnemang</A>.
      </P>

      <H2 id="inte-hojning">När räknas det inte som en prishöjning?</H2>
      <P>Rätten att säga upp utan kostnad gäller inte om ändringen:</P>
      <UL>
        <li>enbart är till din fördel, till exempel mer surf till samma pris,</li>
        <li>är rent administrativ och inte har några negativa följder för dig,</li>
        <li>krävs enligt lag.</li>
      </UL>
      <P>
        Ett kampanjpris som tar slut är inte heller en ändring av avtalet, om kampanjens längd och
        ordinarie pris stod med från början. Då gäller vanlig uppsägningstid och din bindningstid.
        Se <A href="/guider/kampanjpris-efter-kampanjen">kampanjpris efter kampanjen</A> och{" "}
        <A href="/guider/bindningstid-uppsagningstid">bindningstid och uppsägningstid</A>.
      </P>

      <H2 id="vad-gora">Så gör du när priset höjs</H2>
      <OL>
        <li>
          <strong>Läs beskedet.</strong> Notera datumet, det nya priset och när det börjar gälla.
        </li>
        <li>
          <strong>Räkna på alternativen.</strong> Jämför det nya priset med andra abonnemang med
          samma surf. Vår <A href="/">jämförelse</A> sorterar på snittpris första året.
        </li>
        <li>
          <strong>Välj väg.</strong> Stanna, byt till en mindre surfmängd hos samma operatör eller
          byt operatör.
        </li>
        <li>
          <strong>Byter du: flytta numret.</strong> Beställ hos den nya operatören och välj
          nummerflytt. Har du bindningstid, säg också till den gamla operatören att du säger upp med
          stöd av villkorsändringen, så att den återstående tiden inte faktureras. Steg för steg:{" "}
          <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>.
        </li>
        <li>
          <strong>Spara bekräftelsen.</strong> Få uppsägningen bekräftad skriftligt.
        </li>
      </OL>
      <CopyTemplate title="Uppsägning vid ändrade villkor" text={MALL} />
      <P>
        Får du inte rätt hos operatören kan du vända dig till Telekområdgivarna, som ger gratis råd
        till konsumenter om telefoni.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
