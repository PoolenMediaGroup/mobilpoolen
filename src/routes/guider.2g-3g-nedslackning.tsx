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
  OL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { KALLOR, MARKNAD, NEDSLACKNING } from "@/lib/mobil/fakta";

const SLUG = "2g-3g-nedslackning";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "vad-hande", label: "Vad har hänt med 2G och 3G?" },
  { id: "tidslinje", label: "Datum per operatör" },
  { id: "kontrollera", label: "Fungerar din telefon?" },
  { id: "nodsamtal", label: "Nödsamtal och blockerade telefoner" },
  { id: "larm", label: "Larm, klockor och annan utrustning" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "När stängdes 2G och 3G i Sverige?",
    a: `Tele2, Telenor och Tre stängde sina 2G- och 3G-nät den ${NEDSLACKNING.n4mOchTre}. Telia stängde 3G under 2025 men behåller 2G till ${NEDSLACKNING.teliaTvaG}.`,
  },
  {
    q: "Varför fungerar inte min gamla mobil längre?",
    a: "Telefoner som bara kan ringa över 2G eller 3G kan inte ringa i Tele2s, Telenors och Tres nät längre. Samtal kräver nu 4G-samtal, VoLTE. Kan telefonen inte heller ringa nödsamtal över 4G har den blockerats i de näten sedan 2 februari 2026.",
  },
  {
    q: "Ska jag ringa 112 för att testa om telefonen fungerar?",
    a: "Nej. Krisinformation.se avråder från det. Kontrollera i stället om operatören har hört av sig, och se efter i telefonens inställningar om 4G-samtal eller VoLTE finns.",
  },
  {
    q: "Påverkas Telias kunder?",
    a: `Telia omfattas inte av PTS beslut om blockering. Telias 3G är stängt, men 2G finns kvar till ${NEDSLACKNING.teliaTvaG}. En telefon som bara kan 2G fungerar därför i Telias nät fram till dess, men inte längre.`,
  },
];

export const Route = createFileRoute("/guider/2g-3g-nedslackning")({
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
      cta={{ label: "Jämför abonnemang med 4G och 5G" }}
    >
      <P>
        Tele2, Telenor och Tre stängde 2G och 3G den {NEDSLACKNING.n4mOchTre}. Telia har stängt 3G
        men behåller 2G till {NEDSLACKNING.teliaTvaG}. Din telefon fungerar om den kan ringa över
        4G, så kallat VoLTE. Telefoner som inte kan ringa nödsamtal över 4G blockeras i Tele2s,
        Telenors och Tres nät sedan 2 februari 2026.
      </P>

      <H2 id="vad-hande">Vad har hänt med 2G och 3G?</H2>
      <P>
        2G och 3G är de äldre mobilnäten. Nästan all trafik har redan flyttat till 4G och 5G. Enligt
        PTS gick omkring {MARKNAD.volteAndel} procent av alla samtalsminuter över 4G under 2025.
        Operatörerna släcker därför de gamla näten och använder frekvenserna till 4G och 5G i
        stället.
      </P>
      <P>
        För de flesta märks ingenting. En telefon som har köpts de senaste åren klarar 4G-samtal.
        Det är äldre telefoner, enkla knapptelefoner och viss utrustning med inbyggt SIM-kort som
        riskerar att sluta fungera.
      </P>

      <H2 id="tidslinje">Datum per operatör</H2>
      <GuideTable
        head={["Nät", "2G", "3G", "Operatörer i nätet (urval)"]}
        rows={[
          [
            "Tele2s nät",
            `Stängt ${NEDSLACKNING.n4mOchTre}`,
            `Stängt ${NEDSLACKNING.n4mOchTre}`,
            "Tele2, Comviq, Tellus",
          ],
          [
            "Telenors nät",
            `Stängt ${NEDSLACKNING.n4mOchTre}`,
            `Stängt ${NEDSLACKNING.n4mOchTre}`,
            "Telenor, Vimla, My Beat, Fibio",
          ],
          [
            "Tres nät",
            `Stängt ${NEDSLACKNING.n4mOchTre}`,
            `Stängt ${NEDSLACKNING.n4mOchTre}`,
            "Tre, Hallon, Chilimobil, katshing",
          ],
          [
            "Telias nät",
            `Öppet till ${NEDSLACKNING.teliaTvaG}`,
            "Stängt under 2025",
            "Telia, Fello",
          ],
        ]}
      />
      <p className={KALLRAD}>
        Källor: SVT Nyheter 30 november 2025, Telekområdgivarna om 2G och 3G. Operatörerna kör i
        samma nät som nätägaren, så datumen gäller även dem.
      </p>
      <P>
        Har du en telefon som bara kan 2G och vill behålla den en tid till, är Telias nät det enda
        alternativet. Det är en tillfällig lösning. Läs om vilka operatörer som kör i vilket nät i{" "}
        <A href="/guider/vilket-nat-anvander-operatoren">guiden om mobilnäten</A>.
      </P>

      <H2 id="kontrollera">Fungerar din telefon?</H2>
      <OL>
        <li>
          <strong>Har operatören hört av sig?</strong> Operatörerna har kontaktat kunder med
          telefoner som påverkas. Läs sms och mejl från dem.
        </li>
        <li>
          <strong>Leta efter 4G-samtal eller VoLTE i inställningarna.</strong> På iPhone ligger det
          under Mobilnät. På Android under Mobilnät eller Anslutningar. Finns inställningen, slå på
          den.
        </li>
        <li>
          <strong>Titta på symbolen vid samtal.</strong> Visar telefonen 4G, LTE eller VoLTE under
          ett samtal går det över 4G.
        </li>
        <li>
          <strong>Uppdatera programvaran.</strong> Stödet för VoLTE kan komma med en uppdatering.
        </li>
      </OL>
      <Callout>
        Ring inte 112 för att testa telefonen. Det rådet ger Krisinformation.se. Nödnumret ska vara
        ledigt för riktiga nödlägen.
      </Callout>

      <H2 id="nodsamtal">Nödsamtal och blockerade telefoner</H2>
      <P>
        Den 21 november 2025 förelade PTS Tre, Telenor och Tele2 att se till att nödsamtal till 112
        fungerar i deras nät. Vissa telefoner kan använda 4G för surf och vanliga samtal men inte
        ringa nödsamtal över 4G. Sådana telefoner skulle blockeras från 2 februari 2026. Vissa
        modeller blockerades redan 1 december 2025. Enligt PTS berördes tiotusentals telefoner.
      </P>
      <P>Krisinformation.se ger tre råd till den som berörs:</P>
      <UL>
        <li>Kontrollera om operatören har hört av sig.</li>
        <li>Byt till en telefon som klarar nödsamtal över 4G och VoLTE.</li>
        <li>Eller byt till en operatör som har löst problemet för din telefon.</li>
      </UL>
      <P>
        Byter du operatör kan du ta med numret. Se{" "}
        <A href="/guider/byta-operator-behalla-nummer">så byter du operatör och behåller numret</A>.
        Telia omfattas inte av blockeringsbeslutet.
      </P>

      <H2 id="larm">Larm, klockor och annan utrustning</H2>
      <P>
        Allt med ett SIM-kort påverkas, inte bara telefoner. Det kan vara trygghetslarm, hemlarm,
        hisslarm, grindöppnare, GPS-spårare och äldre klockor för barn. Utrustning som bara kan
        kommunicera över 2G eller 3G fungerar inte längre i Tele2s, Telenors och Tres nät, och i
        Telias nät inte efter att 2G stängts.
      </P>
      <P>
        Kontakta leverantören av utrustningen och fråga om den klarar 4G. Gäller det ett
        trygghetslarm hos en äldre anhörig, gör det snarast. Läs också vår sida om{" "}
        <A href="/pensionar">mobilabonnemang för pensionärer</A> om du hjälper någon att byta
        telefon.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: PTS pressmeddelande 21 november 2025; Krisinformation.se om nedstängningen av 2G och
        3G (uppdaterad 27 september 2026); {KALLOR.ptsMarknad.namn}; Telekområdgivarna.
      </p>
    </GuidePage>
  );
}
