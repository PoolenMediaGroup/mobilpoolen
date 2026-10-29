import { useId, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, X } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { arVillkorat, datumText, gbText, kr, sortera, totalKostnad } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/verktyg/kampanjkalkylator";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Verktyg", path: "/verktyg" },
  { name: "Kampanjkalkylator", path: PATH },
];

/** Abonnemang med kampanj först, sedan resten, för förifyllningen. */
const MED_KAMPANJ = sortera(
  PRIVATA.filter((a) => a.kampanjpris != null && (a.kampanjManader ?? 0) > 0),
  "snitt-ar",
);
const UTAN_KAMPANJ = sortera(
  PRIVATA.filter((a) => !(a.kampanjpris != null && (a.kampanjManader ?? 0) > 0)),
  "snitt-ar",
);

const FAQ = [
  {
    q: "Hur jämför jag två kampanjpriser?",
    a: "Räkna totalkostnaden över lika lång tid för båda, till exempel 12 och 24 månader. Ta med kampanjpriset för de månader det gäller, ordinarie pris för resten och eventuell startavgift. Det abonnemang som är billigast totalt är billigast, oavsett vilket som har lägst pris första månaden.",
  },
  {
    q: "Vad är en brytpunkt?",
    a: "Den månad då ett abonnemang som var dyrare i början blir billigare totalt. Har ett abonnemang lägre kampanjpris men högre ordinarie pris kommer det andra ikapp efter en tid. Efter brytpunkten är det andra abonnemanget billigare räknat från start.",
  },
  {
    q: "Vad händer när kampanjen tar slut?",
    a: "Abonnemanget går över till ordinarie pris automatiskt. Har det ingen bindningstid kan du byta operatör när kampanjen är slut. Läs mer i guiden om kampanjpris.",
  },
  {
    q: "Får jag säga upp abonnemanget om priset höjs?",
    a: "Operatören ska meddela en villkorsändring minst en månad innan. Är ändringen inte enbart till din fördel har du rätt att säga upp avtalet utan kostnad.",
    kalla: "Lagen (2022:482) om elektronisk kommunikation",
  },
];

const TITEL = "Kampanjkalkylator: vad kostar kampanjen på 2 år?";
const DESC =
  "Jämför två eller tre mobilabonnemang med kampanjpris. Se totalkostnaden på 12 och 24 månader och när det dyrare i början blir billigast.";

export const Route = createFileRoute("/verktyg/kampanjkalkylator")({
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
          name: "Kampanjkalkylator för mobilabonnemang",
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

type Rad = {
  namn: string;
  kampanjpris: string;
  manader: string;
  pris: string;
  start: string;
};

function tal(s: string): number {
  const n = Number(s.replace(/\s/g, "").replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function fran(a: Abonnemang): Rad {
  const kampanj = a.kampanjpris != null && (a.kampanjManader ?? 0) > 0;
  return {
    namn: `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`,
    kampanjpris: kampanj ? String(a.kampanjpris) : "",
    manader: kampanj ? String(a.kampanjManader) : "0",
    pris: String(a.pris),
    start: a.startavgift ? String(a.startavgift) : "0",
  };
}

/** Samma regel som totalKostnad i berakna.ts, för egna inmatade värden. */
function kostnad(r: Rad, manader: number): number {
  const p = tal(r.pris);
  const kp = r.kampanjpris.trim() ? tal(r.kampanjpris) : p;
  const km = Math.min(Math.round(tal(r.manader)), manader);
  return Math.round(km * kp + (manader - km) * p + tal(r.start));
}

/** Abonnemang med kampanj som alla kan teckna (inga ålders- eller studentkrav). */
const ALLMANNA_KAMPANJ = MED_KAMPANJ.filter((a) => !arVillkorat(a));
const ALLMANNA = PRIVATA.filter((a) => !arVillkorat(a));

function startRader(): Rad[] {
  // Förval: billigaste kampanjen som alla kan teckna, mot billigaste utan kampanj med minst
  // samma surf. Ger en verklig jämförelse direkt i den serverrenderade sidan.
  const a = ALLMANNA_KAMPANJ[0];
  const b = UTAN_KAMPANJ.find(
    (x) => !arVillkorat(x) && x.gb != null && a?.gb != null && x.gb >= a.gb,
  );
  return [a ? fran(a) : tom(1), b ? fran(b) : tom(2)];
}

function tom(i: number): Rad {
  return { namn: `Abonnemang ${i}`, kampanjpris: "", manader: "0", pris: "", start: "0" };
}

const FALT =
  "block min-h-[48px] w-full rounded-xl border border-input-border bg-input px-3 text-[16px] font-semibold text-foreground";
const ETIKETT = "block text-[14px] font-semibold text-foreground";

function Kalkylator() {
  const uid = useId();
  const [rader, setRader] = useState<Rad[]>(startRader);

  const andra = (i: number, f: keyof Rad, v: string) =>
    setRader((rs) => rs.map((r, j) => (j === i ? { ...r, [f]: v } : r)));

  const resultat = useMemo(() => {
    const k12 = rader.map((r) => kostnad(r, 12));
    const k24 = rader.map((r) => kostnad(r, 24));
    // Brytpunkter: första månaden då ordningen mellan två abonnemang vänder.
    const bryt: string[] = [];
    for (let i = 0; i < rader.length; i++) {
      for (let j = i + 1; j < rader.length; j++) {
        if (!tal(rader[i].pris) || !tal(rader[j].pris)) continue;
        const forst = Math.sign(kostnad(rader[i], 1) - kostnad(rader[j], 1));
        let man: number | null = null;
        for (let m = 2; m <= 36; m++) {
          const s = Math.sign(kostnad(rader[i], m) - kostnad(rader[j], m));
          if (forst !== 0 && s !== 0 && s !== forst) {
            man = m;
            break;
          }
        }
        const billigBorjan = forst < 0 ? rader[i].namn : rader[j].namn;
        const kommerIkapp = forst < 0 ? rader[j].namn : rader[i].namn;
        if (man != null)
          bryt.push(
            `${billigBorjan} är billigast i början, men från månad ${man} har ${kommerIkapp} kostat mindre totalt.`,
          );
        else if (forst !== 0)
          bryt.push(`${billigBorjan} är billigare än ${kommerIkapp} hela vägen till 36 månader.`);
      }
    }
    const giltiga = rader.map((r) => tal(r.pris) > 0);
    const min24 = Math.min(...k24.filter((_, i) => giltiga[i]));
    return { k12, k24, bryt, giltiga, min24 };
  }, [rader]);

  return (
    <div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rader.map((r, i) => (
          <fieldset
            key={i}
            className="rounded-2xl border border-border bg-surface p-4 shadow-kort-litet sm:p-5"
          >
            <legend className="sr-only">Abonnemang {i + 1}</legend>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[17px] font-bold">Abonnemang {i + 1}</h3>
              {rader.length > 2 && (
                <button
                  type="button"
                  onClick={() => setRader((rs) => rs.filter((_, j) => j !== i))}
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-foreground/70 hover:text-primary"
                  aria-label={`Ta bort abonnemang ${i + 1}`}
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              )}
            </div>
            <label className={`${ETIKETT} mt-3`}>
              Hämta från jämförelsen
              <select
                className={`${FALT} mt-1.5 text-[15px] font-medium`}
                value=""
                onChange={(e) => {
                  const a = PRIVATA.find((x) => x.id === e.target.value);
                  if (a) setRader((rs) => rs.map((x, j) => (j === i ? fran(a) : x)));
                }}
              >
                <option value="">Välj abonnemang…</option>
                <optgroup label="Med kampanjpris">
                  {MED_KAMPANJ.map((a) => (
                    <option key={a.id} value={a.id}>
                      {operator(a.operator)?.namn} {a.namn} ({gbText(a.gb)})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Utan kampanj">
                  {UTAN_KAMPANJ.map((a) => (
                    <option key={a.id} value={a.id}>
                      {operator(a.operator)?.namn} {a.namn} ({gbText(a.gb)})
                    </option>
                  ))}
                </optgroup>
              </select>
            </label>
            <label className={`${ETIKETT} mt-3`}>
              Namn
              <input
                autoComplete="off"
                value={r.namn}
                onChange={(e) => andra(i, "namn", e.target.value.slice(0, 60))}
                className={`${FALT} mt-1.5`}
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <label className={ETIKETT}>
                Kampanjpris kr/mån
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="ingen"
                  value={r.kampanjpris}
                  onChange={(e) => andra(i, "kampanjpris", e.target.value.replace(/[^\d,]/g, ""))}
                  className={`${FALT} mt-1.5`}
                />
              </label>
              <label className={ETIKETT}>
                Kampanjmånader
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={r.manader}
                  onChange={(e) =>
                    andra(i, "manader", e.target.value.replace(/[^\d]/g, "").slice(0, 2))
                  }
                  className={`${FALT} mt-1.5`}
                />
              </label>
              <label className={ETIKETT}>
                Ordinarie kr/mån
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={r.pris}
                  onChange={(e) => andra(i, "pris", e.target.value.replace(/[^\d,]/g, ""))}
                  className={`${FALT} mt-1.5`}
                />
              </label>
              <label className={ETIKETT}>
                Startavgift kr
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={r.start}
                  onChange={(e) => andra(i, "start", e.target.value.replace(/[^\d,]/g, ""))}
                  className={`${FALT} mt-1.5`}
                />
              </label>
            </div>
          </fieldset>
        ))}
        {rader.length < 3 && (
          <button
            type="button"
            onClick={() => setRader((rs) => [...rs, tom(rs.length + 1)])}
            className="btn-secondary-outline min-h-[120px] w-full md:min-h-0"
          >
            <Plus className="h-5 w-5" aria-hidden />
            Lägg till ett tredje
          </button>
        )}
      </div>

      <section
        aria-live="polite"
        aria-labelledby={`${uid}-res`}
        className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-6"
      >
        <h3 id={`${uid}-res`} className="text-[20px] font-bold">
          Totalkostnad
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[420px] text-[15px]">
            <thead className="text-left">
              <tr className="border-b border-border">
                <th className="py-2.5 pr-3 font-semibold">Abonnemang</th>
                <th className="py-2.5 pr-3 text-right font-semibold">12 mån</th>
                <th className="py-2.5 pr-3 text-right font-semibold">24 mån</th>
                <th className="py-2.5 text-right font-semibold">Snitt/mån över 24</th>
              </tr>
            </thead>
            <tbody>
              {rader.map((r, i) => {
                const bast = resultat.giltiga[i] && resultat.k24[i] === resultat.min24;
                return (
                  <tr key={i} className={`border-b border-border ${bast ? "bg-highlight" : ""}`}>
                    <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                      {r.namn || `Abonnemang ${i + 1}`}
                      {bast && rader.length > 1 && (
                        <span className="ml-2 text-[13px] font-semibold text-primary">
                          billigast på 24 mån
                        </span>
                      )}
                    </th>
                    <td className="py-2.5 pr-3 text-right">
                      {resultat.giltiga[i] ? kr(resultat.k12[i]) : "–"}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-semibold">
                      {resultat.giltiga[i] ? kr(resultat.k24[i]) : "–"}
                    </td>
                    <td className="py-2.5 text-right">
                      {resultat.giltiga[i] ? kr(resultat.k24[i] / 24) : "–"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {resultat.bryt.length > 0 && (
          <div className="mt-4">
            <h4 className="text-[16px] font-bold">Brytpunkt</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-[15px]">
              {resultat.bryt.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        )}
        <p className="mt-4 text-[13px] text-foreground/60">
          Förifyllda priser: operatörernas webbplatser, kontrollerade{" "}
          {datumText(SENAST_KONTROLLERAD)}. Vi sparar ingenting av det du fyller i.
        </p>
      </section>
    </div>
  );
}

function Sida() {
  const ex = ALLMANNA_KAMPANJ[0];
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Kampanjkalkylator för mobilabonnemang"
      ingress={
        <p>
          Ett lågt kampanjpris säger lite om vad abonnemanget kostar. Det som räknas är
          totalkostnaden när kampanjen är slut. Lägg två eller tre abonnemang bredvid varandra, så
          ser du vad de kostar på 12 och 24 månader och när det dyrare i början blir billigast.
        </p>
      }
      nyckeltal={[
        {
          varde: String(ALLMANNA_KAMPANJ.length),
          text: `av ${ALLMANNA.length} abonnemang som alla kan teckna har kampanjpris just nu`,
        },
        ...(ex
          ? [
              {
                varde: kr(totalKostnad(ex, 24)),
                text: `kostar ${operator(ex.operator)?.namn} ${ex.namn} på 24 månader, med kampanj`,
              },
            ]
          : []),
      ]}
      jamforelse={<Kalkylator />}
      jamforelseRubrik="Jämför kampanjerna"
      jamforelseIngress="Välj abonnemang ur jämförelsen eller skriv in egna priser. Totalen räknas om direkt."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/kampanjpris-efter-kampanjen",
          label: "När kampanjpriset tar slut",
          text: "Vad som händer och hur du räknar på hela året.",
        },
        {
          href: "/prisindex",
          label: "Mobilpoolens prisindex",
          text: "Hur mycket priset stiger efter kampanjen i snitt.",
        },
        {
          href: "/verktyg/betalar-jag-for-mycket",
          label: "Betalar jag för mycket?",
          text: "Jämför ditt pris med det billigaste likvärdiga.",
        },
      ]}
      ctaBild="miniraknare-kvitton"
      uppdaterad="2026-10-29"
    >
      <h2>Så räknar kalkylatorn</h2>
      <p>
        För varje abonnemang räknar vi kampanjpriset gånger antalet kampanjmånader, plus ordinarie
        pris för de månader som är kvar, plus startavgiften. Det är samma regel som i jämförelsen.
        Lämnar du kampanjpriset tomt räknar vi med ordinarie pris hela tiden.
      </p>
      <p>
        Brytpunkten är den första månaden då ordningen mellan två abonnemang vänder, räknat på hur
        mycket du har betalat totalt sedan start. Vi letar upp till 36 månader framåt.
      </p>
      <h2>Vad ska jag tänka på med kampanjpriser?</h2>
      <ul>
        <li>Titta på ordinarie pris. Det är det du betalar längst, ofta mer än ett år av två.</li>
        <li>
          Kolla bindningstiden. Ett kampanjpris med bindningstid låser dig vid ordinarie priset när
          kampanjen är slut.
        </li>
        <li>
          Utan bindningstid kan du byta när kampanjen är slut. Då är det bara kampanjmånaderna som
          räknas.
        </li>
      </ul>
      <p>
        Läs mer i guiden om{" "}
        <Link to={"/guider/kampanjpris-efter-kampanjen" as never}>
          vad som händer när kampanjpriset tar slut
        </Link>
        .
      </p>
    </PelarSida>
  );
}
