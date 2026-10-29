import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { MOBILNAT, OPERATORER, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  datumText,
  gbText,
  kr,
  snittForstaAret,
} from "@/lib/mobil/berakna";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "eSIM", path: "/esim" },
];

const MED_ESIM = OPERATORER.filter((o) => o.esim === true && o.aktiv);
const OKANT = OPERATORER.filter((o) => o.esim == null && o.aktiv);
const harEsim = (a: Abonnemang) => operator(a.operator)?.esim === true;
const LISTA = PRIVATA.filter((a) => harEsim(a) && !arVillkorat(a));
const B10 = billigastForBehov(LISTA, 10);
const B20 = billigastForBehov(LISTA, 20);
const OBEGR = billigastForBehov(
  LISTA.filter((a) => a.gb == null),
  0,
);
const OPS_I_JAMF = new Set(LISTA.map((a) => a.operator)).size;

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

const FAQ = [
  {
    q: "Vilka operatörer har eSIM?",
    a: `Enligt operatörernas egna webbplatser erbjuder ${MED_ESIM.map((o) => o.namn).join(", ")} eSIM. För ${OKANT.map((o) => o.namn).join(", ")} har vi inte kunnat bekräfta det.`,
  },
  {
    q: "Vilket är det billigaste abonnemanget med eSIM?",
    a: B10
      ? `Med minst 10 GB är ${vem(B10)} billigast bland operatörerna med eSIM, för ${kr(snittForstaAret(B10))} i månaden i snitt första året.`
      : "Se listan på sidan.",
  },
  {
    q: "Vad är eSIM?",
    a: "Ett eSIM är ett SIM-kort inbyggt i telefonen. I stället för att sätta i ett plastkort laddar du ner abonnemanget, oftast genom att skanna en QR-kod eller via operatörens app. Telefonen måste ha stöd för eSIM.",
  },
  {
    q: "Kostar eSIM extra?",
    a: "Det varierar. Tre och Hallon skriver att eSIM ingår utan extra kostnad. Telia tar 69 kr i månaden för eSIM till en klocka. Avgiften för ett nytt SIM eller eSIM anges inte av alla operatörer.",
  },
  {
    q: "Går det snabbare att byta operatör med eSIM?",
    a: "Ofta. Du slipper vänta på ett kort med posten. Chilimobil anger att nummerflytt tar cirka två dagar med eSIM mot cirka sju arbetsdagar med SIM-kort, och Tre aktiverar eSIM med BankID på 5–10 minuter.",
  },
];

export const Route = createFileRoute("/esim")({
  head: () =>
    pageHead({
      title: "eSIM: operatörer och abonnemang med eSIM | Mobilpoolen",
      description: `${MED_ESIM.length} operatörer erbjuder eSIM enligt sina webbplatser. Jämför abonnemangen${B10 ? `, billigast med minst 10 GB från ${kr(snittForstaAret(B10))}/mån` : ""}, och se hur eSIM fungerar.`,
      canonical: "/esim",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="eSIM: vilka operatörer har det?"
      ingress={
        <p>
          {MED_ESIM.length} operatörer erbjuder eSIM enligt sina egna webbplatser:{" "}
          {MED_ESIM.map((o) => o.namn).join(", ")}.
          {B10 &&
            ` Billigast med minst 10 GB bland dem är ${vem(B10)} för ${kr(snittForstaAret(B10))} i månaden i snitt första året.`}{" "}
          Med eSIM laddar du ner abonnemanget till telefonen i stället för att sätta i ett
          plastkort.
        </p>
      }
      nyckeltal={[
        { varde: String(MED_ESIM.length), text: "operatörer med eSIM enligt egen webbplats" },
        ...(B10
          ? [{ varde: kr(snittForstaAret(B10)), text: "billigast med minst 10 GB och eSIM" }]
          : []),
        ...(OBEGR
          ? [{ varde: kr(snittForstaAret(OBEGR)), text: "billigast obegränsad surf med eSIM" }]
          : []),
      ]}
      jamforelse={<Jamforelse urval={harEsim} id="lista" />}
      jamforelseRubrik="Abonnemang hos operatörer med eSIM"
      jamforelseIngress={`Listan visar ${LISTA.length} abonnemang hos ${OPS_I_JAMF} operatörer som erbjuder eSIM. Kontrollera hos operatören att eSIM gäller just det abonnemang du väljer.`}
      faq={FAQ}
      lankar={[
        {
          href: "/guider/vad-ar-esim",
          label: "Vad är eSIM?",
          text: "Så fungerar det och så aktiverar du det.",
        },
        {
          href: "/guider/byta-operator-behalla-nummer",
          label: "Byta operatör och behålla numret",
          text: "Nummerflytt steg för steg.",
        },
        {
          href: "/5g-abonnemang",
          label: "5G-abonnemang",
          text: "Vilka abonnemang som har 5G.",
        },
        {
          href: "/operatorer",
          label: "Alla operatörer",
          text: "eSIM, nät och villkor per operatör.",
        },
      ]}
      ctaRubrik="Hitta ett abonnemang med eSIM"
      ctaBild="par-hemma-morgon"
      uppdaterad="2026-10-29"
    >
      <h2>Vad är eSIM?</h2>
      <p>
        Ett eSIM är ett SIM-kort som sitter inbyggt i telefonen. I stället för att vänta på ett
        plastkort med posten laddar du ner abonnemanget, oftast genom att skanna en QR-kod eller
        genom operatörens app. Abonnemanget fungerar likadant som med ett vanligt SIM-kort: samma
        nät, samma surf och samma pris.
      </p>
      <p>
        Telefonen måste ha stöd för eSIM. Det har de flesta nyare telefoner från de stora
        tillverkarna, men kontrollera i telefonens inställningar eller hos tillverkaren. Steg för
        steg står i guiden <Link to={"/guider/vad-ar-esim" as never}>vad är eSIM</Link>.
      </p>

      <h2>Vilka operatörer har eSIM?</h2>
      <ul>
        {MED_ESIM.map((o) => (
          <li key={o.slug}>
            <Link to="/operatorer/$slug" params={{ slug: o.slug }}>
              {o.namn}
            </Link>{" "}
            kör i {MOBILNAT[o.nat].namn.toLowerCase()}.
          </li>
        ))}
      </ul>
      {OKANT.length > 0 && (
        <p>
          För {OKANT.map((o) => o.namn).join(", ")} har vi inte kunnat bekräfta eSIM på operatörens
          egen webbplats. Det betyder inte att de saknar eSIM, bara att vi inte har kunnat
          kontrollera det. Fråga operatören innan du beställer.
        </p>
      )}

      <h2>Spelar eSIM någon roll för täckningen?</h2>
      <p>
        Nej. eSIM är bara ett annat sätt att få in abonnemanget i telefonen. Täckningen och
        hastigheten beror på vilket nät operatören kör i och vad abonnemanget har för maxhastighet.
        Operatörerna med eSIM finns i flera av näten, så du kan oftast välja nät först och eSIM
        sedan. Mer om näten på sidan om <Link to={"/nat" as never}>mobilnät och täckning</Link>.
      </p>

      <h2>Vad kostar eSIM?</h2>
      <p>
        Tre skriver att eSIM är kostnadsfritt och aktiveras med BankID på 5–10 minuter. När eSIM:et
        aktiveras slutar det fysiska SIM-kortet att fungera. Hallon skriver att eSIM ingår utan
        extra kostnad. Telia tar 69 kr i månaden för eSIM till en klocka. Avgiften för att byta till
        ett nytt SIM eller eSIM anges inte av alla operatörer.
      </p>

      <h2>Vilket abonnemang med eSIM är billigast?</h2>
      <ul>
        {B10 && (
          <li>
            Minst 10 GB: {vem(B10)} ({B10.gb == null ? "obegränsad" : gbText(B10.gb)}),{" "}
            {kr(snittForstaAret(B10))} i månaden i snitt första året.
          </li>
        )}
        {B20 && (
          <li>
            Minst 20 GB: {vem(B20)} ({B20.gb == null ? "obegränsad" : gbText(B20.gb)}),{" "}
            {kr(snittForstaAret(B20))}.
          </li>
        )}
        {OBEGR && (
          <li>
            Obegränsad surf: {vem(OBEGR)}, {kr(snittForstaAret(OBEGR))}.
          </li>
        )}
      </ul>

      <h2>Fördelar och nackdelar med eSIM</h2>
      <h3>Fördelar</h3>
      <ul>
        <li>Inget kort att vänta på. Du kan ofta börja använda abonnemanget samma dag.</li>
        <li>
          Snabbare nummerflytt. Chilimobil anger cirka två dagar med eSIM mot cirka sju arbetsdagar
          med SIM-kort.
        </li>
        <li>
          Två nummer i samma telefon, till exempel jobb och privat, om telefonen stöder flera SIM.
        </li>
        <li>eSIM till smartklocka, så att klockan kan ringa och surfa utan telefonen.</li>
      </ul>
      <h3>Nackdelar</h3>
      <ul>
        <li>Telefonen måste ha stöd för eSIM.</li>
        <li>
          Byter du telefon måste eSIM:et flyttas eller laddas ner igen, vilket kan kräva kontakt med
          operatören.
        </li>
        <li>Går telefonen sönder kan du inte flytta kortet till en annan telefon direkt.</li>
      </ul>

      <h2>Kan du ha två nummer i samma telefon?</h2>
      <p>
        Ja, om telefonen stöder flera SIM. Många telefoner klarar ett vanligt SIM-kort och ett eSIM
        samtidigt, eller två eSIM. Det är praktiskt om du har ett jobbnummer och ett privat nummer,
        eller om du vill ha ett lokalt abonnemang när du reser utanför EU. Abonnemangen betalas var
        för sig, och du väljer i telefonens inställningar vilket nummer som används för samtal och
        surf.
      </p>

      <h2>Hur byter du till eSIM?</h2>
      <ol>
        <li>Kontrollera att telefonen stöder eSIM.</li>
        <li>Välj eSIM när du beställer abonnemanget, eller be din operatör byta.</li>
        <li>Skanna QR-koden eller följ instruktionen i operatörens app.</li>
        <li>Vill du behålla numret: be den nya operatören flytta det. De sköter uppsägningen.</li>
      </ol>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
      </p>
    </PelarSida>
  );
}
