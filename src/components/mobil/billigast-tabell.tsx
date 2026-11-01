import { Link } from "@tanstack/react-router";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { ABONNEMANG, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  datumText,
  gbText,
  kr,
  prisNu,
  snittForstaAret,
} from "@/lib/mobil/berakna";
import type { Abonnemang, Kundtyp } from "@/lib/mobil/typer";

export const SURFNIVAER = [1, 5, 10, 20, 50, 100] as const;

export type BilligastRad = { niva: string; a: Abonnemang };

/** Billigaste abonnemanget per surfnivå, plus billigaste obegränsade. */
export function billigastPerNiva(
  kundtyp: Kundtyp = "privat",
  filter?: (a: Abonnemang) => boolean,
): BilligastRad[] {
  // Utan eget filter räknas bara abonnemang som alla kan köpa (inga ålders- eller studentkrav).
  const lista = ABONNEMANG.filter(
    (a) => a.kundtyp === kundtyp && (filter ? filter(a) : !arVillkorat(a)),
  );
  const rader: BilligastRad[] = [];
  for (const gb of SURFNIVAER) {
    const a = billigastForBehov(
      lista.filter((x) => x.gb != null),
      gb,
    );
    if (a && !rader.some((r) => r.a.id === a.id)) rader.push({ niva: `Minst ${gb} GB`, a });
  }
  const obegr = billigastForBehov(
    lista.filter((x) => x.gb == null),
    0,
  );
  if (obegr) rader.push({ niva: "Obegränsad surf", a: obegr });
  return rader;
}

/**
 * Tabellen "billigast per surfmängd". Räknas ur datan vid varje bygge, så den
 * följer priserna. Står på startsidan och på /billigaste-mobilabonnemang.
 */
export function BilligastTabell({
  kundtyp = "privat",
  filter,
  rubrikNiva = "Behov",
}: {
  kundtyp?: Kundtyp;
  filter?: (a: Abonnemang) => boolean;
  rubrikNiva?: string;
}) {
  const rader = billigastPerNiva(kundtyp, filter);
  const moms = kundtyp === "foretag" ? " exkl. moms" : "";
  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-tabell">
        <table className="w-full border-collapse text-[15px] max-sm:block">
          <caption className="sr-only">
            Billigaste mobilabonnemanget per surfmängd, snittpris första året
          </caption>
          <thead className="bg-muted/70 text-left text-[12.5px] uppercase tracking-wide text-foreground/70 max-sm:sr-only">
            <tr>
              <th className="px-4 py-3 font-semibold">{rubrikNiva}</th>
              <th className="px-4 py-3 font-semibold">Billigast</th>
              <th className="px-4 py-3 font-semibold">Surf</th>
              <th className="px-4 py-3 text-right font-semibold">Pris första mån</th>
              <th className="bg-highlight px-4 py-3 text-right font-semibold text-primary">
                Snitt/mån år 1
              </th>
            </tr>
          </thead>
          <tbody className="max-sm:block">
            {rader.map(({ niva, a }) => {
              const o = operator(a.operator);
              return (
                <tr
                  key={niva}
                  className="border-t border-border transition-colors hover:bg-highlight/40 max-sm:grid max-sm:grid-cols-[auto_1fr_auto] max-sm:items-center max-sm:gap-x-3 max-sm:gap-y-1 max-sm:px-4 max-sm:py-3"
                >
                  <th scope="row" className="px-4 py-3.5 text-left max-sm:col-span-3 max-sm:p-0">
                    <span className="inline-flex items-center rounded-full bg-highlight px-3 py-1 text-[13.5px] font-semibold text-primary">
                      {niva}
                    </span>
                  </th>
                  <td className="px-4 py-3.5 max-sm:col-span-2 max-sm:p-0">
                    <span className="flex items-center gap-3">
                      <OperatorMonogram namn={o?.namn ?? a.operator} size={32} />
                      <span className="min-w-0 leading-snug">
                        {o ? (
                          <Link
                            to="/operatorer/$slug"
                            params={{ slug: o.slug }}
                            className="font-semibold text-foreground hover:text-primary hover:underline"
                          >
                            {o.namn}
                          </Link>
                        ) : (
                          a.operator
                        )}
                        <span className="block text-[13.5px] text-muted-foreground">
                          {a.namn}
                          {!a.namn.includes(gbText(a.gb)) && (
                            <span className="sm:hidden"> · {gbText(a.gb)}</span>
                          )}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-foreground/80 max-sm:hidden">{gbText(a.gb)}</td>
                  <td className="px-4 py-3.5 text-right tabular-nums text-foreground/70 max-sm:hidden">
                    {kr(prisNu(a))}
                  </td>
                  <td className="bg-highlight/50 px-4 py-3.5 text-right tabular-nums max-sm:bg-transparent max-sm:p-0">
                    <span className="font-display text-[18px] font-bold text-primary">
                      {kr(snittForstaAret(a))}
                    </span>
                    <span className="block text-[11.5px] text-muted-foreground sm:hidden">
                      snitt/mån år 1
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[13.5px] text-foreground/65">
        Priser per månad{moms} från operatörernas egna webbplatser, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}. Snittet räknar in kampanjens längd och startavgiften.
      </p>
    </div>
  );
}
