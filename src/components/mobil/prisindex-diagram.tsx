import { kr, datumText } from "@/lib/mobil/berakna";
import type { IndexManad, NivaRad } from "@/lib/mobil/prisindex";

/**
 * Prisspannet per surfnivå: en linje från billigaste till dyraste snittpris och
 * en punkt för medianen. Ritas med HTML i stället för SVG så att texten håller
 * samma storlek i mobilen. Serverrenderas, så siffrorna finns i HTML:en.
 */
export function PrisspannDiagram({ rader }: { rader: NivaRad[] }) {
  const med = rader.filter((r) => r.min != null && r.max != null && r.med != null);
  if (med.length === 0) return null;
  const tak = Math.ceil(Math.max(...med.map((r) => r.max as number)) / 100) * 100;
  const pos = (v: number) => `${(v / tak) * 100}%`;
  const steg = [0, tak / 2, tak];

  return (
    <figure className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <figcaption className="sr-only">
        Billigaste, median och dyraste snittpris första året per surfnivå, kronor per månad
      </figcaption>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-foreground/70">
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-1.5 w-6 rounded-full bg-primary/25" />
          Billigast till dyrast
        </span>
        <span className="inline-flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-full bg-primary ring-2 ring-surface" />
          Median
        </span>
      </div>
      <ul className="space-y-3.5">
        {med.map((r) => (
          <li
            key={r.niva}
            className="grid grid-cols-[76px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[96px_minmax(0,1fr)]"
          >
            <div className="text-[14px] font-semibold leading-tight">
              {r.niva}
              <div className="text-[12px] font-normal text-foreground/55">{r.antal} st</div>
            </div>
            <div className="relative h-9">
              <div
                aria-hidden
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-primary/25"
                style={{
                  left: pos(r.min as number),
                  right: `calc(100% - ${pos(r.max as number)})`,
                }}
              />
              <div
                aria-hidden
                className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary ring-2 ring-surface"
                style={{ left: pos(r.med as number) }}
              />
              <span
                className="absolute -top-1 -translate-x-1/2 whitespace-nowrap text-[12.5px] font-semibold text-primary"
                style={{ left: pos(r.med as number) }}
              >
                {kr(r.med as number)}
              </span>
              <span
                aria-hidden
                className="absolute top-1/2 hidden -translate-x-full -translate-y-1/2 whitespace-nowrap pr-2 text-[12px] text-foreground/55 sm:inline"
                style={{ left: pos(r.min as number) }}
              >
                {kr(r.min as number)}
              </span>
              <span
                aria-hidden
                className="absolute top-1/2 hidden -translate-y-1/2 whitespace-nowrap pl-2 text-[12px] text-foreground/55 sm:inline"
                style={{ left: pos(r.max as number) }}
              >
                {kr(r.max as number)}
              </span>
              <span className="sr-only">
                Billigast {kr(r.min as number)}, median {kr(r.med as number)}, dyrast{" "}
                {kr(r.max as number)}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-2 grid grid-cols-[76px_minmax(0,1fr)] gap-3 sm:grid-cols-[96px_minmax(0,1fr)]">
        <div />
        <div
          aria-hidden
          className="relative h-5 border-t border-border text-[11.5px] text-foreground/55"
        >
          {steg.map((v, i) => (
            <span
              key={v}
              className={`absolute top-1 whitespace-nowrap ${i === 0 ? "" : i === steg.length - 1 ? "-translate-x-full" : "-translate-x-1/2"}`}
              style={{ left: pos(v) }}
            >
              {kr(v)}
            </span>
          ))}
        </div>
      </div>
    </figure>
  );
}

const MANADER = [
  "jan",
  "feb",
  "mar",
  "apr",
  "maj",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "dec",
];
const manadKort = (m: string) => `${MANADER[Number(m.slice(5, 7)) - 1]} ${m.slice(2, 4)}`;

/**
 * Medianpriset per surfnivå månad för månad. Visas först när det finns minst två
 * sparade månader: en enda punkt är ingen utveckling.
 */
export function IndexTrend({ historik }: { historik: IndexManad[] }) {
  if (historik.length < 2) return null;
  const nivaer = ["5 GB", "20 GB", "Obegränsad"];
  const serier = nivaer.map((n) => ({
    niva: n,
    punkter: historik.map((m) => m.perNiva.find((r) => r.niva === n)?.med ?? null),
  }));
  const varden = serier.flatMap((s) => s.punkter).filter((v): v is number => v != null);
  const tak = Math.ceil(Math.max(...varden) / 100) * 100;
  const B = 520;
  const H = 260;
  const V = 48;
  const T = 16;
  const N = 32;
  const x = (i: number) => V + (i / (historik.length - 1)) * (B - V - 16);
  const y = (v: number) => T + (1 - v / tak) * (H - T - N);
  const farger = ["var(--primary)", "var(--cta)", "var(--foreground)"];

  return (
    <figure className="rounded-xl border border-border bg-surface p-4 sm:p-6">
      <figcaption className="text-[14px] text-foreground/75">
        Medianpris första året, kronor per månad, {datumText(historik[0].kontrollerad)} till{" "}
        {datumText(historik[historik.length - 1].kontrollerad)}
      </figcaption>
      <svg
        viewBox={`0 0 ${B} ${H}`}
        className="mt-3 w-full"
        role="img"
        aria-label="Medianpris per månad"
      >
        {[0, tak / 2, tak].map((v) => (
          <g key={v}>
            <line x1={V} x2={B - 16} y1={y(v)} y2={y(v)} stroke="var(--border)" />
            <text
              x={V - 8}
              y={y(v) + 4}
              textAnchor="end"
              fontSize="15"
              fill="currentColor"
              opacity={0.6}
            >
              {v}
            </text>
          </g>
        ))}
        {historik.map((m, i) => (
          <text
            key={m.manad}
            x={x(i)}
            y={H - 6}
            textAnchor={i === 0 ? "start" : i === historik.length - 1 ? "end" : "middle"}
            fontSize="15"
            fill="currentColor"
            opacity={0.6}
          >
            {manadKort(m.manad)}
          </text>
        ))}
        {serier.map((s, si) => {
          const d = s.punkter
            .map((v, i) => (v == null ? null : `${x(i)},${y(v)}`))
            .filter(Boolean)
            .join(" ");
          return (
            <g key={s.niva}>
              <polyline points={d} fill="none" stroke={farger[si]} strokeWidth={2.5} />
              {s.punkter.map((v, i) =>
                v == null ? null : <circle key={i} cx={x(i)} cy={y(v)} r={3.5} fill={farger[si]} />,
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-foreground/75">
        {serier.map((s, si) => (
          <span key={s.niva} className="inline-flex items-center gap-2">
            <span aria-hidden className="h-1 w-5 rounded-full" style={{ background: farger[si] }} />
            {s.niva}
          </span>
        ))}
      </div>
    </figure>
  );
}
