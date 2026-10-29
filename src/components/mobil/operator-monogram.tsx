/**
 * Operatörens initialer i en rund bricka. Vi visar inte operatörernas
 * logotyper: namnet bär identiteten, och brickan hjälper ögat att hitta raden.
 * Färgen är alltid sajtens egen, så ingen operatör sticker ut i listan.
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
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-highlight font-display font-bold text-primary ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {INITIALER[namn] ?? initialer.charAt(0).toUpperCase() + initialer.slice(1).toLowerCase()}
    </span>
  );
}
