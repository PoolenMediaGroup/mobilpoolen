import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  H3,
  OL,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { KALLOR, OPENSIGNAL, SKI_PRIVAT, TACKNING, decimal } from "@/lib/mobil/fakta";
import { MOBILNAT, OPERATORER } from "@/lib/mobil/data";

const SLUG = "basta-tackning-sverige";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const UMLAUT_TELIA =
  "https://www.mynewsdesk.com/se/telia/pressreleases/telia-har-sveriges-baesta-mobilnaet-foer-sjaette-aaret-i-rad-enligt-umlaut-2025-3426192";
const STAMNING =
  "https://www.tv4.se/artikel/tt-260708-teliastamning1-eb47559b/telia-stammer-telenor-for-reklamfraser";

const NATAGARE = ["Telia", "Tele2", "Telenor", "Tre"] as const;

const TOC = [
  { id: "kort-svar", label: "Kort svar" },
  { id: "pts", label: "Vad säger PTS?" },
  { id: "opensignal", label: "Vad säger Opensignal?" },
  { id: "andra-tester", label: "Umlaut och striden om reklamen" },
  { id: "dar-du-bor", label: "Ta reda på täckningen där du bor" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Vilket mobilnät har bäst täckning i Sverige?",
    a: "Det finns inget enda svar. I Opensignals rapport från december 2025, med mätningar 1 juli till 28 september 2025, vann Telia kategorin täckningsupplevelse. Tele2 och Telenor nådde 5G på 90 procent av landytan i september 2025. PTS redovisar inte täckning per operatör. Det som avgör för dig är täckningen där du bor och rör dig.",
    kalla: "Opensignal december 2025, Tele2 september 2025",
  },
  {
    q: "Vilket nät är snabbast?",
    a: "I Opensignals rapport från december 2025 hade Telenor högst genomsnittlig nedladdningshastighet, 84,7 Mbit/s, och Tele2 högst hastighet på 5G, 219,0 Mbit/s. Mätperioden var 1 juli till 28 september 2025.",
    kalla: "Opensignal, Sweden Mobile Network Experience, december 2025",
  },
  {
    q: "Har billiga operatörer sämre täckning?",
    a: "Inte på grund av priset. En operatör som kör i Telias, Tele2s, Telenors eller Tres nät får samma radiotäckning som nätägaren. Maxhastighet och tjänster som wifi-samtal kan däremot skilja.",
  },
  {
    q: "Hur ser jag täckningen där jag bor?",
    a: "Alla fyra nätägare har täckningskartor på sina webbplatser. Sök på din adress, och kolla även stugan, jobbet och vägarna du kör. Kartorna är operatörernas egna beräkningar, så fråga gärna grannar vilket nät som fungerar inomhus.",
  },
];

export const Route = createFileRoute("/guider/basta-tackning-sverige")({
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
  const ski = SKI_PRIVAT.filter((s) => (NATAGARE as readonly string[]).includes(s.namn));
  const bransch = SKI_PRIVAT.find((s) => s.namn === "Branschen");

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang i alla nät" }}
    >
      <P>
        Inget nät vinner allt. I Opensignals rapport från december 2025 vann Telia
        täckningsupplevelse, Telenor nedladdningshastighet, Tele2 5G-hastighet och Tre jämn
        kvalitet. PTS mäter bara den samlade täckningen, inte per operatör. För dig avgör täckningen
        där du bor och rör dig, så kolla operatörernas kartor för din adress.
      </P>

      <H2 id="kort-svar">Kort svar: det beror på vad du mäter</H2>
      <P>
        Sverige har fyra mobilnät: Telias, Tele2s, Telenors och Tres. Tele2 och Telenor delar
        dessutom radionätet för 4G och 5G genom det samägda bolaget Net4Mobility. Alla andra
        operatörer kör i något av dem. Det finns ingen officiell rankning av vilket nät som är bäst,
        och de mätningar som finns mäter olika saker.
      </P>
      <UL>
        <li>
          <strong>PTS</strong> kartlägger hur stor del av Sverige som har täckning från minst en
          operatör.
        </li>
        <li>
          <strong>Opensignal</strong> mäter vad användarna faktiskt upplever i sina telefoner, under
          en viss period.
        </li>
        <li>
          <strong>Operatörerna</strong> redovisar sin egen täckning och lyfter fram de tester de
          vinner.
        </li>
      </UL>
      <P>
        Vi gör inga egna mätningar och sätter inga betyg på näten. Nedan står vad varje källa säger,
        med period och länk.
      </P>

      <H2 id="pts">Vad säger PTS om mobiltäckningen?</H2>
      <P>
        Post- och telestyrelsen kartlägger varje år mobiltäckningen i hela landet. I kartläggningen
        2025, med läget i november 2025, fanns grundläggande täckning utomhus på {TACKNING.ptsYta}{" "}
        procent av Sveriges yta. Året innan var det {TACKNING.ptsYta2024} procent. God täckning
        fanns i {TACKNING.ptsBebott} procent av de bebodda områdena.
      </P>
      <P>
        Ett område räknas som täckt om minst en operatör täcker det. Rapporten redovisar inga
        siffror per operatör, så den säger inget om vilket nät som är bäst.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.ptsTackning.url} className="underline underline-offset-2">
          {KALLOR.ptsTackning.namn}
        </a>
        .
      </p>
      <H3>Vad operatörerna själva uppger</H3>
      <P>
        Tele2 och Telenor aktiverade 5G i hela sitt gemensamma nät i september 2025. Enligt Tele2
        når 5G därmed {TACKNING.n4m5gYta} procent av landytan och {TACKNING.n4m5gBefolkning} procent
        av befolkningen. Telia uppger att dess 4G- och 5G-nät når {TACKNING.telia4g5gBefolkning}{" "}
        procent av befolkningen och över {TACKNING.telia4g5gYta} procent av landytan. För Tres
        täckning i procent har vi inte hittat någon primärkälla.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.n4m5g.url} className="underline underline-offset-2">
          {KALLOR.n4m5g.namn}
        </a>{" "}
        och{" "}
        <a href={UMLAUT_TELIA} className="underline underline-offset-2">
          Telias pressmeddelande januari 2026
        </a>
        . Siffrorna är operatörernas egna och mäter inte samma sak.
      </p>

      <H2 id="opensignal">Vad säger Opensignal?</H2>
      <P>
        Opensignal samlar in mätningar från vanliga användares telefoner. Den senaste svenska
        rapporten publicerades i december 2025 och bygger på data från 1 juli till 28 september
        2025. Så här fördelades kategorierna:
      </P>
      <GuideTable
        head={["Kategori", "Vinnare", "Värde"]}
        rows={OPENSIGNAL.map((r) => [r.kategori, r.vinnare, r.varde])}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.opensignal.url} className="underline underline-offset-2">
          {KALLOR.opensignal.namn}
        </a>
        , mätperiod 1 juli–28 september 2025. Urval av kategorier.
      </p>
      <P>
        Telenor fick flest utmärkelser i rapporten, 11 inklusive delade. Tre fick 7. Opensignal
        mäter användarnas upplevelse, inte hur stor yta nätet täcker, så resultatet går inte att
        jämföra rakt av med PTS siffror.
      </P>

      <H2 id="andra-tester">Umlaut och striden om reklamen</H2>
      <P>
        Telia lyfter fram umlaut-testet 2025, som görs av Accenture. Enligt Telias eget
        pressmeddelande fick Telia 970 av 1 000 poäng och vann alla kategorier för sjätte året i
        rad. Andra operatörers poäng redovisas inte i Telias källa, och vi har inte kunnat
        kontrollera hela resultatet. Se det därför som Telias egen uppgift.
      </P>
      <P>
        Hur man läser mätningarna är också en tvist. I juli 2026 stämde Telia Telenor för
        reklamfraserna &rdquo;Sveriges bästa nät&rdquo; och &rdquo;landets snabbaste 5G-nät&rdquo;,
        som Telenor grundar på Opensignal. Telia menar att Telenor bara vann två kategorier ensamt
        och nio delat, medan Telia vann bland annat täckningsupplevelsen.
      </P>
      <p className={KALLRAD}>
        Källor:{" "}
        <a href={UMLAUT_TELIA} className="underline underline-offset-2">
          Telias pressmeddelande om umlaut 2025
        </a>{" "}
        och{" "}
        <a href={STAMNING} className="underline underline-offset-2">
          TT/TV4, 8 juli 2026
        </a>
        .
      </p>
      <Callout>
        Läs reklam om &rdquo;bästa nätet&rdquo; som ett urval. Varje nätägare kan peka på en
        kategori eller ett test där den vinner.
      </Callout>
      <H3>Kundnöjdhet är en annan fråga</H3>
      <P>
        Svenskt Kvalitetsindex mäter hur nöjda kunderna är med hela operatören, inte bara nätet. I
        SKI Mobil 2025 fick nätägarna{" "}
        {ski.map((s, i) => (
          <span key={s.namn}>
            {i > 0 ? (i === ski.length - 1 ? " och " : ", ") : ""}
            {s.namn} {decimal(s.varde)}
          </span>
        ))}{" "}
        bland privatkunderna, mot {bransch ? decimal(bransch.varde) : ""} för branschen. Flera av
        varumärkena i samma nät hade högre värden.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.ski.url} className="underline underline-offset-2">
          {KALLOR.ski.namn}
        </a>
        .
      </p>

      <H2 id="dar-du-bor">Så tar du reda på täckningen där du bor</H2>
      <P>Nationella siffror säger lite om ditt kök eller din stuga. Så här gör du i stället:</P>
      <OL>
        <li>
          Sök på din adress i nätägarnas täckningskartor. Kolla också jobbet, stugan och vägarna du
          kör ofta.
        </li>
        <li>
          Fråga grannar eller kolleger vilket nät som fungerar inomhus. Kartorna är beräkningar och
          tjocka väggar kan ge sämre signal.
        </li>
        <li>
          Välj ett abonnemang utan bindningstid om du är osäker. Fungerar nätet dåligt kan du byta
          utan kostnad, och numret följer med.
        </li>
        <li>
          Har du dålig täckning inomhus men bra wifi kan wifi-samtal hjälpa. Läs guiden om{" "}
          <A href="/guider/wifi-samtal-och-dalig-tackning">wifi-samtal och dålig täckning</A>.
        </li>
      </OL>
      <P>
        När du vet vilket nät som fungerar bäst hos dig kan du jämföra alla operatörer i det nätet.
        De får samma täckning, oftast till olika pris:
      </P>
      <UL>
        {Object.values(MOBILNAT).map((n) => {
          const ops = OPERATORER.filter((o) => o.nat === n.id && o.aktiv && !o.natNotis);
          return (
            <li key={n.id}>
              <A href={`/nat/${n.id}`}>{n.namn}</A>: {ops.length} operatörer, bland andra{" "}
              {ops
                .filter((o) => o.grupp !== "mvno")
                .map((o) => o.namn)
                .join(" och ")}
            </li>
          );
        })}
      </UL>
      <P>
        Mer om hur det hänger ihop finns i guiderna{" "}
        <A href="/guider/vilket-nat-anvander-operatoren">vilket nät använder operatören</A> och{" "}
        <A href="/guider/virtuella-operatorer">virtuella operatörer</A>, och på sidan om{" "}
        <A href="/nat">Sveriges mobilnät</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
