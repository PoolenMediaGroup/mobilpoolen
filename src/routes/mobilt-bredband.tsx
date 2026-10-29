import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { GuideTable } from "@/components/guide-page";
import { bindningText, datumText, gbText, kr } from "@/lib/mobil/berakna";
import { MOBILNAT, operator } from "@/lib/mobil/data";
import {
  BB_EXTRA,
  BB_OBEGR,
  BB_OPERATORER,
  BB_ROUTER,
  BB_STUGA,
  BB_SURFSIM,
  BB_UTAN,
  BREDBAND,
  BREDBAND_FAKTA,
  BREDBAND_KONTROLLERAD,
  bbKortNamn,
  bbLank,
  bbNamn,
  bbOperator,
  bbSnitt,
  bbTotal,
} from "@/lib/mobil/bredband";
import type { Bredband } from "@/lib/mobil/typer";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/mobilt-bredband";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Mobilt bredband", path: PATH },
];

const OBEGR_ROUTER = BB_OBEGR.filter((b) => b.typ === "router");
const B_OBEGR = OBEGR_ROUTER[0] ?? BB_OBEGR[0];
const B_OBEGR_UTAN = BB_OBEGR.find((b) => b.bindning === 0);
const B_SIM = BB_SURFSIM.find((b) => b.gb != null && b.gb >= 20);
const PTS_PDF = BREDBAND_FAKTA[0]?.kalla;

function natNamn(b: Bredband): string | null {
  const n = operator(b.operator)?.nat;
  return n ? MOBILNAT[n].namn : null;
}

const FAQ = [
  ...(B_OBEGR
    ? [
        {
          q: "Vad kostar mobilt bredband med obegränsad surf?",
          a: `Billigast är ${bbNamn(B_OBEGR)} för ${kr(bbSnitt(B_OBEGR))} i månaden i snitt första året. ${bindningText(B_OBEGR.bindning)}. Routern kostar ofta extra, så kolla routerns pris innan du beställer.${
            B_OBEGR_UTAN && B_OBEGR_UTAN.id !== B_OBEGR.id
              ? ` Utan bindningstid är ${bbNamn(B_OBEGR_UTAN)} billigast för ${kr(bbSnitt(B_OBEGR_UTAN))}.`
              : ""
          }`,
        },
      ]
    : []),
  {
    q: "Är mobilt bredband lika bra som fiber?",
    a: "Det beror på täckningen där du bor. Fiber ger samma hastighet hela tiden, mobilt bredband delar kapaciteten med andra i mobilnätet och varierar över dygnet. 5G med bra täckning räcker för de flesta hushåll, inklusive streaming och videomöten.",
  },
  {
    q: "Hur mycket surfar ett hushåll med mobilt bredband?",
    a: "Ett abonnemang för mobilt bredband till en fast adress använde i snitt 374 GB i månaden 2025 enligt PTS. Det är därför de flesta väljer obegränsad surf till hemmet.",
    kalla: "PTS, Svensk telekommarknad 2025",
  },
  {
    q: "Vad är skillnaden mellan router och surf-SIM?",
    a: "En router för hemmet står på en plats och delar uppkopplingen med hela hushållet över wifi. Ett surf-SIM sätter du i en surfplatta, en dator eller en liten portabel router, och då har du ofta en fast surfmängd.",
  },
  {
    q: "Kan jag ha mobilt bredband i fritidshuset?",
    a: "Ja. Flera operatörer har abonnemang som du betalar för bara när du använder dem, eller som är billiga i vila. Se avsnittet om fritidshuset på sidan.",
  },
  {
    q: "Ingår routern?",
    a: "Inte alltid. Hos flera operatörer köper du routern separat eller delbetalar den, och vissa lånar ut den när du har bindningstid. Routerns pris står vid varje erbjudande när operatören anger det.",
  },
];

export const Route = createFileRoute("/mobilt-bredband")({
  head: () =>
    pageHead({
      title: "Mobilt bredband: jämför 4G och 5G-bredband 2026 | Mobilpoolen",
      description: `Jämför ${BREDBAND.length} erbjudanden på mobilt bredband hos ${BB_OPERATORER.length} operatörer. Obegränsat från ${B_OBEGR ? kr(bbSnitt(B_OBEGR)) : ""}/mån i snitt. Se routerns pris och bindningstid.`,
      canonical: PATH,
      scripts: [
        breadcrumbJsonLd(TRAIL),
        faqJsonLd(FAQ),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Mobilt bredband med obegränsad surf, billigast första året",
          itemListElement: BB_OBEGR.slice(0, 10).map((b, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${bbNamn(b)}, ${kr(bbSnitt(b))} per månad i snitt första året`,
          })),
        }),
      ],
    }),
  component: Sida,
});

type Filter = "alla" | "obegransad" | "router" | "surfsim" | "utan";
const FILTER: { id: Filter; label: string }[] = [
  { id: "obegransad", label: "Obegränsad surf" },
  { id: "router", label: "Router för hemmet" },
  { id: "surfsim", label: "Surf-SIM" },
  { id: "utan", label: "Utan bindningstid" },
  { id: "alla", label: "Alla" },
];

function Kort({ b }: { b: Bredband }) {
  const nat = natNamn(b);
  const harKampanj = b.kampanjpris != null && (b.kampanjManader ?? 0) > 0;
  return (
    <li className="rounded-2xl border border-border bg-surface p-4 shadow-kort-litet sm:p-5">
      <div className="flex items-start gap-3">
        <OperatorMonogram namn={bbOperator(b)} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-foreground [overflow-wrap:anywhere]">
            {bbOperator(b)} <span className="font-normal">{bbKortNamn(b)}</span>
          </p>
          <p className="text-[13.5px] text-foreground/65">
            {b.typ === "router" ? "Router för hemmet" : "Surf-SIM"} · {bindningText(b.bindning)}
            {nat ? ` · ${nat}` : ""}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Surf</dt>
          <dd className="font-display text-[16px] font-semibold text-foreground">{gbText(b.gb)}</dd>
          {b.hastighet && (
            <dd className="text-[12px] leading-tight text-foreground/65">{b.hastighet}</dd>
          )}
        </div>
        <div className="rounded-xl bg-muted/60 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Pris</dt>
          <dd className="font-display text-[16px] font-semibold text-foreground">
            {kr(harKampanj ? (b.kampanjpris as number) : (b.pris as number))}
          </dd>
          <dd className="text-[12px] leading-tight text-foreground/65">
            {harKampanj ? `i ${b.kampanjManader} mån, sedan ${kr(b.pris as number)}` : "per månad"}
          </dd>
        </div>
        <div className="rounded-xl bg-primary/8 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Snitt år 1</dt>
          <dd className="font-display text-[16px] font-semibold text-primary">{kr(bbSnitt(b))}</dd>
          <dd className="text-[12px] leading-tight text-foreground/65">
            {kr(bbTotal(b, 24))} på 24 mån
          </dd>
        </div>
      </dl>
      {(b.typ === "router" || b.router) && (
        <p className="mt-3 text-[13.5px] text-foreground/75">
          <strong className="font-semibold text-foreground">Router:</strong>{" "}
          {b.router ?? "pris framgår inte av operatörens sida"}
        </p>
      )}
      {b.notis && <p className="mt-1.5 text-[13.5px] text-foreground/65">{b.notis}</p>}
      <a
        href={bbLank(b)}
        target="_blank"
        rel="noopener nofollow"
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
      >
        Till {bbOperator(b)} <ExternalLink className="size-4" aria-hidden />
      </a>
    </li>
  );
}

function Lista() {
  const [filter, setFilter] = useState<Filter>("obegransad");
  const [antal, setAntal] = useState(10);
  const lista = useMemo(() => {
    switch (filter) {
      case "obegransad":
        return BB_OBEGR;
      case "router":
        return BB_ROUTER;
      case "surfsim":
        return BB_SURFSIM;
      case "utan":
        return BB_UTAN;
      default:
        return BREDBAND;
    }
  }, [filter]);
  return (
    <div id="lista" className="scroll-mt-24">
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {FILTER.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => {
              setFilter(f.id);
              setAntal(10);
            }}
            className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-[14.5px] font-semibold transition-colors ${
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-foreground hover:border-primary/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-[14px] text-foreground/65" aria-live="polite">
        {lista.length} erbjudanden, billigast snittpris första året först. Routern är inte inräknad.
      </p>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {lista.slice(0, antal).map((b) => (
          <Kort key={b.id} b={b} />
        ))}
      </ul>
      {lista.length > antal && (
        <button
          type="button"
          onClick={() => setAntal((n) => n + 10)}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-surface px-5 text-[15px] font-semibold text-foreground hover:border-primary/50 sm:w-auto"
        >
          Visa fler ({lista.length - antal} kvar)
        </button>
      )}
    </div>
  );
}

function Sida() {
  const perOp = BB_OPERATORER.map((op) => BB_OBEGR.find((b) => b.operator === op))
    .filter((b): b is Bredband => !!b)
    .sort((a, b) => bbSnitt(a) - bbSnitt(b));
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Mobilt bredband: jämför 4G- och 5G-bredband"
      ingress={
        <p>
          {B_OBEGR && (
            <>
              Billigast med obegränsad surf till hemmet är {bbNamn(B_OBEGR)} för{" "}
              {kr(bbSnitt(B_OBEGR))} i månaden i snitt första året,{" "}
              {bindningText(B_OBEGR.bindning).toLowerCase()}.{" "}
            </>
          )}
          {B_SIM && (
            <>
              Behöver du bara surf till en surfplatta eller dator är {bbNamn(B_SIM)} billigast med
              minst 20 GB, för {kr(bbSnitt(B_SIM))}.{" "}
            </>
          )}
          Vi jämför {BREDBAND.length} erbjudanden hos {BB_OPERATORER.length} operatörer, med pris
          efter kampanjen och vad routern kostar.
        </p>
      }
      nyckeltal={[
        ...(B_OBEGR
          ? [{ varde: kr(bbSnitt(B_OBEGR)), text: "billigast obegränsat, snitt per månad" }]
          : []),
        ...(B_OBEGR_UTAN
          ? [{ varde: kr(bbSnitt(B_OBEGR_UTAN)), text: "obegränsat utan bindningstid" }]
          : []),
        { varde: "374 GB", text: "surf per månad i snitt till en fast adress (PTS 2025)" },
      ]}
      jamforelse={<Lista />}
      jamforelseRubrik="Alla erbjudanden på mobilt bredband"
      jamforelseIngress="Snittpriset räknar in kampanjen och startavgiften under första året. Routern räknas inte in, eftersom du ibland köper den, ibland hyr den och ibland redan har en. Den står vid varje erbjudande."
      faq={FAQ}
      lankar={[
        {
          href: "/obegransad-surf",
          label: "Mobilabonnemang med obegränsad surf",
          text: "Om du vill dela surf från mobilen i stället.",
        },
        {
          href: "/nat",
          label: "Mobilnät och täckning",
          text: "Vilket nät som når fram där du bor.",
        },
        {
          href: "/5g-abonnemang",
          label: "5G-abonnemang",
          text: "Vad 5G ger och var det finns.",
        },
        {
          href: "/guider/wifi-samtal-och-dalig-tackning",
          label: "Dålig täckning inomhus",
          text: "Wifi-samtal och andra lösningar.",
        },
      ]}
      ctaRubrik="Hitta rätt bredband för hemmet"
      ctaBild="stuga-natt-sno"
      uppdaterad="2026-10-29"
    >
      <h2>Mobilt bredband eller fiber?</h2>
      <p>
        Mobilt bredband går över samma mobilnät som din mobil. Det kräver ingen kabel in i huset,
        och du kan ta med routern om du flyttar. I gengäld delar du kapaciteten med alla andra i
        samma mobilmast, så hastigheten varierar mer än med fiber. Har du fiber i huset är det
        nästan alltid stabilare.
      </p>
      <p>
        Allt fler väljer ändå mobilt bredband som enda uppkoppling. Enligt PTS fanns cirka 420 000
        abonnemang för mobilt bredband till en fast adress 2025, över 20 procent fler än året innan.
        De använde i snitt 374 GB i månaden, mot 82 GB för andra abonnemang med bara data.
      </p>

      <h2>Router eller surf-SIM?</h2>
      <ul>
        <li>
          <strong>Router för hemmet</strong> ({BB_ROUTER.length} erbjudanden) passar när hela
          hushållet ska vara uppkopplat. Nästan alla har obegränsad surf. Routern står vid ett
          fönster och delar uppkopplingen över wifi.
        </li>
        <li>
          <strong>Surf-SIM</strong> ({BB_SURFSIM.length} erbjudanden) sätter du i en surfplatta, en
          dator eller en liten portabel router. De har oftast en fast surfmängd och passar när du
          surfar på resan eller som komplement till fast bredband.
        </li>
      </ul>

      <h2>Billigaste obegränsade hos varje operatör</h2>
      <GuideTable
        brytForsta
        head={["Operatör", "Erbjudande", "Snitt år 1", "Bindning"]}
        rows={perOp.map((b) => [
          bbOperator(b),
          bbKortNamn(b),
          kr(bbSnitt(b)),
          b.bindning == null ? "Framgår inte" : b.bindning === 0 ? "Ingen" : `${b.bindning} mån`,
        ])}
      />

      <h2>Vad kostar routern?</h2>
      <p>
        Routern är den kostnad som oftast glöms bort. Hos Tele2 och Comviq kostar 5G-routern{" "}
        {BREDBAND.find((b) => b.operator === "tele2")?.router?.split(" (")[0] ?? "extra"} med
        bindningstid, eller går att delbetala. Telenor lånar ut routern när du binder dig, och hos
        Hallon ingår den inte. Räkna in routern i totalen om du jämför ett erbjudande med router mot
        ett utan.
      </p>

      {BB_STUGA.length > 0 && (
        <>
          <h2>Mobilt bredband till fritidshuset</h2>
          <p>
            Är du i stugan några veckor om året lönar det sig sällan att betala fullt pris varje
            månad. De här erbjudandena är byggda för det:
          </p>
          <ul>
            {BB_STUGA.map((b) => (
              <li key={b.id}>
                <strong>{bbNamn(b)}</strong>
                {b.pris != null ? `, ${kr(b.pris)} i månaden` : ""}. {b.notis}
              </li>
            ))}
          </ul>
        </>
      )}

      {BB_EXTRA.length > 0 && (
        <>
          <h2>Extra datasim till ditt mobilabonnemang</h2>
          <p>
            Har du redan mobilabonnemang kan ett extra datasim vara billigare än ett eget
            bredbandsabonnemang. Det delar ofta surfen med ditt mobilabonnemang.
          </p>
          <GuideTable
            brytForsta
            head={["Erbjudande", "Pris", "Villkor"]}
            rows={BB_EXTRA.map((b) => [bbNamn(b), `${kr(b.pris as number)}/mån`, b.notis ?? ""])}
          />
        </>
      )}

      <h2>Så väljer du nät för mobilt bredband</h2>
      <p>
        Täckningen avgör mer än priset. Kolla operatörens täckningskarta för din adress och välj
        helst ett nät med 5G där du bor. Billigast i varje nät hittar du på sidorna om{" "}
        <Link to={"/nat" as never}>mobilnäten</Link>. Har du dålig signal inomhus kan en router som
        står vid ett fönster eller en utomhusantenn göra stor skillnad.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser och prislistor, kontrollerade{" "}
        {datumText(BREDBAND_KONTROLLERAD)}. Antal abonnemang och surf per månad:{" "}
        {PTS_PDF ? (
          <a href={PTS_PDF} target="_blank" rel="noopener nofollow">
            PTS, Svensk telekommarknad 2025
          </a>
        ) : (
          "PTS, Svensk telekommarknad 2025"
        )}
        .
      </p>
    </PelarSida>
  );
}
