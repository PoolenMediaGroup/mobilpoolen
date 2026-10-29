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
import { MOBILNAT, OPERATORER } from "@/lib/mobil/data";
import { KALLOR, MARKNAD, SKI_PRIVAT, decimal } from "@/lib/mobil/fakta";
import type { Operator } from "@/lib/mobil/typer";

const SLUG = "virtuella-operatorer";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const AKTIVA = OPERATORER.filter((o) => o.aktiv);
const NATAGARE = AKTIVA.filter((o) => o.grupp === "natagare");
const VARUMARKEN = AKTIVA.filter((o) => o.grupp === "varumarke");
const MVNO = AKTIVA.filter((o) => o.grupp === "mvno");

function lista(o: Operator[]): string {
  const namn = o.map((x) => x.namn);
  if (namn.length < 2) return namn.join("");
  return `${namn.slice(0, -1).join(", ")} och ${namn[namn.length - 1]}`;
}

function natFor(o: Operator): string {
  if (o.natNotis) return "Anges inte";
  const nat = MOBILNAT[o.nat].namn;
  return o.slug === "lycamobile" ? `${nat} (uppges)` : nat;
}

const ja = (v: boolean | null) => (v == null ? "Uppgift saknas" : v ? "Ja" : "Nej");

const ovriga = MARKNAD.andelar.find((a) => a.namn === "Övriga");

const TOC = [
  { id: "vad-ar", label: "Vad är en virtuell operatör?" },
  { id: "tre-sorter", label: "Nätägare, varumärken och MVNO" },
  { id: "skillnader", label: "Vad skiljer i praktiken?" },
  { id: "nojdhet", label: "Är kunderna mindre nöjda?" },
  { id: "valja", label: "När är en virtuell operatör rätt?" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vad är en virtuell operatör?",
    a: "En virtuell operatör, ofta kallad MVNO, säljer mobilabonnemang utan att äga något eget mobilnät. Den hyr kapacitet i någon av de fyra nätägarnas nät, alltså Telias, Tele2s, Telenors eller Tres.",
  },
  {
    q: "Har virtuella operatörer sämre täckning?",
    a: "Nej, inte i sig. Täckningen är densamma som för nätägaren, eftersom samma master används. Maxhastighet, 5G, eSIM och wifi-samtal kan däremot skilja mellan operatörer i samma nät.",
  },
  {
    q: "Är Hallon, Comviq och Vimla virtuella operatörer?",
    a: "De äger inga egna nät, men de ägs av nätägarna. Hallon ägs av samma bolag som Tre, Comviq av Tele2 och Vimla av Telenor. Vi kallar dem varumärken hos nätägaren, till skillnad från fristående virtuella operatörer.",
  },
  {
    q: "Varför är virtuella operatörer billigare?",
    a: "De har inget nät att bygga och driva, och de har ofta färre butiker och en mindre kundtjänst. Alla är inte billigare. Jämför vad abonnemanget kostar under ett helt år, inte bara första månaden.",
  },
];

export const Route = createFileRoute("/guider/virtuella-operatorer")({
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
  const skiRader = SKI_PRIVAT.filter((s) => s.namn !== "Övriga");

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför alla operatörer" }}
    >
      <P>
        En virtuell operatör äger inget eget nät utan hyr in sig hos Telia, Tele2, Telenor eller
        Tre. Täckningen blir därför densamma som hos nätägaren. Det som kan skilja är pris,
        maxhastighet, 5G, eSIM och kundtjänst. Sämre är de alltså inte i sig, men villkoren behöver
        läsas lika noga som hos de stora.
      </P>

      <H2 id="vad-ar">Vad är en virtuell operatör (MVNO)?</H2>
      <P>
        MVNO står för mobile virtual network operator. Det är en operatör som säljer abonnemang med
        eget varumärke, egna priser och egen kundtjänst, men som använder någon annans mobilnät. I
        Sverige finns fyra nätägare. Alla andra kör i något av deras nät.
      </P>
      <P>
        De fyra stora har tillsammans 96 procent av mobilabonnemangen. Resten, cirka{" "}
        {ovriga ? decimal(ovriga.andel) : "4"} procent, fördelas på övriga operatörer enligt PTS.
        Varumärken som Hallon och Comviq räknas då in hos sina ägare.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.ptsMarknad.url} className="underline underline-offset-2">
          {KALLOR.ptsMarknad.namn}
        </a>
        .
      </p>

      <H2 id="tre-sorter">Nätägare, varumärken och fristående MVNO</H2>
      <P>Det är lättare att förstå marknaden om man delar upp den i tre grupper:</P>
      <UL>
        <li>
          <strong>Nätägare:</strong> {lista(NATAGARE)}. De bygger och driver näten.
        </li>
        <li>
          <strong>Varumärken hos nätägarna:</strong> {lista(VARUMARKEN)}. De ägs av en nätägare och
          kör i dess nät, ofta med lägre priser och färre tjänster.
        </li>
        <li>
          <strong>Fristående virtuella operatörer:</strong> {lista(MVNO)}. De hyr kapacitet i ett av
          näten.
        </li>
      </UL>
      <P>Så här ser det ut för de virtuella operatörerna vi har gått igenom:</P>
      <GuideTable
        brytForsta
        head={["Operatör", "Nät", "5G", "eSIM", "Wifi-samtal"]}
        rows={MVNO.map((o) => [o.namn, natFor(o), ja(o.femg), ja(o.esim), ja(o.wifiSamtal)])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser. &rdquo;Uppgift saknas&rdquo; betyder att vi inte har
        kunnat bekräfta det hos operatören. Hela listan med nät finns i guiden{" "}
        <A href="/guider/vilket-nat-anvander-operatoren">vilket nät använder operatören</A>.
      </p>

      <H2 id="skillnader">Vad skiljer i praktiken?</H2>
      <P>
        <strong>Täckningen är densamma.</strong> En virtuell operatör använder samma master som
        nätägaren. Det betyder att du kan välja nät efter täckningen där du bor, och sedan operatör
        efter pris och villkor.
      </P>
      <P>Det som faktiskt kan skilja:</P>
      <UL>
        <li>
          <strong>Maxhastighet.</strong> Vissa virtuella operatörer sätter ett tak. Chilimobil
          säljer till exempel fri surf där priset styrs av vilken hastighet du väljer.
        </li>
        <li>
          <strong>5G och eSIM.</strong> Inte alla har det, eller anger det. Se tabellen ovan.
        </li>
        <li>
          <strong>Kundtjänst.</strong> Många har bara chatt, eller kortare öppettider än de stora.
        </li>
        <li>
          <strong>Extratjänster.</strong> Streaming, familjeabonnemang och telefon på avbetalning är
          vanligare hos nätägarna.
        </li>
      </UL>
      <Callout>
        Billigare är inte automatiskt sant. Flera virtuella operatörer har låga kampanjpriser i
        några månader och sedan ett högt ordinarie pris. Läs om{" "}
        <A href="/guider/kampanjpris-efter-kampanjen">vad du betalar efter kampanjen</A>.
      </Callout>

      <H2 id="nojdhet">Är kunderna mindre nöjda hos de billiga?</H2>
      <P>
        Mätningarna pekar snarare åt andra hållet. I Svenskt Kvalitetsindex 2025 hade flera av
        varumärkena utan eget nät nöjdare privatkunder än nätägarna:
      </P>
      <GuideTable
        head={["Operatör", "SKI 2025, privat"]}
        rows={skiRader.map((s) => [s.namn, decimal(s.varde)])}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.ski.url} className="underline underline-offset-2">
          {KALLOR.ski.namn}
        </a>
        . Skala 0–100. Mindre operatörer redovisas inte var för sig.
      </p>
      <P>
        SKI mäter hela kundupplevelsen, inte bara nätet. De fristående virtuella operatörerna är för
        små för att redovisas en och en.
      </P>

      <H2 id="valja">När är en virtuell operatör rätt för dig?</H2>
      <P>En operatör utan eget nät passar ofta bra om du:</P>
      <UL>
        <li>vet vilket nät som fungerar där du bor och vill betala så lite som möjligt för det,</li>
        <li>klarar dig med chatt eller e-post när du behöver hjälp,</li>
        <li>vill slippa bindningstid, vilket är vanligt hos de mindre operatörerna.</li>
      </UL>
      <P>
        En nätägare kan passa bättre om du vill ha telefonen på avbetalning, streaming i
        abonnemanget, många familjemedlemmar på samma faktura eller en butik att gå till. Jämför
        alltid totalkostnaden, och se alla operatörer på <A href="/operatorer">operatörssidan</A>{" "}
        eller i nätet du vill ha på <A href="/nat">sidan om mobilnäten</A>. Vill du byta behåller du
        numret, se <A href="/guider/byta-operator-behalla-nummer">så byter du operatör</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
