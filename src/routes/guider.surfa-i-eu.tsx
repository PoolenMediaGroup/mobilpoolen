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
import { datumText, formatTal, gbText, kr } from "@/lib/mobil/berakna";
import { KALLOR } from "@/lib/mobil/fakta";

const SLUG = "surfa-i-eu";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "roam-like-at-home", label: "Vad är Roam like at home?" },
  { id: "lander", label: "Vilka länder ingår?" },
  { id: "obegransad", label: "Så räknas EU-surfen på obegränsat" },
  { id: "per-abonnemang", label: "EU-surf per abonnemang" },
  { id: "slut", label: "När EU-surfen tar slut" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Kostar det extra att surfa i EU?",
    a: "Nej, inte inom den EU-surf som ingår i abonnemanget. Enligt EU:s regler om Roam like at home, som gäller till 2032, ringer, sms:ar och surfar du i EU och EES till samma pris som hemma. Med obegränsad surf får operatören sätta ett tak för EU-surfen.",
  },
  {
    q: "Ingår Norge i EU-surfen?",
    a: "Ja. Roam like at home gäller i EU:s medlemsländer samt Island, Liechtenstein och Norge. Enligt EU:s webbplats Your Europe gäller det även Moldavien och Ukraina.",
  },
  {
    q: "Ingår Schweiz och Storbritannien?",
    a: "De omfattas inte av EU:s regler. Vissa operatörer tar ändå med dem frivilligt, ibland med ett lägre tak. Kontrollera i din operatörs prislista innan du reser.",
  },
  {
    q: "Varför får jag mindre surf i EU än hemma med obegränsat?",
    a: "EU-reglerna tillåter ett tak för obegränsade och mycket stora paket. Taket ska vara minst två gånger månadspriset exklusive moms delat med grossistpriset per GB. Ju dyrare abonnemang, desto högre lägsta tak.",
  },
];

export const Route = createFileRoute("/guider/surfa-i-eu")({
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
  const aktiva = PRIVATA.filter((a) => operator(a.operator)?.aktiv && a.euGb != null);
  // Obegränsade abonnemang, ett per operatör och pris, mest EU-surf först.
  const obegransade = aktiva
    .filter((a) => a.gb == null && !a.namn.includes("Plus "))
    .sort((a, b) => (b.euGb ?? 0) - (a.euGb ?? 0) || a.pris - b.pris);
  const euVarden = obegransade.map((a) => a.euGb ?? 0);
  const minEu = Math.min(...euVarden);
  const maxEu = Math.max(...euVarden);
  // Fasta surfmängder där EU-surfen är lägre än surfen hemma.
  const lagreIEu = aktiva
    .filter((a) => a.gb != null && a.euGb != null && a.euGb < a.gb && !a.kampanjpris)
    .sort((a, b) => (b.gb ?? 0) - (a.gb ?? 0));

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang med EU-surf" }}
    >
      <P>
        I EU, Norge, Island och Liechtenstein surfar du till samma pris som hemma, enligt reglerna
        om Roam like at home som gäller till 2032. Har du en fast surfmängd gäller den oftast även
        utomlands. Med obegränsad surf får operatören sätta ett tak. I de obegränsade abonnemang vi
        har kontrollerat ligger det mellan {formatTal(minEu)} och {formatTal(maxEu)} GB i månaden.
      </P>

      <H2 id="roam-like-at-home">Vad är Roam like at home?</H2>
      <P>
        EU:s roamingförordning trädde i kraft den 1 juli 2022 och förlänger Roam like at home till
        2032. Du kan ringa, sms:a och surfa i EU och EES utan extra kostnad, med samma kvalitet som
        hemma när det är möjligt. Förordningen ger också bättre tillgång till nödnummer och
        information om tjänster som kan kosta extra, till exempel betalnummer.
      </P>
      <P>
        Reglerna gäller när du reser, inte om du bor stadigvarande i ett annat land. Visar
        operatörens kontroll att du använder abonnemanget mer utomlands än hemma, får den ta ut
        tillägg.
      </P>

      <H2 id="lander">Vilka länder ingår?</H2>
      <UL>
        <li>
          <strong>Alla EU-länder</strong>, till exempel Spanien, Grekland, Italien, Tyskland och
          Kroatien.
        </li>
        <li>
          <strong>EES-länderna</strong> Norge, Island och Liechtenstein.
        </li>
        <li>
          <strong>Moldavien och Ukraina</strong>, enligt EU:s webbplats Your Europe.
        </li>
      </UL>
      <P>
        Schweiz och Storbritannien omfattas inte av EU:s regler. Vissa operatörer tar ändå med dem.
        Hallon skriver till exempel att hela surfmängden gäller i EU/EES och Storbritannien, och
        Lyca Mobile har ett lägre tak för Storbritannien och Schweiz. Läs om övriga länder i guiden{" "}
        <A href="/guider/surfa-utanfor-eu">surfa utanför EU</A>.
      </P>

      <H2 id="obegransad">Så räknas EU-surfen på obegränsat</H2>
      <P>
        För obegränsade och mycket stora paket får operatören sätta en gräns för EU-surfen. Gränsen
        får inte vara hur låg som helst. Den bestäms av en formel i EU-reglerna:
      </P>
      <Callout>
        Lägsta EU-surf = 2 × (månadspris exkl. moms ÷ grossisttaket per GB). Exempel från Your
        Europe med 2025 års tak på 1,30 euro per GB: ett abonnemang för 13 euro i månaden ger minst
        20 GB i EU.
      </Callout>
      <P>
        Grossisttaket är det högsta pris operatörerna får ta av varandra för roamingdata. Det sänks
        stegvis och är 1,00 euro per GB från 2027. Ett lägre tak ger mer EU-surf för samma
        månadspris. Operatören får alltid ge mer än formeln kräver, och många gör det.
      </P>

      <H2 id="per-abonnemang">EU-surf per abonnemang</H2>
      <P>
        Tabellen visar hur mycket EU-surf som ingår i de obegränsade abonnemangen vi har
        kontrollerat, enligt operatörernas egna uppgifter.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Pris/mån", "EU-surf per månad"]}
        rows={obegransade.map((a) => [
          `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`,
          kr(a.pris),
          `${formatTal(a.euGb ?? 0)} GB`,
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser och prislistor, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}. Telias webbsida anger 100 GB, prislistan högst 50 GB. Vi
        visar prislistans siffra.
      </p>
      {lagreIEu.length > 0 && (
        <>
          <P>
            Har du en fast surfmängd gäller den oftast fullt ut i EU. Några abonnemang med mycket
            surf har ändå ett lägre tak utomlands:
          </P>
          <GuideTable
            brytForsta
            head={["Abonnemang", "Surf hemma", "EU-surf"]}
            rows={lagreIEu.map((a) => [
              `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`,
              gbText(a.gb),
              `${formatTal(a.euGb ?? 0)} GB`,
            ])}
          />
          <p className={KALLRAD}>
            Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
          </p>
        </>
      )}

      <H2 id="slut">När EU-surfen tar slut</H2>
      <P>
        När EU-surfen är slut får operatören ta betalt per GB. Tillägget får högst vara
        grossisttaket per GB, och priset står i operatörens prislista. Så här undviker du en
        överraskning:
      </P>
      <UL>
        <li>Se efter i operatörens app hur mycket EU-surf du har kvar.</li>
        <li>Använd wifi på hotellet för att strömma film och ladda ner uppdateringar.</li>
        <li>Ladda ner kartor, musik och serier innan du reser.</li>
        <li>Köp ett extra surfpaket i appen om du vet att du behöver mer.</li>
      </UL>
      <P>
        Reser du ofta kan det löna sig att välja ett abonnemang med mycket EU-surf. Jämför i{" "}
        <A href="/obegransad-surf">obegränsad surf</A>, eller räkna på ditt behov med verktyget{" "}
        <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf behöver jag?</A> Ska du ringa
        hem eller till andra länder, läs{" "}
        <A href="/guider/ringa-utomlands-billigt">ringa till utlandet billigt</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: {KALLOR.roaming.namn}; EU-kommissionen, New roaming rules (1 juli 2022);
        operatörernas prislistor.
      </p>
    </GuidePage>
  );
}
