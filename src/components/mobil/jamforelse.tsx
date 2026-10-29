import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, ExternalLink, Info, SlidersHorizontal, X } from "lucide-react";
import { ABONNEMANG, MOBILNAT, operator } from "@/lib/mobil/data";
import type { Abonnemang, Kundtyp, Malgrupp, NatId } from "@/lib/mobil/typer";
import {
  bindningText,
  arVillkorat,
  datumText,
  formatTal,
  momsText,
  gbText,
  iSurfIntervall,
  kr,
  prisNu,
  prisPerGb,
  snittForstaAret,
  sortera,
  SORTERINGAR,
  SURF_INTERVALL,
  tackerBehov,
  totalKostnad,
  type Sortering,
  type SurfIntervall,
} from "@/lib/mobil/berakna";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { Ersattningsrad } from "@/components/ersattningsrad";

export type Forval = {
  surf?: SurfIntervall;
  /** Minsta surf i GB. Används av besparingsräknaren. */
  behovGb?: number;
  utanBindning?: boolean;
  bara5g?: boolean;
  nat?: NatId | "alla";
  operator?: string;
  malgrupp?: Malgrupp;
  sortering?: Sortering;
  /** Visa även abonnemang med ålderskrav eller studentkrav från början. */
  villkorade?: boolean;
};

export { arVillkorat };

/**
 * Jämförelsen av mobilabonnemang. Samma komponent används på startsidan och på
 * pelarsidorna, med olika förval. All data finns i den serverrenderade
 * HTML:en: filtren döljer bara rader, de hämtar inget.
 *
 * Sorteringen är aldrig påverkad av om en operatör är partner.
 */
export function Jamforelse({
  kundtyp = "privat",
  forval = {},
  antalForst = 10,
  visaFilter = true,
  urval,
  id = "jamfor",
}: {
  kundtyp?: Kundtyp;
  forval?: Forval;
  antalForst?: number;
  visaFilter?: boolean;
  /** Begränsa listan till ett eget urval, t.ex. en operatörs abonnemang. */
  urval?: (a: Abonnemang) => boolean;
  id?: string;
}) {
  const [surf, setSurf] = useState<SurfIntervall>(forval.surf ?? "alla");
  const [behovGb, setBehovGb] = useState<number | undefined>(forval.behovGb);
  const [utanBindning, setUtanBindning] = useState(forval.utanBindning ?? false);
  const [bara5g, setBara5g] = useState(forval.bara5g ?? false);
  const [nat, setNat] = useState<NatId | "alla">(forval.nat ?? "alla");
  const [op, setOp] = useState<string>(forval.operator ?? "alla");
  const [sortering, setSortering] = useState<Sortering>(forval.sortering ?? "snitt-ar");
  const [antal, setAntal] = useState(antalForst);
  const [filterOppen, setFilterOppen] = useState(false);
  const [villkorade, setVillkorade] = useState(forval.villkorade ?? Boolean(forval.malgrupp));

  // Besparingsräknaren i heron skickar nya förval när besökaren räknar om.
  useEffect(() => {
    setSurf(forval.surf ?? "alla");
    setBehovGb(forval.behovGb);
    if (forval.sortering) setSortering(forval.sortering);
    setAntal(antalForst);
  }, [forval.surf, forval.behovGb, forval.sortering, antalForst]);

  const bas = useMemo(
    () =>
      ABONNEMANG.filter(
        (a) =>
          a.kundtyp === kundtyp &&
          (!urval || urval(a)) &&
          (!forval.malgrupp || a.malgrupp?.includes(forval.malgrupp)),
      ),
    [kundtyp, urval, forval.malgrupp],
  );

  const operatorer = useMemo(
    () =>
      [...new Set(bas.map((a) => a.operator))]
        .map((s) => operator(s))
        .filter((o): o is NonNullable<typeof o> => !!o)
        .sort((a, b) => a.namn.localeCompare(b.namn, "sv")),
    [bas],
  );

  const traffar = useMemo(() => {
    const lista = bas.filter(
      (a) =>
        iSurfIntervall(a, surf) &&
        (behovGb == null || tackerBehov(a, behovGb)) &&
        (!utanBindning || a.bindning === 0) &&
        (!bara5g || a.femg) &&
        (nat === "alla" || operator(a.operator)?.nat === nat) &&
        (op === "alla" || a.operator === op) &&
        (villkorade || !arVillkorat(a)),
    );
    return sortera(lista, sortering);
  }, [bas, surf, behovGb, utanBindning, bara5g, nat, op, sortering, villkorade]);
  const antalVillkorade = useMemo(() => bas.filter(arVillkorat).length, [bas]);

  const aktivaFilter =
    (surf !== "alla" ? 1 : 0) +
    (behovGb != null ? 1 : 0) +
    (utanBindning ? 1 : 0) +
    (bara5g ? 1 : 0) +
    (nat !== "alla" ? 1 : 0) +
    (op !== "alla" ? 1 : 0);

  const nollstall = () => {
    setSurf("alla");
    setBehovGb(undefined);
    setUtanBindning(false);
    setBara5g(false);
    setNat("alla");
    setOp("alla");
    setAntal(antalForst);
  };

  const prisEnhet = "kr/mån";
  const visade = traffar.slice(0, antal);

  return (
    <div id={id} className="scroll-mt-24">
      {visaFilter && (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-kort-litet sm:p-5">
          {/* Surfmängd: det viktigaste valet, alltid synligt */}
          <fieldset className="min-w-0">
            <legend className="mb-2 text-[14px] font-semibold text-foreground">
              Hur mycket surf behöver du?
            </legend>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
              {SURF_INTERVALL.map((s) => {
                const aktiv = surf === s.id && behovGb == null;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={aktiv}
                    onClick={() => {
                      setSurf(s.id);
                      setBehovGb(undefined);
                      setAntal(antalForst);
                    }}
                    className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-[14.5px] font-semibold transition-colors ${
                      aktiv
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-surface text-foreground hover:border-primary/50"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Vaxel
              checked={utanBindning}
              onChange={(v) => {
                setUtanBindning(v);
                setAntal(antalForst);
              }}
              label="Utan bindningstid"
            />
            <Vaxel
              checked={bara5g}
              onChange={(v) => {
                setBara5g(v);
                setAntal(antalForst);
              }}
              label="Med 5G"
            />
            <button
              type="button"
              onClick={() => setFilterOppen((v) => !v)}
              aria-expanded={filterOppen}
              className="inline-flex min-h-11 items-center gap-2 text-[14.5px] font-semibold text-primary"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Fler filter
              <ChevronDown
                className={`h-4 w-4 transition-transform ${filterOppen ? "rotate-180" : ""}`}
                aria-hidden
              />
            </button>
            <label className="ml-auto flex min-w-0 items-center gap-2 text-[14px] text-foreground/80 max-sm:w-full">
              <span className="shrink-0">Sortera</span>
              <select
                value={sortering}
                onChange={(e) => setSortering(e.target.value as Sortering)}
                className="min-h-11 min-w-0 flex-1 rounded-[10px] border border-input-border bg-surface px-3 text-[14.5px] font-medium text-foreground"
              >
                {SORTERINGAR.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filterOppen && (
            <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
              {antalVillkorade > 0 && (
                <div className="sm:col-span-2">
                  <Vaxel
                    checked={villkorade}
                    onChange={(v) => {
                      setVillkorade(v);
                      setAntal(antalForst);
                    }}
                    label={`Visa student-, ungdoms- och seniorerbjudanden (${antalVillkorade})`}
                  />
                </div>
              )}
              <label className="text-[14px] font-semibold text-foreground">
                Mobilnät
                <select
                  value={nat}
                  onChange={(e) => {
                    setNat(e.target.value as NatId | "alla");
                    setAntal(antalForst);
                  }}
                  className="mt-1 block min-h-11 w-full rounded-[10px] border border-input-border bg-surface px-3 font-medium"
                >
                  <option value="alla">Alla nät</option>
                  {Object.values(MOBILNAT).map((n) => (
                    <option key={n.id} value={n.id}>
                      {n.namn}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[14px] font-semibold text-foreground">
                Operatör
                <select
                  value={op}
                  onChange={(e) => {
                    setOp(e.target.value);
                    setAntal(antalForst);
                  }}
                  className="mt-1 block min-h-11 w-full rounded-[10px] border border-input-border bg-surface px-3 font-medium"
                >
                  <option value="alla">Alla operatörer</option>
                  {operatorer.map((o) => (
                    <option key={o.slug} value={o.slug}>
                      {o.namn}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-2" aria-live="polite">
        <p className="text-[14.5px] text-foreground/75">
          {traffar.length === 0
            ? "Inga abonnemang matchar filtren."
            : `${traffar.length} abonnemang${behovGb != null ? ` med minst ${behovGb} GB` : ""}${
                aktivaFilter ? " matchar" : ""
              }`}
        </p>
        {aktivaFilter > 0 && (
          <button
            type="button"
            onClick={nollstall}
            className="inline-flex min-h-11 items-center gap-1 text-[14px] font-semibold text-primary"
          >
            <X className="h-4 w-4" aria-hidden /> Rensa filter
          </button>
        )}
      </div>

      <ol className="mt-3 space-y-3">
        {visade.map((a, i) => (
          <li key={a.id}>
            <AbonnemangKort
              a={a}
              etta={i === 0 && sortering !== "mest-surf"}
              prisEnhet={prisEnhet}
            />
          </li>
        ))}
      </ol>

      {traffar.length > antal && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setAntal((n) => n + 15)}
            className="btn-secondary-outline"
          >
            Visa fler ({traffar.length - antal} till)
          </button>
        </div>
      )}

      <p className="mt-5 flex items-start gap-2 text-[13.5px] leading-relaxed text-foreground/65">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          Snittpriset räknar med kampanjens längd och startavgiften under de första tolv månaderna.
          Priserna kommer från operatörernas egna webbplatser och kan ha ändrats sedan
          kontrolldatumet. Läs mer om{" "}
          <Link to="/sa-jamfor-vi" className="underline underline-offset-2 hover:text-primary">
            hur vi jämför
          </Link>
          .
        </span>
      </p>
    </div>
  );
}

function Vaxel({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex min-h-11 cursor-pointer select-none items-center gap-2.5 text-[14.5px] font-medium text-foreground">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className={`relative h-6 w-10 rounded-full transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-foreground ${
          checked ? "bg-primary" : "bg-foreground/20"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </span>
      {label}
    </label>
  );
}

export function AbonnemangKort({
  a,
  etta = false,
  prisEnhet = "kr/mån",
}: {
  a: Abonnemang;
  etta?: boolean;
  prisEnhet?: string;
}) {
  const [oppen, setOppen] = useState(false);
  const o = operator(a.operator);
  const harKampanj = a.kampanjpris != null && (a.kampanjManader ?? 0) > 0;
  const snitt = snittForstaAret(a);
  const perGb = prisPerGb(a);
  const natNamn = o ? MOBILNAT[o.nat].kortText : "";

  return (
    <article
      className={`rounded-2xl border bg-surface transition-shadow hover:shadow-kort ${
        etta ? "border-primary/40 shadow-kort-litet" : "border-border"
      }`}
    >
      {etta && (
        <div className="rounded-t-2xl bg-highlight px-5 py-1.5 text-[13px] font-semibold text-primary">
          Lägst pris med dina val
        </div>
      )}
      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center md:gap-6">
        {/* Operatör och abonnemang */}
        <div className="flex min-w-0 items-center gap-3.5">
          <OperatorMonogram namn={o?.namn ?? a.operator} />
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold leading-tight text-foreground [overflow-wrap:anywhere]">
              {o ? (
                <Link
                  to="/operatorer/$slug"
                  params={{ slug: o.slug }}
                  className="hover:text-primary"
                >
                  {o.namn}
                </Link>
              ) : (
                a.operator
              )}{" "}
              <span className="font-semibold text-foreground/70">{a.namn}</span>
            </h3>
            <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-foreground/70">
              <li className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5 text-savings" aria-hidden />
                {bindningText(a.bindning)}
              </li>
              {a.femg && (
                <li className="inline-flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-savings" aria-hidden />
                  5G
                </li>
              )}
              {a.kontantkort && <li>Kontantkort</li>}
              {a.malgrupp?.includes("senior") && <li>Ålderskrav</li>}
              {(a.malgrupp?.includes("student") || a.malgrupp?.includes("ung")) && (
                <li>Student eller ung</li>
              )}
              {momsText(a.moms) && <li>Pris {momsText(a.moms)}</li>}
              {a.hastighet && a.gb == null && /mbit/i.test(a.hastighet) && <li>{a.hastighet}</li>}
              {natNamn && <li>{natNamn}</li>}
            </ul>
          </div>
        </div>

        {/* Surf och pris */}
        <div className="flex items-end justify-between gap-4 md:justify-start md:gap-8">
          <div>
            <div className="font-display text-[26px] font-bold leading-none text-foreground">
              {gbText(a.gb)}
            </div>
            <div className="mt-1 text-[13px] text-foreground/65">
              {a.euGb != null ? `${formatTal(a.euGb)} GB i EU` : "surf per månad"}
            </div>
          </div>
          <div className="text-right md:text-left">
            <div className="font-display text-[26px] font-bold leading-none text-foreground">
              {harKampanj ? a.kampanjpris : a.pris}
              <span className="ml-1 text-[14px] font-semibold text-foreground/70">{prisEnhet}</span>
            </div>
            <div className="mt-1 text-[13px] text-foreground/65">
              {harKampanj ? (
                <>
                  i {a.kampanjManader} mån, sedan {kr(a.pris)}
                  <span className="block font-semibold text-foreground/80">
                    snitt {kr(snitt)} första året
                  </span>
                </>
              ) : (
                `snitt ${kr(snitt)} första året`
              )}
            </div>
          </div>
        </div>

        {/* Knappar */}
        <div className="flex items-center gap-2 md:flex-col md:items-stretch">
          <a
            href={a.kalla}
            target="_blank"
            rel={`noopener ${o?.partner ? "sponsored" : "nofollow"}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-cta px-4 text-[15px] font-semibold text-cta-foreground hover:bg-cta-hover md:flex-none"
          >
            Till {o?.namn ?? "operatören"}
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
          <button
            type="button"
            onClick={() => setOppen((v) => !v)}
            aria-expanded={oppen}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-[10px] border border-border px-3 text-[14px] font-semibold text-foreground hover:border-primary/50"
          >
            Detaljer
            <ChevronDown
              className={`h-4 w-4 transition-transform ${oppen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
        </div>
      </div>

      {oppen && (
        <div className="border-t border-border px-4 py-4 sm:px-5">
          <dl className="grid gap-x-6 gap-y-2 text-[14px] sm:grid-cols-2 lg:grid-cols-3">
            <Rad t="Ordinarie pris" v={`${kr(a.pris)} per månad`} />
            {harKampanj && (
              <Rad
                t="Kampanj"
                v={a.kampanjText ?? `${kr(a.kampanjpris ?? 0)} i ${a.kampanjManader} mån`}
              />
            )}
            <Rad t="Snitt första året" v={`${kr(snitt)} per månad`} />
            <Rad t="Kostnad 24 månader" v={kr(totalKostnad(a, 24))} />
            {perGb != null && (
              <Rad t="Pris per GB" v={`${perGb.toString().replace(".", ",")} kr`} />
            )}
            <Rad
              t="Startavgift"
              v={
                a.startavgift ? kr(a.startavgift) : a.startavgift === 0 ? "Ingen" : "Uppgift saknas"
              }
            />
            <Rad t="Samtal och sms" v={a.friaSamtal ? "Fria i Sverige" : "Enligt prislista"} />
            {a.euGb != null && <Rad t="Surf i EU/EES" v={`${formatTal(a.euGb)} GB per månad`} />}
            {a.sparadSurf != null && <Rad t="Sparad surf" v={a.sparadSurf ? "Ja" : "Nej"} />}
            {a.hastighet && <Rad t="Hastighet" v={a.hastighet} />}
            {a.uppsagning != null && <Rad t="Uppsägningstid" v={`${a.uppsagning} mån`} />}
            <Rad t="Pris i dag" v={`${kr(prisNu(a))} första månaden`} />
          </dl>
          {a.notis && <p className="mt-3 text-[14px] text-foreground/80">{a.notis}</p>}
          <p className="mt-3 text-[13px] text-foreground/60">
            Källa:{" "}
            <a
              href={a.kalla}
              target="_blank"
              rel="noopener nofollow"
              className="underline underline-offset-2 hover:text-primary"
            >
              {o?.namn ?? a.operator}s webbplats
            </a>
            {o ? `, kontrollerad ${datumText(o.kontrollerad)}` : ""}.
          </p>
          <Ersattningsrad partner={o?.partner ?? false} />
        </div>
      )}
    </article>
  );
}

function Rad({ t, v }: { t: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/60 py-1.5 sm:block sm:border-0 sm:py-0">
      <dt className="text-foreground/60">{t}</dt>
      <dd className="font-semibold text-foreground">{v}</dd>
    </div>
  );
}
