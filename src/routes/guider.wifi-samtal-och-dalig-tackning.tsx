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
import { MOBILNAT, OPERATORER, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText } from "@/lib/mobil/berakna";
import { KALLOR, TACKNING } from "@/lib/mobil/fakta";

const SLUG = "wifi-samtal-och-dalig-tackning";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const TOC = [
  { id: "vad-ar", label: "Vad är wifi-samtal?" },
  { id: "vilka", label: "Vilka operatörer har wifi-samtal?" },
  { id: "installningar", label: "Kontrollera inställningarna" },
  { id: "byta-nat", label: "Byt till ett annat mobilnät" },
  { id: "forstarkare", label: "Hjälper en förstärkare?" },
  { id: "fragor", label: "Vanliga frågor" },
];

// Operatörer med bekräftade wifi-samtal enligt deras egna sidor.
const MED_WIFI = OPERATORER.filter((o) => o.aktiv && o.wifiSamtal === true);
const wifiNamn = MED_WIFI.map((o) => o.namn);
const wifiLista =
  wifiNamn.length > 1
    ? `${wifiNamn.slice(0, -1).join(", ")} och ${wifiNamn[wifiNamn.length - 1]}`
    : (wifiNamn[0] ?? "");

const FAQ = [
  {
    q: "Kostar wifi-samtal något extra?",
    a: "Samtalet räknas som ett vanligt samtal i abonnemanget och drar inte mobilsurf, eftersom det går via ditt wifi. Tele2 skriver att wifi-samtal ingår utan extra kostnad. Kontrollera hos din operatör om du är osäker.",
  },
  {
    q: "Vilka operatörer har wifi-samtal?",
    a: `Bland operatörerna i vår jämförelse har vi kunnat bekräfta wifi-samtal hos ${wifiLista}. För övriga har vi inte kunnat kontrollera det. Fråga operatören innan du byter om det är avgörande för dig.`,
  },
  {
    q: "Varför är täckningen sämre inomhus än utomhus?",
    a: "Väggar, energiglas och betong dämpar signalen från masten. Därför kan telefonen visa full täckning på gatan men tappa samtal i köket. Wifi-samtal löser det om du har bredband hemma.",
  },
  {
    q: "Kan jag behålla numret om jag byter till ett annat nät?",
    a: "Ja. Den nya operatören flyttar numret åt dig, och avbrottet får vara högst en arbetsdag. Den gamla operatören tar inte betalt för att lämna ifrån sig numret.",
  },
];

export const Route = createFileRoute("/guider/wifi-samtal-och-dalig-tackning")({
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
  const rader = Object.values(MOBILNAT).map((n) => {
    const iNatet = OPERATORER.filter((o) => o.aktiv && o.nat === n.id && !o.natNotis);
    const namn = iNatet
      .map((o) => (o.slug === "lycamobile" ? `${o.namn} (uppges)` : o.namn))
      .join(", ");
    const wifi = iNatet.filter((o) => o.wifiSamtal === true).map((o) => o.namn);
    return [n.namn, namn, wifi.length ? wifi.join(", ") : "Inte bekräftat hos någon"];
  });

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
        Har du dålig täckning inomhus är wifi-samtal ofta den enklaste lösningen. Telefonen ringer
        då via ditt bredband i stället för via masten. Det kräver att både operatören och telefonen
        stöder det. Räcker inte det kan du byta till en operatör i ett annat mobilnät och ta med
        numret.
      </P>

      <H2 id="vad-ar">Vad är wifi-samtal?</H2>
      <P>
        Wifi-samtal, ibland kallat VoWiFi, betyder att vanliga samtal och sms går över ett
        wifi-nätverk när mobilsignalen är svag. Du ringer från samma nummer och med samma app som
        vanligt. Den du ringer märker ingen skillnad. Samtalet drar inte mobilsurf, eftersom det går
        via ditt wifi.
      </P>
      <P>
        Problemet med täckning inomhus är vanligt. Enligt PTS kartläggning fanns grundläggande
        täckning utomhus på {TACKNING.ptsYta} procent av Sveriges yta i november 2025, och god
        täckning i {TACKNING.ptsBebott} procent av bebodda områden. Siffrorna gäller utomhus. Tjocka
        väggar, betong och energiglas dämpar signalen, så inne kan det vara betydligt sämre.
      </P>

      <H2 id="vilka">Vilka operatörer har wifi-samtal?</H2>
      <P>
        Tabellen visar vilka operatörer som finns i varje nät och var vi har kunnat bekräfta
        wifi-samtal på operatörens egen webbplats. Att en operatör saknas i sista kolumnen betyder
        inte att tjänsten saknas, bara att vi inte har kunnat kontrollera den.
      </P>
      <GuideTable
        brytForsta
        head={["Mobilnät", "Operatörer i nätet", "Wifi-samtal bekräftat"]}
        rows={rader}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Lyca
        Mobile uppges köra i Telenors nät men har inte bekräftat det själv.
      </p>
      <P>
        Mer om vilket nät varje operatör använder finns i guiden{" "}
        <A href="/guider/vilket-nat-anvander-operatoren">vilket nät använder operatören?</A>
      </P>

      <H2 id="installningar">Kontrollera inställningarna i telefonen</H2>
      <P>Börja med det som är gratis. Gå igenom stegen i den här ordningen:</P>
      <OL>
        <li>
          <strong>Slå på wifi-samtal.</strong> På iPhone finns det under Inställningar, Mobilnät. På
          Android ligger det oftast under Samtalsinställningar eller Anslutningar. Namnet varierar
          mellan tillverkare.
        </li>
        <li>
          <strong>Slå på 4G-samtal (VoLTE).</strong> Sedan 2G och 3G stängdes i de flesta nät går
          samtalen över 4G. En telefon som ringer över ett gammalt nät tappar lättare samtal. Läs
          mer i guiden om <A href="/guider/2g-3g-nedslackning">2G- och 3G-nedsläckningen</A>.
        </li>
        <li>
          <strong>Uppdatera telefonens programvara.</strong> Stödet för wifi-samtal och VoLTE kommer
          ofta med uppdateringar från tillverkaren.
        </li>
        <li>
          <strong>Starta om och testa ett annat rum.</strong> Täckningen kan skilja mycket mellan
          ett fönster och mitten av huset.
        </li>
      </OL>
      <Callout>
        Fungerar inte wifi-samtal trots att operatören stöder det? Kontakta operatörens kundtjänst.
        Det kan behöva aktiveras på abonnemanget, och alla telefonmodeller stöds inte.
      </Callout>

      <H2 id="byta-nat">Byt till ett annat mobilnät</H2>
      <P>
        Sverige har fyra mobilnät: Telias, Tele2s, Telenors och Tres. Tele2 och Telenor delar
        radionätet för 4G och 5G genom Net4Mobility. Täckningen inne i just ditt hus kan därför
        skilja mellan Telias nät, Tres nät och det gemensamma nätet.
      </P>
      <P>
        Enligt operatörerna själva når Telias 4G- och 5G-nät {TACKNING.telia4g5gBefolkning} procent
        av befolkningen och över {TACKNING.telia4g5gYta} procent av landytan. Tele2 och Telenor
        uppger {TACKNING.n4m5gYta} procent av landytan och {TACKNING.n4m5gBefolkning} procent av
        befolkningen för 5G. I Opensignals mätning från december 2025 hade Telia bäst
        täckningsupplevelse. Ingen av siffrorna säger något om ditt eget kök, så testa själv.
      </P>
      <UL>
        <li>
          <strong>Låna ett SIM-kort</strong> av någon i ett annat nät och jämför i de rum där det är
          sämst.
        </li>
        <li>
          <strong>Välj ett abonnemang utan bindningstid</strong> om du är osäker. Då kan du byta
          tillbaka om det inte blev bättre.
        </li>
        <li>
          <strong>Ta med numret.</strong> Den nya operatören sköter flytten. Se{" "}
          <A href="/guider/byta-operator-behalla-nummer">så byter du operatör</A>.
        </li>
      </UL>
      <P>
        Jämför näten i guiden om{" "}
        <A href="/guider/basta-tackning-sverige">bästa täckningen i Sverige</A> eller på sidan om{" "}
        <A href="/nat">Sveriges mobilnät</A>.
      </P>

      <H2 id="forstarkare">Hjälper en förstärkare?</H2>
      <P>
        En mobilförstärkare tar emot signalen utomhus och sänder ut den inomhus. Den sänder alltså
        på mobilnätens frekvenser, och en felaktig förstärkare kan störa nätet för andra. Köp därför
        inte en förstärkare på måfå på nätet.
      </P>
      <P>
        Fråga i stället din operatör vilka lösningar de godkänner för ditt nät. Har du bredband
        hemma är wifi-samtal nästan alltid billigare och enklare. En förstärkare är mest aktuell i
        till exempel ett fritidshus utan bredband.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: {KALLOR.ptsTackning.namn}; {KALLOR.opensignal.namn}; {KALLOR.n4m5g.namn}; Telias
        pressmeddelande om nätet (januari 2026).
      </p>
    </GuidePage>
  );
}
