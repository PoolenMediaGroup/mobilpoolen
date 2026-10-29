import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { GuideTable } from "@/components/guide-page";
import { SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { bindningText, datumText, gbText, kr } from "@/lib/mobil/berakna";
import {
  KAMPANJ_SLUT,
  OPPNA_KAMPANJER,
  VILLKORADE_KAMPANJER,
  opNamn,
  type Kampanj,
} from "@/lib/mobil/kampanjer";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const PATH = "/kampanjer";
const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Kampanjer", path: PATH },
];

const ALLA = OPPNA_KAMPANJER;
const BAST = ALLA[0];
const UTAN = ALLA.filter((k) => k.a.bindning === 0);
const LANGST = [...ALLA].sort((a, b) => b.manader - a.manader || a.snitt - b.snitt)[0];
const STORST_HOJNING = [...ALLA].sort((a, b) => b.hojning - a.hojning)[0];
const OPS = new Set(ALLA.map((k) => k.a.operator)).size;
const KORTA = ALLA.filter((k) => k.manader <= 4).length;

function vem(k: Kampanj): string {
  return `${opNamn(k.a)} ${k.a.namn}`;
}

const FAQ = [
  ...(BAST
    ? [
        {
          q: "Vilken är den bästa kampanjen på mobilabonnemang just nu?",
          a: `Räknat på vad du betalar under hela första året är ${vem(BAST)} billigast, för ${kr(BAST.snitt)} i månaden i snitt. Kampanjpriset är ${kr(BAST.kampanjpris)} i ${BAST.manader} månader och sedan ${kr(BAST.a.pris)}.`,
        },
      ]
    : []),
  {
    q: "Hur länge gäller ett kampanjpris?",
    a: `Oftast två till fyra månader. ${KORTA} av de ${ALLA.length} kampanjerna i jämförelsen gäller i fyra månader eller kortare.${LANGST ? ` Längst gäller ${vem(LANGST)}, i ${LANGST.manader} månader.` : ""} Sedan betalar du ordinarie pris automatiskt.`,
  },
  {
    q: "Kan jag få kampanjpris om jag redan är kund?",
    a: "Oftast inte. Kampanjerna gäller i regel nya kunder. Du kan byta till en annan operatör och ta med numret, och fråga din nuvarande operatör om de kan matcha priset.",
  },
  {
    q: "Finns det kampanjer utan bindningstid?",
    a: `Ja. ${UTAN.length} av de ${ALLA.length} kampanjerna har ingen bindningstid, så du kan säga upp abonnemanget när kampanjen är slut.`,
  },
  {
    q: "Vad är dubbel surf?",
    a: "Flera operatörer ger dubbel surfmängd under en period till nya kunder. Hur länge det gäller skiljer sig. Läs mer i guiden om sparad surf och dubbel surf.",
  },
];

export const Route = createFileRoute("/kampanjer")({
  head: () =>
    pageHead({
      title: "Mobilabonnemang kampanj: alla erbjudanden | Mobilpoolen",
      description: `${ALLA.length} kampanjer på mobilabonnemang hos ${OPS} operatörer, sorterade på vad du betalar första året. Se pris efter kampanjen och bindningstid.`,
      canonical: PATH,
      scripts: [
        breadcrumbJsonLd(TRAIL),
        faqJsonLd(FAQ),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Kampanjer på mobilabonnemang, billigast första året",
          itemListElement: ALLA.slice(0, 10).map((k, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${vem(k)}: ${kr(k.kampanjpris)} i ${k.manader} månader, sedan ${kr(k.a.pris)}`,
          })),
        }),
      ],
    }),
  component: Sida,
});

type Filter = "alla" | "minst-20" | "utan-bindning" | "lang" | "villkorade";

/** Dagens datum som ISO, för att märka kampanjer vars slutdatum har passerat. */
function idag(): string {
  return new Date().toISOString().slice(0, 10);
}

const FILTER: { id: Filter; label: string }[] = [
  { id: "alla", label: "Alla" },
  { id: "minst-20", label: "Minst 20 GB" },
  { id: "utan-bindning", label: "Utan bindningstid" },
  { id: "lang", label: "Minst 6 månader" },
  { id: "villkorade", label: "Student, ung, 55+" },
];

function Kort({ k, etta }: { k: Kampanj; etta: boolean }) {
  const slut = KAMPANJ_SLUT[k.a.operator];
  return (
    <li className="rounded-2xl border border-border bg-surface p-4 shadow-kort-litet sm:p-5">
      <div className="flex items-start gap-3">
        <OperatorMonogram namn={opNamn(k.a)} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-foreground [overflow-wrap:anywhere]">
            {opNamn(k.a)} {k.a.namn}
          </p>
          <p className="text-[13.5px] text-foreground/65">
            {gbText(k.a.gb)} · {bindningText(k.a.bindning)}
            {etta && " · Lägst snittpris"}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Kampanj</dt>
          <dd className="font-display text-[17px] font-semibold text-foreground">
            {kr(k.kampanjpris)}
          </dd>
          <dd className="text-[12.5px] text-foreground/65">i {k.manader} mån</dd>
        </div>
        <div className="rounded-xl bg-muted/60 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Sedan</dt>
          <dd className="font-display text-[17px] font-semibold text-foreground">{kr(k.a.pris)}</dd>
          <dd className="text-[12.5px] text-foreground/65">+{kr(k.hojning)}/mån</dd>
        </div>
        <div className="rounded-xl bg-primary/8 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Snitt år 1</dt>
          <dd className="font-display text-[17px] font-semibold text-primary">{kr(k.snitt)}</dd>
          <dd className="text-[12.5px] text-foreground/65">{kr(k.total24)} på 24 mån</dd>
        </div>
      </dl>
      {slut && (
        <p className="mt-3 text-[13.5px] text-foreground/75">
          {slut.datum < idag()
            ? `Kampanjen angavs gälla till ${datumText(slut.datum)}. Kontrollera hos operatören om den finns kvar.`
            : slut.text}
        </p>
      )}
      <a
        href={/\/\/api\./.test(k.a.kalla) ? (operator(k.a.operator)?.webb ?? k.a.kalla) : k.a.kalla}
        target="_blank"
        rel="noopener nofollow"
        className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
      >
        Se kampanjen hos {opNamn(k.a)} <ExternalLink className="size-4" aria-hidden />
      </a>
    </li>
  );
}

function Kampanjlista() {
  const [filter, setFilter] = useState<Filter>("alla");
  const [antal, setAntal] = useState(12);
  const lista = useMemo(() => {
    switch (filter) {
      case "utan-bindning":
        return ALLA.filter((k) => k.a.bindning === 0);
      case "minst-20":
        return ALLA.filter((k) => k.a.gb == null || k.a.gb >= 20);
      case "lang":
        return ALLA.filter((k) => k.manader >= 6);
      case "villkorade":
        return VILLKORADE_KAMPANJER;
      default:
        return ALLA;
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
              setAntal(12);
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
        {lista.length} kampanjer, billigast snittpris första året först.
      </p>
      <ul className="mt-4 grid gap-4 md:grid-cols-2">
        {lista.slice(0, antal).map((k, i) => (
          <Kort key={k.a.id} k={k} etta={i === 0 && filter === "alla"} />
        ))}
      </ul>
      {lista.length > antal && (
        <button
          type="button"
          onClick={() => setAntal((n) => n + 12)}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-border bg-surface px-5 text-[15px] font-semibold text-foreground hover:border-primary/50 sm:w-auto"
        >
          Visa fler ({lista.length - antal} kvar)
        </button>
      )}
    </div>
  );
}

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Kampanjer på mobilabonnemang just nu"
      ingress={
        <p>
          {BAST && (
            <>
              Bästa kampanjen räknat på hela första året är {vem(BAST)}: {kr(BAST.kampanjpris)} i{" "}
              {BAST.manader} månader och sedan {kr(BAST.a.pris)}, alltså {kr(BAST.snitt)} i månaden
              i snitt.{" "}
            </>
          )}
          Här är alla {ALLA.length} kampanjer hos {OPS} operatörer, sorterade på vad du faktiskt
          betalar och inte på priset första månaden.
        </p>
      }
      nyckeltal={[
        { varde: String(ALLA.length), text: `kampanjer hos ${OPS} operatörer` },
        { varde: String(UTAN.length), text: "utan bindningstid" },
        ...(BAST ? [{ varde: kr(BAST.snitt), text: "lägsta snittpris första året" }] : []),
      ]}
      jamforelse={<Kampanjlista />}
      jamforelseRubrik="Alla kampanjer"
      jamforelseIngress="Snittpriset räknar in kampanjmånaderna, de ordinarie månaderna och startavgiften. Det är det rättvisa sättet att jämföra en kampanj på 3 månader med en på 24."
      faq={FAQ}
      lankar={[
        {
          href: "/guider/kampanjpris-efter-kampanjen",
          label: "Vad betalar du efter kampanjen?",
          text: "Så räknar du på ett kampanjpris.",
        },
        {
          href: "/verktyg/kampanjkalkylator",
          label: "Kampanjkalkylator",
          text: "Räkna på en kampanj du har fått erbjudande om.",
        },
        {
          href: "/guider/forhandla-med-operatoren",
          label: "Förhandla med operatören",
          text: "Få ett bättre pris utan att byta.",
        },
        {
          href: "/guider/byta-operator-behalla-nummer",
          label: "Byt operatör och behåll numret",
          text: "Det tar högst en arbetsdag.",
        },
      ]}
      ctaRubrik="Jämför hela året, inte första månaden"
      ctaBild="spargris-tra"
      uppdaterad="2026-10-29"
    >
      <h2>Så läser du en kampanj</h2>
      <p>
        Ett kampanjpris är ett lockpris för nya kunder. Tre saker avgör om det är en bra affär: hur
        länge kampanjen gäller, vad du betalar sedan och om du binder dig.{" "}
        {STORST_HOJNING &&
          `Störst prishöjning efter kampanjen har ${vem(STORST_HOJNING)}, som går från ${kr(STORST_HOJNING.kampanjpris)} till ${kr(STORST_HOJNING.a.pris)} i månaden.`}
      </p>
      <p>
        Sätt en påminnelse i kalendern månaden innan kampanjen slutar. Har abonnemanget ingen
        bindningstid kan du byta operatör då och ta en ny kampanj någon annanstans. Hur det går till
        står i guiden om att{" "}
        <Link to={"/guider/byta-operator-behalla-nummer" as never}>byta operatör</Link>.
      </p>

      <h2>Billigast första året per operatör</h2>
      <GuideTable
        brytForsta
        head={["Operatör", "Bästa kampanjen", "Snitt år 1"]}
        rows={[...new Set(ALLA.map((k) => k.a.operator))].map((op) => {
          const k = ALLA.find((x) => x.a.operator === op)!;
          return [opNamn(k.a), `${k.a.namn}, ${kr(k.kampanjpris)} i ${k.manader} mån`, kr(k.snitt)];
        })}
      />

      <h2>Kampanjer som kräver student, ålder eller 55+</h2>
      <p>
        {VILLKORADE_KAMPANJER.length} kampanjer gäller bara dig som är student, ung eller över en
        viss ålder. De står inte med i listan ovan förrän du väljer filtret. Se också{" "}
        <Link to={"/studentabonnemang" as never}>studentabonnemang</Link>,{" "}
        <Link to={"/barn" as never}>abonnemang för barn</Link> och{" "}
        <Link to={"/pensionar" as never}>abonnemang för pensionärer</Link>.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Kampanjer
        ändras ofta. Kontrollera alltid priset hos operatören innan du beställer.
      </p>
    </PelarSida>
  );
}
