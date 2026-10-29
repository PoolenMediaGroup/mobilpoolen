import { useId, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { Ersattningsrad } from "@/components/ersattningsrad";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { KALLOR } from "@/lib/mobil/fakta";
import {
  arVillkorat,
  billigastForBehov,
  bindningText,
  datumText,
  formatTal,
  gbText,
  kr,
  snittForstaAret,
  totalKostnad,
} from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/verktyg/betalar-jag-for-mycket";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Verktyg", path: "/verktyg" },
  { name: "Betalar jag för mycket?", path: PATH },
];

const ALLMANNA = PRIVATA.filter((a) => !arVillkorat(a));

const FAQ = [
  {
    q: "Kan jag byta operatör fast jag har bindningstid kvar?",
    a: "Ja. Bindningstiden hindrar inte att du flyttar numret till en ny operatör, men du måste betala de månader som är kvar av bindningstiden till den gamla operatören.",
    kalla: "PTSFS 2022:4 om nummerportabilitet",
  },
  {
    q: "När ska jag säga upp abonnemanget om jag har bindningstid?",
    a: "Uppsägningstiden får vara högst en månad för en konsument, och du ska inte behöva säga upp tidigare än en månad före bindningstidens slut för att avtalet ska upphöra då. Säg upp senast en månad innan bindningen går ut, så slipper du betala längre än nödvändigt.",
    kalla: "Lagen (2022:482) om elektronisk kommunikation, 12 kap. 13 §",
  },
  {
    q: "Kostar det något att ta med mig numret?",
    a: "Den gamla operatören får inte ta betalt för att lämna ifrån sig numret. Den nya operatören kan ta betalt för att ta emot det. Avbrottet under flytten får vara högst en arbetsdag.",
    kalla: "PTSFS 2022:4 och lagen om elektronisk kommunikation, 12 kap. 19–20 §§",
  },
  {
    q: "Varför räknar ni med snittpris i stället för pris första månaden?",
    a: "Ett kampanjpris gäller bara några månader. Snittpriset första året räknar med kampanjens längd, ordinarie pris resten av året och startavgiften. Det visar vad du faktiskt betalar.",
  },
];

const TITEL = "Betalar jag för mycket för mobilen? Räkna ut";
const DESC =
  "Jämför ditt mobilpris med det billigaste abonnemanget med minst samma surf. Se besparingen på 12 och 24 månader och om du bör byta nu eller vänta.";

export const Route = createFileRoute("/verktyg/betalar-jag-for-mycket")({
  head: () =>
    pageHead({
      title: `${TITEL} | Mobilpoolen`,
      description: DESC,
      socialTitle: TITEL,
      canonical: PATH,
      scripts: [
        breadcrumbJsonLd(TRAIL),
        faqJsonLd(FAQ),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Betalar jag för mycket för mobilen?",
          description: DESC,
          url: absoluteUrl(PATH),
          applicationCategory: "FinanceApplication",
          operatingSystem: "Alla med webbläsare",
          inLanguage: "sv-SE",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
          publisher: { "@id": "https://mobilpoolen.se/#organization" },
        }),
      ],
    }),
  component: Sida,
});

function tal(s: string): number {
  const n = Number(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

const FALT =
  "block min-h-[48px] w-full rounded-xl border border-input-border bg-input px-4 text-[17px] font-semibold text-foreground";
const ETIKETT = "block text-[14.5px] font-semibold text-foreground";

function Kalkylator() {
  const uid = useId();
  const [pris, setPris] = useState("349");
  const [gb, setGb] = useState("20");
  const [obegransad, setObegransad] = useState(false);
  const [kvar, setKvar] = useState("0");

  const r = useMemo((): R | null => {
    const p = tal(pris);
    const k = Math.min(24, Math.round(tal(kvar)));
    const behov = tal(gb);
    const lista = obegransad ? ALLMANNA.filter((a) => a.gb == null) : ALLMANNA;
    const ny = billigastForBehov(lista, obegransad ? 0 : behov);
    if (!ny || p <= 0) return null;
    const ny12 = totalKostnad(ny, 12);
    const ny24 = totalKostnad(ny, 24);
    const behalla24 = p * 24;
    const bindning = p * k;
    const bytNu24 = bindning + ny24;
    const vanta24 = bindning + (k >= 24 ? 0 : totalKostnad(ny, 24 - k));
    return {
      p,
      k,
      behov,
      ny,
      spar12: p * 12 - ny12,
      spar24: behalla24 - ny24,
      bindning,
      behalla24,
      bytNu24,
      vanta24,
    };
  }, [pris, gb, obegransad, kvar]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        onSubmit={(e) => e.preventDefault()}
        aria-labelledby={`${uid}-rubrik`}
        className="rounded-2xl border border-border bg-surface p-5 shadow-kort-litet sm:p-6"
      >
        <h2 id={`${uid}-rubrik`} className="text-[22px] font-bold">
          Ditt abonnemang i dag
        </h2>
        <label className={`${ETIKETT} mt-5`}>
          Vad betalar du per månad?
          <span className="relative mt-2 block">
            <input
              inputMode="numeric"
              autoComplete="off"
              value={pris}
              onChange={(e) => setPris(e.target.value.replace(/[^\d\s,]/g, ""))}
              className={`${FALT} pr-20`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
              kr/mån
            </span>
          </span>
        </label>
        <label className={`${ETIKETT} mt-5`}>
          Hur mycket surf ingår?
          <span className="relative mt-2 block">
            <input
              inputMode="decimal"
              autoComplete="off"
              value={obegransad ? "" : gb}
              disabled={obegransad}
              placeholder={obegransad ? "Obegränsad" : "t.ex. 20"}
              onChange={(e) => setGb(e.target.value.replace(/[^\d,.]/g, ""))}
              className={`${FALT} pr-16 disabled:opacity-60`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
              GB
            </span>
          </span>
        </label>
        <label className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-[15px] font-medium">
          <input
            type="checkbox"
            checked={obegransad}
            onChange={(e) => setObegransad(e.target.checked)}
            className="h-5 w-5 accent-[var(--color-primary)]"
          />
          Jag har obegränsad surf
        </label>
        <label className={`${ETIKETT} mt-4`}>
          Hur många månader bindningstid har du kvar?
          <span className="mt-1 block text-[13px] font-normal text-foreground/65">
            0 om du inte har någon bindningstid. Högst 24.
          </span>
          <span className="relative mt-2 block">
            <input
              inputMode="numeric"
              autoComplete="off"
              value={kvar}
              onChange={(e) => setKvar(e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
              className={`${FALT} pr-16`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
              mån
            </span>
          </span>
        </label>
        <p className="mt-5 text-[12.5px] text-foreground/60">
          Vi sparar ingenting av det du fyller i. Uträkningen sker i din webbläsare.
        </p>
      </form>

      <div aria-live="polite">
        {r ? (
          <Resultat r={r} obegransad={obegransad} />
        ) : (
          <p className="rounded-2xl border border-border bg-surface p-6 text-[16px]">
            Fyll i vad du betalar per månad så räknar vi.
          </p>
        )}
      </div>
    </div>
  );
}

type R = {
  p: number;
  k: number;
  behov: number;
  ny: Abonnemang;
  spar12: number;
  spar24: number;
  bindning: number;
  behalla24: number;
  bytNu24: number;
  vanta24: number;
};

function Resultat({ r, obegransad }: { r: R; obegransad: boolean }) {
  const o = operator(r.ny.operator);
  const kampanj = r.ny.kampanjpris != null && (r.ny.kampanjManader ?? 0) > 0;
  const billigare = r.spar12 > 0 || r.spar24 > 0;

  let rad: string;
  if (!billigare) {
    rad =
      "Du betalar redan lika lite eller mindre än det billigaste likvärdiga abonnemanget vi har hittat. Det finns inget att vinna på att byta just nu.";
  } else if (r.k === 0) {
    rad = `Byt nu. Du har ingen bindningstid, så du sparar ${kr(r.spar24)} på två år från första månaden.`;
  } else if (r.vanta24 < r.behalla24) {
    rad = `Vänta tills bindningstiden går ut om ${r.k} mån och byt då. Att byta nu betyder att du betalar båda abonnemangen i ${r.k} mån. Säg upp senast en månad före bindningstidens slut.`;
  } else {
    rad = `Med ${r.k} mån kvar av bindningstiden hinner du inte spara något inom två år. Behåll abonnemanget och räkna igen när bindningen närmar sig slutet.`;
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-dark-section p-5 text-white sm:p-6">
        <h2 className="text-[18px] font-bold text-white">
          {billigare ? "Du kan betala mindre" : "Du har ett bra pris"}
        </h2>
        <dl className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <dt className="text-[13.5px] text-white/75">Skillnad på 12 mån</dt>
            <dd className="font-display text-[30px] font-bold leading-tight text-white">
              {kr(Math.max(0, r.spar12))}
            </dd>
          </div>
          <div>
            <dt className="text-[13.5px] text-white/75">Skillnad på 24 mån</dt>
            <dd className="font-display text-[30px] font-bold leading-tight text-white">
              {kr(Math.max(0, r.spar24))}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-[13.5px] text-white/70">
          Skillnaden mellan ditt pris och det billigaste likvärdiga, utan hänsyn till
          bindningstiden.
        </p>
        <p className="mt-4 text-[16px] font-semibold text-white">{rad}</p>
      </section>

      <article className="rounded-2xl border border-primary/40 bg-surface p-4 shadow-kort-litet sm:p-5">
        <p className="text-[13px] font-semibold text-primary">
          {obegransad
            ? "Billigast med obegränsad surf"
            : `Billigast med minst ${formatTal(r.behov)} GB`}
        </p>
        <div className="mt-2 flex items-start gap-3">
          <OperatorMonogram namn={o?.namn ?? r.ny.operator} size={40} />
          <div className="min-w-0 flex-1">
            <h3 className="text-[17px] font-bold leading-tight [overflow-wrap:anywhere]">
              {o?.namn ?? r.ny.operator}{" "}
              <span className="font-semibold text-foreground/70">{r.ny.namn}</span>
            </h3>
            <p className="mt-1 text-[13.5px] text-foreground/70">
              {gbText(r.ny.gb)} · {bindningText(r.ny.bindning)}
            </p>
            <p className="mt-1 text-[13.5px] text-foreground/75">
              {kampanj
                ? `${kr(r.ny.kampanjpris ?? 0)}/mån i ${r.ny.kampanjManader} mån, sedan ${kr(r.ny.pris)}/mån. Snitt ${kr(snittForstaAret(r.ny))}/mån första året.`
                : `${kr(r.ny.pris)}/mån.`}
            </p>
          </div>
        </div>
        <a
          href={r.ny.kalla}
          target="_blank"
          rel={`noopener ${o?.partner ? "sponsored" : "nofollow"}`}
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-[10px] bg-cta px-4 text-[15px] font-semibold text-cta-foreground hover:bg-cta-hover"
        >
          Till {o?.namn ?? "operatören"}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <Ersattningsrad partner={o?.partner ?? false} />
      </article>

      <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <h3 className="text-[17px] font-bold">Vad du betalar de kommande 24 månaderna</h3>
        <table className="mt-3 w-full text-[15px]">
          <tbody>
            <tr className="border-t border-border">
              <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                Behålla ditt abonnemang
              </th>
              <td className="py-2.5 text-right font-semibold">{kr(r.behalla24)}</td>
            </tr>
            {r.k > 0 && (
              <>
                <tr className="border-t border-border">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    Byta nu (du betalar kvarvarande bindning, {kr(r.bindning)}, ovanpå)
                  </th>
                  <td className="py-2.5 text-right font-semibold">{kr(r.bytNu24)}</td>
                </tr>
                <tr className="border-t border-border">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    Vänta {r.k} mån och byta då
                  </th>
                  <td className="py-2.5 text-right font-semibold">{kr(r.vanta24)}</td>
                </tr>
              </>
            )}
            {r.k === 0 && (
              <tr className="border-t border-border">
                <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                  Byta nu
                </th>
                <td className="py-2.5 text-right font-semibold">{kr(totalKostnad(r.ny, 24))}</td>
              </tr>
            )}
          </tbody>
        </table>
        <p className="mt-3 text-[13px] text-foreground/60">
          Kampanj och startavgift ingår för det nya abonnemanget. Vi räknar med att ditt nuvarande
          pris ligger kvar. Källa: operatörernas webbplatser, kontrollerade{" "}
          {datumText(SENAST_KONTROLLERAD)}.
        </p>
      </section>
    </div>
  );
}

function Sida() {
  const ex = billigastForBehov(ALLMANNA, 20);
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Betalar jag för mycket för mobilen?"
      ingress={
        <p>
          Fyll i vad du betalar, hur mycket surf du har och hur länge bindningstiden är kvar. Vi
          jämför med det billigaste abonnemanget som har minst lika mycket surf och visar skillnaden
          på ett och två år.
          {ex && (
            <>
              {" "}
              Med 20 GB kostar det billigaste just nu {kr(snittForstaAret(ex))} i månaden i snitt
              första året.
            </>
          )}
        </p>
      }
      jamforelse={<Kalkylator />}
      jamforelseRubrik="Räkna ut om du betalar för mycket"
      faq={FAQ}
      lankar={[
        {
          href: "/saga-upp",
          label: "Säga upp mobilabonnemanget",
          text: "Uppsägningstid och nummerflytt, operatör för operatör.",
        },
        {
          href: "/verktyg/hur-mycket-surf-behover-jag",
          label: "Hur mycket surf behöver jag?",
          text: "Kanske räcker det med mindre surf än du har.",
        },
        {
          href: "/verktyg/kampanjkalkylator",
          label: "Kampanjkalkylator",
          text: "Jämför vad kampanjerna kostar på två år.",
        },
      ]}
      ctaBild="spargris-tra"
      uppdaterad="2026-10-29"
    >
      <h2>Så räknar verktyget</h2>
      <ol>
        <li>
          Vi letar fram det abonnemang som har lägst snittpris första året bland dem som har minst
          lika mycket surf som du. Har du obegränsad surf jämför vi bara med obegränsade abonnemang.
          Erbjudanden med ålders- eller studentkrav är inte med.
        </li>
        <li>
          Skillnaden på 12 och 24 månader är ditt pris gånger antalet månader minus vad det nya
          abonnemanget kostar totalt under samma tid, med kampanj och startavgift.
        </li>
        <li>
          Kvarvarande bindningstid räknar vi som ditt månadspris gånger antalet månader som är kvar.
          Det är vad du ska betala till den gamla operatören även om du flyttar numret.
        </li>
        <li>
          Byta nu eller vänta jämför vad du betalar totalt de kommande 24 månaderna i båda fallen.
        </li>
      </ol>

      <h2>Lönar det sig att byta när man har bindningstid?</h2>
      <p>
        Sällan. Bindningstiden hindrar inte att du flyttar numret, men du betalar de månader som är
        kvar till den gamla operatören. Byter du nu betalar du alltså två abonnemang samtidigt. Det
        billigaste är nästan alltid att vänta och säga upp i tid. För en konsument får
        uppsägningstiden vara högst en månad, och du ska inte behöva säga upp tidigare än en månad
        före bindningstidens slut.
      </p>
      <p className="kalla">
        Källa:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 12 kap. 13 §, och PTSFS 2022:4 om nummerportabilitet.
      </p>

      <h2>Vad mer ska jag kolla innan jag byter?</h2>
      <ul>
        <li>
          Hur mycket surf du faktiskt använder. Det ser du i telefonens inställningar. Kanske räcker
          det med en lägre nivå.
        </li>
        <li>Vad abonnemanget kostar när kampanjen är slut, inte bara första månaden.</li>
        <li>Om det nya abonnemanget har bindningstid.</li>
        <li>
          Vilket nät operatören kör i. Läs mer på sidan om <Link to="/nat">mobilnät</Link>.
        </li>
      </ul>
    </PelarSida>
  );
}
