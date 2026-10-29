import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { MOBILNAT, OPERATORER } from "@/lib/mobil/data";
import { KALLOR, NEDSLACKNING, OPENSIGNAL, TACKNING } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { NatId } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Mobilnät och täckning", path: "/nat" },
];

const FAQ = [
  {
    q: "Vilket mobilnät är bäst i Sverige?",
    a: "Det finns inget enda svar. I Opensignals mätning från december 2025 vann Telia täckningsupplevelsen, Telenor nedladdningshastigheten, Tele2 5G-hastigheten och Tre videoupplevelsen och den jämna kvaliteten. Det som avgör för dig är täckningen där du bor och rör dig.",
    kalla: KALLOR.opensignal.namn,
  },
  {
    q: "Hur stor del av Sverige har mobiltäckning?",
    a: "Enligt PTS fanns grundläggande mobiltäckning utomhus på 89,95 procent av Sveriges yta i november 2025, mot 86,93 procent året innan. Ett område räknas som täckt om minst en operatör täcker det.",
    kalla: KALLOR.ptsTackning.namn,
  },
  {
    q: "Får jag samma täckning hos en billigare operatör i samma nät?",
    a: "Ja, täckningen är densamma eftersom det är samma nät. Det som kan skilja är maxhastigheten, om 5G ingår och om operatören har wifi-samtal. Hallon anger till exempel en maxhastighet på 100 till 150 Mbit/s, trots att Hallon kör i Tres nät.",
  },
  {
    q: "Vad är Net4Mobility?",
    a: "Ett bolag som Tele2 och Telenor äger tillsammans och som bygger deras gemensamma nät för 4G och 5G. Därför har Tele2 och Telenor i stort sett samma täckning, även om de säljer och styr sina tjänster var för sig.",
  },
];

export const Route = createFileRoute("/nat/")({
  head: () =>
    pageHead({
      title: "Mobilnät i Sverige: täckning och mätningar 2026 | Mobilpoolen",
      description:
        "De fyra mobilnäten i Sverige jämförda: vilka operatörer som kör i vilket nät, vad PTS och Opensignal mäter och hur du kollar täckningen där du bor.",
      canonical: "/nat",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilnät och täckning i Sverige"
      ingress={
        <p>
          Alla mobilabonnemang i Sverige går i något av fyra nät: Telias, Tele2s, Telenors eller
          Tres. Tele2 och Telenor delar dessutom radionätet för 4G och 5G. Väljer du en billigare
          operatör i samma nät får du samma täckning, ofta till ett lägre pris.
        </p>
      }
      nyckeltal={[
        {
          varde: `${TACKNING.ptsYta} %`,
          text: "av Sveriges yta har mobiltäckning utomhus (PTS, nov 2025)",
        },
        { varde: `${TACKNING.n4m5gYta} %`, text: "av landytan har 5G i Tele2s och Telenors nät" },
        { varde: "2027", text: "då Telia stänger sitt 2G-nät, det sista som finns kvar" },
      ]}
      jamforelse={
        <div className="grid gap-4 md:grid-cols-2">
          {(Object.keys(MOBILNAT) as NatId[]).map((id) => {
            const nat = MOBILNAT[id];
            const ops = OPERATORER.filter((o) => o.nat === id && o.aktiv);
            return (
              <Link
                key={id}
                to="/nat/$slug"
                params={{ slug: id }}
                className="group flex flex-col rounded-2xl border border-border bg-surface p-6 transition-shadow hover:shadow-kort"
              >
                <span className="flex items-center justify-between gap-3 font-display text-[22px] font-bold group-hover:text-primary">
                  {nat.namn}
                  <ArrowRight className="h-5 w-5" aria-hidden />
                </span>
                <span className="mt-2 text-[15.5px] text-foreground/80">{nat.beskrivning}</span>
                <span className="mt-4 text-[14px] font-semibold text-foreground">
                  Operatörer: {ops.map((o) => o.namn).join(", ")}
                </span>
              </Link>
            );
          })}
        </div>
      }
      jamforelseRubrik="De fyra näten och vilka operatörer som kör i dem"
      faq={FAQ}
      lankar={[
        {
          href: "/guider/basta-tackning-sverige",
          label: "Vilket nät har bäst täckning?",
          text: "Mätningarna genomgångna i detalj.",
        },
        {
          href: "/guider/vilket-nat-anvander-operatoren",
          label: "Vilket nät använder din operatör?",
          text: "Hela listan, operatör för operatör.",
        },
        { href: "/5g-abonnemang", label: "5G-abonnemang", text: "Billigaste abonnemangen med 5G." },
      ]}
      ctaBild="mast-stjarnhimmel"
      uppdaterad="2026-10-29"
    >
      <h2>Vad mätningarna säger</h2>
      <p>
        Det finns ingen officiell mätning per operatör från PTS. Myndighetens kartläggning visar hur
        stor del av landet som har täckning från minst en operatör: {TACKNING.ptsYta} procent av
        ytan i november 2025, och god täckning i {TACKNING.ptsBebott} procent av de bebodda
        områdena.
      </p>
      <p>
        Opensignal mäter i stället hur nätet upplevs i användarnas telefoner. I rapporten från
        december 2025, med mätningar från juli till september, delades vinsterna upp så här:
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[15px]">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Kategori</th>
              <th className="px-4 py-3 font-semibold">Vinnare</th>
              <th className="px-4 py-3 font-semibold">Resultat</th>
            </tr>
          </thead>
          <tbody>
            {OPENSIGNAL.map((r) => (
              <tr key={r.kategori} className="border-t border-border">
                <td className="px-4 py-3">{r.kategori}</td>
                <td className="px-4 py-3 font-semibold">{r.vinnare}</td>
                <td className="px-4 py-3">{r.varde}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="kalla">
        Källa:{" "}
        <a href={KALLOR.opensignal.url} target="_blank" rel="noopener nofollow">
          {KALLOR.opensignal.namn}
        </a>
        . Telenor fick flest utmärkelser totalt, inklusive delade. Telia har stämt Telenor för att
        marknadsföra sig med "Sveriges bästa nät" utifrån samma rapport, så läs varje kategori för
        sig.
      </p>
      <h2>5G och de gamla näten</h2>
      <p>
        I september 2025 slog Tele2 och Telenor på 5G i hela sitt gemensamma nät, som då nådde{" "}
        {TACKNING.n4m5gBefolkning} procent av befolkningen och {TACKNING.n4m5gYta} procent av
        landytan. Telia uppger att dess 4G- och 5G-nät når {TACKNING.telia4g5gBefolkning} procent av
        befolkningen och över {TACKNING.telia4g5gYta} procent av landytan.
      </p>
      <p>
        Tele2, Telenor och Tre stängde sina 2G- och 3G-nät den {NEDSLACKNING.n4mOchTre}. Telia
        behåller 2G till {NEDSLACKNING.teliaTvaG}. En telefon som inte kan ringa över 4G (VoLTE)
        fungerar därför inte längre för samtal i de tre andra näten. Läs mer i guiden om{" "}
        <Link to={"/guider/2g-3g-nedslackning" as never}>2G- och 3G-nedsläckningen</Link>.
      </p>
      <h2>Så kollar du täckningen där du bor</h2>
      <ol>
        <li>
          Skriv in din adress i operatörens täckningskarta. Alla fyra nätägare har en på sin
          webbplats.
        </li>
        <li>Fråga grannar eller kolleger vilken operatör de har och hur det fungerar inomhus.</li>
        <li>
          Välj en operatör utan bindningstid om du är osäker, så kan du byta om täckningen inte
          räcker.
        </li>
        <li>Är problemet bara inomhus, kolla om operatören har wifi-samtal.</li>
      </ol>
    </PelarSida>
  );
}
