import { createFileRoute, Link } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import {
  ABONNEMANG,
  OPERATORER,
  PRIVATA,
  SENAST_KONTROLLERAD,
  AELDST_KONTROLLERAD,
} from "@/lib/mobil/data";
import {
  arVillkorat,
  datumText,
  formatTal,
  kr,
  prisPerGb,
  snittForstaAret,
} from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/prisindex";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Prisindex", path: PATH },
];

/* ---------------- Uträkningen, gjord en gång vid bygget ---------------- */

const MANAD = datumText(SENAST_KONTROLLERAD).replace(/^\d+ /, ""); // "oktober 2026"
const NIVAER = [1, 5, 10, 20, 50, 100] as const;
const TAK = 3;

/** Abonnemang som alla kan teckna: inga ålders- eller studentkrav. */
const URVAL = PRIVATA.filter((a) => !arVillkorat(a));
const VILLKORADE = PRIVATA.length - URVAL.length;

function median(xs: number[]): number | null {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function harKampanj(a: Abonnemang): boolean {
  return a.kampanjpris != null && (a.kampanjManader ?? 0) > 0 && a.kampanjpris < a.pris;
}

type NivaRad = {
  niva: string;
  regel: string;
  antal: number;
  min: number | null;
  med: number | null;
  max: number | null;
  kampanjAndel: number | null;
};

function nivaRad(niva: string, regel: string, lista: Abonnemang[]): NivaRad {
  const p = lista.map(snittForstaAret);
  return {
    niva,
    regel,
    antal: lista.length,
    min: p.length ? Math.min(...p) : null,
    med: median(p),
    max: p.length ? Math.max(...p) : null,
    kampanjAndel: lista.length ? (lista.filter(harKampanj).length / lista.length) * 100 : null,
  };
}

const PER_NIVA: NivaRad[] = [
  ...NIVAER.map((n) =>
    nivaRad(
      `${n} GB`,
      `${formatTal(n)}–${formatTal(n * TAK)} GB`,
      URVAL.filter((a) => a.gb != null && a.gb >= n && a.gb <= n * TAK),
    ),
  ),
  nivaRad(
    "Obegränsad",
    "Obegränsad surf",
    URVAL.filter((a) => a.gb == null),
  ),
];

const MED_KAMPANJ = URVAL.filter(harKampanj);
const hojningar = MED_KAMPANJ.map((a) => a.pris / (a.kampanjpris as number));
const SNITT_HOJNING = hojningar.length
  ? hojningar.reduce((s, x) => s + x, 0) / hojningar.length
  : null;
const MEDIAN_HOJNING_KR = median(MED_KAMPANJ.map((a) => a.pris - (a.kampanjpris as number)));
const UTAN_BINDNING = URVAL.filter((a) => a.bindning === 0).length;
const BINDNING_OKAND = URVAL.filter((a) => a.bindning == null).length;
const PER_GB = URVAL.map(prisPerGb).filter((x): x is number => x != null);
const MEDIAN_PER_GB = median(PER_GB);
const OPERATORER_I_URVAL = [...new Set(URVAL.map((a) => a.operator))]
  .map((s) => OPERATORER.find((o) => o.slug === s)?.namn ?? s)
  .sort((a, b) => a.localeCompare(b, "sv"));
/** Aktiva operatörer utan några kontrollerade priser alls. */
const UTAN_PRISER = OPERATORER.filter(
  (o) => o.aktiv && !ABONNEMANG.some((a) => a.operator === o.slug),
).map((o) => o.namn);
const AVVECKLAS = OPERATORER.filter((o) => !o.aktiv).map((o) => o.namn);
const PERIOD =
  AELDST_KONTROLLERAD === SENAST_KONTROLLERAD
    ? `den ${datumText(SENAST_KONTROLLERAD)}`
    : `mellan ${datumText(AELDST_KONTROLLERAD)} och ${datumText(SENAST_KONTROLLERAD)}`;

const pct = (x: number) => `${formatTal(Math.round(x))} %`;

const NYCKEL: { mått: string; varde: string; forklaring: string }[] = [
  {
    mått: "Abonnemang i urvalet",
    varde: String(URVAL.length),
    forklaring: `från ${OPERATORER_I_URVAL.length} operatörer`,
  },
  {
    mått: "Andel med kampanjpris",
    varde: pct((MED_KAMPANJ.length / URVAL.length) * 100),
    forklaring: `${MED_KAMPANJ.length} av ${URVAL.length} abonnemang`,
  },
  {
    mått: "Prishöjning efter kampanjen, snitt",
    varde: SNITT_HOJNING != null ? `${formatTal(Math.round(SNITT_HOJNING * 10) / 10)} gånger` : "–",
    forklaring: "ordinarie pris delat med kampanjpris, medelvärde",
  },
  {
    mått: "Prishöjning efter kampanjen, median i kronor",
    varde: MEDIAN_HOJNING_KR != null ? `${kr(MEDIAN_HOJNING_KR)}/mån` : "–",
    forklaring: "ordinarie pris minus kampanjpris",
  },
  {
    mått: "Andel utan bindningstid",
    varde: pct((UTAN_BINDNING / URVAL.length) * 100),
    forklaring: `${UTAN_BINDNING} av ${URVAL.length}. För ${BINDNING_OKAND} framgår bindningstiden inte`,
  },
  {
    mått: "Pris per GB, median",
    varde: MEDIAN_PER_GB != null ? `${formatTal(MEDIAN_PER_GB)} kr` : "–",
    forklaring: `ordinarie pris delat med surf, ${PER_GB.length} abonnemang med fast surfmängd`,
  },
];

/* ---------------- CSV ---------------- */

function csvCell(v: string | number | null): string {
  const s = v == null ? "" : String(v);
  return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function byggCsv(): string {
  const rader: (string | number | null)[][] = [
    [`Mobilpoolens prisindex ${MANAD}`],
    [`Priser kontrollerade ${AELDST_KONTROLLERAD} till ${SENAST_KONTROLLERAD}`],
    [`Källa: operatörernas webbplatser. ${absoluteUrl(PATH)}`],
    [],
    [
      "Surfnivå",
      "Urval",
      "Antal abonnemang",
      "Billigaste snittpris år 1 (kr/mån)",
      "Median snittpris år 1 (kr/mån)",
      "Dyraste snittpris år 1 (kr/mån)",
      "Andel med kampanj (%)",
    ],
    ...PER_NIVA.map((r) => [
      r.niva,
      r.regel,
      r.antal,
      r.min,
      r.med,
      r.max,
      r.kampanjAndel != null ? Math.round(r.kampanjAndel) : null,
    ]),
    [],
    ["Mått", "Värde", "Förklaring"],
    ...NYCKEL.map((n) => [n.mått, n.varde, n.forklaring]),
  ];
  return rader.map((r) => r.map(csvCell).join(";")).join("\r\n");
}

function laddaNer() {
  // BOM så att Excel läser å, ä och ö rätt. Semikolon är svensk Excel-standard.
  const blob = new Blob(["﻿" + byggCsv()], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mobilpoolen-prisindex-${SENAST_KONTROLLERAD.slice(0, 7)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------------- Sidan ---------------- */

const FAQ = [
  {
    q: "Vad är Mobilpoolens prisindex?",
    a: "En sammanställning av priserna på mobilabonnemang för privatpersoner i Sverige, räknad ur de priser vi har kontrollerat på operatörernas egna webbplatser. Den visar billigaste, median och dyraste snittpris per surfnivå, hur vanliga kampanjer är och hur mycket priset stiger när kampanjen tar slut.",
  },
  {
    q: "Varför snittpris första året och inte månadspris?",
    a: "Många abonnemang har ett lågt kampanjpris i några månader. Snittpriset första året räknar med kampanjens längd, ordinarie pris resten av året och startavgiften. Det ger en rättvisare bild av vad du betalar.",
  },
  {
    q: "Hur ofta uppdateras prisindexet?",
    a: "Indexet räknas om varje gång vi uppdaterar priserna i jämförelsen. Datumet högst upp visar när priserna senast kontrollerades.",
  },
  {
    q: "Får jag använda siffrorna?",
    a: "Ja. Ange Mobilpoolens prisindex som källa, med månad och länk till den här sidan. Tabellerna kan laddas ner som CSV.",
  },
];

const TITEL = `Mobilpoolens prisindex ${MANAD}`;
const DESC = `Vad kostar mobilabonnemang i Sverige? Billigaste, median och dyraste pris per surfnivå, andel kampanjer och prishöjning efter kampanj, ${MANAD}.`;

export const Route = createFileRoute("/prisindex")({
  head: () =>
    pageHead({
      title: `Prisindex mobilabonnemang ${MANAD} | Mobilpoolen`,
      description: DESC,
      socialTitle: TITEL,
      canonical: PATH,
      scripts: [
        breadcrumbJsonLd(TRAIL),
        faqJsonLd(FAQ),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: TITEL,
          description: `Priser på ${URVAL.length} mobilabonnemang för privatpersoner i Sverige från ${OPERATORER_I_URVAL.length} operatörer, hämtade från operatörernas egna webbplatser. Billigaste, median och dyraste snittpris första året per surfnivå, andel abonnemang med kampanj, prishöjning efter kampanj, andel utan bindningstid och median pris per GB.`,
          url: absoluteUrl(PATH),
          inLanguage: "sv-SE",
          isAccessibleForFree: true,
          spatialCoverage: { "@type": "Place", name: "Sverige" },
          temporalCoverage: `${AELDST_KONTROLLERAD}/${SENAST_KONTROLLERAD}`,
          dateModified: SENAST_KONTROLLERAD,
          keywords: ["mobilabonnemang", "pris", "prisindex", "Sverige", "kampanjpris"],
          variableMeasured: [
            "Snittpris per månad första året, kronor inklusive moms",
            "Andel abonnemang med kampanjpris",
            "Ordinarie pris delat med kampanjpris",
            "Andel abonnemang utan bindningstid",
            "Pris per GB, kronor",
          ],
          creator: { "@id": "https://mobilpoolen.se/#organization" },
          publisher: { "@id": "https://mobilpoolen.se/#organization" },
        }),
      ],
    }),
  component: Sida,
});

const TH = "px-4 py-3 align-bottom font-semibold";
const TD = "px-4 py-3";

function Sida() {
  const tjugo = PER_NIVA.find((r) => r.niva === "20 GB");
  const obegr = PER_NIVA.find((r) => r.niva === "Obegränsad");
  return (
    <PelarSida
      trail={TRAIL}
      rubrik={TITEL}
      ingress={
        <p>
          {tjugo?.med != null && (
            <>
              Ett mobilabonnemang med 20 till 60 GB kostar i median {kr(tjugo.med)} i månaden första
              året.{" "}
            </>
          )}
          {obegr?.med != null && <>Obegränsad surf kostar i median {kr(obegr.med)}. </>}
          {pct((MED_KAMPANJ.length / URVAL.length) * 100)} av abonnemangen har kampanjpris, och när
          kampanjen tar slut blir priset i snitt{" "}
          {SNITT_HOJNING != null ? formatTal(Math.round(SNITT_HOJNING * 10) / 10) : "–"} gånger så
          högt. Räknat ur {URVAL.length} abonnemang, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
        </p>
      }
      nyckeltal={[
        {
          varde: pct((MED_KAMPANJ.length / URVAL.length) * 100),
          text: "av abonnemangen har kampanjpris",
        },
        {
          varde: pct((UTAN_BINDNING / URVAL.length) * 100),
          text: "av abonnemangen saknar bindningstid",
        },
        {
          varde: MEDIAN_PER_GB != null ? `${formatTal(MEDIAN_PER_GB)} kr` : "–",
          text: "per GB i median, vid ordinarie pris",
        },
      ]}
      jamforelse={
        <div>
          <h3 className="text-[20px] font-bold">Snittpris första året per surfnivå</h3>
          <p className="mt-1 text-[15px] text-foreground/75">
            Kronor per månad inklusive moms, med kampanj och startavgift inräknade.
          </p>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[640px] text-[15px]">
              <caption className="sr-only">
                Billigaste, median och dyraste snittpris första året per surfnivå, {MANAD}
              </caption>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th scope="col" className={TH}>
                    Surfnivå
                  </th>
                  <th scope="col" className={TH}>
                    Urval
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Antal
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Billigast
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Median
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Dyrast
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Med kampanj
                  </th>
                </tr>
              </thead>
              <tbody>
                {PER_NIVA.map((r) => (
                  <tr key={r.niva} className="border-t border-border">
                    <th scope="row" className={`${TD} text-left font-semibold`}>
                      {r.niva}
                    </th>
                    <td className={`${TD} text-foreground/75`}>{r.regel}</td>
                    <td className={`${TD} text-right`}>{r.antal}</td>
                    <td className={`${TD} text-right`}>{r.min != null ? kr(r.min) : "–"}</td>
                    <td className={`${TD} text-right font-semibold`}>
                      {r.med != null ? kr(r.med) : "–"}
                    </td>
                    <td className={`${TD} text-right`}>{r.max != null ? kr(r.max) : "–"}</td>
                    <td className={`${TD} text-right`}>
                      {r.kampanjAndel != null ? pct(r.kampanjAndel) : "–"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="mt-10 text-[20px] font-bold">Kampanjer, bindningstid och pris per GB</h3>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[520px] text-[15px]">
              <caption className="sr-only">Nyckeltal för mobilabonnemang, {MANAD}</caption>
              <thead className="bg-muted/60 text-left">
                <tr>
                  <th scope="col" className={TH}>
                    Mått
                  </th>
                  <th scope="col" className={`${TH} text-right`}>
                    Värde
                  </th>
                  <th scope="col" className={TH}>
                    Så räknas det
                  </th>
                </tr>
              </thead>
              <tbody>
                {NYCKEL.map((n) => (
                  <tr key={n.mått} className="border-t border-border">
                    <th scope="row" className={`${TD} text-left font-semibold`}>
                      {n.mått}
                    </th>
                    <td className={`${TD} whitespace-nowrap text-right font-semibold`}>
                      {n.varde}
                    </td>
                    <td className={`${TD} text-foreground/75`}>{n.forklaring}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[13.5px] text-foreground/65">
            Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
          </p>
          <button
            type="button"
            onClick={laddaNer}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-[12px] border border-primary/35 bg-surface px-5 font-display text-[15px] font-semibold text-primary hover:border-primary hover:bg-highlight"
          >
            <Download className="h-5 w-5" aria-hidden />
            Ladda ner tabellerna som CSV
          </button>
        </div>
      }
      jamforelseRubrik={`Priserna i ${MANAD}`}
      faq={FAQ}
      lankar={[
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Vilka abonnemang som är billigast just nu.",
        },
        {
          href: "/verktyg/kampanjkalkylator",
          label: "Kampanjkalkylator",
          text: "Räkna på vad en kampanj kostar på två år.",
        },
        {
          href: "/sa-jamfor-vi",
          label: "Så jämför vi",
          text: "Varifrån priserna kommer.",
        },
      ]}
      ctaBild="myntstaplar-okar"
      uppdaterad={SENAST_KONTROLLERAD}
    >
      <h2>Så räknar vi prisindexet</h2>
      <p>
        Indexet bygger på samma priser som jämförelsen. Vi har hämtat ordinarie pris, kampanjpris,
        kampanjens längd, startavgift och bindningstid från varje operatörs egen webbplats. Priserna
        kontrollerades {PERIOD}.
      </p>
      <h3>Vilka abonnemang som är med</h3>
      <ul>
        <li>
          Abonnemang för privatpersoner som alla kan teckna, {URVAL.length} stycken från{" "}
          {OPERATORER_I_URVAL.join(", ")}.
        </li>
        <li>
          {VILLKORADE} abonnemang med ålders- eller studentkrav är inte med, eftersom alla inte kan
          köpa dem.
        </li>
        <li>
          {UTAN_PRISER.length > 0 && (
            <>
              {UTAN_PRISER.join(", ")} är inte med, eftersom vi inte har kunnat kontrollera deras
              priser.{" "}
            </>
          )}
          {AVVECKLAS.length > 0 && (
            <>{AVVECKLAS.join(", ")} är inte med, eftersom varumärket avvecklas. </>
          )}
          Företagsabonnemang är inte med.
        </li>
        <li>
          Varje abonnemang räknas för sig. Har en operatör samma abonnemang både med och utan
          kampanj räknas båda.
        </li>
      </ul>
      <h3>Urvalsregeln per surfnivå</h3>
      <p>
        Ett abonnemang räknas till en surfnivå om det har minst så mycket surf och högst tre gånger
        så mycket. Till 10 GB räknas alltså abonnemang med 10 till 30 GB. Utan ett tak skulle
        billigaste priset för 1 GB och 5 GB ofta vara samma abonnemang, och medianen skulle dras upp
        av abonnemang med mycket mer surf än nivån. Med taket jämförs abonnemang som rimligen
        konkurrerar med varandra. Ett abonnemang kan räknas till två närliggande nivåer. Obegränsad
        surf är en egen nivå och ingår inte i 100 GB.
      </p>
      <h3>Måtten</h3>
      <ul>
        <li>
          <strong>Snittpris första året:</strong> kampanjpriset för kampanjens månader, ordinarie
          pris resten av året och startavgiften, delat med tolv.
        </li>
        <li>
          <strong>Median:</strong> det mittersta priset när abonnemangen sorteras. Vid jämnt antal
          medelvärdet av de två mittersta.
        </li>
        <li>
          <strong>Prishöjning efter kampanjen:</strong> ordinarie pris delat med kampanjpris, som
          medelvärde för alla abonnemang med kampanj. Tre gånger betyder att priset tredubblas.
        </li>
        <li>
          <strong>Pris per GB:</strong> ordinarie månadspris delat med surfmängden. Obegränsade
          abonnemang är inte med.
        </li>
      </ul>
      <p>
        Priserna är det operatörerna publicerar på sina webbplatser. Erbjudanden i butik, i telefon
        eller till befintliga kunder är inte med. Läs mer om{" "}
        <Link to="/sa-jamfor-vi">hur vi jämför</Link>.
      </p>
    </PelarSida>
  );
}
