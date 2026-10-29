import { useId, useState } from "react";
import { ArrowDown, Sparkles } from "lucide-react";
import { PRIVATA, operator } from "@/lib/mobil/data";
import { billigastForBehov, gbText, kr, snittForstaAret } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

export const BEHOV_VAL: { gb: number; label: string; text: string }[] = [
  { gb: 3, label: "Lite", text: "Mejl, chatt och kartor" },
  { gb: 15, label: "Lagom", text: "Sociala medier och musik" },
  { gb: 40, label: "Mycket", text: "Video varje dag" },
  { gb: 1000, label: "Obegränsat", text: "Delar surf, ingen spärr" },
];

export type KalkylResultat = { behovGb: number; nuvarande: number | null };

/**
 * Besparingsräknaren i startsidans hero. Räknar bara i webbläsaren och sparar
 * ingenting. Svaret pekar på det billigaste abonnemanget som täcker behovet,
 * mätt som snittpris första året (kampanj och startavgift inräknade).
 */
export function SparKalkyl({ onResultat }: { onResultat: (r: KalkylResultat) => void }) {
  const uid = useId();
  const [behov, setBehov] = useState<number>(15);
  const [pris, setPris] = useState("");
  const [svar, setSvar] = useState<{ a: Abonnemang; nuvarande: number | null } | null>(null);

  const rakna = (e: React.FormEvent) => {
    e.preventDefault();
    const nuvarande = pris.trim()
      ? Math.max(0, Number(pris.replace(/\s/g, "").replace(",", ".")))
      : null;
    const behovGb = behov >= 1000 ? Number.POSITIVE_INFINITY : behov;
    const lista =
      behovGb === Number.POSITIVE_INFINITY ? PRIVATA.filter((a) => a.gb == null) : PRIVATA;
    const a = billigastForBehov(lista, Number.isFinite(behovGb) ? behovGb : 0);
    if (a) setSvar({ a, nuvarande: Number.isFinite(nuvarande ?? NaN) ? nuvarande : null });
    onResultat({ behovGb: behov, nuvarande });
  };

  const besparing =
    svar && svar.nuvarande != null ? (svar.nuvarande - snittForstaAret(svar.a)) * 12 : null;

  return (
    <form
      onSubmit={rakna}
      className="rounded-[22px] bg-surface p-5 text-foreground shadow-mork sm:p-7"
      aria-labelledby={`${uid}-rubrik`}
    >
      <h2 id={`${uid}-rubrik`} className="text-[22px] font-bold sm:text-[24px]">
        Räkna ut vad du kan spara
      </h2>
      <fieldset className="mt-5">
        <legend className="mb-2 text-[14.5px] font-semibold">Hur mycket surfar du?</legend>
        <div className="grid grid-cols-2 gap-2">
          {BEHOV_VAL.map((v) => {
            const aktiv = behov === v.gb;
            return (
              <button
                key={v.gb}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setBehov(v.gb)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  aktiv
                    ? "border-primary bg-highlight ring-1 ring-primary"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <span className="block text-[15px] font-bold">{v.label}</span>
                <span className="block text-[12.5px] leading-snug text-foreground/70">
                  {v.text}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <label htmlFor={`${uid}-pris`} className="mt-5 block text-[14.5px] font-semibold">
        Vad betalar du i dag? <span className="font-normal text-foreground/65">(valfritt)</span>
      </label>
      <div className="relative mt-2">
        <input
          id={`${uid}-pris`}
          inputMode="numeric"
          autoComplete="off"
          placeholder="t.ex. 349"
          value={pris}
          onChange={(e) => setPris(e.target.value.replace(/[^\d\s,]/g, ""))}
          className="block min-h-[52px] w-full rounded-xl border border-input-border bg-input px-4 pr-20 text-[17px] font-semibold"
        />
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
          kr/mån
        </span>
      </div>
      <button type="submit" className="btn-cta mt-5 w-full">
        Räkna ut
      </button>

      <div aria-live="polite">
        {svar && (
          <div className="mt-5 rounded-xl bg-highlight p-4">
            <p className="flex items-start gap-2 text-[15px] leading-snug">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                Billigast just nu:{" "}
                <strong>
                  {operator(svar.a.operator)?.namn} {svar.a.namn}
                </strong>{" "}
                ({gbText(svar.a.gb)}), i snitt <strong>{kr(snittForstaAret(svar.a))}/mån</strong>{" "}
                första året.
              </span>
            </p>
            {besparing != null && (
              <p className="mt-2 text-[15px] font-semibold text-foreground">
                {besparing > 0
                  ? `Du kan spara runt ${kr(besparing)} per år.`
                  : "Du betalar redan ett bra pris för den surfen."}
              </p>
            )}
            <a
              href="#jamfor"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-primary underline underline-offset-2"
            >
              Se alla som passar dig
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
        )}
      </div>
      <p className="mt-4 text-[12.5px] text-foreground/60">
        Vi sparar ingenting av det du fyller i. Uträkningen sker i din webbläsare.
      </p>
    </form>
  );
}
