import { Link } from "@tanstack/react-router";
import { OFFERT_OPPEN } from "@/lib/lansering";

/**
 * Upplysningen om ersättningen, direkt under knappar som leder till en
 * operatör vi har avtal med.
 *
 * Före lansering (OFFERT_OPPEN = false) har vi inga avtal och får ingen
 * ersättning. Då visas raden inte alls. `partner` skickas av knappar som leder
 * till en viss operatör: raden visas bara när just den operatören är partner.
 */
export function Ersattningsrad({
  className = "mt-3 text-[13px] leading-relaxed text-foreground/60",
  linkClassName = "underline underline-offset-2 hover:text-primary",
  partner = true,
}: {
  className?: string;
  linkClassName?: string;
  partner?: boolean;
}) {
  if (!OFFERT_OPPEN || !partner) return null;
  return (
    <p className={className}>
      Gratis för dig. Vi kan få{" "}
      <Link to="/sa-tjanar-vi-pengar" className={linkClassName}>
        ersättning
      </Link>{" "}
      av operatören.
    </p>
  );
}
