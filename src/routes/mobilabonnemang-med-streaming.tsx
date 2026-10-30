import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { ABONNEMANG, PRIVATA, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  datumText,
  kr,
  snittForstaAret,
  totalKostnad,
} from "@/lib/mobil/berakna";
import { STREAMINGPRISER, STREAMING_KONTROLLERAD } from "@/lib/mobil/streaming-data";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import { vem } from "@/lib/mobil/surf";
import type { Abonnemang } from "@/lib/mobil/typer";

const PATH = "/mobilabonnemang-med-streaming";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Mobilabonnemang med streaming", path: PATH },
];

/* ---------------- Uträkningen, ur prisdatan ---------------- */

const hitta = (id: string) => ABONNEMANG.find((a) => a.id === id);
const pris = (tjanst: string, niva: string) =>
  STREAMINGPRISER.find((s) => s.tjanst === tjanst && s.niva === niva) ?? null;

/** Telias Obegränsad Plus utan tjänst, utan och med bindningstid. Grunden för jämförelsen. */
const PLUS = hitta("telia-telia-mobil-obegransad-plus");
const PLUS24 = hitta("telia-telia-mobil-obegransad-plus-24-man-bindning");

/**
 * Streamingvarianterna och vilken nivå av tjänsten som ingår enligt Telias prislista.
 * Viaplay: prislistan anger inte vilken nivå som ingår, så den räknas inte.
 */
const VARIANTER: {
  id: string;
  tjanst: string;
  ingar: ({ tjanst: string; niva: string } | null)[];
}[] = [
  {
    id: "telia-telia-obegransad-plus-netflix-24-man-bindning",
    tjanst: "Netflix",
    ingar: [{ tjanst: "Netflix", niva: "Standard" }],
  },
  {
    id: "telia-telia-obegransad-plus-hbo-max-24-man-bindning",
    tjanst: "HBO Max",
    ingar: [{ tjanst: "HBO Max", niva: "Basic med reklam" }],
  },
  {
    id: "telia-telia-obegransad-plus-disney-24-man-bindning",
    tjanst: "Disney+",
    ingar: [{ tjanst: "Disney+", niva: "Standard med reklam" }],
  },
  {
    id: "telia-telia-obegransad-plus-tv4-play-24-man-bindning",
    tjanst: "TV4 Play",
    ingar: [{ tjanst: "TV4 Play", niva: "Plus" }],
  },
  {
    id: "telia-telia-obegransad-plus-amazon-prime-24-man-bindning",
    tjanst: "Amazon Prime",
    ingar: [{ tjanst: "Amazon Prime", niva: "Amazon Prime (månatligen)" }],
  },
  {
    id: "telia-telia-obegransad-plus-viaplay-24-man-bindning",
    tjanst: "Viaplay",
    ingar: [null],
  },
  {
    id: "telia-telia-obegransad-plus-netflix-hbo-max-disney-24-man-bindning",
    tjanst: "Netflix, HBO Max och Disney+",
    ingar: [
      { tjanst: "Netflix", niva: "Standard" },
      { tjanst: "HBO Max", niva: "Basic med reklam" },
      { tjanst: "Disney+", niva: "Standard med reklam" },
    ],
  },
];

type Rad = {
  a: Abonnemang;
  tjanst: string;
  ingarText: string;
  tillagg: number;
  separat: number | null;
  sparar: number | null;
  kalla: string[];
};

const RADER: Rad[] = PLUS
  ? VARIANTER.flatMap((v) => {
      const a = hitta(v.id);
      if (!a) return [];
      const priser = v.ingar.map((i) => (i ? pris(i.tjanst, i.niva) : null));
      const kanda = priser.every((p) => p?.pris != null);
      const separat = kanda ? priser.reduce((s, p) => s + (p?.pris ?? 0), 0) : null;
      const tillagg = a.pris - PLUS.pris;
      return [
        {
          a,
          tjanst: v.tjanst,
          ingarText: v.ingar
            .map((i) =>
              i
                ? `${i.tjanst} ${i.niva.replace(/^Amazon Prime \(månatligen\)$/, "")}`.trim()
                : "Viaplay, nivån framgår inte",
            )
            .join(", "),
          tillagg,
          separat,
          sparar: separat != null ? separat - tillagg : null,
          kalla: priser.filter((p) => p != null).map((p) => p!.kalla),
        },
      ];
    })
  : [];

const NETFLIX = RADER.find((r) => r.tjanst === "Netflix");
const NETFLIX_PRIS = pris("Netflix", "Standard")?.pris ?? null;
const KOMBO = RADER.find((r) => r.tjanst.includes(","));
const STORST = [...RADER].filter((r) => r.sparar != null).sort((x, y) => y.sparar! - x.sparar!)[0];

/** Hastighetstak i Mbit/s ur abonnemangets hastighetstext, eller null om inget anges. */
function hastighetstak(a: Abonnemang): number | null {
  const m = a.hastighet?.match(/(\d+)\s*Mbit\/s/i);
  return m ? Number(m[1]) : null;
}

/**
 * Billigaste obegränsade abonnemanget som alla kan teckna och som inte är strypt under
 * 100 Mbit/s. Ett abonnemang på 3 eller 10 Mbit/s är billigare men räcker sämre för film.
 */
const BILLIGAST_OBEGR = billigastForBehov(
  PRIVATA.filter((a) => {
    const tak = hastighetstak(a);
    return a.gb == null && !arVillkorat(a) && (tak == null || tak >= 100);
  }),
  0,
);
const TELIA_NETFLIX_24 = NETFLIX ? totalKostnad(NETFLIX.a, 24) : null;
const ALT_24 =
  BILLIGAST_OBEGR && NETFLIX_PRIS != null
    ? totalKostnad(BILLIGAST_OBEGR, 24) + 24 * NETFLIX_PRIS
    : null;
const PLUS24_MED_NETFLIX_24 =
  PLUS24 && NETFLIX_PRIS != null ? totalKostnad(PLUS24, 24) + 24 * NETFLIX_PRIS : null;

const FAQ = [
  {
    q: "Lönar det sig att ha Netflix i mobilabonnemanget?",
    a:
      NETFLIX &&
      NETFLIX_PRIS != null &&
      BILLIGAST_OBEGR &&
      ALT_24 != null &&
      TELIA_NETFLIX_24 != null
        ? `Bara om du ändå vill ha Telias Obegränsad Plus. Tillägget för Netflix kostar ${kr(NETFLIX.tillagg)} i månaden mot ${kr(NETFLIX_PRIS)} för Netflix Standard direkt hos Netflix. Men ${vem(BILLIGAST_OBEGR)} med Netflix köpt separat kostar ${kr(ALT_24)} på två år, mot ${kr(TELIA_NETFLIX_24)} för Telias paket med 24 månaders bindningstid.`
        : "Det beror på om du ändå vill ha det abonnemang som tjänsten ingår i. Jämför totalkostnaden över två år.",
  },
  {
    q: "Vilka operatörer har streaming i mobilabonnemanget?",
    a: "Bland operatörerna i vår jämförelse är det Telia som har abonnemang där en streamingtjänst ingår hela tiden: Obegränsad Plus finns med Netflix, HBO Max, Disney+, TV4 Play, Amazon Prime, Viaplay eller tre tjänster i samma paket. Chilimobil och Fibio har kampanjer där Viaplay ingår några månader.",
  },
  {
    q: "Vilken nivå av Netflix ingår hos Telia?",
    a: `Netflix Standard enligt Telias prislista. Den kostar ${NETFLIX_PRIS != null ? kr(NETFLIX_PRIS) : "–"} i månaden hos Netflix, utan reklam.`,
  },
  {
    q: "Vad kostar streamingtjänsterna om jag köper dem själv?",
    a: [
      pris("Netflix", "Standard"),
      pris("HBO Max", "Basic med reklam"),
      pris("Disney+", "Standard med reklam"),
      pris("TV4 Play", "Plus"),
      pris("Viaplay", "Film & Serier"),
      pris("Amazon Prime", "Amazon Prime (månatligen)"),
    ]
      .filter((s) => s?.pris != null)
      .map((s) =>
        s!.tjanst === "Amazon Prime"
          ? `Amazon Prime ${kr(s!.pris!)}`
          : `${s!.tjanst} ${s!.niva} ${kr(s!.pris!)}`,
      )
      .join(", ")
      .concat(
        ` i månaden, enligt tjänsternas egna webbplatser ${datumText(STREAMING_KONTROLLERAD)}.`,
      ),
  },
];

const TITLE = "Mobilabonnemang med streaming: lönar det sig?";
const DESC = NETFLIX
  ? `Netflix, HBO Max eller Disney+ i mobilabonnemanget. Vi räknar på vad tillägget kostar mot att köpa tjänsten själv, och på totalen över två år.`
  : "Mobilabonnemang där streaming ingår. Vad tillägget kostar mot att köpa tjänsten själv.";

export const Route = createFileRoute("/mobilabonnemang-med-streaming")({
  head: () =>
    pageHead({
      title: `${TITLE} | Mobilpoolen`,
      description: DESC,
      canonical: PATH,
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

const TH = "px-4 py-3 align-bottom font-semibold";
const TD = "px-4 py-3";

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilabonnemang med streaming: lönar det sig?"
      ingress={
        <p>
          {NETFLIX && NETFLIX_PRIS != null && STORST?.sparar != null ? (
            <>
              Hos Telia kostar Netflix {kr(NETFLIX.tillagg)} extra i månaden i Obegränsad Plus, mot{" "}
              {kr(NETFLIX_PRIS)} om du köper Netflix Standard själv. Tillägget är alltså billigare
              än tjänsten. Men det lönar sig bara om du ändå vill ha Telias Obegränsad Plus: med ett
              billigare obegränsat abonnemang och Netflix köpt separat betalar du mindre totalt.
            </>
          ) : (
            "Vi räknar på vad streamingtjänsten kostar i mobilabonnemanget mot att köpa den själv."
          )}
        </p>
      }
      nyckeltal={[
        ...(NETFLIX
          ? [
              {
                varde: `${kr(NETFLIX.tillagg)}/mån`,
                text: "kostar Netflix i Telias Obegränsad Plus",
              },
            ]
          : []),
        ...(NETFLIX_PRIS != null
          ? [{ varde: `${kr(NETFLIX_PRIS)}/mån`, text: "kostar Netflix Standard hos Netflix" }]
          : []),
        ...(TELIA_NETFLIX_24 != null && ALT_24 != null
          ? [
              {
                varde: kr(TELIA_NETFLIX_24 - ALT_24),
                text: "dyrare på två år än billigaste obegränsade plus Netflix",
              },
            ]
          : []),
      ]}
      jamforelseRubrik="Vad tjänsten kostar i abonnemanget"
      jamforelseIngress={
        PLUS
          ? `Tillägget är skillnaden mot Telias Obegränsad Plus utan tjänst, ${kr(PLUS.pris)} i månaden, vid ordinarie pris.`
          : undefined
      }
      jamforelse={
        RADER.length > 0 ? (
          <div>
            {/* Mobil: ett kort per variant, så att besparingen syns utan sidledsscroll. */}
            <ul className="divide-y divide-border rounded-xl border border-border bg-surface sm:hidden">
              {RADER.map((r) => (
                <li key={r.a.id} className="px-4 py-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="font-semibold">{r.tjanst}</span>
                    <span className="whitespace-nowrap text-[15px]">{kr(r.a.pris)}/mån</span>
                  </div>
                  <div className="mt-0.5 text-[13px] text-foreground/65">{r.ingarText}</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-[13px]">
                    <div>
                      <div className="text-foreground/60">Tillägg</div>
                      <div className="font-semibold">+{kr(r.tillagg)}</div>
                    </div>
                    <div>
                      <div className="text-foreground/60">Separat</div>
                      <div className="font-semibold">{r.separat != null ? kr(r.separat) : "–"}</div>
                    </div>
                    <div>
                      <div className="text-foreground/60">Billigare</div>
                      <div className="font-semibold text-savings">
                        {r.sparar != null ? `${kr(r.sparar)}/mån` : "–"}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface sm:block">
              <table className="w-full min-w-[640px] text-[15px]">
                <caption className="sr-only">
                  Vad streamingtjänsten kostar i Telias Obegränsad Plus mot att köpa den separat
                </caption>
                <thead className="bg-muted/60 text-left">
                  <tr>
                    <th scope="col" className={TH}>
                      Telia Obegränsad Plus med
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      Ordinarie pris
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      Tillägg
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      Tjänsten separat
                    </th>
                    <th scope="col" className={`${TH} text-right`}>
                      Billigare i paketet
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {RADER.map((r) => (
                    <tr key={r.a.id} className="border-t border-border align-top">
                      <th scope="row" className={`${TD} text-left`}>
                        <span className="font-semibold">{r.tjanst}</span>
                        <span className="block text-[13px] font-normal text-foreground/65">
                          {r.ingarText}
                        </span>
                      </th>
                      <td className={`${TD} whitespace-nowrap text-right`}>{kr(r.a.pris)}/mån</td>
                      <td className={`${TD} whitespace-nowrap text-right`}>+{kr(r.tillagg)}</td>
                      <td className={`${TD} whitespace-nowrap text-right`}>
                        {r.separat != null ? kr(r.separat) : "–"}
                      </td>
                      <td
                        className={`${TD} whitespace-nowrap text-right font-semibold text-savings`}
                      >
                        {r.sparar != null ? `${kr(r.sparar)}/mån` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13.5px] text-foreground/65">
              Telias priser från telia.se och Telias prislista, kontrollerade{" "}
              {datumText(operator("telia")?.kontrollerad ?? STREAMING_KONTROLLERAD)}. Tjänsternas
              priser från deras egna webbplatser, kontrollerade {datumText(STREAMING_KONTROLLERAD)}.
              Viaplay räknas inte, eftersom Telia inte anger vilken nivå som ingår.
            </p>
          </div>
        ) : undefined
      }
      faq={FAQ}
      lankar={[
        {
          href: "/obegransad-surf",
          label: "Obegränsad surf",
          text: "Alla obegränsade abonnemang, billigast först.",
        },
        { href: "/operatorer/telia", label: "Allt om Telia", text: "Priser, nät och villkor." },
        {
          href: "/guider/kampanjpris-efter-kampanjen",
          label: "Kampanjpris efter kampanjen",
          text: "Vad du betalar när rabatten tar slut.",
        },
      ]}
      ctaBild="vanner-middag-utomhus"
      uppdaterad="2026-10-30"
    >
      <h2>Första året ingår tjänsten utan extra kostnad</h2>
      <p>
        Med 24 månaders bindningstid kostar Obegränsad Plus{" "}
        {PLUS24?.kampanjpris != null ? kr(PLUS24.kampanjpris) : "–"} i månaden de första{" "}
        {PLUS24?.kampanjManader ?? 12} månaderna, och streamingvarianterna med en tjänst kostar lika
        mycket.{" "}
        {KOMBO?.a.kampanjpris != null && (
          <>
            Paketet med Netflix, HBO Max och Disney+ kostar {kr(KOMBO.a.kampanjpris)} under samma
            period.{" "}
          </>
        )}
        Efter kampanjen gäller ordinarie pris, och bindningstiden löper ett år till.
      </p>

      <h2>Men behöver du Obegränsad Plus?</h2>
      <p>
        Tillägget är billigt, men abonnemanget det sitter i är dyrare än de flesta obegränsade
        abonnemang. Räkna på hela kostnaden över två år:
      </p>
      <ul>
        {TELIA_NETFLIX_24 != null && (
          <li>
            <strong>Telia Obegränsad Plus Netflix</strong> med 24 månaders bindningstid:{" "}
            {kr(TELIA_NETFLIX_24)}.
          </li>
        )}
        {PLUS24_MED_NETFLIX_24 != null && (
          <li>
            <strong>Telia Obegränsad Plus utan tjänst och Netflix köpt själv:</strong>{" "}
            {kr(PLUS24_MED_NETFLIX_24)}.
          </li>
        )}
        {BILLIGAST_OBEGR && ALT_24 != null && (
          <li>
            <strong>{vem(BILLIGAST_OBEGR)} och Netflix köpt själv:</strong> {kr(ALT_24)}. Det är det
            billigaste obegränsade abonnemanget i vår jämförelse som inte är strypt under 100
            Mbit/s, {kr(snittForstaAret(BILLIGAST_OBEGR))} i månaden i snitt första året.
          </li>
        )}
      </ul>
      <p>
        Vill du ha Telias nät, extra användare på Obegränsad Plus eller samlingsrabatten med
        Telia-bredband är paketet ett bra köp. Vill du bara ha obegränsad surf och Netflix blir det
        billigare att köpa dem var för sig. Jämför alla obegränsade abonnemang på{" "}
        <Link to="/obegransad-surf">obegränsad surf</Link>.
      </p>

      <h2>Så räknar vi</h2>
      <ul>
        <li>
          Tillägget är ordinarie pris för streamingvarianten minus ordinarie pris för Obegränsad
          Plus utan tjänst.
        </li>
        <li>
          Tjänsten separat är ordinarie månadspris utan bindning för samma nivå som ingår hos Telia:
          Netflix Standard, HBO Max Basic med reklam, Disney+ Standard med reklam, TV4 Play Plus med
          reklam och Amazon Prime.
        </li>
        <li>
          Totalen över två år räknar med kampanjpris, ordinarie pris och startavgift där den finns.
          Rabatter för dig under 28 år och samlingsrabatter är inte med.
        </li>
      </ul>
      <p className="kalla">
        Källor:{" "}
        {[...new Set(STREAMINGPRISER.filter((s) => s.pris != null).map((s) => s.kalla))].map(
          (k, i) => (
            <span key={k}>
              {i > 0 ? ", " : ""}
              <a href={k} target="_blank" rel="noopener nofollow">
                {new URL(k).hostname.replace(/^www\./, "")}
              </a>
            </span>
          ),
        )}
        , kontrollerade {datumText(STREAMING_KONTROLLERAD)}.
      </p>
    </PelarSida>
  );
}
