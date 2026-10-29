import { useId, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink, Info } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { Ersattningsrad } from "@/components/ersattningsrad";
import { PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { KALLOR, MARKNAD } from "@/lib/mobil/fakta";
import {
  arVillkorat,
  billigastForBehov,
  bindningText,
  datumText,
  formatTal,
  gbText,
  kr,
  snittForstaAret,
  sortera,
  tackerBehov,
} from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";
import { absoluteUrl, breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/verktyg/hur-mycket-surf-behover-jag";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Verktyg", path: "/verktyg" },
  { name: "Hur mycket surf behöver jag?", path: PATH },
];

const NETFLIX_KALLA = "https://help.netflix.com/en/node/87";
const SPOTIFY_KALLA = "https://support.spotify.com/article/audio-quality";

/** Netflix Help Center: data per timme och enhet, "upp till". */
const VIDEO = [
  { id: "lag", label: "Låg", gbPerTimme: 0.3 },
  { id: "medium", label: "Medium", gbPerTimme: 0.7 },
  { id: "hog", label: "Hög (SD)", gbPerTimme: 1 },
  { id: "hd", label: "HD", gbPerTimme: 3 },
  { id: "4k", label: "4K (Ultra HD)", gbPerTimme: 7 },
] as const;

/** Spotify Support: kbit/s omräknat till MB per timme (kbit/s × 3600 ÷ 8000). */
const MUSIK = [
  { id: "lag", label: "Låg (24 kbit/s)", mbPerTimme: 11 },
  { id: "normal", label: "Normal (96 kbit/s)", mbPerTimme: 43 },
  { id: "hog", label: "Hög (160 kbit/s)", mbPerTimme: 72 },
  { id: "mycket-hog", label: "Mycket hög (320 kbit/s)", mbPerTimme: 144 },
] as const;

const EGNA = [
  { id: "sociala", label: "Sociala medier" },
  { id: "webb", label: "Webb, nyheter och mejl" },
  { id: "samtal", label: "Videosamtal" },
  { id: "kartor", label: "Kartor och navigering" },
] as const;

type EgenId = (typeof EGNA)[number]["id"];

/** Vanliga surfnivåer hos operatörerna. Över 100 GB rekommenderar vi obegränsad. */
const NIVAER = [1, 3, 5, 10, 15, 20, 30, 50, 100];

const DAGAR = 30;

const FAQ = [
  {
    q: "Hur mycket surf behöver jag per månad?",
    a: `Det beror nästan helt på hur mycket video du tittar på utanför wifi. Abonnemang med samtal och data använde i genomsnitt ${MARKNAD.surfPerManad} GB per månad 2025 enligt PTS. Tittar du en timme film om dagen i HD på mobilnätet går det åt upp till 90 GB på en månad, medan musik i normal kvalitet en timme om dagen drar runt 1,3 GB.`,
    kalla: KALLOR.ptsMarknad.namn,
  },
  {
    q: "Hur mycket data drar Netflix per timme?",
    a: "Enligt Netflix drar en timme upp till 0,3 GB i låg kvalitet, 0,7 GB i medium, 1 GB i hög SD-kvalitet, 3 GB i HD och 7 GB i 4K. I mobilen kan du välja Spara data, som enligt Netflix ger cirka sex timmar per GB.",
    kalla: "Netflix Help Center, How to control how much data Netflix uses",
  },
  {
    q: "Hur mycket data drar Spotify per timme?",
    a: "Spotify anger ljudkvaliteterna 24, 96, 160 och 320 kbit/s. Omräknat blir det cirka 11, 43, 72 och 144 MB per timme. Musik du har laddat ner i appen drar ingen surf när du lyssnar.",
    kalla: "Spotify Support, Audio quality",
  },
  {
    q: "Räknas det som surf när jag är uppkopplad mot wifi?",
    a: "Nej. När telefonen är ansluten till wifi går trafiken via det nätet och inte via mobilabonnemanget. Därför frågar kalkylatorn hur stor del av tiden du strömmar på wifi.",
  },
  {
    q: "Var ser jag hur mycket mobildata jag faktiskt använder?",
    a: "I telefonens inställningar. På iPhone under Mobilnät, på Android under Nätverk och internet eller Anslutningar. Där ser du mobildata per app. Många operatörer visar också förbrukningen i sin app.",
  },
];

const TITEL = "Hur mycket surf behöver jag? Surfkalkylator";
const DESC =
  "Räkna ut hur mycket surf du behöver per månad utifrån film och musik du strömmar. Se rekommenderad surfnivå och de billigaste abonnemangen som räcker.";

export const Route = createFileRoute("/verktyg/hur-mycket-surf-behover-jag")({
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
          name: "Surfkalkylator: hur mycket surf behöver jag?",
          description: DESC,
          url: absoluteUrl(PATH),
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Alla med webbläsare",
          browserRequirements: "Kräver JavaScript för att räkna om",
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
const HJALP = "mt-1 block text-[13px] font-normal text-foreground/65";

function Kalkylator() {
  const uid = useId();
  const [videoTim, setVideoTim] = useState("1");
  const [videoKval, setVideoKval] = useState<(typeof VIDEO)[number]["id"]>("medium");
  const [musikTim, setMusikTim] = useState("1");
  const [musikKval, setMusikKval] = useState<(typeof MUSIK)[number]["id"]>("normal");
  const [wifi, setWifi] = useState("50");
  const [egna, setEgna] = useState<Record<EgenId, string>>({
    sociala: "",
    webb: "",
    samtal: "",
    kartor: "",
  });

  const r = useMemo(() => {
    const mobilAndel = 1 - Math.min(100, tal(wifi)) / 100;
    const v = VIDEO.find((x) => x.id === videoKval)!;
    const m = MUSIK.find((x) => x.id === musikKval)!;
    const videoGb = Math.min(24, tal(videoTim)) * v.gbPerTimme * mobilAndel * DAGAR;
    const musikGb = (Math.min(24, tal(musikTim)) * m.mbPerTimme * mobilAndel * DAGAR) / 1000;
    const egnaGb = EGNA.reduce((s, e) => s + tal(egna[e.id]), 0);
    const totalt = Math.round((videoGb + musikGb + egnaGb) * 10) / 10;
    const niva = NIVAER.find((n) => n >= totalt) ?? null;
    const lista = PRIVATA.filter((a) => !arVillkorat(a));
    const behov = Math.max(totalt, 0.5);
    const topp = sortera(
      lista.filter((a) => tackerBehov(a, behov)),
      "snitt-ar",
    ).slice(0, 3);
    // Samma regel som billigastForBehov, så att första kortet alltid är dess svar.
    const forsta = billigastForBehov(lista, behov);
    if (forsta && topp[0]?.id !== forsta.id) topp.unshift(forsta);
    return { videoGb, musikGb, egnaGb, totalt, niva, topp: topp.slice(0, 3) };
  }, [videoTim, videoKval, musikTim, musikKval, wifi, egna]);

  const nivaText = r.niva == null ? "Obegränsad surf" : `${r.niva} GB per månad`;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <form
        onSubmit={(e) => e.preventDefault()}
        aria-labelledby={`${uid}-rubrik`}
        className="rounded-2xl border border-border bg-surface p-5 shadow-kort-litet sm:p-6"
      >
        <h2 id={`${uid}-rubrik`} className="text-[22px] font-bold">
          Din användning utanför wifi
        </h2>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-[16px] font-bold">Film och serier</legend>
          <label className={ETIKETT}>
            Timmar per dag
            <input
              inputMode="decimal"
              autoComplete="off"
              value={videoTim}
              onChange={(e) => setVideoTim(e.target.value.replace(/[^\d,.]/g, ""))}
              className={`${FALT} mt-2`}
            />
          </label>
          <label className={ETIKETT}>
            Bildkvalitet
            <select
              value={videoKval}
              onChange={(e) => setVideoKval(e.target.value as typeof videoKval)}
              className={`${FALT} mt-2`}
            >
              {VIDEO.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}, upp till {formatTal(v.gbPerTimme)} GB/tim
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <fieldset className="mt-5 grid gap-4 sm:grid-cols-2">
          <legend className="mb-2 text-[16px] font-bold">Musik och poddar</legend>
          <label className={ETIKETT}>
            Timmar per dag
            <input
              inputMode="decimal"
              autoComplete="off"
              value={musikTim}
              onChange={(e) => setMusikTim(e.target.value.replace(/[^\d,.]/g, ""))}
              className={`${FALT} mt-2`}
            />
          </label>
          <label className={ETIKETT}>
            Ljudkvalitet
            <select
              value={musikKval}
              onChange={(e) => setMusikKval(e.target.value as typeof musikKval)}
              className={`${FALT} mt-2`}
            >
              {MUSIK.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
        </fieldset>

        <label className={`${ETIKETT} mt-5`}>
          Hur stor del av tiden strömmar du på wifi?
          <span className={HJALP}>Gäller film och musik ovan. 0 betyder alltid mobilnätet.</span>
          <span className="relative mt-2 block">
            <input
              inputMode="numeric"
              autoComplete="off"
              value={wifi}
              onChange={(e) => setWifi(e.target.value.replace(/[^\d]/g, "").slice(0, 3))}
              className={`${FALT} pr-12`}
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[15px] text-foreground/60">
              %
            </span>
          </span>
        </label>

        <fieldset className="mt-6 border-t border-border pt-5">
          <legend className="text-[16px] font-bold">Övrigt, om du vet (valfritt)</legend>
          <p className="mt-1 text-[13.5px] leading-relaxed text-foreground/70">
            För sociala medier, webb, videosamtal och kartor finns inga förbrukningssiffror vi kan
            belägga. Skriv in vad telefonen visar att apparna drar i mobildata per månad, så räknas
            det med. Lämnar du fälten tomma räknas de inte alls.
          </p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {EGNA.map((e) => (
              <label key={e.id} className={ETIKETT}>
                {e.label}
                <span className="relative mt-2 block">
                  <input
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0"
                    value={egna[e.id]}
                    onChange={(ev) =>
                      setEgna((s) => ({ ...s, [e.id]: ev.target.value.replace(/[^\d,.]/g, "") }))
                    }
                    className={`${FALT} pr-24`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
                    GB/mån
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="mt-5 text-[12.5px] text-foreground/60">
          Vi sparar ingenting av det du fyller i. Uträkningen sker i din webbläsare.
        </p>
      </form>

      <div aria-live="polite" className="flex flex-col gap-4">
        <section className="rounded-2xl bg-dark-section p-5 text-white sm:p-6">
          <h2 className="text-[18px] font-bold text-white">Ditt surfbehov</h2>
          <p className="mt-2 font-display text-[44px] font-bold leading-none text-white">
            {formatTal(r.totalt)} GB
            <span className="ml-2 text-[16px] font-semibold text-white/75">per månad</span>
          </p>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-[13.5px] text-white/80">
            <div>
              <dt>Film</dt>
              <dd className="font-semibold text-white">{formatTal(r.videoGb)} GB</dd>
            </div>
            <div>
              <dt>Musik</dt>
              <dd className="font-semibold text-white">{formatTal(r.musikGb)} GB</dd>
            </div>
            <div>
              <dt>Övrigt</dt>
              <dd className="font-semibold text-white">{formatTal(r.egnaGb)} GB</dd>
            </div>
          </dl>
          <p className="mt-4 text-[15.5px] text-white/90">
            Rekommenderad surfnivå: <strong className="text-white">{nivaText}</strong>.
          </p>
          <p className="mt-2 text-[13.5px] text-white/70">
            Som jämförelse använde abonnemang med samtal och data {MARKNAD.surfPerManad} GB per
            månad i snitt 2025 enligt PTS. Uträkningen täcker bara film och musik, plus det du själv
            har lagt in under övrigt.
          </p>
        </section>

        <section>
          <h2 className="text-[19px] font-bold">Billigast som räcker för dig</h2>
          <p className="mt-1 text-[14px] text-foreground/70">
            Lägst snittpris första året bland abonnemang som alla kan teckna, med minst{" "}
            {formatTal(Math.max(r.totalt, 0.5))} GB eller obegränsad surf.
          </p>
          <ol className="mt-3 space-y-3">
            {r.topp.map((a, i) => (
              <li key={a.id}>
                <AbKort a={a} etta={i === 0} />
              </li>
            ))}
          </ol>
          <p className="mt-3 text-[13px] text-foreground/60">
            Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
          </p>
          <Link to={"/billigaste-mobilabonnemang" as never} className="btn-secondary-outline mt-4">
            Se alla billigaste abonnemang
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </section>
      </div>
    </div>
  );
}

function AbKort({ a, etta }: { a: Abonnemang; etta: boolean }) {
  const o = operator(a.operator);
  const kampanj = a.kampanjpris != null && (a.kampanjManader ?? 0) > 0;
  return (
    <article
      className={`rounded-2xl border bg-surface p-4 ${etta ? "border-primary/40 shadow-kort-litet" : "border-border"}`}
    >
      <div className="flex items-start gap-3">
        <OperatorMonogram namn={o?.namn ?? a.operator} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="text-[16.5px] font-bold leading-tight [overflow-wrap:anywhere]">
            {o?.namn ?? a.operator}{" "}
            <span className="font-semibold text-foreground/70">{a.namn}</span>
          </h3>
          <p className="mt-1 text-[13.5px] text-foreground/70">
            {gbText(a.gb)} · {bindningText(a.bindning)}
            {a.kontantkort ? " · Kontantkort" : ""}
          </p>
        </div>
        <div className="text-right">
          <div className="font-display text-[22px] font-bold leading-none">
            {kr(snittForstaAret(a))}
          </div>
          <div className="mt-1 text-[12.5px] text-foreground/65">snitt/mån år 1</div>
        </div>
      </div>
      <p className="mt-2 text-[13.5px] text-foreground/75">
        {kampanj
          ? `${kr(a.kampanjpris ?? 0)}/mån i ${a.kampanjManader} mån, sedan ${kr(a.pris)}/mån.`
          : `${kr(a.pris)}/mån.`}
      </p>
      <a
        href={a.kalla}
        target="_blank"
        rel={`noopener ${o?.partner ? "sponsored" : "nofollow"}`}
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-[10px] bg-cta px-4 text-[15px] font-semibold text-cta-foreground hover:bg-cta-hover"
      >
        Till {o?.namn ?? "operatören"}
        <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
      <Ersattningsrad partner={o?.partner ?? false} />
    </article>
  );
}

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Hur mycket surf behöver jag?"
      ingress={
        <p>
          Hur mycket surf du behöver avgörs nästan helt av hur mycket film du strömmar utanför wifi.
          Snittet var {MARKNAD.surfPerManad} GB per månad 2025 enligt PTS. En timme film i HD om
          dagen på mobilnätet kan dra upp till 90 GB i månaden, medan musik knappt märks. Fyll i din
          användning så räknar vi ut behovet.
        </p>
      }
      nyckeltal={[
        { varde: `${MARKNAD.surfPerManad} GB`, text: "surf per månad i snitt 2025 (PTS)" },
        { varde: "upp till 3 GB", text: "per timme film i HD, enligt Netflix" },
        { varde: "cirka 43 MB", text: "per timme musik i normal kvalitet på Spotify" },
      ]}
      jamforelse={<Kalkylator />}
      jamforelseRubrik="Surfkalkylatorn"
      jamforelseIngress="Fyll i hur mycket du strömmar när du inte är på wifi. Resultatet uppdateras direkt."
      faq={FAQ}
      lankar={[
        {
          href: "/obegransad-surf",
          label: "Obegränsad surf",
          text: "När det lönar sig och vad det kostar.",
        },
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Billigast per surfnivå just nu.",
        },
        {
          href: "/verktyg/betalar-jag-for-mycket",
          label: "Betalar jag för mycket?",
          text: "Jämför ditt pris med det billigaste likvärdiga.",
        },
      ]}
      ctaBild="kvinna-soffa-mobil"
      uppdaterad="2026-10-29"
    >
      <h2>Hur mycket surf drar film och musik?</h2>
      <p>
        Video står för nästan all surf i en vanlig mobil. Netflix anger hur mycket data en timme
        drar per enhet beroende på bildkvalitet:
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[15px]">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Bildkvalitet</th>
              <th className="px-4 py-3 font-semibold">Per timme</th>
              <th className="px-4 py-3 font-semibold">1 tim/dag i 30 dagar</th>
            </tr>
          </thead>
          <tbody>
            {VIDEO.map((v) => (
              <tr key={v.id} className="border-t border-border">
                <td className="px-4 py-3">{v.label}</td>
                <td className="px-4 py-3">upp till {formatTal(v.gbPerTimme)} GB</td>
                <td className="px-4 py-3">upp till {formatTal(v.gbPerTimme * DAGAR)} GB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="kalla">
        Källa:{" "}
        <a href={NETFLIX_KALLA} target="_blank" rel="noopener nofollow">
          Netflix Help Center, How to control how much data Netflix uses
        </a>
        . Andra tjänster kan dra mer eller mindre.
      </p>
      <p>
        Musik drar mycket mindre. Spotify anger ljudkvaliteten i kilobit per sekund, och omräknat
        blir det så här mycket per timme:
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-[15px]">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Ljudkvalitet</th>
              <th className="px-4 py-3 font-semibold">Per timme</th>
              <th className="px-4 py-3 font-semibold">1 tim/dag i 30 dagar</th>
            </tr>
          </thead>
          <tbody>
            {MUSIK.map((m) => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-4 py-3">{m.label}</td>
                <td className="px-4 py-3">cirka {m.mbPerTimme} MB</td>
                <td className="px-4 py-3">cirka {formatTal((m.mbPerTimme * DAGAR) / 1000)} GB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="kalla">
        Källa:{" "}
        <a href={SPOTIFY_KALLA} target="_blank" rel="noopener nofollow">
          Spotify Support, Audio quality
        </a>
        . Omräkning: kbit/s × 3 600 ÷ 8 000 = MB per timme.
      </p>

      <h2>Så räknar kalkylatorn</h2>
      <ol>
        <li>
          Timmar per dag gånger förbrukningen per timme för den kvalitet du valt. Siffrorna för film
          är Netflix högsta värden för varje nivå, så resultatet är snarare i överkant.
        </li>
        <li>Resultatet minskas med den andel av tiden du strömmar på wifi.</li>
        <li>Det gångras med 30 dagar till en månad.</li>
        <li>Det du själv skrivit in under övrigt läggs till som det står, i GB per månad.</li>
        <li>
          Rekommenderad nivå är den närmaste vanliga surfnivån som täcker behovet. Över 100 GB
          rekommenderar vi obegränsad surf.
        </li>
      </ol>
      <p>
        De tre abonnemangen under resultatet är de med lägst snittpris första året bland dem som har
        minst så mycket surf, med kampanj och startavgift inräknade. Erbjudanden med ålders- eller
        studentkrav är inte med.
      </p>

      <h2>Vad räknas inte med?</h2>
      <p>
        Vi har inga siffror vi kan belägga för hur mycket sociala medier, webbsurf, videosamtal och
        kartor drar. Det varierar mycket med hur apparna spelar upp video och bilder. Därför räknas
        de bara med om du själv fyller i dem. Det säkraste är att titta i telefonens inställningar,
        där du ser hur mycket mobildata varje app har använt.
      </p>
      <p>
        Osäker? Välj ett abonnemang{" "}
        <Link to={"/utan-bindningstid" as never}>utan bindningstid</Link>. Då kan du byta surfnivå
        när du ser vad du faktiskt använder.
      </p>
      <p className="flex items-start gap-2 text-[15px] text-foreground/75">
        <Info className="mt-1 h-4 w-4 shrink-0" aria-hidden />
        <span>
          Snittet från PTS gäller alla abonnemang med samtal och data i Sverige 2025. Källa:{" "}
          <a href={KALLOR.ptsMarknad.url} target="_blank" rel="noopener nofollow">
            {KALLOR.ptsMarknad.namn}
          </a>
          .
        </span>
      </p>
    </PelarSida>
  );
}
