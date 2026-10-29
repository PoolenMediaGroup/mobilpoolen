import type { CSSProperties, ReactNode } from "react";

/**
 * Sektionsrubrik som på Elpoolen: Sora, 30 till 44 px, 48 px luft under och
 * ingressen 16 px under rubriken. Ingen etikett ovanför (Mobilpoolens regel).
 * Färgerna kommer från tokens: rubrik i foreground, ingress i
 * muted-foreground (6,7:1 mot bakgrunden, 7,2:1 mot vitt).
 */
export function SectionHeader({
  title,
  sub,
  dark = false,
}: {
  title: string;
  sub?: string;
  dark?: boolean;
}) {
  return (
    <header className="mb-12 text-left" data-reveal>
      <h2
        className={`font-bold ${dark ? "text-white" : "text-foreground"}`}
        style={{
          fontSize: "clamp(30px, 4.2vw, 44px)",
          lineHeight: 1.12,
          letterSpacing: "-0.025em",
        }}
      >
        {title}
      </h2>
      {sub ? (
        <p
          className={`mt-4 ${dark ? "text-dark-muted" : "text-muted-foreground"}`}
          style={{ fontSize: 18.5, lineHeight: 1.55, maxWidth: 660 }}
        >
          {sub}
        </p>
      ) : null}
    </header>
  );
}

/**
 * Sektionsskal som på Elpoolen: samma bredd (1140 px), sidmarginal och luft
 * på alla sektioner, 80 px på mobil och 128 px på dator. När två sektioner i
 * rad har samma bakgrund sätts `flushTop` på den andra, så att mellanrummet
 * inte blir dubbelt. Styr luften med props, inte med pt-/pb-klasser i
 * className: lg:pt-32 här vinner över ett pt-0 utifrån.
 */
export function SectionShell({
  id,
  className = "",
  style,
  flushTop = false,
  children,
}: {
  id?: string;
  className?: string;
  style?: CSSProperties;
  flushTop?: boolean;
  children: ReactNode;
}) {
  const luft = flushTop ? "pt-0 pb-20 lg:pb-32" : "pt-20 pb-20 lg:pt-32 lg:pb-32";
  return (
    <section id={id} className={`${luft} ${className}`} style={style}>
      <div className="mx-auto w-full max-w-[1140px] px-6">{children}</div>
    </section>
  );
}
