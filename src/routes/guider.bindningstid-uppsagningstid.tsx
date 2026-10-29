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
import { KALLOR } from "@/lib/mobil/fakta";
import { datumText, gbText, kr, totalKostnad } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "bindningstid-uppsagningstid";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "lagen", label: "Vad säger lagen?" },
  { id: "uppsagningstid", label: "Uppsägningstid hos operatörerna" },
  { id: "bryta", label: "Vad kostar det att bryta i förtid?" },
  { id: "lonar-sig", label: "När lönar sig bindningstid?" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Hur lång bindningstid får ett mobilabonnemang ha?",
    a: "Högst 24 månader. Det gäller konsumenter, och även mikroföretag, småföretag och ideella organisationer om de inte uttryckligen har avstått från regeln.",
    kalla: "12 kap. 8 och 10 §§ lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Hur lång uppsägningstid får ett mobilabonnemang ha?",
    a: "Som konsument får du ha högst en månads uppsägningstid. Har du bindningstid ska det räcka att du säger upp en månad före bindningstidens slut för att avtalet ska upphöra då.",
    kalla: "12 kap. 13 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Vad händer när bindningstiden går ut?",
    a: "Abonnemanget fortsätter oftast att löpa tills vidare. Förlängs ett avtal med bindningstid automatiskt har du rätt att säga upp det när som helst efter förlängningen, med högst en månads uppsägningstid.",
    kalla: "12 kap. 14 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Kan jag byta operatör fast jag har bindningstid kvar?",
    a: "Ja. Bindningstiden hindrar inte att du flyttar numret till en ny operatör, men den återstående tiden hos den gamla operatören ska betalas.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
];

export const Route = createFileRoute("/guider/bindningstid-uppsagningstid")({
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

function hitta(id: string) {
  return PRIVATA.find((a) => a.id === id);
}

function Page() {
  // Abonnemang från aktiva operatörer, utan kontantkort.
  const aktiva = PRIVATA.filter((a) => !a.kontantkort && operator(a.operator)?.aktiv);
  const utanBindning = aktiva.filter((a) => a.bindning === 0).length;
  const medBindning = aktiva.filter((a) => (a.bindning ?? 0) > 0).length;

  // Exempel 1: samma Comviq-abonnemang med och utan bindningstid, över 12 månader.
  const comviqFri = hitta("comviq-comviq-mobilabonnemang-5-gb");
  const comviqBunden = hitta("comviq-comviq-mobilabonnemang-5-gb-12-man-bindning-dubbel-surf");

  // Exempel 2: Tele2s 24-månaderskampanj mot billigaste abonnemang utan bindning
  // med minst lika mycket surf, räknat över 24 månader.
  const tele2 = hitta("tele2-mobil-15-gb");
  const fri24 = tele2
    ? aktiva
        .filter((a) => a.bindning === 0 && (a.gb == null || (tele2.gb != null && a.gb >= tele2.gb)))
        .filter((a) => !(a.malgrupp ?? []).some((m) => m !== "familj"))
        .sort((a, b) => totalKostnad(a, 24) - totalKostnad(b, 24))[0]
    : undefined;

  const uppsagning: string[][] = [
    ["Telia", "1 månad", "Enligt Telia gäller en månads uppsägningstid för alla abonnemang."],
    ["Tele2", "1 månad", "Enligt Tele2 har de flesta abonnemang en månads uppsägningstid."],
    ["Tre", "30 dagar", "Enligt prislistan."],
    ["Comviq", "Ingen", "Du betalar innevarande fakturaperiod."],
    ["Hallon", "Till månadsskiftet", "Upphör vid nästkommande månadsskifte."],
    ["Tellus Mobil", "Ingen", "Avslutas sista dagen i den månad uppsägningen kommer in."],
    [
      "Chilimobil",
      "1 till 1,5 månad",
      "Säger du upp före den 15:e avslutas det vid kommande månadsskifte, annars vid nästa.",
    ],
  ];

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang med och utan bindning" }}
    >
      <P>
        Ett mobilabonnemang får ha högst 24 månaders bindningstid, och som konsument får du ha högst
        en månads uppsägningstid. Under bindningstiden betalar du månadsavgiften även om du byter
        operatör. Bindningstid lönar sig bara när rabatten du får är större än vad du kunde ha
        sparat på att byta fritt.
      </P>

      <H2 id="lagen">Vad säger lagen om bindningstid och uppsägningstid?</H2>
      <P>
        Reglerna står i 12 kapitlet i lagen om elektronisk kommunikation (LEK). De gäller alla
        operatörer, oavsett vad som står i deras egna villkor.
      </P>
      <GuideTable
        head={["Regel", "Vad som gäller", "Lagrum"]}
        rows={[
          ["Längsta bindningstid", "24 månader", "12 kap. 8 §"],
          [
            "Företag och föreningar",
            "Samma tak för mikro- och småföretag och ideella organisationer, om de inte avstått",
            "12 kap. 10 §",
          ],
          ["Längsta uppsägningstid", "1 månad för konsumenter", "12 kap. 13 §"],
          [
            "Uppsägning vid bindningstid",
            "Räcker att säga upp en månad före bindningstidens slut",
            "12 kap. 13 §",
          ],
          [
            "Automatisk förlängning",
            "Efter förlängningen får du säga upp när som helst med högst en månads uppsägningstid",
            "12 kap. 14 §",
          ],
          [
            "Avtalssammanfattning",
            "Avtalet gäller först när du fått en kort sammanfattning och bekräftat",
            "12 kap. 1 §",
          ],
        ]}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 12 kap. 1, 8, 10, 13 och 14 §§.
      </p>
      <P>
        Bindningstiden och uppsägningstiden är två olika saker. Bindningstiden är den period du
        lovat att betala för. Uppsägningstiden är hur länge abonnemanget löper efter att du sagt upp
        det. Har du ett abonnemang utan bindningstid är det bara uppsägningstiden som gäller.
      </P>

      <H2 id="uppsagningstid">Hur lång uppsägningstid har operatörerna?</H2>
      <P>
        Lagen sätter taket, men många operatörer har kortare tid än så. Så här skriver operatörerna
        själva:
      </P>
      <GuideTable head={["Operatör", "Uppsägningstid", "Detalj"]} rows={uppsagning} />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, prislistor och allmänna villkor, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}.
      </p>
      <P>
        Bland de privatabonnemang vi har kontrollerat har {utanBindning} ingen bindningstid och{" "}
        {medBindning} har bindningstid. Du kan filtrera fram dem utan bindning på sidan om{" "}
        <A href="/utan-bindningstid">mobilabonnemang utan bindningstid</A>. Vill du säga upp hos en
        viss operatör finns steg för steg under <A href="/saga-upp">säga upp abonnemang</A>.
      </P>

      <H2 id="bryta">Vad kostar det att bryta en bindningstid i förtid?</H2>
      <P>
        Du kan alltid byta operatör och ta med numret, även mitt i bindningstiden. Men du betalar
        resten av bindningstiden till den gamla operatören. Har du sex månader kvar på ett
        abonnemang för 300 kronor är det alltså 1 800 kronor som återstår, oavsett om du stannar
        eller går.
      </P>
      <P>Det finns två situationer där reglerna är annorlunda:</P>
      <UL>
        <li>
          <strong>Operatören ändrar villkoren till din nackdel.</strong> Då får du säga upp avtalet
          utan extra kostnad inom tre månader från beskedet, även med bindningstid. Läs mer i guiden
          om <A href="/guider/prishojning-mobilabonnemang">prishöjning på mobilabonnemang</A>.
        </li>
        <li>
          <strong>Du har en subventionerad telefon.</strong> Har du rätt att säga upp avtalet i
          förtid får operatören bara begära kompensation för utrustning du behåller. Den får högst
          vara det lägsta av telefonens tidsproportionella restvärde och summan av de avgifter som
          återstår (12 kap. 16 § LEK).
        </li>
      </UL>
      <P>
        Hur du räknar på ett byte med bindningstid kvar går vi igenom i{" "}
        <A href="/guider/byta-operator-med-bindningstid">byta operatör med bindningstid</A>.
      </P>

      <H2 id="lonar-sig">När lönar sig bindningstid?</H2>
      <P>
        Bindningstid är en byteshandel. Du får ett lägre pris och lovar i gengäld att stanna. Den
        lönar sig när rabatten är större än det du hade sparat på att kunna byta fritt. Två exempel
        ur operatörernas egna priser:
      </P>
      {comviqFri &&
      comviqBunden &&
      totalKostnad(comviqFri, 12) <= totalKostnad(comviqBunden, 12) ? (
        <Callout>
          Hos Comviq kostar {gbText(comviqFri.gb)} lika mycket med och utan bindningstid:{" "}
          {kr(totalKostnad(comviqFri, 12))} på ett år. Varianten med {comviqBunden.bindning}{" "}
          månaders bindningstid ger dubbel surf i stället för ett lägre pris. Behöver du inte mer
          surf är bindningen alltså bara en nackdel.
        </Callout>
      ) : comviqFri && comviqBunden ? (
        <Callout>
          {namn(comviqFri)} utan bindningstid kostar {kr(totalKostnad(comviqFri, 12))} på ett år.
          Samma abonnemang med kampanj kostar {kr(comviqBunden.kampanjpris ?? comviqBunden.pris)} i{" "}
          {comviqBunden.kampanjManader} månader och kräver {comviqBunden.bindning} månaders
          bindningstid. Det blir {kr(totalKostnad(comviqBunden, 12))} på ett år, alltså{" "}
          {kr(totalKostnad(comviqFri, 12) - totalKostnad(comviqBunden, 12))} mindre för att du
          stannar ett år.
        </Callout>
      ) : null}
      {tele2 && fri24 ? (
        <>
          <P>
            {namn(tele2)} kostar {kr(tele2.kampanjpris ?? tele2.pris)} i månaden i{" "}
            {tele2.kampanjManader} månader med {tele2.bindning} månaders bindningstid. Det blir{" "}
            {kr(totalKostnad(tele2, 24))} på två år. Det billigaste abonnemanget utan bindningstid
            med minst {gbText(tele2.gb)} över samma tid är {namn(fri24)} för{" "}
            {kr(totalKostnad(fri24, 24))}.
          </P>
          <P>
            {totalKostnad(tele2, 24) > totalKostnad(fri24, 24)
              ? "Här kostar alltså bindningstiden mer än friheten, även innan du räknar med att priserna kan sjunka under två år."
              : `Bindningstiden ger här ${kr(totalKostnad(fri24, 24) - totalKostnad(tele2, 24))} lägre kostnad på två år, men du kan inte byta om ett billigare erbjudande dyker upp.`}
          </P>
        </>
      ) : null}
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Totalen
        räknar med kampanjpris, ordinarie pris och eventuell startavgift.
      </p>
      <P>Tumregler när du väger bindning mot frihet:</P>
      <UL>
        <li>Räkna på hela bindningstiden, inte på första månadens pris.</li>
        <li>
          Kolla att kampanjpriset gäller lika länge som bindningstiden. Annars betalar du ordinarie
          pris under en period då du inte kan byta. Se{" "}
          <A href="/guider/kampanjpris-efter-kampanjen">kampanjpris efter kampanjen</A>.
        </li>
        <li>Sätt en påminnelse en månad innan bindningstiden går ut, så att du hinner säga upp.</li>
        <li>Är du osäker på täckningen där du bor är det tryggare att börja utan bindning.</li>
      </UL>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
