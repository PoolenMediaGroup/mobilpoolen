/**
 * Byggstenar för datasidorna (inbrottsstatistik för landet, kommuner och
 * polisregioner), efter Elpoolens data-kit: en mörk hero och en vit panel som
 * överlappar den, där svaret syns direkt i stora nyckeltal med källan under.
 *
 * Bara utseende. Texten och ordningen i HTML:en är densamma som innan
 * komponenten fanns: siffra, förklaring, källrad. Etiketter i vanlig skrift,
 * inte versalt som hos Elpoolen (Mobilpoolens regel).
 */
import type { ReactNode } from "react";

export type Nyckeltal = {
  /** Siffran, redan formaterad. */
  varde: ReactNode;
  /** Förklaringen under siffran. */
  text: ReactNode;
};

/**
 * Vit panel som överlappar heron. Första nyckeltalet står i indigo, övriga i
 * textfärgen, så att ögat landar på svaret först. indigo har 7,2:1 mot vitt,
 * förklaringarna i foreground/65 har 5,0:1.
 */
export function NyckeltalPanel({
  tal,
  kalla,
  kolumner = 3,
  reveal = false,
}: {
  tal: Nyckeltal[];
  kalla: ReactNode;
  kolumner?: 3 | 4;
  reveal?: boolean;
}) {
  const grid = kolumner === 4 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3";
  return (
    <section className="relative z-10 -mt-12 lg:-mt-16">
      <div className="mx-auto max-w-[1140px] px-6">
        <div className="card-hero p-5 sm:p-8" data-reveal={reveal ? true : undefined}>
          <div className={`grid gap-6 sm:gap-x-8 ${grid}`}>
            {tal.map((t, i) => (
              <div key={i} className="min-w-0">
                <div
                  className={`font-display font-bold leading-none tracking-tight tabular-nums ${
                    i === 0 ? "text-primary" : "text-foreground"
                  }`}
                  style={{ fontSize: "clamp(32px, 4vw, 42px)" }}
                >
                  {t.varde}
                </div>
                <p className="mt-2 text-[14.5px] leading-snug text-foreground/65">{t.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 border-t border-border/70 pt-4 text-[13px] text-foreground/65">
            {kalla}
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Liggande stapel i ren HTML, renderad på servern. Etikett till vänster,
 * siffran till höger, som Elpoolens HBars men på en rad.
 */
export function Stapelrad({
  namn,
  varde,
  bredd,
  farg,
  etikettBredd = "w-[128px]",
  vardeBredd = "w-[48px]",
}: {
  namn: ReactNode;
  varde: ReactNode;
  /** Bredd i procent, till exempel "62%". */
  bredd: string;
  /** Tailwind-klass för stapelns färg. */
  farg: string;
  etikettBredd?: string;
  vardeBredd?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={`${etikettBredd} shrink-0 text-[15px] text-foreground/90`}>{namn}</span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={`${farg} h-full rounded-full`} style={{ width: bredd }} />
      </div>
      <span
        className={`${vardeBredd} shrink-0 text-right font-display text-[17px] font-bold tabular-nums`}
      >
        {varde}
      </span>
    </div>
  );
}
