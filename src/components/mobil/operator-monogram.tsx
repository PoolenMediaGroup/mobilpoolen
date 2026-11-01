import { logotyp } from "@/lib/mobil/logotyper";

/**
 * Operatörens logotyp i en vit bricka (lika stor för alla, så att raderna
 * linjerar). Saknar vi logotypen visas initialerna i en rund bricka i stället.
 * Namnet står alltid bredvid i text, så brickan är dold för skärmläsare.
 */
/** Fasta initialer där de automatiska skulle krocka (Telia, Tele2, Telenor). */
const INITIALER: Record<string, string> = {
  Telia: "Ta",
  Tele2: "T2",
  Telenor: "Tn",
  Tre: "3",
  Comviq: "Cq",
  "Tellus Mobil": "Tm",
  "Lyca Mobile": "Ly",
  "My Beat": "MB",
  Halebop: "Hb",
  Telavox: "Tx",
};

export function OperatorMonogram({
  namn,
  size = 44,
  className = "",
}: {
  namn: string;
  size?: number;
  className?: string;
}) {
  const logo = logotyp(namn);
  if (logo) {
    const bredd = Math.round(size * 1.8);
    return (
      <span
        aria-hidden
        className={`inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-white ${className}`}
        style={{ width: bredd, height: size, padding: Math.max(4, Math.round(size * 0.14)) }}
      >
        <img
          src={logo.src}
          alt=""
          width={logo.w}
          height={logo.h}
          loading="lazy"
          decoding="async"
          className="block h-full w-full object-contain"
        />
      </span>
    );
  }
  const ord = namn
    .replace(/[^\p{L}\p{N} ]/gu, "")
    .split(/\s+/)
    .filter(Boolean);
  const initialer =
    INITIALER[namn] ??
    (ord.length >= 2 && !/^\d/.test(ord[0])
      ? `${ord[0][0]}${ord[1][0]}`
      : namn.replace(/[^\p{L}\p{N}]/gu, "").slice(0, 2));
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-highlight font-display font-bold text-primary ${className}`}
      style={{ width: Math.round(size * 1.8), height: size, fontSize: Math.round(size * 0.38) }}
    >
      {INITIALER[namn] ?? initialer.charAt(0).toUpperCase() + initialer.slice(1).toLowerCase()}
    </span>
  );
}
