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
import { KALLOR, NEDSLACKNING } from "@/lib/mobil/fakta";

const SLUG = "byta-operator-behalla-nummer";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const PTSFS_PORTERING =
  "https://WWW.PTS.SE/globalassets/startpage/dokument/legala-dokument/foreskrifter/telefoni/ny-lek-2022/ptsfs-2022_4-om-nummerportabilitet.pdf";

const TOC = [
  { id: "kort", label: "Så fungerar en nummerflytt" },
  { id: "steg", label: "Steg för steg" },
  { id: "lagen", label: "Dina rättigheter vid nummerflytt" },
  { id: "tid", label: "Hur lång tid tar det?" },
  { id: "fallgropar", label: "Det här ska du kolla först" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Måste jag säga upp mitt gamla abonnemang när jag byter operatör?",
    a: "Nej, inte om du flyttar numret. Du beställer hos den nya operatören och väljer nummerflytt. Det gamla abonnemanget avslutas när numret flyttats. Säg bara upp själv om du inte vill behålla numret.",
  },
  {
    q: "Kostar det något att flytta numret?",
    a: "Den gamla operatören ska lämna ifrån sig numret kostnadsfritt. Den nya operatören får ta betalt för att ta emot det. Har du bindningstid kvar ska den återstående tiden betalas till den gamla operatören.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
  {
    q: "Hur länge får mobilen vara utan täckning vid en nummerflytt?",
    a: "Högst en arbetsdag. Den nya operatören ska också koppla in tjänsten senast inom en arbetsdag från den dag ni kommit överens om.",
    kalla: "12 kap. 19–20 §§ lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Kan jag flytta numret om jag har bindningstid eller obetalda fakturor?",
    a: "Ja. Varken bindningstid eller obetalda fakturor får hindra en nummerflytt. Men det du är skyldig, och resten av bindningstiden, ska fortfarande betalas.",
    kalla: "PTSFS 2022:4 om nummerportabilitet, 4 §",
  },
  {
    q: "Kan jag ta med numret efter att abonnemanget har sagts upp?",
    a: "Ja, under en begränsad tid. Rätten att behålla numret gäller minst en månad efter att avtalet upphört. Vänta inte längre än så.",
    kalla: "12 kap. 19 § lagen (2022:482) om elektronisk kommunikation",
  },
];

export const Route = createFileRoute("/guider/byta-operator-behalla-nummer")({
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
      cta={{ label: "Hitta ett nytt abonnemang" }}
    >
      <P>
        Du byter operatör och behåller numret genom att beställa ett abonnemang hos den nya
        operatören och välja att flytta numret. Den nya operatören sköter flytten och det gamla
        abonnemanget avslutas automatiskt. Den gamla operatören får inte ta betalt för att lämna
        ifrån sig numret, och avbrottet får vara högst en arbetsdag.
      </P>

      <H2 id="kort">Så fungerar en nummerflytt</H2>
      <P>
        En nummerflytt kallas också nummerportering. Du har rätt enligt lag att ta med ditt
        mobilnummer när du byter operatör. Det gäller oavsett om du har abonnemang eller
        kontantkort, och oavsett vilken operatör du lämnar.
      </P>
      <Callout>
        Kort sagt: beställ hos den nya, välj nummerflytt, vänta på SIM-kort eller eSIM och byt på
        flyttdagen. Du behöver inte kontakta den gamla operatören.
      </Callout>

      <H2 id="steg">Byta operatör och behålla numret, steg för steg</H2>
      <OL>
        <li>
          <strong>Kolla ditt nuvarande avtal.</strong> Har du bindningstid kvar? Hur lång är
          uppsägningstiden? Det står i avtalet eller på Mina sidor. Bindningstid hindrar inte bytet,
          men den återstående tiden ska betalas. Räkna på det i{" "}
          <A href="/guider/byta-operator-med-bindningstid">byta operatör med bindningstid</A>.
        </li>
        <li>
          <strong>Välj nytt abonnemang.</strong> Jämför på snittpris första året, inte på första
          månadens pris. Kolla vilket nät operatören kör i och täckningen där du bor.
        </li>
        <li>
          <strong>Beställ och välj att flytta numret.</strong> Ange numret du vill ta med. Vissa
          operatörer frågar också efter uppgifter om ditt nuvarande abonnemang, till exempel vem som
          står på det. Välj gärna ett datum för flytten som passar dig.
        </li>
        <li>
          <strong>Vänta på SIM-kort eller eSIM.</strong> Följ den nya operatörens instruktioner om
          när du ska sätta i SIM-kortet eller aktivera eSIM. Oftast är det på flyttdagen.
        </li>
        <li>
          <strong>Byt på flyttdagen.</strong> När det gamla SIM-kortet slutar fungera är det dags
          att byta. Starta om telefonen och testa att ringa och surfa.
        </li>
        <li>
          <strong>Ta hand om det sista.</strong> Betala slutfakturan från den gamla operatören. Har
          du kontantkort, be om att få tillbaka det återstående saldot. Ta bort gamla
          autogirodragningar.
        </li>
      </OL>
      <H3>Om du står på ett abonnemang som någon annan betalar</H3>
      <P>
        Numret flyttas från den som står som abonnent. Är det en förälder eller en arbetsgivare som
        står på abonnemanget behöver den personen oftast vara med i beställningen, eller så måste
        abonnemanget först överlåtas till dig. Fråga den nya operatören vad de behöver.
      </P>

      <H2 id="lagen">Dina rättigheter vid nummerflytt</H2>
      <P>
        Reglerna står i lagen om elektronisk kommunikation och i Post- och telestyrelsens föreskrift
        om nummerportabilitet.
      </P>
      <GuideTable
        head={["Regel", "Vad som gäller", "Källa"]}
        rows={[
          [
            "Rätt att behålla numret",
            "Du har rätt att behålla numret när du byter operatör",
            "12 kap. 19 § LEK",
          ],
          [
            "Efter uppsägning",
            "Rätten gäller minst en månad efter att avtalet upphört",
            "12 kap. 19 § LEK",
          ],
          ["Avbrott", "Högst en arbetsdag under överflyttningen", "12 kap. 20 § LEK"],
          [
            "Inkoppling",
            "Så snart som möjligt och senast inom en arbetsdag från avtalad dag",
            "12 kap. 20 § LEK",
          ],
          ["Bindningstid och skulder", "Får inte hindra nummerflytten", "PTSFS 2022:4, 4 §"],
          ["Kostnad hos gamla operatören", "Numret lämnas ifrån sig kostnadsfritt", "PTSFS 2022:4"],
          ["Kostnad hos nya operatören", "Får ta betalt för att ta emot numret", "PTSFS 2022:4"],
          [
            "Kontantkortssaldo",
            "Återstående saldo ska återbetalas om du begär det",
            "PTSFS 2022:4, 9 §",
          ],
        ]}
      />
      <p className={KALLRAD}>
        Källor:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 12 kap. 19–20 §§, och{" "}
        <a href={PTSFS_PORTERING} target="_blank" rel="noopener nofollow">
          PTSFS 2022:4 om nummerportabilitet
        </a>
        .
      </p>
      <P>
        Observera att bindningstiden inte försvinner för att du flyttar numret. Du betalar den
        återstående tiden till den gamla operatören. Undantaget är om operatören har ändrat
        villkoren till din nackdel. Då får du säga upp utan extra kostnad inom tre månader från
        beskedet, se <A href="/guider/prishojning-mobilabonnemang">prishöjning</A>.
      </P>

      <H2 id="tid">Hur lång tid tar en nummerflytt?</H2>
      <P>
        Själva avbrottet får vara högst en arbetsdag. Hela processen, från beställning till att du
        använder det nya abonnemanget, tar oftast några dagar längre. Du ska vänta på SIM-kortet,
        och den gamla operatören ska lämna över numret.
      </P>
      <P>
        Hur lång tid det tar varierar mellan operatörerna. Chilimobil skriver till exempel att en
        nummerflytt tar ungefär sju arbetsdagar med SIM-kort och ungefär två dagar med eSIM. Med{" "}
        <A href="/esim">eSIM</A> slipper du vänta på posten.
      </P>
      <P>
        Har du uppsägningstid kvar kan den nya operatören välja ett flyttdatum som stämmer med den.
        Som konsument får du ha högst en månads uppsägningstid, se{" "}
        <A href="/guider/bindningstid-uppsagningstid">bindningstid och uppsägningstid</A>.
      </P>

      <H2 id="fallgropar">Det här ska du kolla innan du byter</H2>
      <UL>
        <li>
          <strong>Säg inte upp först.</strong> Säger du upp det gamla abonnemanget innan du beställt
          nummerflytt har du bara en begränsad tid på dig att flytta numret.
        </li>
        <li>
          <strong>Telefonen måste klara 4G-samtal.</strong> Tele2, Telenor och Tre stängde 2G och 3G
          den {NEDSLACKNING.n4mOchTre}. Byter du till en operatör i något av de näten behöver
          telefonen kunna ringa över 4G (VoLTE), även nödsamtal. Se{" "}
          <A href="/guider/2g-3g-nedslackning">2G och 3G släcks ner</A>.
        </li>
        <li>
          <strong>Operatörslås.</strong> Har du köpt telefonen med abonnemang kan den vara låst till
          den gamla operatören. När bindningstiden gått ut ska operatören ta bort låset gratis om du
          ber om det.
        </li>
        <li>
          <strong>Tjänster som använder numret.</strong> Kontrollera efter flytten att till exempel
          inloggningskoder via sms kommer fram som vanligt.
        </li>
        <li>
          <strong>Telefonförsäljare.</strong> En säljare som ringer och vill flytta ditt nummer
          måste skicka erbjudandet skriftligt, och avtalet gäller bara om du accepterar skriftligt
          efter samtalet. Se <A href="/guider/angerratt-mobilabonnemang">ångerrätt</A>.
        </li>
      </UL>
      <P>
        Var du kund hos Halebop? Telia har meddelat att Halebop avvecklas och att kunderna flyttas
        till Telia. Vill du hellre till en annan operatör flyttar du numret på samma sätt, se{" "}
        <A href="/guider/halebop-laggs-ned">Halebop läggs ned</A>.
      </P>
      <P>
        Redo att välja? Jämför alla abonnemang på <A href="/">startsidan</A> eller se de{" "}
        <A href="/billigaste-mobilabonnemang">billigaste mobilabonnemangen</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
