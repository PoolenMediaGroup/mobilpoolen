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
import { KALLOR } from "@/lib/mobil/fakta";
import { datumText, gbText, kr, totalKostnad } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "byta-operator-med-bindningstid";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

/** Hur långt fram vi räknar när vi jämför att byta nu med att vänta. */
const HORISONT = 24;
const MANADER_KVAR = [1, 3, 6, 12];

const TOC = [
  { id: "far-du", label: "Får du byta med bindningstid?" },
  { id: "kostnad", label: "Vad kostar det?" },
  { id: "rakna", label: "Byta nu eller vänta?" },
  { id: "gratis", label: "När du slipper betala resten" },
  { id: "sa-gor-du", label: "Så gör du" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Kan jag byta operatör om jag har bindningstid?",
    a: "Ja. Bindningstiden hindrar inte att du flyttar numret till en ny operatör. Men den återstående bindningstiden ska betalas till den gamla operatören.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
  {
    q: "Hur mycket kostar det att bryta bindningstiden?",
    a: "Normalt månadsavgiften gånger antalet månader som är kvar. Har du en subventionerad telefon tillkommer det som återstår av den. Kolla exakt belopp på Mina sidor eller fråga operatören.",
  },
  {
    q: "När slipper jag betala resten av bindningstiden?",
    a: "Om operatören ändrar villkoren, till exempel höjer priset, och ändringen inte enbart är till din fördel. Då får du säga upp utan extra kostnad inom tre månader från beskedet.",
    kalla: "12 kap. 12 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "När ska jag säga upp för att byta när bindningstiden går ut?",
    a: "Du får inte behöva säga upp tidigare än en månad före bindningstidens slut. Beställ hos den nya operatören ungefär en månad innan och välj ett flyttdatum när bindningstiden är slut.",
    kalla: "12 kap. 13 § lagen (2022:482) om elektronisk kommunikation",
  },
];

export const Route = createFileRoute("/guider/byta-operator-med-bindningstid")({
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

function Page() {
  // Exempel: du har Tre 25 GB med 24 månaders bindningstid och vill byta till
  // det billigaste abonnemanget utan bindning med minst lika mycket surf.
  const gammal = PRIVATA.find((a) => a.id === "tre-25-gb");
  const ny = gammal
    ? PRIVATA.filter(
        (a) =>
          !a.kontantkort &&
          a.bindning === 0 &&
          operator(a.operator)?.aktiv &&
          !(a.malgrupp ?? []).some((m) => m !== "familj") &&
          (gammal.gb == null ? a.gb == null : a.gb == null || a.gb >= gammal.gb),
      ).sort((a, b) => totalKostnad(a, 12) - totalKostnad(b, 12))[0]
    : undefined;

  // Byter du nu betalar du resten av bindningstiden OCH det nya abonnemanget.
  // Väntar du betalar du bara resten av bindningstiden. Merkostnaden för att
  // byta nu är alltså vad det nya abonnemanget kostar under de månader som
  // överlappar, räknat över samma period.
  const merkostnad = (kvar: number) =>
    ny ? totalKostnad(ny, HORISONT) - totalKostnad(ny, HORISONT - kvar) : 0;

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang utan bindningstid" }}
    >
      <P>
        Du kan byta operatör och ta med numret även om du har bindningstid kvar. Bindningstiden
        hindrar inte flytten, men du betalar den återstående tiden till den gamla operatören. Att
        byta i förtid innebär alltså att du betalar två abonnemang samtidigt. Det lönar sig sällan,
        utom när operatören har höjt priset eller kampanjpriset hos den nya är mycket lågt.
      </P>

      <H2 id="far-du">Får du byta operatör med bindningstid?</H2>
      <P>
        Ja. Enligt Post- och telestyrelsens föreskrift om nummerportabilitet får varken bindningstid
        eller obetalda fakturor hindra en nummerflytt. Den gamla operatören måste lämna ifrån sig
        numret och får inte ta betalt för det.
      </P>
      <P>
        Det du har lovat att betala finns dock kvar. Den återstående bindningstiden ska betalas,
        antingen på slutfakturan eller som vanligt månad för månad, beroende på operatören.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a
          href="https://WWW.PTS.SE/globalassets/startpage/dokument/legala-dokument/foreskrifter/telefoni/ny-lek-2022/ptsfs-2022_4-om-nummerportabilitet.pdf"
          target="_blank"
          rel="noopener nofollow"
        >
          PTSFS 2022:4 om nummerportabilitet
        </a>
        , 4 §.
      </p>

      <H2 id="kostnad">Vad kostar det att byta med bindningstid kvar?</H2>
      <P>Kostnaden består av två delar:</P>
      <UL>
        <li>
          <strong>Resten av abonnemanget.</strong> Månadsavgiften gånger antalet månader som
          återstår av bindningstiden.
        </li>
        <li>
          <strong>Resten av telefonen</strong>, om du har köpt en telefon på delbetalning med
          abonnemanget. Har du rätt att säga upp i förtid får operatören högst ta ut det lägsta av
          telefonens tidsproportionella restvärde och summan av återstående avgifter (12 kap. 16 §
          LEK).
        </li>
      </UL>
      {gammal && gammal.bindning ? (
        <Callout>
          Exempel: {namn(gammal)} kostar {kr(gammal.pris)} i månaden med {gammal.bindning} månaders
          bindningstid. Har du 6 månader kvar är det {kr(gammal.pris * 6)} som återstår. Har du 12
          månader kvar är det {kr(gammal.pris * 12)}.
        </Callout>
      ) : null}
      <P>
        Det exakta beloppet ser du på Mina sidor eller genom att fråga operatören. Fråga också om
        det läggs på slutfakturan eller betalas månadsvis.
      </P>

      <H2 id="rakna">Byta nu eller vänta tills bindningstiden går ut?</H2>
      <P>
        Den återstående bindningstiden betalar du oavsett om du byter nu eller väntar. Det som
        skiljer är att du betalar det nya abonnemanget under samma månader om du byter nu. Det är
        din verkliga merkostnad för att byta i förtid.
      </P>
      {gammal && ny ? (
        <>
          <P>
            Tabellen visar exemplet ovan: du byter från {namn(gammal)} till {namn(ny)} (
            {gbText(ny.gb)}, {natFor(ny)}), som saknar bindningstid och har kampanjpris de första
            månaderna.
          </P>
          <GuideTable
            head={[
              "Månader kvar",
              `Kvar att betala till ${operator(gammal.operator)?.namn ?? gammal.operator}`,
              "Merkostnad för att byta nu",
            ]}
            rows={MANADER_KVAR.filter((m) => m <= (gammal.bindning ?? 0)).map((m) => [
              `${m} mån`,
              kr(gammal.pris * m),
              kr(merkostnad(m)),
            ])}
          />
          <p className={KALLRAD}>
            Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
            Merkostnaden är vad {namn(ny)} kostar under de överlappande månaderna, räknat över{" "}
            {HORISONT} månader med kampanjpris och startavgift. Vi antar att kampanjen finns kvar om
            du väntar, vilket inte är säkert.
          </p>
        </>
      ) : null}
      <P>
        Med andra ord: att byta i förtid lönar sig nästan aldrig bara på priset. Det kan ändå vara
        rätt beslut om:
      </P>
      <UL>
        <li>täckningen där du bor är så dålig att abonnemanget inte fungerar,</li>
        <li>
          ett kampanjerbjudande hos den nya operatören bara gäller nu och är värt mer än
          merkostnaden,
        </li>
        <li>operatören har ändrat villkoren, se nästa avsnitt.</li>
      </UL>
      <P>
        Ett alternativ är att byta till en mindre surfmängd hos den operatör du har. Telia skriver
        till exempel att du kan sänka surfmängden när du har 90 dagar eller mindre kvar av
        bindningstiden. Fråga din operatör.
      </P>

      <H2 id="gratis">När slipper du betala resten av bindningstiden?</H2>
      <P>
        Om operatören ändrar avtalet och ändringen inte enbart är till din fördel. Det vanligaste
        fallet är en prishöjning. Operatören ska ge dig besked minst en månad innan, och du får säga
        upp avtalet utan extra kostnad inom tre månader från beskedet.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 12 kap. 12 §.
      </p>
      <P>
        Mer om hur det fungerar i guiden om{" "}
        <A href="/guider/prishojning-mobilabonnemang">prishöjning på mobilabonnemang</A>. Har du
        tecknat abonnemanget på nätet eller i telefon de senaste 14 dagarna kan du i stället ångra
        det, se <A href="/guider/angerratt-mobilabonnemang">ångerrätt</A>.
      </P>

      <H2 id="sa-gor-du">Så byter du när bindningstiden går ut</H2>
      <OL>
        <li>
          <strong>Ta reda på slutdatumet</strong> för bindningstiden på Mina sidor eller i avtalet.
        </li>
        <li>
          <strong>Sätt en påminnelse en månad innan.</strong> Du får inte behöva säga upp tidigare
          än en månad före bindningstidens slut (12 kap. 13 § LEK).
        </li>
        <li>
          <strong>Välj nytt abonnemang</strong> och jämför på snittpris första året.
        </li>
        <li>
          <strong>Beställ med nummerflytt</strong> och be om ett flyttdatum när bindningstiden är
          slut. Den nya operatören sköter resten. Steg för steg i{" "}
          <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>.
        </li>
      </OL>
      <P>
        Gör du ingenting fortsätter abonnemanget oftast efter bindningstiden. Förlängs ett avtal med
        bindningstid automatiskt får du säga upp det när som helst efter förlängningen, med högst en
        månads uppsägningstid (12 kap. 14 § LEK). Vill du slippa frågan nästa gång, välj ett
        abonnemang <A href="/utan-bindningstid">utan bindningstid</A>. Reglerna i sin helhet står i{" "}
        <A href="/guider/bindningstid-uppsagningstid">bindningstid och uppsägningstid</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
