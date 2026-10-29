import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { BilligastTabell } from "@/components/mobil/billigast-tabell";
import { FORETAG, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { datumText, kr, momsText, prisNu, snittForstaAret, sortera } from "@/lib/mobil/berakna";
import { KALLOR, SKI_FORETAG, decimal } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Företag", path: "/foretag" },
];

const opNamn = (slug: string) => operator(slug)?.namn ?? slug;

/** Operatörerna grupperade efter hur de anger moms på sina företagspriser. */
function momsGrupper() {
  const per = (m: "exkl" | "inkl" | "okand") => [
    ...new Set(FORETAG.filter((a) => (a.moms ?? "okand") === m).map((a) => opNamn(a.operator))),
  ];
  return { exkl: per("exkl"), okand: per("okand") };
}

function lista(namn: string[]): string {
  if (namn.length <= 1) return namn.join("");
  return `${namn.slice(0, -1).join(", ")} och ${namn[namn.length - 1]}`;
}

const billigastObegr = sortera(
  FORETAG.filter((a) => a.gb == null),
  "snitt-ar",
)[0];
const billigastFast = sortera(
  FORETAG.filter((a) => a.gb != null),
  "snitt-ar",
)[0];
const telia = SKI_FORETAG.find((s) => s.namn === "Telia");
const bransch = SKI_FORETAG.find((s) => s.namn === "Branschen");

const FAQ = [
  {
    q: "Vad kostar ett mobilabonnemang för företag?",
    a: billigastObegr
      ? `Det billigaste obegränsade företagsabonnemanget i vår jämförelse är ${opNamn(billigastObegr.operator)} ${billigastObegr.namn} för ${kr(snittForstaAret(billigastObegr))} i månaden i snitt första året${momsText(billigastObegr.moms) ? `, ${momsText(billigastObegr.moms)}` : ""}. Med fast surfmängd finns abonnemang från ${billigastFast ? kr(prisNu(billigastFast)) : "lägre priser"} i månaden. Kontrollera alltid om priset är exkl. eller inkl. moms.`
      : "Priserna varierar mellan operatörerna. Se jämförelsen på sidan och kontrollera om priset anges exkl. eller inkl. moms.",
    kalla: "Operatörernas webbplatser",
  },
  {
    q: "Är företagsabonnemang alltid exkl. moms?",
    a: "Nej, inte alltid. Tre och Telavox anger uttryckligen att priserna är exkl. moms. Telia, Tele2 och Hallon skriver inte ut det på sina abonnemangssidor. Vi visar vad som gäller för varje abonnemang. Pris inkl. moms är pris exkl. moms gånger 1,25.",
    kalla: "Operatörernas webbplatser",
  },
  {
    q: "Gäller 24 månaders maxgräns för bindningstid även företag?",
    a: "Ja, för mikroföretag och andra små företag, om de inte uttryckligen har gått med på något annat. Ett större företag, eller ett litet som uttryckligen avstår, kan alltså få längre bindningstid, till exempel 36 månader.",
    kalla: "12 kap. 8 och 10 §§ lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Måste de anställda förmånsbeskattas för jobbmobilen?",
    a: "Inte om mobilen och abonnemanget normalt behövs i arbetet. Då är privat användning skattefri enligt Skatteverket, så länge det rör sig om tjänster mot fast avgift. Privata tjänster som debiteras utöver den fasta avgiften och som arbetsgivaren betalar är däremot skattepliktiga. Reglerna kan ändras och Skatteverket har sista ordet.",
    kalla: "Skatteverket, arbetsredskap",
  },
  {
    q: "Kan jag ha företagsabonnemang med enskild firma?",
    a: "Operatörerna skriver inte ut på sina sidor om de godtar enskild firma, så fråga innan du beställer. Många med enskild firma klarar sig med ett privat abonnemang utan bindningstid och gör avdrag för verksamhetsdelen.",
  },
  {
    q: "Vilken operatör har nöjdast företagskunder?",
    a: telia
      ? `Telia, med ${decimal(telia.varde)} i Svenskt Kvalitetsindex mätning 2025. Branschsnittet för företagskunder var ${bransch ? decimal(bransch.varde) : "lägre"}.`
      : "Se Svenskt Kvalitetsindex senaste mätning.",
    kalla: "Svenskt Kvalitetsindex, SKI Mobil 2025",
  },
];

export const Route = createFileRoute("/foretag")({
  head: () =>
    pageHead({
      title: "Mobilabonnemang för företag: jämför priser | Mobilpoolen",
      description:
        "Jämför mobilabonnemang för företag. Priser exkl. moms där operatören anger det, bindningstid, växel, delad surf och vad som gäller för förmån och avdrag.",
      canonical: "/foretag",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  const moms = momsGrupper();
  const antalOp = new Set(FORETAG.map((a) => a.operator)).size;
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilabonnemang för företag"
      ingress={
        <p>
          Ett företagsabonnemang är ett mobilabonnemang som tecknas av företaget, oftast med pris
          exkl. moms. Här jämför vi {FORETAG.length} abonnemang från {antalOp} operatörer.
          {billigastObegr && (
            <>
              {" "}
              Billigast med obegränsad surf är just nu {opNamn(billigastObegr.operator)}{" "}
              {billigastObegr.namn} för {kr(snittForstaAret(billigastObegr))} i månaden i snitt
              första året.
            </>
          )}
        </p>
      }
      nyckeltal={[
        { varde: String(FORETAG.length), text: "företagsabonnemang i jämförelsen" },
        ...(billigastObegr
          ? [
              {
                varde: kr(snittForstaAret(billigastObegr)),
                text: `billigaste obegränsade, snitt per månad år 1${momsText(billigastObegr.moms) ? ` (${momsText(billigastObegr.moms)})` : ""}`,
              },
            ]
          : []),
        ...(telia
          ? [{ varde: decimal(telia.varde), text: "Telia, nöjdast företagskunder i SKI 2025" }]
          : []),
      ]}
      jamforelse={
        <div className="space-y-12">
          <BilligastTabell kundtyp="foretag" />
          <Jamforelse kundtyp="foretag" id="lista" />
        </div>
      }
      jamforelseRubrik="Billigaste företagsabonnemangen per surfmängd"
      jamforelseIngress="Sorterat på snittpris per månad första året, med kampanj och startavgift inräknade. Vid varje abonnemang ser du om operatören anger priset exkl. moms eller inte anger moms alls."
      faq={FAQ}
      lankar={[
        {
          href: "/foretag/billigaste-foretagsabonnemang",
          label: "Billigaste företagsabonnemang",
          text: "Billigast per surfmängd och fällorna med kampanj och bindning.",
        },
        {
          href: "/foretag/enskild-firma",
          label: "Mobilabonnemang för enskild firma",
          text: "Privat eller företag, avdrag och uttag.",
        },
        {
          href: "/verktyg/foretagskalkylator",
          label: "Företagskalkylator",
          text: "Räkna ut kostnaden för alla anställda.",
        },
        {
          href: "/guider/privat-eller-foretagsabonnemang",
          label: "Privat- eller företagsabonnemang",
          text: "Skillnaderna i moms, villkor och konsumentskydd.",
        },
        {
          href: "/guider/moms-mobilabonnemang",
          label: "Moms på mobilabonnemang",
          text: "Ex eller inkl. moms och när du får dra av.",
        },
        {
          href: "/guider/jobbmobil-formansskatt",
          label: "Jobbmobil och förmånsskatt",
          text: "Vad Skatteverket säger om privat användning.",
        },
        {
          href: "/guider/avdrag-mobilabonnemang-enskild-firma",
          label: "Avdrag i enskild firma",
          text: "Avdrag, uttag och skälig fördelning.",
        },
        {
          href: "/guider/vaxel-eller-mobil",
          label: "Växel eller bara mobil?",
          text: "Mobil växel för småföretag, med priser.",
        },
        {
          href: "/guider/delad-surf-foretag",
          label: "Delad surf för företag",
          text: "Extra sim, datakort och ramavtal.",
        },
        {
          href: "/guider/overlata-abonnemang-till-foretag",
          label: "Flytta numret till företaget",
          text: "Så fungerar en överlåtelse.",
        },
      ]}
      ctaRubrik="Betalar företaget för mycket för mobilerna?"
      ctaIngress="Jämför företagsabonnemangen och räkna på hela bindningstiden, inte bara första månaden."
      ctaBild="kontor-motesrum"
      uppdaterad="2026-10-29"
    >
      <h2>Exkl. eller inkl. moms: så läser du priserna</h2>
      <p>
        Företagspriser anges i regel exkl. moms, men inte alltid. {lista(moms.exkl)} skriver
        uttryckligen att priserna är exkl. moms. {lista(moms.okand)} anger inte på sina
        abonnemangssidor om priset är exkl. eller inkl. moms. Vi gissar inte. I jämförelsen står det
        vid varje abonnemang vad operatören själv anger.
      </p>
      <p>
        För att jämföra med ett privat abonnemang, som alltid anges inkl. moms, multiplicerar du
        priset exkl. moms med 1,25.
        {billigastObegr && billigastObegr.moms === "exkl" && (
          <>
            {" "}
            {opNamn(billigastObegr.operator)} {billigastObegr.namn} för {kr(prisNu(billigastObegr))}{" "}
            exkl. moms blir {kr(prisNu(billigastObegr) * 1.25)} inkl. moms.
          </>
        )}{" "}
        Är företaget momsregistrerat får det dra av momsen för den del som används i verksamheten.
        Läs mer i guiden om{" "}
        <Link to={"/guider/moms-mobilabonnemang" as never}>moms på mobilabonnemang</Link>.
      </p>

      <h2>Vad skiljer ett företagsabonnemang från ett privat?</h2>
      <p>
        Avtalet tecknas av företaget och fakturan går till företaget. Utöver momsen skiljer sig tre
        saker:
      </p>
      <ul>
        <li>
          <strong>Tjänster för flera användare.</strong> Växel, extra datasim, rabatter för kollegor
          och fria samtal mellan kollegor inom samma organisationsnummer.
        </li>
        <li>
          <strong>Ramavtal för större företag.</strong> Tele2 har ramavtal för företag med minst 10
          anställda, med 24 eller 36 månaders löptid och en fast minimiavgift på 90 procent av
          uppskattad volym. Telia har också ett mobilt ramavtal med egen kundtjänst och samlad
          faktura.
        </li>
        <li>
          <strong>Ett svagare konsumentskydd.</strong> Vissa regler i lagen om elektronisk
          kommunikation gäller bara konsumenter, till exempel att uppsägningstiden högst får vara en
          månad.
        </li>
      </ul>
      <p>
        Läs hela genomgången i{" "}
        <Link to={"/guider/privat-eller-foretagsabonnemang" as never}>
          privat- eller företagsabonnemang
        </Link>
        .
      </p>

      <h2>Bindningstid för företag</h2>
      <p>
        Högst 24 månaders bindningstid gäller inte bara konsumenter. Enligt 12 kap. 8 och 10 §§ i
        lagen om elektronisk kommunikation gäller samma gräns för mikroföretag, andra små företag
        och ideella organisationer, om de inte uttryckligen har gått med på avsteg. Ett mikroföretag
        har färre än 10 sysselsatta och högst 2 miljoner euro i omsättning eller balansomslutning.
        Ett småföretag har färre än 50 sysselsatta och högst 10 miljoner euro.
      </p>
      <p>
        Det betyder att ett 36 månaders avtal kräver att företaget uttryckligen har avstått från
        skyddet. Läs avtalet innan du skriver under. Regeln om högst en månads uppsägningstid gäller
        däremot bara konsumenter, så ett företag kan få längre uppsägningstid. Rätten att säga upp
        utan kostnad om operatören ändrar villkoren till din nackdel gäller alla kunder, även
        företag.
      </p>

      <h2>Jobbmobil och förmån</h2>
      <p>
        Får en anställd använda företagets mobil och abonnemang privat är det inte en skattepliktig
        förmån om utrustningen normalt behövs i arbetet. Det framgår av Skatteverkets
        ställningstagande från 7 juni 2018. Ett abonnemang mot fast avgift räknas som en tjänst även
        om samtal, sms och surf ingår. Privata tjänster som debiteras utöver den fasta avgiften,
        till exempel betalsamtal, är däremot skattepliktiga om arbetsgivaren betalar dem. Reglerna
        kan ändras och Skatteverket har sista ordet. Läs mer i{" "}
        <Link to={"/guider/jobbmobil-formansskatt" as never}>jobbmobil och förmånsskatt</Link>.
      </p>

      <h2>Behöver företaget en växel?</h2>
      <p>
        En mobil växel ger företaget ett gemensamt nummer, öppettider, köer och röstbrevlåda. Telia
        har växeln Smart Connect, som ingår i Företag Obegränsad Max. Tre har mobilväxeln 3Koppla
        som tillägg. Hos Telavox ingår växel i abonnemangen från Premium och uppåt. Tele2 har Tele2
        Växel, men priserna redovisas inte öppet. Jämför funktioner och priser i{" "}
        <Link to={"/guider/vaxel-eller-mobil" as never}>växel eller bara mobil</Link>.
      </p>

      <h2>Delad surf mellan anställda</h2>
      <p>
        Ingen av operatörerna vi har granskat har en öppet prissatt surfpool för hela företaget på
        sina abonnemangssidor. Det som finns är extra sim som delar surf med ett huvudabonnemang.
        Tre har ett datakort som delar surfen med huvudabonnemanget och ingår i 3Företag Obegränsad
        Max. Hos Telia ingår ett extra datasim i Obegränsad Max och Premium. Läs mer om{" "}
        <Link to={"/guider/delad-surf-foretag" as never}>delad surf för företag</Link>.
      </p>

      <h2>Nöjdast företagskunder enligt SKI 2025</h2>
      <p>
        Svenskt Kvalitetsindex mäter varje år hur nöjda kunderna är. Bland företagskunderna såg det
        ut så här 2025:
      </p>
      <table>
        <thead>
          <tr>
            <th>Operatör</th>
            <th>SKI 2025, företag</th>
          </tr>
        </thead>
        <tbody>
          {SKI_FORETAG.map((s) => (
            <tr key={s.namn}>
              <td>{s.namn === "Branschen" ? "Branschsnitt" : s.namn}</td>
              <td>{decimal(s.varde)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="kalla">
        Källa:{" "}
        <a href={KALLOR.ski.url} target="_blank" rel="noopener nofollow">
          {KALLOR.ski.namn}
        </a>
        . Det är kundernas betyg, inte vårt.
      </p>

      <h2>Så räknar du på hela företaget</h2>
      <p>
        Räkna på totalkostnaden under hela avtalstiden, inte på priset första månaden. Hos Tele2 och
        hos Tre Obegränsad Max gäller kampanjpriset i 24 månader med lika lång bindningstid. Sedan
        går priset upp till ordinarie. Har ni flera anställda, multiplicera med antalet användare
        och lägg till växel och extra sim. Vår{" "}
        <Link to={"/verktyg/foretagskalkylator" as never}>företagskalkylator</Link> gör det åt dig.
        Har du enskild firma, läs{" "}
        <Link to={"/foretag/enskild-firma" as never}>mobilabonnemang för enskild firma</Link>.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Lagen
        (2022:482) om elektronisk kommunikation. Skatteverket, arbetsredskap.
      </p>
    </PelarSida>
  );
}
