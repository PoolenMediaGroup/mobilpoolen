import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { BilligastTabell, billigastPerNiva } from "@/components/mobil/billigast-tabell";
import { FORETAG, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, gbText, kr, momsText, snittForstaAret } from "@/lib/mobil/berakna";
import { KALLOR } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const PATH = "/foretag/enskild-firma";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Företag", path: "/foretag" },
  { name: "Enskild firma", path: PATH },
];

const SKV_ENSKILD =
  "https://www.faronline.se/dokument/skatteverket/stallningstaganden2/2015/skvstallningst2015082502/";

const opNamn = (slug: string) => operator(slug)?.namn ?? slug;
const fullNamn = (a: Abonnemang) => `${opNamn(a.operator)} ${a.namn}`;

/** Privata abonnemang utan bindning och utan ålders- eller studentkrav. */
const privatUtanBindning = (a: Abonnemang) =>
  a.bindning === 0 &&
  !a.kontantkort &&
  !(a.malgrupp ?? []).some((m) => m === "senior" || m === "student" || m === "ung");

const PRIVAT_RADER = billigastPerNiva("privat", privatUtanBindning);
const FTG_UTAN_BINDNING = FORETAG.filter((a) => a.bindning === 0).sort(
  (a, b) => snittForstaAret(a) - snittForstaAret(b),
);
const PRIVAT_BILLIGAST = PRIVAT_RADER[0]?.a;

const SLUTRAD =
  "Reglerna kan ändras och Skatteverket har sista ordet. Fråga Skatteverket eller din redovisningskonsult om du är osäker.";

const FAQ = [
  {
    q: "Kan jag ha ett privat mobilabonnemang i min enskilda firma?",
    a: "Ja. Enligt Skatteverket kan ett mobilabonnemang som bokförs i verksamheten dras av, men den privata användningen ska uttagsbeskattas. Köps abonnemanget privat ges i stället skäligt avdrag för verksamhetsdelen. Reglerna kan ändras och Skatteverket har sista ordet.",
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
  {
    q: "Får jag dra av hela mobilabonnemanget i enskild firma?",
    a: "Du kan dra av abonnemanget om det bokförs i verksamheten, men då ska den privata användningen uttagsbeskattas. Vid jämn fördelning mellan jobb och privat kan hälften av utgiften ligga till grund för avdraget. Reglerna kan ändras och Skatteverket har sista ordet.",
    kalla: "Skatteverket, ställningstagande 2015-08-25",
  },
  {
    q: "Gäller förmånsreglerna för mig med enskild firma?",
    a: "Nej. Du är inte anställd i ditt eget företag, så förmånsreglerna gäller inte. I stället gäller uttagsbeskattning för den privata delen. I ett aktiebolag omfattas ägaren av förmånsreglerna. Reglerna kan ändras och Skatteverket har sista ordet.",
    kalla: "Skatteverket",
  },
  {
    q: "Godtar operatörerna enskild firma för företagsabonnemang?",
    a: "Det framgår inte av operatörernas egna sidor. Fråga operatören innan du beställer. Tre kräver vid överlåtelse att mottagaren godkänns i en kreditprövning och är över 18 år.",
  },
  {
    q: "Får jag dra av momsen på mobilabonnemanget?",
    a: "Om firman är momsregistrerad får du dra av momsen för den del som används i verksamheten. Används mobilen till hälften privat får du dra av hälften av momsen. Fördelningen ska vara skälig och du ska kunna visa hur du räknat. Reglerna kan ändras och Skatteverket har sista ordet.",
    kalla: "Skatteverket, inköp till företaget",
  },
];

export const Route = createFileRoute("/foretag_/enskild-firma")({
  head: () =>
    pageHead({
      title: "Mobilabonnemang för enskild firma: privat eller företag | Mobilpoolen",
      description:
        "Privat abonnemang eller företagsabonnemang i enskild firma? Så fungerar avdrag, uttag och moms enligt Skatteverket, och vilka abonnemang som är billigast.",
      canonical: PATH,
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilabonnemang för enskild firma"
      ingress={
        <p>
          Med enskild firma kan du välja mellan ett privat abonnemang och ett företagsabonnemang.
          Bokför du abonnemanget i firman får du dra av det, men den privata användningen ska
          uttagsbeskattas. Ett privat abonnemang utan bindning
          {PRIVAT_BILLIGAST && (
            <> finns från {kr(snittForstaAret(PRIVAT_BILLIGAST))} i månaden</>
          )}{" "}
          och räcker ofta.
        </p>
      }
      nyckeltal={[
        ...(PRIVAT_BILLIGAST
          ? [
              {
                varde: kr(snittForstaAret(PRIVAT_BILLIGAST)),
                text: "billigaste privata utan bindning, snitt år 1 inkl. moms",
              },
            ]
          : []),
        ...(FTG_UTAN_BINDNING[0]
          ? [
              {
                varde: kr(snittForstaAret(FTG_UTAN_BINDNING[0])),
                text: `billigaste företagsabonnemang utan bindning, ${opNamn(FTG_UTAN_BINDNING[0].operator)}`,
              },
            ]
          : []),
        { varde: "Uttag", text: "privat användning beskattas som uttag, inte som förmån" },
      ]}
      jamforelse={<BilligastTabell kundtyp="privat" filter={privatUtanBindning} />}
      jamforelseRubrik="Billigaste privata abonnemangen utan bindningstid"
      jamforelseIngress="Privata priser anges inkl. moms. De här abonnemangen kan du säga upp när du vill, vilket passar en firma som växer eller ändrar sig."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/avdrag-mobilabonnemang-enskild-firma",
          label: "Avdrag i enskild firma",
          text: "Guiden om avdrag, uttag och skälig fördelning.",
        },
        {
          href: "/guider/privat-eller-foretagsabonnemang",
          label: "Privat- eller företagsabonnemang",
          text: "Skillnaderna i villkor och konsumentskydd.",
        },
        {
          href: "/guider/moms-mobilabonnemang",
          label: "Moms på mobilabonnemang",
          text: "Så fungerar momsavdraget.",
        },
        {
          href: "/guider/overlata-abonnemang-till-foretag",
          label: "Behålla numret i firman",
          text: "Överlåtelse från privat till företag.",
        },
        {
          href: "/foretag/billigaste-foretagsabonnemang",
          label: "Billigaste företagsabonnemang",
          text: "Billigast per surfmängd för företag.",
        },
        {
          href: "/utan-bindningstid",
          label: "Utan bindningstid",
          text: "Alla privata utan bindning.",
        },
      ]}
      ctaRubrik="Hitta ett billigt abonnemang till firman"
      ctaIngress="Jämför privata och företagsabonnemang och se vad du betalar på ett år."
      ctaBild="tomt-kontor"
      uppdaterad="2026-10-29"
    >
      <h2>Privat abonnemang eller företagsabonnemang?</h2>
      <p>
        Det finns inget krav på att en enskild firma har ett företagsabonnemang. Båda fungerar. Det
        som skiljer är pris, moms, villkor och konsumentskydd.
      </p>
      <ul>
        <li>
          <strong>Privat abonnemang.</strong> Priset anges inkl. moms. Du har konsumentskyddet i
          lagen om elektronisk kommunikation, till exempel högst en månads uppsägningstid. Det finns
          många abonnemang utan bindningstid att välja bland.
        </li>
        <li>
          <strong>Företagsabonnemang.</strong> Priset anges oftast exkl. moms, men Telia, Tele2 och
          Hallon anger inte moms på sina abonnemangssidor. Du får tjänster som växel och extra sim.
          Gränsen på 24 månaders bindningstid gäller även små företag, om du inte uttryckligen
          avstår, men regeln om högst en månads uppsägningstid gäller bara konsumenter.
        </li>
      </ul>
      <p>
        Om operatörerna godtar enskild firma för företagsabonnemang framgår inte av deras egna
        sidor. Fråga innan du beställer.
      </p>

      <h2>Avdrag och uttag enligt Skatteverket</h2>
      <p>
        Som enskild näringsidkare är du inte anställd i ditt eget företag. Därför gäller inte
        förmånsreglerna, som i ett aktiebolag. I stället gäller uttagsbeskattning. Enligt
        Skatteverkets ställningstagande från 25 augusti 2015, Utgifter för dator och telefon i
        enskild näringsverksamhet, gäller det här:
      </p>
      <ul>
        <li>
          Ett mobilabonnemang och en mobil av mindre värde som bokförs i verksamheten kan dras av
          direkt. Den privata användningen ska uttagsbeskattas.
        </li>
        <li>Köps mobilen privat ges skäligt avdrag för den del som hör till verksamheten.</li>
        <li>Vid jämn fördelning kan hälften av utgiften ligga till grund för avdraget.</li>
        <li>
          Ett fast telefonabonnemang i bostaden är aldrig avdragsgillt. Bara rörliga
          samtalskostnader i verksamheten får dras av.
        </li>
      </ul>
      <p>{SLUTRAD}</p>
      <p className="kalla">
        Källa:{" "}
        <a href={SKV_ENSKILD} target="_blank" rel="noopener nofollow">
          Skatteverket, ställningstagande 2015-08-25
        </a>
        .
      </p>

      <h2>Moms i enskild firma</h2>
      <p>
        Är firman momsregistrerad får du dra av den ingående momsen på 25 procent för det som
        används i verksamheten. Används abonnemanget både i jobbet och privat får du bara dra av
        momsen för verksamhetsdelen, efter en skälig fördelning som du ska kunna visa med
        anteckningar eller beräkningar. Skatteverkets exempel: 50 procent privat användning ger 50
        procents avdrag. {SLUTRAD} Läs mer om{" "}
        <Link to={"/guider/moms-mobilabonnemang" as never}>moms på mobilabonnemang</Link>.
      </p>

      <h2>Enskild firma eller aktiebolag: vad skiljer?</h2>
      <p>
        I ett aktiebolag är abonnemanget bolagets kostnad. Ägaren och de anställda omfattas av
        förmånsreglerna, så privat användning är skattefri om mobilen behövs i arbetet. I en enskild
        firma dras kostnaden av i firman och den privata delen uttagsbeskattas, eller så görs en
        skälig fördelning. I båda fallen dras momsen av bara för verksamhetsdelen. {SLUTRAD}
      </p>
      <p className="kalla">
        Källa:{" "}
        <a href={KALLOR.skatteverketArbetsredskap.url} target="_blank" rel="noopener nofollow">
          {KALLOR.skatteverketArbetsredskap.namn}
        </a>
        .
      </p>

      <h2>Billigaste företagsabonnemangen utan bindning</h2>
      <p>
        Föredrar du ett företagsabonnemang men vill slippa bindningstid, är det här de billigaste vi
        har kunnat kontrollera:
      </p>
      <table>
        <thead>
          <tr>
            <th>Abonnemang</th>
            <th>Surf</th>
            <th>Snitt år 1</th>
            <th>Moms</th>
          </tr>
        </thead>
        <tbody>
          {FTG_UTAN_BINDNING.map((a) => (
            <tr key={a.id}>
              <td>{fullNamn(a)}</td>
              <td>{gbText(a.gb)}</td>
              <td>{kr(snittForstaAret(a))}</td>
              <td>{momsText(a.moms) ?? "moms anges inte"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
      </p>
      <p>
        Jämför med de privata abonnemangen ovan. Anges företagspriset exkl. moms, multiplicera med
        1,25 för att jämföra med ett privat pris. Saknas momsuppgift, fråga operatören. Alla
        företagsabonnemang finns på{" "}
        <Link to={"/foretag" as never}>mobilabonnemang för företag</Link>.
      </p>

      <h2>Behålla ditt nummer i firman</h2>
      <p>
        En enskild firma är samma juridiska person som du, så ditt privata abonnemang kan stå kvar
        och dras av till den del det används i verksamheten. Vill du i stället ha ett
        företagsabonnemang på firmans organisationsnummer och behålla numret, fråga operatören hur
        de gör bytet. Startar du sedan ett aktiebolag är det en överlåtelse till en annan juridisk
        person. Hos Tre görs en överlåtelse i Mitt3 med BankID, och den återstående bindningstiden
        följer med. Läs mer i guiden om att{" "}
        <Link to={"/guider/overlata-abonnemang-till-foretag" as never}>
          överlåta ett abonnemang till företag
        </Link>
        .
      </p>
    </PelarSida>
  );
}
