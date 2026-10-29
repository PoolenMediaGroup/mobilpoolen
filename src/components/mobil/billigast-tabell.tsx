import { Link } from "@tanstack/react-router";
import { ABONNEMANG, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import {
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
  const lista = ABONNEMANG.filter((a) => a.kundtyp === kundtyp && (!filter || filter(a)));
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
  rubrikNiva = "Surf",
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
              <th className="px-4 py-3 text-right font-semibold">Snitt år 1</th>
            </tr>
          </thead>
          <tbody className="max-sm:block">
            {rader.map(({ niva, a }) => {
              const o = operator(a.operator);
              return (
                <tr
                  key={niva}
                  className="border-t border-border max-sm:block max-sm:px-4 max-sm:py-3"
                >
                  <th
                    scope="row"
                    className="px-4 py-3 text-left font-semibold text-foreground max-sm:block max-sm:p-0"
                  >
                    {niva}
                  </th>
                  <td className="px-4 py-3 max-sm:block max-sm:p-0 max-sm:pt-1">
                    {o ? (
                      <Link
                        to="/operatorer/$slug"
                        params={{ slug: o.slug }}
                        className="font-semibold text-primary hover:underline"
                      >
                        {o.namn}
                      </Link>
                    ) : (
                      a.operator
                    )}{" "}
                    <span className="text-foreground/75">{a.namn}</span>
                  </td>
                  <td className="px-4 py-3 text-foreground/80 max-sm:inline max-sm:p-0 max-sm:after:content-['_·_']">
                    {gbText(a.gb)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums max-sm:inline max-sm:p-0 max-sm:after:content-['_·_']">
                    {kr(prisNu(a))}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums max-sm:inline max-sm:p-0">
                    <span className="sm:hidden">snitt </span>
                    {kr(snittForstaAret(a))}
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
