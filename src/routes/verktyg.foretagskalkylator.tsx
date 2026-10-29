import { useId, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { FORETAG, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { KALLOR } from "@/lib/mobil/fakta";
import {
  bindningText,
  datumText,
  gbText,
  kr,
  momsText,
  snittForstaAret,
  sortera,
  tackerBehov,
} from "@/lib/mobil/berakna";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/verktyg/foretagskalkylator";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Verktyg", path: "/verktyg" },
  { name: "Företagskalkylator", path: PATH },
];

const MOMS = 0.25;
const SKV_MOMS =
  "https://skatteverket.se/foretag/moms/kopavarorochtjanster/inkoptillforetaget.4.7459477810df5bccdd480005156.html";

const OKANDA = [
  ...new Set(FORETAG.filter((a) => a.moms === "okand").map((a) => operator(a.operator)?.namn)),
].filter(Boolean) as string[];

const FAQ = [
  {
    q: "Är priser på företagsabonnemang exklusive moms?",
    a: `I regel ja, men inte alltid uttryckligen. Tre och Telavox skriver att priset är exklusive moms. ${OKANDA.join(", ")} anger inte på sina abonnemangssidor om priset är med eller utan moms. Fråga operatören innan du räknar på det.`,
  },
  {
    q: "Får företaget dra av momsen på mobilabonnemanget?",
    a: "Ett momsregistrerat företag får dra av ingående moms, 25 procent, på inköp som används i verksamheten. Används abonnemanget även privat får du bara dra av den del som hör till verksamheten, efter en skälig fördelning som du ska kunna visa.",
    kalla: "Skatteverket, inköp till företaget",
  },
  {
    q: "Hur räknar jag ut priset inklusive moms?",
    a: "Multiplicera priset exklusive moms med 1,25. Ett abonnemang för 200 kronor exklusive moms kostar alltså 250 kronor inklusive moms, och 50 kronor av det är moms.",
  },
  {
    q: "Gäller reglerna om högst 24 månaders bindningstid även företag?",
    a: "Ja, för mikroföretag, små företag och ideella organisationer, om de inte uttryckligen har gått med på något annat. Ett större företag kan avtala om längre bindningstid.",
    kalla: "Lagen (2022:482) om elektronisk kommunikation",
  },
];

const TITEL = "Företagskalkylator: vad kostar mobilerna?";
const DESC =
  "Räkna ut vad företagets mobilabonnemang kostar per månad och år, per användare och totalt, exklusive och inklusive moms. Välj ur jämförelsen.";

export const Route = createFileRoute("/verktyg/foretagskalkylator")({
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
          name: "Företagskalkylator för mobilabonnemang",
          description: DESC,
          url: absoluteUrl(PATH),
          applicationCategory: "BusinessApplication",
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

const SURF = [
  { v: "0", label: "Spelar ingen roll" },
  { v: "10", label: "Minst 10 GB" },
  { v: "30", label: "Minst 30 GB" },
  { v: "60", label: "Minst 60 GB" },
  { v: "obegransad", label: "Obegränsad" },
];

function Kalkylator() {
  const uid = useId();
  const [antal, setAntal] = useState("5");
  const [surf, setSurf] = useState("0");
  const [val, setVal] = useState<string>("");
  const [egetPris, setEgetPris] = useState("");
  const [egetMoms, setEgetMoms] = useState<"exkl" | "inkl">("exkl");

  const lista = useMemo(() => {
    const l =
      surf === "obegransad"
        ? FORETAG.filter((a) => a.gb == null)
        : FORETAG.filter((a) => tackerBehov(a, Number(surf)));
    return sortera(l, "snitt-ar");
  }, [surf]);

  const valt = val === "eget" ? null : (lista.find((a) => a.id === val) ?? lista[0] ?? null);

  const n = Math.max(1, Math.min(10000, Math.round(tal(antal)) || 1));
  let exkl: number;
  let momsStatus: "exkl" | "inkl" | "okand";
  if (val === "eget") {
    const p = tal(egetPris);
    exkl = egetMoms === "inkl" ? p / (1 + MOMS) : p;
    momsStatus = egetMoms;
  } else {
    // Snitt första året med kampanj och startavgift. Okänd moms räknas som exkl.
    exkl = valt ? snittForstaAret(valt) : 0;
    momsStatus = valt?.moms ?? "okand";
  }
  const inkl = exkl * (1 + MOMS);
  const o = valt ? operator(valt.operator) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        onSubmit={(e) => e.preventDefault()}
        aria-labelledby={`${uid}-rubrik`}
        className="rounded-2xl border border-border bg-surface p-5 shadow-kort-litet sm:p-6"
      >
        <h2 id={`${uid}-rubrik`} className="text-[22px] font-bold">
          Företagets behov
        </h2>
        <label className={`${ETIKETT} mt-5`}>
          Antal användare
          <input
            inputMode="numeric"
            autoComplete="off"
            value={antal}
            onChange={(e) => setAntal(e.target.value.replace(/[^\d]/g, "").slice(0, 5))}
            className={`${FALT} mt-2`}
          />
        </label>
        <label className={`${ETIKETT} mt-5`}>
          Surf per användare
          <select
            value={surf}
            onChange={(e) => {
              setSurf(e.target.value);
              if (val !== "eget") setVal("");
            }}
            className={`${FALT} mt-2`}
          >
            {SURF.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className={`${ETIKETT} mt-5`}>
          Abonnemang
          <select
            value={val === "eget" ? "eget" : (valt?.id ?? "")}
            onChange={(e) => setVal(e.target.value)}
            className={`${FALT} mt-2 text-[15.5px]`}
          >
            {lista.map((a) => (
              <option key={a.id} value={a.id}>
                {operator(a.operator)?.namn} {a.namn}, {kr(snittForstaAret(a))}/mån
                {a.moms === "okand" ? " (moms anges inte)" : ""}
              </option>
            ))}
            <option value="eget">Ange eget pris</option>
          </select>
        </label>
        {val === "eget" && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className={ETIKETT}>
              Pris per användare
              <span className="relative mt-2 block">
                <input
                  inputMode="numeric"
                  autoComplete="off"
                  value={egetPris}
                  onChange={(e) => setEgetPris(e.target.value.replace(/[^\d,]/g, ""))}
                  className={`${FALT} pr-20`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
                  kr/mån
                </span>
              </span>
            </label>
            <label className={ETIKETT}>
              Priset är
              <select
                value={egetMoms}
                onChange={(e) => setEgetMoms(e.target.value as "exkl" | "inkl")}
                className={`${FALT} mt-2`}
              >
                <option value="exkl">exkl. moms</option>
                <option value="inkl">inkl. moms</option>
              </select>
            </label>
          </div>
        )}
        <p className="mt-5 text-[12.5px] text-foreground/60">
          Vi sparar ingenting av det du fyller i. Uträkningen sker i din webbläsare.
        </p>
      </form>

      <section aria-live="polite" className="flex flex-col gap-4">
        <div className="rounded-2xl bg-dark-section p-5 text-white sm:p-6">
          <h2 className="text-[18px] font-bold text-white">
            {n} användare
            {valt && val !== "eget" ? `, ${o?.namn} ${valt.namn}` : ""}
          </h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[300px] text-[15px] text-white">
              <thead>
                <tr className="border-b border-white/20 text-left text-white/75">
                  <th className="py-2 pr-3 font-medium">
                    <span className="sr-only">Period</span>
                  </th>
                  <th className="py-2 pr-3 text-right font-medium">Exkl. moms</th>
                  <th className="py-2 text-right font-medium">Inkl. moms</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/10">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    Per användare och månad
                  </th>
                  <td className="py-2.5 pr-3 text-right">{kr(exkl)}</td>
                  <td className="py-2.5 text-right">{kr(inkl)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    Per användare och år
                  </th>
                  <td className="py-2.5 pr-3 text-right">{kr(exkl * 12)}</td>
                  <td className="py-2.5 text-right">{kr(inkl * 12)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    Alla, per månad
                  </th>
                  <td className="py-2.5 pr-3 text-right font-semibold">{kr(exkl * n)}</td>
                  <td className="py-2.5 text-right font-semibold">{kr(inkl * n)}</td>
                </tr>
                <tr>
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">
                    Alla, per år
                  </th>
                  <td className="py-2.5 pr-3 text-right font-display text-[20px] font-bold">
                    {kr(exkl * 12 * n)}
                  </td>
                  <td className="py-2.5 text-right font-display text-[20px] font-bold">
                    {kr(inkl * 12 * n)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13.5px] text-white/75">
            Momsen är {kr((inkl - exkl) * 12 * n)} per år. Ett momsregistrerat företag kan dra av
            den del som hör till verksamheten.
          </p>
        </div>

        {momsStatus === "okand" && (
          <p
            role="note"
            className="flex items-start gap-2.5 rounded-2xl border border-cta/60 bg-cta-soft p-4 text-[15px] text-foreground"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-foreground" aria-hidden />
            <span>
              <strong>{o?.namn} anger inte om priset är exklusive moms.</strong> Vi har räknat som
              om det är exklusive, vilket är vanligast för företagspriser. Är det i stället
              inklusive moms blir kostnaden 20 procent lägre än i tabellen. Fråga operatören.
            </span>
          </p>
        )}

        {valt && val !== "eget" && (
          <div className="rounded-2xl border border-border bg-surface p-4 text-[14.5px] sm:p-5">
            <p>
              <strong>
                {o?.namn} {valt.namn}
              </strong>
              : {gbText(valt.gb)}, {bindningText(valt.bindning)}.{" "}
              {valt.kampanjpris != null && (valt.kampanjManader ?? 0) > 0
                ? `${kr(valt.kampanjpris)}/mån i ${valt.kampanjManader} mån, sedan ${kr(valt.pris)}/mån. Tabellen visar snittet första året.`
                : `${kr(valt.pris)}/mån.`}{" "}
              {valt.moms === "okand" || !valt.moms
                ? "Operatören anger inte om priset är exklusive eller inklusive moms."
                : `Priset är ${momsText(valt.moms)} enligt operatören.`}
            </p>
            <a
              href={valt.kalla}
              target="_blank"
              rel={`noopener ${o?.partner ? "sponsored" : "nofollow"}`}
              className="mt-2 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-2"
            >
              Se priset hos {o?.namn}
            </a>
            <p className="mt-1 text-[13px] text-foreground/60">
              Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function Sida() {
  const billigast = sortera(FORETAG, "snitt-ar")[0];
  const bo = billigast ? operator(billigast.operator) : null;
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Företagskalkylator för mobilabonnemang"
      ingress={
        <p>
          Räkna ut vad företagets mobiler kostar per användare och totalt, per månad och per år,
          både utan och med moms. Välj ett av {FORETAG.length} företagsabonnemang ur jämförelsen
          eller skriv in priset du har fått i en offert.
          {billigast && bo && (
            <>
              {" "}
              Lägst snittpris första året har just nu {bo.namn} {billigast.namn},{" "}
              {kr(snittForstaAret(billigast))} i månaden
              {billigast.moms === "exkl" ? " exklusive moms" : ""}.
            </>
          )}
        </p>
      }
      nyckeltal={[
        { varde: "25 %", text: "moms på mobilabonnemang" },
        { varde: String(FORETAG.length), text: "företagsabonnemang i kalkylatorn" },
        {
          varde: String(OKANDA.length),
          text: "operatörer anger inte om företagspriset är exkl. moms",
        },
      ]}
      jamforelse={<Kalkylator />}
      jamforelseRubrik="Räkna på företagets mobiler"
      faq={FAQ}
      lankar={[
        {
          href: "/foretag",
          label: "Mobilabonnemang för företag",
          text: "Jämför alla företagsabonnemang.",
        },
        {
          href: "/foretag/billigaste-foretagsabonnemang",
          label: "Billigaste företagsabonnemang",
          text: "Billigast per surfnivå för företag.",
        },
        {
          href: "/foretag/enskild-firma",
          label: "Mobil i enskild firma",
          text: "Avdrag, moms och privat användning.",
        },
      ]}
      ctaRubrik="Jämför företagsabonnemang"
      ctaIngress="Se alla företagsabonnemang med pris per användare, surf och bindningstid."
      ctaBild="kontor-motesrum"
      uppdaterad="2026-10-29"
    >
      <h2>Så räknar kalkylatorn</h2>
      <ol>
        <li>
          Månadspriset per användare är snittpriset första året, med kampanj och startavgift
          inräknade. Det är samma mått som i jämförelsen.
        </li>
        <li>Priset inklusive moms är priset exklusive moms gånger 1,25.</li>
        <li>Årskostnaden är månadspriset gånger tolv, gånger antalet användare.</li>
        <li>
          Skriver du in ett eget pris inklusive moms räknar vi om det till exklusive genom att dela
          med 1,25.
        </li>
      </ol>
      <p>
        Kalkylatorn räknar inte med växel, extra simkort, telefoner eller rabatter för många
        abonnemang. Sådant ger operatörerna i offert.
      </p>

      <h2>Är priset exklusive eller inklusive moms?</h2>
      <p>
        Företagspriser anges i regel exklusive moms. Tre och Telavox skriver det uttryckligen.{" "}
        {OKANDA.join(", ")} anger inte på sina abonnemangssidor om priset är med eller utan moms.
        Kalkylatorn räknar då som om priset är exklusive moms och visar en varning. Kontrollera med
        operatören innan du bestämmer dig.
      </p>
      <p>
        Ett momsregistrerat företag får dra av momsen på det som används i verksamheten. Används
        abonnemanget även privat får du bara dra av den del som hör till verksamheten, efter en
        skälig fördelning.
      </p>
      <p className="kalla">
        Källa:{" "}
        <a href={SKV_MOMS} target="_blank" rel="noopener nofollow">
          Skatteverket, inköp till företaget
        </a>
        . Om förmånsbeskattning:{" "}
        <a href={KALLOR.skatteverketArbetsredskap.url} target="_blank" rel="noopener nofollow">
          {KALLOR.skatteverketArbetsredskap.namn}
        </a>
        .
      </p>
      <p>
        Har du enskild firma gäller andra regler för den privata användningen. Läs mer på sidan om{" "}
        <Link to={"/foretag/enskild-firma" as never}>mobil i enskild firma</Link>. Vill du ha en
        översikt över alla abonnemang, se{" "}
        <Link to={"/foretag" as never}>mobilabonnemang för företag</Link>.
      </p>
    </PelarSida>
  );
}
