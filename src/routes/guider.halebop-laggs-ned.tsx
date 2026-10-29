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
import { MOBILNAT, OPERATORER, PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { billigastForBehov, datumText, gbText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import { decimal, SKI_PRIVAT } from "@/lib/mobil/fakta";

const SLUG = "halebop-laggs-ned";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";
const M3 =
  "https://www.m3.se/article/3154242/halebop-gar-i-graven-kunderna-flyttas-over-till-telia.html";

const TOC = [
  { id: "vad-hander", label: "Vad händer med Halebop?" },
  { id: "rattigheter", label: "Dina rättigheter om villkoren ändras" },
  { id: "telias-nat", label: "Alternativ i Telias nät" },
  { id: "andra-nat", label: "Alternativ i andra nät" },
  { id: "byta", label: "Så byter du och behåller numret" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Läggs Halebop ned?",
    a: "Ja. Telia meddelade den 2 juni 2026 att varumärket Halebop avvecklas och att kunderna flyttas över till Telia. Det rapporterade bland andra M3.",
  },
  {
    q: "Måste jag bli kund hos Telia?",
    a: "Nej. Du kan säga upp abonnemanget och byta till vilken operatör du vill och ta med numret. Har du bindningstid kvar ska den återstående tiden betalas, men den hindrar inte en nummerflytt.",
  },
  {
    q: "Kan Telia höja priset när jag flyttas över?",
    a: "Ändras villkoren till din nackdel ska du få besked minst en månad innan. Du har då rätt att säga upp avtalet utan extra kostnad inom tre månader från beskedet. Det följer av 12 kap. 12 § lagen om elektronisk kommunikation.",
  },
  {
    q: "Byter jag mobilnät om jag stannar hos Telia?",
    a: "Nej. Halebop använder redan Telias nät, så täckningen blir densamma. Byter du till en operatör i ett annat nät kan täckningen bli bättre eller sämre där du bor.",
  },
];

export const Route = createFileRoute("/guider/halebop-laggs-ned")({
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
  const teliaNat = OPERATORER.filter((o) => o.aktiv && o.nat === "telia" && !o.natNotis);
  const teliaNatMedPris = teliaNat.filter((o) => o.prisKontrollerade).map((o) => o.slug);
  const teliaNatUtanPris = teliaNat.filter((o) => !o.prisKontrollerade).map((o) => o.namn);

  const iTeliasNat = PRIVATA.filter(
    (a) => teliaNatMedPris.includes(a.operator) && !a.namn.includes("Plus "),
  ).sort((a, b) => snittForstaAret(a) - snittForstaAret(b));

  const andraNat = PRIVATA.filter((a) => {
    const o = operator(a.operator);
    return (
      o &&
      o.aktiv &&
      o.nat !== "telia" &&
      !a.malgrupp?.some((m) => m === "senior" || m === "student" || m === "ung")
    );
  });
  const behov = [5, 10, 20, 50];
  const billigast = behov
    .map((gb) => ({ gb, a: billigastForBehov(andraNat, gb) }))
    .filter((r) => r.a != null);

  const skiHalebop = SKI_PRIVAT.find((s) => s.namn === "Halebop")?.varde;
  const skiFello = SKI_PRIVAT.find((s) => s.namn === "Fello")?.varde;
  const skiTelia = SKI_PRIVAT.find((s) => s.namn === "Telia")?.varde;

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför alternativ till Halebop" }}
    >
      <P>
        Halebop läggs ned. Telia meddelade den 2 juni 2026 att varumärket avvecklas och att kunderna
        flyttas över till Telia. Du behöver inte stanna. Du kan byta till vilken operatör du vill
        och ta med numret. Ändras villkoren till din nackdel har du rätt att säga upp avtalet utan
        extra kostnad.
      </P>

      <H2 id="vad-hander">Vad händer med Halebop?</H2>
      <P>
        Halebop har ägts av Telia sedan 2001 och har hela tiden använt Telias mobilnät. Enligt
        Telias besked, som M3 rapporterade, avvecklas varumärket och kunderna flyttas till Telia.
        Hur det går till i detalj, och vilka priser som gäller efter flytten, ska Telia meddela
        varje kund. Läs det beskedet noga när det kommer.
      </P>
      <P>
        Halebop hade nöjda kunder. I Svenskt Kvalitetsindex 2025 fick Halebop{" "}
        {skiHalebop != null ? decimal(skiHalebop) : "uppgift saknas"} bland privatkunderna, mot{" "}
        {skiTelia != null ? decimal(skiTelia) : "uppgift saknas"} för Telia. Därför är det värt att
        jämföra innan du accepterar flytten.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={M3} className="underline underline-offset-2">
          M3, Halebop går i graven
        </a>
        ; Svenskt Kvalitetsindex, SKI Mobil 2025. Halebop finns inte med i vår prisjämförelse.
      </p>

      <H2 id="rattigheter">Dina rättigheter om villkoren ändras</H2>
      <P>
        Lagen om elektronisk kommunikation (LEK) skyddar dig när operatören ändrar avtalet. Det
        gäller oavsett vilket varumärke som står på fakturan.
      </P>
      <UL>
        <li>
          <strong>Besked i förväg.</strong> Operatören ska meddela en ändring minst en månad innan
          den gäller, på ett varaktigt sätt, till exempel mejl eller brev, och tala om att du har
          rätt att säga upp avtalet.
        </li>
        <li>
          <strong>Rätt att säga upp utan kostnad.</strong> Är ändringen inte enbart till din fördel
          kan du säga upp avtalet utan extra kostnad inom tre månader från beskedet. Det gäller även
          om du har bindningstid kvar. Undantag finns för rent administrativa ändringar utan
          negativa följder och för ändringar som krävs enligt lag (12 kap. 12 § LEK).
        </li>
        <li>
          <strong>Högst en månads uppsägningstid.</strong> Som konsument får du aldrig ha längre
          uppsägningstid än en månad (12 kap. 13 § LEK).
        </li>
      </UL>
      <Callout>
        Spara beskedet från Telia eller Halebop. Står det ett högre pris, mindre surf eller en ny
        bindningstid är det en ändring till din nackdel, och då kan du gå utan kostnad.
      </Callout>
      <P>
        Läs mer i guiden om{" "}
        <A href="/guider/prishojning-mobilabonnemang">prishöjning på mobilabonnemang</A>.
      </P>

      <H2 id="telias-nat">Alternativ i Telias nät</H2>
      <P>
        Vill du ha exakt samma täckning som i dag ska du välja en operatör i Telias nät. Här är
        Telias egna abonnemang som vi har kontrollerat, sorterade efter snittpris första året.
      </P>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Surf", "Pris/mån", "Snitt år 1"]}
        rows={iTeliasNat.map((a) => [
          `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`,
          gbText(a.gb),
          kr(a.pris),
          `${kr(snittForstaAret(a))}/mån`,
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Telias
        Obegränsad Plus med streamingtjänster är inte med i tabellen.
      </p>
      {teliaNatUtanPris.length > 0 && (
        <P>
          {teliaNatUtanPris.join(" och ")} kör också i Telias nät, men vi har inte kunnat
          kontrollera aktuella priser.{" "}
          {teliaNatUtanPris.includes("Fello") && skiFello != null
            ? `Fello hade ${decimal(skiFello)} i SKI 2025, näst högst bland privatkunderna. `
            : ""}
          Jämför på operatörens egen sida.
        </P>
      )}

      <H2 id="andra-nat">Alternativ i andra nät</H2>
      <P>
        Lägre priser finns oftast hos operatörer i Tele2s, Telenors och Tres nät. Tabellen visar det
        abonnemang som är billigast första året för några vanliga surfbehov, utanför Telias nät.
      </P>
      <GuideTable
        brytForsta
        head={["Du behöver", "Billigast första året", "Nät", "Snitt år 1"]}
        rows={billigast.map(({ gb, a }) => {
          const o = operator(a!.operator);
          return [
            `Minst ${gb} GB`,
            `${o?.namn ?? a!.operator} ${a!.namn} (${gbText(a!.gb)})`,
            o ? MOBILNAT[o.nat].kortText : "",
            `${kr(snittForstaAret(a!))}/mån`,
          ];
        })}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Snittet
        räknar in kampanjpris och startavgift. Abonnemang med ålders- eller studentkrav är inte med.
      </p>
      <P>
        Testa gärna täckningen hemma innan du byter nät. Se guiden om{" "}
        <A href="/guider/basta-tackning-sverige">bästa täckningen i Sverige</A>.
      </P>

      <H2 id="byta">Så byter du och behåller numret</H2>
      <UL>
        <li>Beställ det nya abonnemanget och välj att flytta ditt nummer.</li>
        <li>Den nya operatören säger upp det gamla abonnemanget åt dig.</li>
        <li>Avbrottet får vara högst en arbetsdag.</li>
        <li>Den gamla operatören tar inte betalt för att lämna ifrån sig numret.</li>
        <li>Bindningstid hindrar inte flytten, men återstående månader ska betalas.</li>
      </UL>
      <P>
        Steg för steg finns i guiden{" "}
        <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>. Se
        också <A href="/operatorer/halebop">vår sida om Halebop</A> och{" "}
        <A href="/billigaste-mobilabonnemang">de billigaste mobilabonnemangen</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
      <p className={KALLRAD}>
        Källor: M3 (juni 2026); lagen (2022:482) om elektronisk kommunikation, 12 kap. 12–13 och
        19–20 §§; PTSFS 2022:4 om nummerportabilitet.
      </p>
    </GuidePage>
  );
}
