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
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import {
  decimal,
  KALLOR,
  MARKNAD,
  OPENSIGNAL,
  SKI_FORETAG,
  SKI_PRIVAT,
  TACKNING,
} from "@/lib/mobil/fakta";

const SLUG = "mobilmarknaden-i-siffror";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";
const PTS = KALLOR.ptsMarknad.namn;

const TOC = [
  { id: "abonnemang", label: "Antal mobilabonnemang" },
  { id: "marknadsandelar", label: "Marknadsandelar per operatör" },
  { id: "surf", label: "Surf, samtal och sms" },
  { id: "5g-tackning", label: "5G och täckning" },
  { id: "nojdhet-nat", label: "Kundnöjdhet och nätmätningar" },
  { id: "fragor", label: "Vanliga frågor" },
];

const telia = MARKNAD.andelar.find((a) => a.namn === "Telia Company")?.andel ?? 0;
const fyraStorsta = Math.round(
  MARKNAD.andelar.filter((a) => a.namn !== "Övriga").reduce((s, a) => s + a.andel, 0),
);

const FAQ = [
  {
    q: "Hur många mobilabonnemang finns det i Sverige?",
    a: `Den 31 december 2025 fanns ${MARKNAD.abonnemang} mobilabonnemang i Sverige enligt PTS. ${MARKNAD.privat} var privatabonnemang och ${MARKNAD.foretag} företagsabonnemang.`,
  },
  {
    q: "Vilken mobiloperatör är störst i Sverige?",
    a: `Telia, med ${decimal(telia)} procent av mobilabonnemangen 2025 enligt PTS. Därefter kommer Tele2, Telenor och Tre. De fyra största har tillsammans ${fyraStorsta} procent av marknaden.`,
  },
  {
    q: "Hur mycket surfar svenskar i mobilen?",
    a: `Abonnemang med samtal och data använde i snitt ${MARKNAD.surfPerManad} GB per månad 2025, mot ${MARKNAD.surfPerManad2024} GB 2024, enligt PTS.`,
  },
  {
    q: "Hur många använder 5G?",
    a: `${MARKNAD.femgAbonnemang} mobilabonnemang använde 5G-nätet under 2025, ungefär ${MARKNAD.femgAndel} procent av alla. Det var en ökning med 2,2 miljoner på ett år.`,
  },
  {
    q: "Vilken operatör har nöjdast kunder?",
    a: "Enligt Svenskt Kvalitetsindex 2025 hade Vimla nöjdast privatkunder med 82,5, följt av Fello med 81,7. Bland företagskunderna låg Telia högst med 70,1.",
  },
];

export const Route = createFileRoute("/guider/mobilmarknaden-i-siffror")({
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
      cta={{ label: "Jämför mobilabonnemang" }}
    >
      <P>
        Sverige hade {MARKNAD.abonnemang} mobilabonnemang den 31 december 2025, enligt PTS. Telia är
        störst med {decimal(telia)} procent av abonnemangen. Ett abonnemang med samtal och data
        använde i snitt {MARKNAD.surfPerManad} GB i månaden, och {MARKNAD.femgAndel} procent av
        abonnemangen använde 5G. Intäkterna för mobila tjänster var {MARKNAD.intakter}.
      </P>
      <Callout>
        Siffrorna kommer från PTS rapport Svensk telekommarknad 2025, publicerad 25 maj 2026, om
        inget annat anges. Citera gärna, men ange PTS som källa.
      </Callout>

      <H2 id="abonnemang">Antal mobilabonnemang</H2>
      <GuideTable
        head={["Mått", "2025"]}
        rows={[
          ["Mobilabonnemang totalt", MARKNAD.abonnemang],
          ["Varav privatabonnemang", MARKNAD.privat],
          ["Varav företagsabonnemang", MARKNAD.foretag],
          ["Ökning jämfört med 2024", "drygt 170 000"],
          ["Abonnemang med samtal och data", "cirka 12,7 miljoner"],
          ["Abonnemang med endast data", "drygt 1,6 miljoner"],
          ["Varav mobilt bredband till fast adress (FWA)", "cirka 420 000"],
          ["Abonnemang med endast samtal", "738 000"],
          ["SIM-kort för M2M och IoT", "34,3 miljoner (7,7 miljoner används i Sverige)"],
        ]}
      />
      <p className={KALLRAD}>Källa: {PTS}. Läget 31 december 2025.</p>
      <P>
        Med omkring 10,6 miljoner invånare motsvarar det ungefär ett privatabonnemang per invånare.
        Mobilt bredband till fast adress, FWA, växte med över 20 procent under 2025.
      </P>

      <H2 id="marknadsandelar">Marknadsandelar per operatör</H2>
      <GuideTable
        head={["Koncern", "Andel av mobilabonnemangen 2025"]}
        rows={MARKNAD.andelar.map((a) => [a.namn, `${decimal(a.andel)} %`])}
      />
      <p className={KALLRAD}>
        Källa: {PTS}, tabell 12. Andelarna gäller koncernen. Telia Company omfattar även Fello och
        Halebop, Tele2 även Comviq, Telenor även Vimla och Tre även Hallon.
      </p>
      <P>
        De fyra nätägarna har tillsammans {fyraStorsta} procent av abonnemangen. Telias andel har
        minskat varje år sedan 2017, då den var 35,9 procent. Tres andel har ökat varje år, från
        13,2 procent 2017. Vilka operatörer som kör i vilket nät står i{" "}
        <A href="/guider/vilket-nat-anvander-operatoren">vilket nät använder operatören?</A>
      </P>

      <H2 id="surf">Surf, samtal och sms</H2>
      <GuideTable
        head={["Mått", "2025", "2024"]}
        rows={[
          [
            "Surf per månad, abonnemang med samtal och data",
            `${MARKNAD.surfPerManad} GB`,
            `${MARKNAD.surfPerManad2024} GB`,
          ],
          ["Surf per månad, abonnemang med endast data", "164 GB", "131 GB"],
          ["Total mobil datatrafik", "cirka 5 300 petabyte", "cirka 4 400 petabyte"],
          ["Varav i 5G-näten", "cirka 1 600 petabyte", ""],
          ["Utgående samtalsminuter", "cirka 34,7 miljarder", ""],
          ["Andel av samtalsminuterna över 4G (VoLTE)", `cirka ${MARKNAD.volteAndel} %`, ""],
          ["Skickade sms", "cirka 7,1 miljarder", ""],
          ["Sms per privatabonnemang och månad", "52", ""],
        ]}
      />
      <p className={KALLRAD}>Källa: {PTS}.</p>
      <P>
        Den mobila datatrafiken ökade med omkring 20 procent. Trafiken i 5G-näten mer än
        fördubblades och stod för ungefär 30 procent av all trafik. Samtalsminuterna minskade med 2
        procent och sms:en med 3 procent. Inga operatörer erbjöd samtal i 5G-nätet. Hur mycket surf
        du själv behöver kan du räkna ut i{" "}
        <A href="/verktyg/hur-mycket-surf-behover-jag">surfkalkylatorn</A>.
      </P>
      <H3 id="intakter">Intäkter</H3>
      <GuideTable
        head={["Intäkter för mobila tjänster", "2025", "Förändring"]}
        rows={[
          ["Totalt", MARKNAD.intakter, "+2,4 %"],
          ["Kontraktsabonnemang", "29,9 miljarder kronor", "+2,8 %"],
          ["Kontantkort", "strax under 2,5 miljarder kronor", "-1,8 %"],
        ]}
      />
      <p className={KALLRAD}>Källa: {PTS}, tabell 1.</p>

      <H2 id="5g-tackning">5G och täckning</H2>
      <GuideTable
        head={["Mått", "Värde", "Källa"]}
        rows={[
          [
            "Abonnemang som använde 5G 2025",
            `${MARKNAD.femgAbonnemang} (${MARKNAD.femgAndel} %)`,
            "PTS",
          ],
          ["Abonnemang som använde 5G 2024", "6,4 miljoner", "PTS"],
          ["Yta med grundläggande täckning utomhus, nov 2025", `${TACKNING.ptsYta} %`, "PTS"],
          ["Samma mått, okt 2024", `${TACKNING.ptsYta2024} %`, "PTS"],
          ["Bebodda områden med god täckning", `${TACKNING.ptsBebott} %`, "PTS"],
          ["5G-yta, Tele2 och Telenor, sep 2025", `${TACKNING.n4m5gYta} % av landytan`, "Tele2"],
          ["4G och 5G, Telia", `över ${TACKNING.telia4g5gYta} % av landytan`, "Telia"],
        ]}
      />
      <p className={KALLRAD}>
        Källor: {PTS}; {KALLOR.ptsTackning.namn}; {KALLOR.n4m5g.namn}; Telias pressmeddelande
        januari 2026. PTS räknar ett område som täckt om minst en operatör täcker det.
      </p>
      <P>
        2G och 3G har stängts i Tele2s, Telenors och Tres nät. Läs mer i{" "}
        <A href="/guider/2g-3g-nedslackning">2G och 3G släcks ner</A> och{" "}
        <A href="/guider/behover-jag-5g">behöver jag 5G?</A>
      </P>

      <H2 id="nojdhet-nat">Kundnöjdhet och nätmätningar</H2>
      <H3 id="ski">Svenskt Kvalitetsindex 2025</H3>
      <GuideTable
        head={["Privatkunder", "Index"]}
        rows={SKI_PRIVAT.map((s) => [s.namn, decimal(s.varde)])}
      />
      <GuideTable
        head={["Företagskunder", "Index"]}
        rows={SKI_FORETAG.map((s) => [s.namn, decimal(s.varde)])}
      />
      <p className={KALLRAD}>
        Källa: {KALLOR.ski.namn}. Undersökningen gjordes i september 2025 med 2 874 intervjuer.
        Skala 0–100.
      </p>
      <H3 id="opensignal">Opensignal december 2025</H3>
      <GuideTable
        head={["Kategori", "Vinnare", "Värde"]}
        rows={OPENSIGNAL.map((o) => [o.kategori, o.vinnare, o.varde])}
      />
      <p className={KALLRAD}>
        Källa: {KALLOR.opensignal.namn}. Mätperiod 1 juli till 28 september 2025. Telenor fick flest
        utmärkelser, 11 inklusive delade.
      </p>
      <P>
        Mätningarna mäter olika saker och ska inte läsas som betyg. Jämför näten i{" "}
        <A href="/guider/basta-tackning-sverige">bästa täckningen i Sverige</A> och operatörerna på{" "}
        <A href="/operatorer">alla operatörer</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: {PTS}; PTS pressmeddelande om 5G (25 maj 2026); {KALLOR.ptsTackning.namn};{" "}
        {KALLOR.ski.namn}; {KALLOR.opensignal.namn}.
      </p>
    </GuidePage>
  );
}
