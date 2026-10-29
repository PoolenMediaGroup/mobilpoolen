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
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { MOBILNAT, PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { KALLOR, MARKNAD } from "@/lib/mobil/fakta";
import { datumText, gbText, kr, snittForstaAret, totalKostnad } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "sank-mobilrakningen";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "anvandning", label: "Betala för den surf du använder" },
  { id: "pris", label: "Betala rätt pris för samma surf" },
  { id: "rabatter", label: "Rabatter som många missar" },
  { id: "fakturan", label: "Rensa fakturan" },
  { id: "spara", label: "Så mycket kan du spara" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Hur mycket surf använder man i genomsnitt?",
    a: `Ett mobilabonnemang med både samtal och surf använde i snitt ${MARKNAD.surfPerManad} GB i månaden 2025 enligt PTS. Snittet säger lite om dig. Kolla din egen förbrukning i telefonens inställningar innan du väljer surfmängd.`,
    kalla: KALLOR.ptsMarknad.namn,
  },
  {
    q: "Är billigare operatörer sämre?",
    a: "Inte när det gäller nätet. Alla operatörer i Sverige kör i något av de fyra näten som Telia, Tele2, Telenor och Tre äger. Comviq och Tellus kör till exempel i Tele2s nät och Hallon i Tres. Skillnaden ligger i pris, kundtjänst, maxhastighet och tillval.",
  },
  {
    q: "Lönar det sig att byta operatör varje år?",
    a: "Ofta, om du har abonnemang utan bindningstid. Många kampanjer gäller bara nya kunder i några månader. Numret följer med, den nya operatören sköter flytten och avbrottet får vara högst en arbetsdag.",
    kalla: "12 kap. 20 § lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Kostar det extra att använda mobilen i EU?",
    a: "Nej, inte i grunden. Roam like at home gäller till 2032 i EU samt Island, Liechtenstein och Norge. Du ringer, sms:ar och surfar som hemma, men operatören får sätta en gräns för EU-surf på stora och obegränsade abonnemang.",
    kalla: "EU-kommissionen och Your Europe",
  },
];

export const Route = createFileRoute("/guider/sank-mobilrakningen")({
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

function natFor(a: Abonnemang) {
  const o = operator(a.operator);
  return o ? MOBILNAT[o.nat].kortText : "";
}

/** Abonnemang som alla kan teckna, utan bindningstid, hos aktiva operatörer. */
const FRIA = PRIVATA.filter(
  (a) =>
    !a.kontantkort &&
    a.bindning === 0 &&
    operator(a.operator)?.aktiv &&
    !(a.malgrupp ?? []).some((m) => m !== "familj"),
);

function billigasteFria(gb: number | null) {
  return FRIA.filter((a) => (gb == null ? a.gb == null : a.gb == null || a.gb >= gb)).sort(
    (a, b) => totalKostnad(a, 12) - totalKostnad(b, 12),
  )[0];
}

function Page() {
  const h5 = hitta("hallon-hallon-5-gb");
  const h10 = hitta("hallon-hallon-10-gb");
  const h25 = hitta("hallon-hallon-25-gb");
  const hStud = hitta("hallon-student-10-gb");

  const tele2Obeg = hitta("tele2-mobil-obegransad");
  const tellusObeg = hitta("tellus-tellus-mobil-obegransat");

  const teliaPlus = hitta("telia-obegransad-plus");
  const teliaNetflix = hitta("telia-obegransad-plus-netflix");

  // Vanliga abonnemang hos de stora operatörerna, jämförda med det billigaste
  // abonnemanget utan bindning med minst lika mycket surf.
  const jamforelser = ["telia-mobil-10-gb", "telia-mobil-20-gb", "tre-25-gb", "telia-obegransad"]
    .map((id) => hitta(id))
    .filter((a): a is Abonnemang => !!a)
    .map((a) => ({ a, alt: billigasteFria(a.gb) }))
    .filter((r): r is { a: Abonnemang; alt: Abonnemang } => !!r.alt);

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Se vad du kan spara" }}
    >
      <P>
        Du sänker mobilräkningen mest genom att betala för den surf du faktiskt använder och byta
        till en operatör som är billigare i samma nät. Lägg till familjerabatter, rensa bort tillval
        och räkna alltid på vad abonnemanget kostar på ett år. Här är tio sätt, med exempel ur
        operatörernas egna priser.
      </P>

      <H2 id="anvandning">Betala bara för den surf du använder</H2>
      <H3>1. Kolla din förbrukning</H3>
      <P>
        Öppna mobilens inställningar och leta upp mobildata eller dataanvändning. Där ser du hur
        mycket du har surfat de senaste månaderna. Ett abonnemang med samtal och surf använde i
        snitt {MARKNAD.surfPerManad} GB i månaden 2025 enligt PTS, men spridningen är stor. Vårt
        verktyg <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf behöver jag</A>{" "}
        hjälper dig att räkna.
      </P>
      <H3>2. Välj rätt surfmängd</H3>
      {h5 && h10 && h25 ? (
        <P>
          Skillnaden mellan surfnivåerna är ofta stor. Hos Hallon kostar {gbText(h5.gb)}{" "}
          {kr(h5.pris)}, {gbText(h10.gb)} {kr(h10.pris)} och {gbText(h25.gb)} {kr(h25.pris)} i
          månaden efter kampanjen. Använder du 6 GB betalar du alltså{" "}
          {kr((h25.pris - h10.pris) * 12)} för mycket på ett år om du har {gbText(h25.gb)} i stället
          för {gbText(h10.gb)}.
        </P>
      ) : null}
      <H3>3. Använd wifi hemma och på jobbet</H3>
      <P>
        Surf över wifi drar inte från mobilabonnemanget. Ställ in att appar bara uppdateras och att
        bilder säkerhetskopieras över wifi, så räcker en mindre surfmängd längre.
      </P>

      <H2 id="pris">Betala rätt pris för samma surf</H2>
      <H3>4. Jämför snittpriset första året</H3>
      <P>
        Ett lågt kampanjpris säger lite om vad du betalar. Räkna på tolv månader, med kampanj,
        ordinarie pris och startavgift. Läs mer i guiden om{" "}
        <A href="/guider/kampanjpris-efter-kampanjen">kampanjpris efter kampanjen</A>.
      </P>
      <H3>5. Byt till en billigare operatör i samma nät</H3>
      {tele2Obeg && tellusObeg ? (
        <P>
          {namn(tele2Obeg)} och {namn(tellusObeg)} går båda i {natFor(tele2Obeg)}.{" "}
          {operator(tele2Obeg.operator)?.namn} kostar {kr(tele2Obeg.pris)} i månaden efter
          kampanjen, och {operator(tellusObeg.operator)?.namn} kostar {kr(tellusObeg.pris)} utan
          bindningstid. Kolla villkoren för rimlig användning hos båda, men täckningen är samma nät.
          Se <A href="/guider/vilket-nat-anvander-operatoren">vilket nät din operatör använder</A>.
        </P>
      ) : null}
      <H3>6. Byt igen när kampanjen tar slut</H3>
      <P>
        Har du ingen bindningstid kan du flytta numret till en ny kampanj när den gamla är slut.
        Numret följer med och flytten är gratis från den gamla operatören. Så gör du:{" "}
        <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>.
      </P>

      <H2 id="rabatter">Rabatter som många missar</H2>
      <H3>7. Samla familjen</H3>
      <P>
        Flera operatörer låter dig lägga till familjemedlemmar som extra användare till ett lägre
        pris än ett eget abonnemang. Jämför både med och utan familjerabatt, eftersom extra
        användare ibland delar på samma surf. Se <A href="/familjeabonnemang">familjeabonnemang</A>.
      </P>
      <H3>8. Använd ålders- och studentpriser</H3>
      {h5 && hStud && hStud.pris === h5.pris ? (
        <P>
          Hallon ger studenter och unga {gbText(hStud.gb)} för samma pris som {gbText(h5.gb)} kostar
          för alla, {kr(hStud.pris)} i månaden. Flera operatörer har också egna priser för dig över
          55 eller 65. Se <A href="/pensionar">abonnemang för pensionärer</A> och{" "}
          <A href="/studentabonnemang">studentabonnemang</A>.
        </P>
      ) : (
        <P>
          Flera operatörer har egna priser för studenter, unga och dig över 55 eller 65. Se{" "}
          <A href="/pensionar">abonnemang för pensionärer</A> och{" "}
          <A href="/studentabonnemang">studentabonnemang</A>.
        </P>
      )}

      <H2 id="fakturan">Rensa fakturan</H2>
      <H3>9. Ta bort tillval du inte använder</H3>
      {teliaPlus && teliaNetflix ? (
        <P>
          Streaming i abonnemanget kostar pengar varje månad. {namn(teliaNetflix)} kostar{" "}
          {kr(teliaNetflix.pris - teliaPlus.pris)} mer i månaden än {namn(teliaPlus)}, alltså{" "}
          {kr((teliaNetflix.pris - teliaPlus.pris) * 12)} om året. Kolla också om du betalar för
          pappersfaktura, extra SIM-kort eller försäkringar du inte behöver.
        </P>
      ) : null}
      <H3>10. Fråga om ett bättre pris</H3>
      <P>
        Har du ett äldre abonnemang kan det finnas nyare och billigare varianter hos samma operatör.
        Ring eller chatta och fråga. Hur du förbereder samtalet står i{" "}
        <A href="/guider/forhandla-med-operatoren">förhandla med operatören</A>.
      </P>

      <H2 id="spara">Så mycket kan du spara</H2>
      <P>
        Tabellen visar vad några vanliga abonnemang hos de stora operatörerna kostar på ett år,
        jämfört med det billigaste abonnemanget utan bindningstid med minst lika mycket surf.
      </P>
      <GuideTable
        brytForsta
        head={["Om du har", "Kostar år 1", "Billigare alternativ", "Kostar år 1", "Skillnad"]}
        rows={jamforelser.map(({ a, alt }) => [
          `${namn(a)} (${gbText(a.gb)})`,
          kr(totalKostnad(a, 12)),
          `${namn(alt)} (${gbText(alt.gb)}, ${natFor(alt)})`,
          `${kr(totalKostnad(alt, 12))} (snitt ${kr(snittForstaAret(alt))}/mån)`,
          kr(totalKostnad(a, 12) - totalKostnad(alt, 12)),
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. År 1
        räknar med kampanjpris och startavgift. Har du bindningstid kvar betalar du den först.
      </p>
      <Callout>
        Spara mest genom att göra två saker samtidigt: välj den surfmängd du använder och byt till
        det billigaste abonnemanget med den mängden. Har du bindningstid kvar, sätt en påminnelse en
        månad innan den går ut.
      </Callout>
      <P>
        Hela listan, sorterad på snittpris första året, hittar du bland de{" "}
        <A href="/billigaste-mobilabonnemang">billigaste mobilabonnemangen</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
