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
import { MOBILNAT, OPERATORER, PRIVATA, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { KALLOR, MARKNAD, OPENSIGNAL, TACKNING } from "@/lib/mobil/fakta";
import { datumText } from "@/lib/mobil/berakna";
import type { Operator } from "@/lib/mobil/typer";

const SLUG = "behover-jag-5g";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const UMLAUT_TELIA =
  "https://www.mynewsdesk.com/se/telia/pressreleases/telia-har-sveriges-baesta-mobilnaet-foer-sjaette-aaret-i-rad-enligt-umlaut-2025-3426192";

const AKTIVA = OPERATORER.filter((o) => o.aktiv);
const MED_5G = AKTIVA.filter((o) => o.femg);
const UTAN_5G = AKTIVA.filter((o) => !o.femg);

const femgOs = OPENSIGNAL.filter((r) => r.kategori.startsWith("5G"));

function lista(o: Operator[]): string {
  const namn = o.map((x) => x.namn);
  if (namn.length < 2) return namn.join("");
  return `${namn.slice(0, -1).join(", ")} och ${namn[namn.length - 1]}`;
}

const TOC = [
  { id: "vad-ger", label: "Vad ger 5G i praktiken?" },
  { id: "tackning", label: "Hur stor del av Sverige har 5G?" },
  { id: "vad-kravs", label: "Vad krävs för 5G?" },
  { id: "operatorer", label: "Vilka operatörer har 5G?" },
  { id: "behover", label: "Behöver du 5G?" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Behöver jag 5G?",
    a: "De flesta klarar sig bra med 4G. 5G ger mest om du laddar ned eller strömmar mycket, är på platser med många användare eller vill ha den högsta hastigheten. Det ingår i dag i de flesta abonnemang, så frågan är oftare om telefonen klarar det.",
  },
  {
    q: "Behöver jag en ny telefon för 5G?",
    a: "Ja, om din telefon inte stöder 5G. Det står i telefonens specifikationer. En telefon utan 5G fungerar fortfarande på 4G, så den slutar inte fungera för att du byter till ett abonnemang med 5G.",
  },
  {
    q: "Kostar 5G extra?",
    a: `Oftast inte. Hos ${MED_5G.length} av de ${AKTIVA.length} operatörer vi har gått igenom ingår 5G enligt operatören. Kontrollera ändå att just ditt abonnemang har det, och om det finns ett tak för hastigheten.`,
    kalla: `operatörernas webbplatser, kontrollerade ${datumText(SENAST_KONTROLLERAD)}`,
  },
  {
    q: "Ringer man över 5G?",
    a: "Inte i dag. Enligt PTS erbjöd ingen svensk operatör samtal i 5G-nätet 2025. Samtalen går över 4G med VoLTE, som stod för omkring 95 procent av samtalsminuterna.",
    kalla: "PTS, Svensk telekommarknad 2025",
  },
];

export const Route = createFileRoute("/guider/behover-jag-5g")({
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
  const femgAbonnemang = PRIVATA.filter((a) => a.femg).length;

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang med 5G" }}
    >
      <P>
        För de flesta räcker 4G bra. 5G ger högre hastighet och mer kapacitet där många surfar
        samtidigt, men samtal och vanlig surf fungerar lika bra på 4G. 5G ingår redan i de flesta
        abonnemang utan extra kostnad. Det du behöver är en telefon som stöder 5G och täckning där
        du är.
      </P>

      <H2 id="vad-ger">Vad ger 5G i praktiken?</H2>
      <P>5G är nästa generations mobilnät efter 4G. I vardagen märks det främst på tre sätt:</P>
      <UL>
        <li>
          <strong>Högre hastighet.</strong> I Opensignals rapport från december 2025 var den högsta
          genomsnittliga nedladdningshastigheten på 5G{" "}
          {femgOs.find((r) => r.kategori.includes("nedladdning"))?.varde}, mot{" "}
          {OPENSIGNAL.find((r) => r.kategori === "Nedladdningshastighet")?.varde} för all mobilsurf.
        </li>
        <li>
          <strong>Mer kapacitet.</strong> Där många använder nätet samtidigt, som på arenor och
          stationer, klarar 5G fler användare.
        </li>
        <li>
          <strong>Inget för samtalen.</strong> Samtal går fortfarande över 4G. Enligt PTS erbjöd
          ingen operatör samtal i 5G-nätet 2025.
        </li>
      </UL>
      <P>
        För att chatta, läsa nyheter, lyssna på musik och se video i mobilen räcker 4G i de flesta
        fall. Skillnaden märks mest när du laddar ned stora filer eller delar surf till en dator.
      </P>
      <p className={KALLRAD}>
        Källor:{" "}
        <a href={KALLOR.opensignal.url} className="underline underline-offset-2">
          {KALLOR.opensignal.namn}
        </a>{" "}
        (mätperiod 1 juli–28 september 2025) och{" "}
        <a href={KALLOR.ptsMarknad.url} className="underline underline-offset-2">
          {KALLOR.ptsMarknad.namn}
        </a>
        .
      </p>

      <H2 id="tackning">Hur stor del av Sverige har 5G?</H2>
      <P>
        5G byggdes snabbt ut under 2025. Under året använde {MARKNAD.femgAbonnemang} mobilabonnemang
        5G-nätet, ungefär {MARKNAD.femgAndel} procent av alla, enligt PTS.
      </P>
      <GuideTable
        head={["Nät", "Vad operatören uppger"]}
        rows={[
          [
            "Tele2 och Telenor (Net4Mobility)",
            `5G på ${TACKNING.n4m5gYta} % av landytan och ${TACKNING.n4m5gBefolkning} % av befolkningen sedan september 2025`,
          ],
          [
            "Telia",
            `4G och 5G når ${TACKNING.telia4g5gBefolkning} % av befolkningen och över ${TACKNING.telia4g5gYta} % av landytan. Ren 5G redovisas inte separat`,
          ],
          ["Tre", "Ingen siffra i procent som vi har kunnat belägga"],
        ]}
      />
      <p className={KALLRAD}>
        Källor:{" "}
        <a href={KALLOR.n4m5g.url} className="underline underline-offset-2">
          {KALLOR.n4m5g.namn}
        </a>{" "}
        och{" "}
        <a href={UMLAUT_TELIA} className="underline underline-offset-2">
          Telias pressmeddelande januari 2026
        </a>
        . Siffrorna är operatörernas egna och mäter olika saker.
      </p>
      <P>
        Täckning på en karta betyder inte att du får full 5G-hastighet överallt. Inomhus och på
        landsbygden kan telefonen falla tillbaka på 4G. Kolla operatörens täckningskarta för din
        adress. Mer om näten i guiden om{" "}
        <A href="/guider/basta-tackning-sverige">bästa täckningen i Sverige</A>.
      </P>

      <H2 id="vad-kravs">Vad krävs för att använda 5G?</H2>
      <P>Tre saker måste stämma samtidigt:</P>
      <UL>
        <li>
          <strong>En telefon som stöder 5G.</strong> Det står i telefonens specifikationer. Äldre
          och enklare modeller saknar det ofta.
        </li>
        <li>
          <strong>Ett abonnemang med 5G.</strong> Det ingår i de flesta, men inte alla.
        </li>
        <li>
          <strong>5G-täckning där du är.</strong> Annars använder telefonen 4G automatiskt.
        </li>
      </UL>
      <Callout>
        Du behöver inte byta telefon för att byta till ett abonnemang med 5G. En telefon utan 5G
        fungerar på 4G som vanligt. Det som spelar roll är att telefonen kan ringa över 4G (VoLTE),
        sedan 2G och 3G stängdes i de flesta nät. Läs mer om{" "}
        <A href="/guider/2g-3g-nedslackning">nedsläckningen av 2G och 3G</A>.
      </Callout>

      <H2 id="operatorer">Vilka operatörer har 5G?</H2>
      <P>
        Enligt operatörernas egna uppgifter ingår 5G hos {lista(MED_5G)}.{" "}
        {UTAN_5G.length > 0 &&
          `Hos ${lista(UTAN_5G)} har vi inte kunnat bekräfta 5G på operatörens webbplats.`}{" "}
        Av de {PRIVATA.length} privatabonnemang vi jämför har {femgAbonnemang} 5G.
      </P>
      <GuideTable
        brytForsta
        head={["Operatör", "Nät", "5G enligt operatören"]}
        rows={AKTIVA.map((o) => [
          o.namn,
          o.natNotis ? "Anges inte" : MOBILNAT[o.nat].namn,
          o.femg ? "Ja" : "Inte bekräftat",
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
      </p>
      <P>
        Kolla också maxhastigheten. Vissa operatörer har 5G men sätter ett tak, till exempel 100
        eller 150 Mbit/s. Det räcker gott för mobilen men tar bort en del av poängen med 5G om du
        vill ha högsta möjliga fart. Alla abonnemang med 5G finns på sidan{" "}
        <A href="/5g-abonnemang">5G-abonnemang</A>.
      </P>

      <H2 id="behover">Behöver du 5G?</H2>
      <P>
        <strong>Du har nytta av 5G</strong> om du laddar ned eller strömmar mycket utan wifi, delar
        surf till datorn, rör dig ofta där många är uppkopplade samtidigt eller har en ny telefon
        och vill ha ut det den klarar.
      </P>
      <P>
        <strong>Du klarar dig utan</strong> om du mest chattar, ringer, lyssnar på musik och surfar
        på wifi hemma. Då är surfmängd, pris och täckning viktigare än nätgenerationen.
      </P>
      <P>
        Eftersom 5G ingår nästan överallt ska det sällan styra valet. Välj efter täckning där du bor
        och efter vad abonnemanget kostar under ett helt år. Börja med{" "}
        <A href="/billigaste-mobilabonnemang">de billigaste mobilabonnemangen</A> eller se vilket
        nät operatören använder i{" "}
        <A href="/guider/vilket-nat-anvander-operatoren">guiden om näten</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
