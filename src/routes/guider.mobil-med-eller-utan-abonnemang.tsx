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
import { MOBILNAT, PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { KALLOR } from "@/lib/mobil/fakta";
import { datumText, gbText, kr, totalKostnad } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "mobil-med-eller-utan-abonnemang";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

/** Hypotetiskt telefonpris i räkneexemplet. Inte ett butikspris. */
const TELEFON = 8000;
const MANADER = 24;

const TOC = [
  { id: "skillnaden", label: "Vad är skillnaden?" },
  { id: "rakna", label: "Räkna på 24 månader" },
  { id: "exempel", label: "Räkneexempel" },
  { id: "lagen", label: "Operatörslås och förtida uppsägning" },
  { id: "valja", label: "Vilket ska du välja?" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Är det billigare att köpa mobilen utan abonnemang?",
    a: "Ofta, men inte alltid. Telefonen kostar ungefär lika mycket på båda sätten. Skillnaden ligger i abonnemanget: köper du telefonen själv kan du välja det billigaste abonnemanget utan bindningstid. Räkna på totalen över 24 månader.",
  },
  {
    q: "Måste jag ha bindningstid om jag köper telefon på delbetalning hos operatören?",
    a: "Hos flera operatörer, ja. Comviq skriver att 24 månaders bindningstid gäller med telefon på avbetalning, och hos Telia köps telefonen med ett abonnemang på 24 månader. Bindningstiden får aldrig vara längre än 24 månader.",
    kalla:
      "operatörernas webbplatser och 12 kap. 8 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Får operatören låsa telefonen till sitt nät?",
    a: "När bindningstiden för ett abonnemang med subventionerad telefon har gått ut ska operatören på begäran ta bort operatörslåset, kostnadsfritt och utan dröjsmål.",
    kalla: "12 kap. 15 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Kan jag flytta numret om jag har en telefon på avbetalning?",
    a: "Ja. Bindningstid hindrar inte en nummerflytt. Men återstående bindningstid och resten av telefonen ska fortfarande betalas.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
];

export const Route = createFileRoute("/guider/mobil-med-eller-utan-abonnemang")({
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

/** Billigaste abonnemang utan bindning med minst `gb` surf, mätt över `manader`. */
function billigastFri(gb: number | null, manader: number) {
  return PRIVATA.filter(
    (a) =>
      !a.kontantkort &&
      a.bindning === 0 &&
      operator(a.operator)?.aktiv &&
      !(a.malgrupp ?? []).some((m) => m !== "familj") &&
      (gb == null ? a.gb == null : a.gb == null || a.gb >= gb),
  ).sort((a, b) => totalKostnad(a, manader) - totalKostnad(b, manader))[0];
}

function Page() {
  // Bundna abonnemang ur datan som exempel på "telefon + abonnemang hos operatören".
  const bundna = ["tele2-mobil-15-gb", "tre-25-gb", "tele2-mobil-obegransad"]
    .map((id) => PRIVATA.find((a) => a.id === id))
    .filter((a): a is Abonnemang => !!a && (a.bindning ?? 0) > 0);

  const rader = bundna
    .map((b) => ({ b, fri: billigastFri(b.gb, MANADER) }))
    .filter((r): r is { b: Abonnemang; fri: Abonnemang } => !!r.fri);

  const forsta = rader[0];
  const delbetalning = Math.round(TELEFON / MANADER);

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Hitta billigaste abonnemanget utan bindning" }}
    >
      <P>
        Att köpa mobilen utan abonnemang och sedan ta ett billigt abonnemang utan bindningstid blir
        ofta billigare än en telefon på delbetalning med abonnemang. Telefonen kostar ungefär lika
        mycket. Det som avgör är abonnemanget, eftersom delbetalning hos operatören oftast kräver 24
        månaders bindningstid. Räkna därför på totalen över 24 månader.
      </P>

      <H2 id="skillnaden">Vad är skillnaden?</H2>
      <UL>
        <li>
          <strong>Med abonnemang.</strong> Du betalar telefonen i delar på fakturan, oftast i 24
          månader, och binder dig till abonnemanget lika länge. Comviq skriver att 24 månaders
          bindningstid gäller med telefon på avbetalning. Hos Telia köps telefonen med ett
          abonnemang på 24 månader.
        </li>
        <li>
          <strong>Utan abonnemang.</strong> Du köper telefonen kontant eller på delbetalning hos en
          butik, och väljer sedan vilket abonnemang du vill, hos vilken operatör du vill. Du kan
          byta abonnemang när ett billigare dyker upp.
        </li>
      </UL>
      <P>
        Fördelen med att köpa via operatören är enkelheten: telefon och abonnemang på samma faktura.
        Nackdelen är att du inte kan byta till ett billigare abonnemang under bindningstiden utan
        att betala resten.
      </P>

      <H2 id="rakna">Så räknar du på 24 månader</H2>
      <P>Lägg ihop allt du betalar under perioden på båda sätten:</P>
      <UL>
        <li>
          <strong>Med abonnemang:</strong> abonnemangets månadspris × 24, med kampanj och
          startavgift, plus telefonens delbetalning × 24 och eventuella avgifter för delbetalningen.
        </li>
        <li>
          <strong>Utan abonnemang:</strong> telefonens pris, plus ränta och avgifter om du
          delbetalar, plus det billigaste abonnemanget med den surf du behöver × 24.
        </li>
      </UL>
      <P>
        Kontrollera alltid om delbetalningen har ränta eller avgifter. Då är telefonen inte lika dyr
        på båda sätten, och skillnaden behöver räknas in.
      </P>

      <H2 id="exempel">Räkneexempel med en telefon för {kr(TELEFON)}</H2>
      <P>
        Exemplet bygger på en tänkt telefon för {kr(TELEFON)}, alltså inget verkligt butikspris. Vi
        antar att den kostar lika mycket på båda sätten, {kr(delbetalning)} i månaden i {MANADER}{" "}
        månader utan ränta. Abonnemangen är verkliga priser ur vår jämförelse.
      </P>
      <GuideTable
        brytForsta
        head={[
          "Med abonnemang (24 mån bindning)",
          "Totalt 24 mån",
          "Utan abonnemang (ingen bindning)",
          "Totalt 24 mån",
          "Skillnad",
        ]}
        rows={rader.map(({ b, fri }) => {
          const med = totalKostnad(b, MANADER) + TELEFON;
          const utan = totalKostnad(fri, MANADER) + TELEFON;
          return [
            `${namn(b)} (${gbText(b.gb)}) + telefon`,
            kr(med),
            `Telefon + ${namn(fri)} (${gbText(fri.gb)}, ${natFor(fri)})`,
            kr(utan),
            med > utan ? `${kr(med - utan)} billigare utan` : `${kr(utan - med)} billigare med`,
          ];
        })}
      />
      <p className={KALLRAD}>
        Abonnemangspriser: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}
        . Totalen räknar med kampanjpris, ordinarie pris och startavgift. Telefonpriset{" "}
        {kr(TELEFON)} är ett exempel.
      </p>
      {forsta ? (
        <Callout>
          Så läser du raden för {namn(forsta.b)}: {kr(totalKostnad(forsta.b, MANADER))} för
          abonnemanget och {kr(TELEFON)} för telefonen blir{" "}
          {kr(totalKostnad(forsta.b, MANADER) + TELEFON)}. Köper du telefonen själv och tar{" "}
          {namn(forsta.fri)} blir det {kr(totalKostnad(forsta.fri, MANADER))} plus {kr(TELEFON)},
          alltså {kr(totalKostnad(forsta.fri, MANADER) + TELEFON)}.
        </Callout>
      ) : null}
      <P>
        Telefonens pris tar ut sig självt i jämförelsen när det är samma på båda sätten. Det är
        därför det räcker att jämföra abonnemangen. Är telefonen billigare hos operatören, dra av
        skillnaden. Är den dyrare, lägg till den.
      </P>

      <H2 id="lagen">Operatörslås och förtida uppsägning</H2>
      <P>
        Två regler i lagen om elektronisk kommunikation skyddar dig som köper telefon med
        abonnemang:
      </P>
      <UL>
        <li>
          <strong>Operatörslås.</strong> När bindningstiden har gått ut ska operatören på begäran ta
          bort operatörslåset kostnadsfritt och utan dröjsmål (12 kap. 15 §).
        </li>
        <li>
          <strong>Kompensation vid förtida uppsägning.</strong> Har du rätt att säga upp i förtid,
          till exempel efter en villkorsändring, får operatören bara begära kompensation för
          subventionerad utrustning du behåller. Den får högst vara det lägsta av telefonens
          tidsproportionella restvärde och summan av återstående avgifter (12 kap. 16 §).
        </li>
      </UL>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 12 kap. 15–16 §§.
      </p>
      <P>
        Vill du byta operatör mitt i perioden kan du flytta numret ändå, men återstående
        bindningstid ska betalas. Se{" "}
        <A href="/guider/byta-operator-med-bindningstid">byta operatör med bindningstid</A>.
      </P>

      <H2 id="valja">Vilket ska du välja?</H2>
      <UL>
        <li>
          <strong>Köp utan abonnemang</strong> om du vill kunna byta till billigare abonnemang, om
          du behåller telefonen länge eller om du redan har en telefon som fungerar.
        </li>
        <li>
          <strong>Köp med abonnemang</strong> om operatören har ett erbjudande där abonnemang och
          telefon tillsammans blir billigare över 24 månader, och du ändå tänker stanna hela
          perioden.
        </li>
      </UL>
      <P>
        Hitta det billigaste abonnemanget att kombinera med en egen telefon bland{" "}
        <A href="/utan-bindningstid">abonnemang utan bindningstid</A> eller de{" "}
        <A href="/billigaste-mobilabonnemang">billigaste mobilabonnemangen</A>. Har du en telefon
        som stöder eSIM kan du aktivera abonnemanget utan att vänta på ett SIM-kort, se{" "}
        <A href="/esim">eSIM</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
