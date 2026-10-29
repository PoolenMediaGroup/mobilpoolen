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
import { KALLOR, MARKNAD } from "@/lib/mobil/fakta";
import { formatTal } from "@/lib/mobil/berakna";

const SLUG = "hur-mycket-surf-drar-appar";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const NETFLIX_HJALP = "https://help.netflix.com/en/node/87";
const SPOTIFY_HJALP = "https://support.spotify.com/article/audio-quality";

/** Netflix Help Center: dataåtgång per timme och enhet, "upp till". */
const NETFLIX = [
  { niva: "Låg", gb: 0.3 },
  { niva: "Medium", gb: 0.7 },
  { niva: "Hög (SD)", gb: 1 },
  { niva: "Hög (HD)", gb: 3 },
  { niva: "Hög (4K Ultra HD)", gb: 7 },
];

/** Spotify Support: bithastighet per ljudkvalitet. MB per timme = kbit/s × 3600 ÷ 8000. */
const SPOTIFY = [
  { niva: "Låg", kbit: 24 },
  { niva: "Normal", kbit: 96 },
  { niva: "Hög", kbit: 160 },
  { niva: "Mycket hög", kbit: 320 },
];

const mbPerTimme = (kbit: number) => Math.round((kbit * 3600) / 8000);

/** Netflix mobilinställning "Automatiskt": cirka 4 timmar per GB. */
const NETFLIX_AUTO_GB_PER_TIMME = 1 / 4;

/** En timme om dagen i 30 dagar, i GB. */
const perManad = (gbPerTimme: number) => gbPerTimme * 30;

const spotifyNormalManad = perManad(mbPerTimme(96) / 1000);
const netflixAutoManad = perManad(NETFLIX_AUTO_GB_PER_TIMME);
const netflixHdManad = perManad(3);

const TOC = [
  { id: "snabbt-svar", label: "Hur mycket drar film och musik?" },
  { id: "netflix", label: "Netflix" },
  { id: "spotify", label: "Spotify" },
  { id: "ovriga-appar", label: "TikTok, YouTube och videosamtal" },
  { id: "rakna", label: "Räkna fram din månad" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Hur mycket surf drar Netflix i timmen?",
    a: "Enligt Netflix drar en timme upp till 0,3 GB i låg kvalitet, upp till 1 GB i SD, upp till 3 GB i HD och upp till 7 GB i 4K. I mobilen ger inställningen Automatiskt cirka 4 timmar film per GB.",
    kalla: "Netflix Help Center",
  },
  {
    q: "Hur mycket surf drar Spotify?",
    a: `Spotify strömmar i cirka 24 till 320 kbit/s beroende på ljudkvalitet. Omräknat blir det ungefär ${mbPerTimme(24)} MB i timmen på Låg, ${mbPerTimme(96)} MB på Normal och ${mbPerTimme(320)} MB på Mycket hög.`,
    kalla: "Spotify Support, omräkning av Mobilpoolen",
  },
  {
    q: "Hur mycket surf drar TikTok och YouTube?",
    a: "TikTok och YouTube publicerar inga siffror per timme som vi har kunnat kontrollera. Det beror på videokvalitet och hur mycket du tittar. Mät själv: telefonen visar hur mycket mobildata varje app har använt under inställningarna för mobilnät eller dataanvändning.",
  },
  {
    q: "Drar det surf att lyssna på nedladdad musik eller film?",
    a: "Nej. Det du har laddat ned för att spela offline spelas upp från telefonen och drar ingen mobilsurf. Ladda ned över wifi, så går det inte heller åt surf när du laddar ned.",
  },
];

export const Route = createFileRoute("/guider/hur-mycket-surf-drar-appar")({
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
      cta={{ label: "Jämför abonnemang efter surfmängd" }}
    >
      <P>
        Film drar mest surf. En timme Netflix i HD drar upp till 3 GB enligt Netflix, medan en timme
        Spotify i normal kvalitet drar runt {mbPerTimme(96)} MB. TikTok, YouTube och videosamtal
        publicerar inga egna siffror, så för dem behöver du mäta din förbrukning i telefonen. Det
        tar fem minuter och ger ett bättre svar än någon tabell.
      </P>

      <H2 id="snabbt-svar">Hur mycket surf drar film och musik?</H2>
      <P>
        Video är det som tar slut på surfen. Ljud drar lite, och meddelanden, mejl och vanlig surf
        på webbsidor drar ännu mindre. Skillnaden mellan låg och hög videokvalitet är stor, så det
        är inställningen i appen som avgör, inte bara hur mycket du tittar.
      </P>
      <P>
        Som jämförelse använde ett svenskt abonnemang med samtal och data i snitt{" "}
        {MARKNAD.surfPerManad} GB i månaden under 2025, enligt PTS. Året innan var det{" "}
        {MARKNAD.surfPerManad2024} GB. PTS räknar själva med att en timme film i HD motsvarar cirka
        3 GB.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.ptsMarknad.url} className="underline underline-offset-2">
          {KALLOR.ptsMarknad.namn}
        </a>
        .
      </p>

      <H2 id="netflix">Hur mycket surf drar Netflix?</H2>
      <P>
        Netflix anger hur mycket data en timme film drar per enhet, beroende på vilken kvalitet du
        strömmar i. Siffrorna är maxvärden, så det kan bli mindre.
      </P>
      <GuideTable
        head={["Kvalitet", "Upp till per timme", "Timmar per 5 GB (ungefär)"]}
        rows={NETFLIX.map((n) => [
          n.niva,
          `${formatTal(n.gb)} GB`,
          `${formatTal(Math.round((5 / n.gb) * 10) / 10)} h`,
        ])}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={NETFLIX_HJALP} className="underline underline-offset-2">
          Netflix Help Center, How to control how much data Netflix uses
        </a>
        . Timmar per 5 GB är vår omräkning.
      </p>
      <P>
        I mobilappen finns en egen inställning för mobildata. Med <strong>Automatiskt</strong> får
        du enligt Netflix cirka 4 timmar film per GB. <strong>Spara data</strong> ger cirka 6 timmar
        per GB. <strong>Maximal data</strong> kan dra 1 GB på 20 minuter eller mer. Ändra under
        appinställningarna, uppspelning av video, mobildata.
      </P>

      <H2 id="spotify">Hur mycket surf drar Spotify?</H2>
      <P>
        Spotify anger bithastigheten för varje ljudkvalitet. Vi har räknat om den till megabyte per
        timme med formeln kbit/s × 3 600 ÷ 8 000.
      </P>
      <GuideTable
        head={["Ljudkvalitet", "Bithastighet", "Per timme (ungefär)"]}
        rows={[
          ...SPOTIFY.map((s) => [s.niva, `${s.kbit} kbit/s`, `${mbPerTimme(s.kbit)} MB`]),
          ["Lossless", "Upp till 24 bit/44,1 kHz FLAC", "Anges inte, mer än Mycket hög"],
        ]}
      />
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={SPOTIFY_HJALP} className="underline underline-offset-2">
          Spotify Support, Audio quality
        </a>
        . Megabyte per timme är vår omräkning.
      </p>
      <P>
        Musik är alltså billigt i surf. Även på Mycket hög drar en timme mindre än en tjugondel av
        vad en timme Netflix i HD kan dra. Vill du spara ändå: ladda ned spellistor över wifi och
        lyssna offline. Podcaster fungerar på samma sätt.
      </P>

      <H2 id="ovriga-appar">Hur mycket surf drar TikTok, YouTube och videosamtal?</H2>
      <P>
        Här finns inga siffror vi kan stå för. TikTok, YouTube och tjänsterna för videosamtal
        publicerar inte dataåtgång per timme på ett sätt vi har kunnat kontrollera. Siffror som
        cirkulerar på nätet är andras uppskattningar och skiljer sig mycket åt.
      </P>
      <P>
        Det vi kan säga är att det är video, och att videokvaliteten styr. Flera appar har en
        inställning för att spara data eller begränsa kvaliteten på mobilnät. Det bästa svaret får
        du genom att mäta själv:
      </P>
      <OL>
        <li>
          Öppna inställningarna i telefonen. På iPhone heter avsnittet Mobilnät eller Mobildata. På
          Android finns det oftast under Nätverk och internet eller Anslutningar, och sedan
          Dataanvändning.
        </li>
        <li>
          Där ser du hur mycket mobildata varje app har använt. Nollställ statistiken i början av en
          period så blir siffran lätt att läsa.
        </li>
        <li>
          Använd telefonen som vanligt i en eller två veckor. Räkna sedan upp till en hel månad.
        </li>
      </OL>
      <Callout>
        Kom ihåg att wifi inte drar mobilsurf. Det du tittar på hemma i soffan över wifi syns inte i
        mobildatastatistiken och ska inte räknas med.
      </Callout>

      <H2 id="rakna">Räkna fram hur mycket surf du behöver i månaden</H2>
      <P>
        Börja med det som drar mest. Tre exempel på en timme om dagen i 30 dagar, med siffrorna
        ovan:
      </P>
      <UL>
        <li>
          <strong>Spotify i normal kvalitet:</strong> ungefär {formatTal(spotifyNormalManad)} GB i
          månaden.
        </li>
        <li>
          <strong>Netflix med Automatiskt i mobilen:</strong> ungefär {formatTal(netflixAutoManad)}{" "}
          GB i månaden.
        </li>
        <li>
          <strong>Netflix i HD:</strong> upp till {formatTal(netflixHdManad)} GB i månaden.
        </li>
      </UL>
      <P>
        Lägg till sociala medier, kartor och vanlig surf utifrån vad din telefon visar. Lägg sedan
        på lite marginal för månader med resor eller när wifi saknas.
      </P>
      <H3>Välj surfmängd efter din siffra</H3>
      <P>
        Hamnar du under några GB räcker ett litet abonnemang. Läs{" "}
        <A href="/guider/racker-5-gb-surf">om 5 GB surf räcker</A>. Ligger du nära gränsen varje
        månad kan sparad surf hjälpa, se <A href="/guider/sparad-surf-dubbel-surf">sparad surf</A>.
        Tittar du mycket på film utan wifi är <A href="/obegransad-surf">obegränsad surf</A> ofta
        enklare. Vill du ha hjälp med uträkningen finns verktyget{" "}
        <A href="/verktyg/hur-mycket-surf-behover-jag">hur mycket surf behöver jag</A>.
      </P>
      <P>
        Tar surfen slut ändå, läs vad som händer i guiden om{" "}
        <A href="/guider/nar-surfen-tar-slut">när surfen tar slut</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
