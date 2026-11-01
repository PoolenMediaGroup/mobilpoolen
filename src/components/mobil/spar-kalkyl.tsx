import { useId, useState } from "react";
import { ArrowDown, BellRing, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PRIVATA, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  gbText,
  kr,
  snittForstaAret,
  sortera,
  tackerBehov,
} from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

export const BEHOV_VAL: { gb: number; label: string; text: string }[] = [
  { gb: 3, label: "Lite", text: "Mejl, chatt och kartor" },
  { gb: 15, label: "Lagom", text: "Sociala medier och musik" },
  { gb: 40, label: "Mycket", text: "Video varje dag" },
  { gb: 1000, label: "Obegränsat", text: "Delar surf, ingen spärr" },
];

export type KalkylResultat = { behovGb: number; nuvarande: number; maxSnitt: number };

/**
 * Hur mycket billigare ett förslag minst ska vara än det besökaren betalar i dag.
 * 0,15 = vi visar bara abonnemang som är minst 15 procent billigare.
 */
export const SPAR_MARGINAL = 0.15;

type Svar = {
  nuvarande: number;
  maxSnitt: number;
  traffar: Abonnemang[];
  billigast: Abonnemang | null;
};

/**
 * Besparingsräknaren i startsidans hero. Räknar bara i webbläsaren och sparar
 * ingenting. Besökaren anger surf och vad hen betalar i dag. Svaret visar de
 * abonnemang som täcker surfen och kostar minst SPAR_MARGINAL mindre, mätt som
 * snittpris första året (kampanj och startavgift inräknade). Finns inget sådant
 * säger vi det rakt ut i stället för att visa något dyrare.
 */
export function SparKalkyl({ onResultat }: { onResultat: (r: KalkylResultat) => void }) {
  const uid = useId();
  const [behov, setBehov] = useState<number>(15);
  const [pris, setPris] = useState("");
  const [fel, setFel] = useState(false);
  const [svar, setSvar] = useState<Svar | null>(null);

  const rakna = (e: React.FormEvent) => {
    e.preventDefault();
    const nuvarande = Number(pris.replace(/\s/g, "").replace(",", "."));
    if (!pris.trim() || !Number.isFinite(nuvarande) || nuvarande <= 0) {
      setFel(true);
      setSvar(null);
      return;
    }
    setFel(false);
    const maxSnitt = Math.floor(nuvarande * (1 - SPAR_MARGINAL));
    const obegransad = behov >= 1000;
    const allmanna = PRIVATA.filter((a) => !arVillkorat(a));
    const kandidater = obegransad
      ? allmanna.filter((a) => a.gb == null)
      : allmanna.filter((a) => tackerBehov(a, behov));
    const traffar = sortera(
      kandidater.filter((a) => snittForstaAret(a) <= maxSnitt),
      "snitt-ar",
    );
    const billigast = sortera(kandidater, "snitt-ar")[0] ?? null;
    setSvar({ nuvarande, maxSnitt, traffar, billigast });
    onResultat({ behovGb: behov, nuvarande, maxSnitt });
  };

  const basta = svar?.traffar[0] ?? null;
  const besparing = svar && basta ? (svar.nuvarande - snittForstaAret(basta)) * 12 : null;
  const procent = Math.round(SPAR_MARGINAL * 100);

  return (
    <form
      onSubmit={rakna}
      noValidate
      className="flex flex-col gap-4 rounded-[20px] bg-surface p-5 text-left text-foreground shadow-mork sm:p-7"
      aria-labelledby={`${uid}-rubrik`}
    >
      <h2 id={`${uid}-rubrik`} className="font-sans text-[16px] font-medium text-foreground">
        Om ditt abonnemang
      </h2>
      <fieldset>
        <legend className="mb-1 text-[14px] font-semibold">Hur mycket surfar du?</legend>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1">
          {BEHOV_VAL.map((v) => {
            const aktiv = behov === v.gb;
            return (
              <button
                key={v.gb}
                type="button"
                aria-pressed={aktiv}
                onClick={() => setBehov(v.gb)}
                className={`min-h-[52px] rounded-lg border-2 px-3 py-1.5 text-center transition-all ${
                  aktiv
                    ? "border-primary bg-surface text-primary shadow-sm"
                    : "border-transparent text-foreground/70 hover:text-foreground"
                }`}
              >
                <span className="block text-[14.5px] font-semibold">{v.label}</span>
                <span className="block text-[12px] leading-snug opacity-80">{v.text}</span>
              </button>
            );
          })}
        </div>
      </fieldset>
      <div>
        <label
          htmlFor={`${uid}-pris`}
          className="mb-1 flex items-center gap-1.5 text-[14px] font-semibold"
        >
          Vad betalar du i dag?
          <span className="text-[12px] font-normal text-muted-foreground">per månad</span>
        </label>
        <div className="relative">
          <input
            id={`${uid}-pris`}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Ex. 349"
            required
            aria-invalid={fel}
            aria-describedby={fel ? `${uid}-fel` : undefined}
            value={pris}
            onChange={(e) => {
              setPris(e.target.value.replace(/[^\d\s,]/g, ""));
              if (fel) setFel(false);
            }}
            className={`block min-h-[52px] w-full rounded-xl border ${fel ? "border-[#B45309]" : "border-input-border"} bg-input px-4 pr-20 text-[16px] focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15`}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
            kr/mån
          </span>
        </div>
        {fel && (
          <p id={`${uid}-fel`} className="mt-1 text-xs font-medium" style={{ color: "#B45309" }}>
            Fyll i vad du betalar i dag, så visar vi vad du kan spara.
          </p>
        )}
      </div>
      <button type="submit" className="btn-cta w-full">
        Visa mitt pris →
      </button>

      <div aria-live="polite">
        {svar && basta && (
          <div className="rounded-xl bg-highlight p-4">
            <p className="flex items-start gap-2 text-[15px] leading-snug">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>
                <strong>{svar.traffar.length} abonnemang</strong> med din surf kostar minst{" "}
                {procent} % mindre än dina {kr(svar.nuvarande)}. Billigast:{" "}
                <strong>
                  {operator(basta.operator)?.namn} {basta.namn}
                </strong>{" "}
                ({gbText(basta.gb)}), i snitt <strong>{kr(snittForstaAret(basta))}/mån</strong>{" "}
                första året.
              </span>
            </p>
            {besparing != null && besparing > 0 && (
              <p className="mt-2 text-[15px] font-semibold text-foreground">
                Du kan spara runt {kr(besparing)} per år.
              </p>
            )}
            <a
              href="#alla"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-primary underline underline-offset-2"
            >
              Se alla {svar.traffar.length}
              <ArrowDown className="h-4 w-4" aria-hidden />
            </a>
          </div>
        )}
        {svar && !basta && (
          <div className="rounded-xl bg-highlight p-4 text-[15px] leading-snug">
            <p className="font-semibold text-foreground">Du betalar redan ett bra pris.</p>
            <p className="mt-1">
              Inget abonnemang med din surf är {procent} % billigare än {kr(svar.nuvarande)} just nu
              {svar.billigast
                ? `. Billigast är ${operator(svar.billigast.operator)?.namn} ${svar.billigast.namn} för ${kr(snittForstaAret(svar.billigast))}/mån i snitt.`
                : "."}
            </p>
            <Link
              to="/autopilot"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-primary underline underline-offset-2"
            >
              <BellRing className="h-4 w-4" aria-hidden />
              Få besked när det finns något billigare
            </Link>
          </div>
        )}
      </div>
    </form>
  );
}
