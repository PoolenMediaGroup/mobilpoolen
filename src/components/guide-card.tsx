import { Link } from "@tanstack/react-router";
import {
  ArrowLeftRight,
  Building2,
  Clock,
  Plane,
  ReceiptText,
  ShieldCheck,
  Signal,
  Users,
} from "lucide-react";
import { getGuideImage, type GuideImage } from "@/lib/guide-images";
import { type GuideMeta } from "@/lib/guides";
import { litenMatt } from "@/lib/bildbank-matt";

/** Ikon per kategori på platshållaren, så att kortet utan bild ser avsiktligt ut. */
const KATEGORI_IKON = {
  "Pris och avtal": ReceiptText,
  "Surf och nät": Signal,
  "Byta och säga upp": ArrowLeftRight,
  Utland: Plane,
  "Familj och målgrupper": Users,
  "Säkerhet och rättigheter": ShieldCheck,
  "För företag": Building2,
} as const;

export function GuideCard({
  guide,
  bild,
  kompakt = false,
}: {
  guide: GuideMeta;
  /**
   * Kompakt på mobil (under 640 px): liten bild till vänster, rubrik och lästid.
   * Används på /guider, där 90 kort i full storlek blev 39 000 px långt.
   */
  kompakt?: boolean;
  /**
   * Bilden på kortet. Utelämnad: guidens egen bild. null: tonad platshållare,
   * för listor där guidens bild redan syns på ett annat kort (se
   * unikaKortbilder i guide-images.ts).
   */
  bild?: GuideImage | null;
}) {
  const img = bild === undefined ? getGuideImage(guide.slug) : bild;
  const Ikon = KATEGORI_IKON[guide.category] ?? ShieldCheck;
  return (
    <Link
      to={`/guider/${guide.slug}` as never}
      // Som på Elpoolen: lyfter 2 px med sajtens långsamma tempo, bara transform och skugga animeras.
      className={`group overflow-hidden rounded-2xl bg-surface ${kompakt ? "flex max-sm:items-stretch sm:block" : "block"} shadow-kort hover:shadow-kort-hover hover:-translate-y-0.5 transition-[translate,box-shadow] duration-(--elp-dur-slow) motion-reduce:hover:translate-y-0`}
    >
      <div
        className={`relative overflow-hidden ${kompakt ? "max-sm:w-28 max-sm:shrink-0 max-sm:rounded-l-2xl sm:w-full sm:rounded-t-2xl sm:aspect-[2/1]" : "w-full rounded-t-2xl aspect-[2/1]"}`}
      >
        {img ? (
          <picture className="block h-full">
            <source srcSet={img.thumbWebp} type="image/webp" />
            <img
              src={img.thumb}
              alt={img.alt}
              {...litenMatt(img.nyckel)}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 motion-reduce:group-hover:scale-100"
            />
          </picture>
        ) : (
          // Tonad platshållare, som Elpoolens kort utan bild: marinblå ton med
          // kategorins ikon. Dekor, därför aria-hidden och ingen alt-text.
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundImage:
                "radial-gradient(110% 90% at 100% 0%, color-mix(in srgb, var(--primary) 9%, transparent) 0%, transparent 60%), linear-gradient(135deg, color-mix(in srgb, var(--dark-section) 7%, var(--muted)) 0%, color-mix(in srgb, var(--dark-section) 14%, var(--muted)) 100%)",
            }}
            aria-hidden
          >
            <Ikon className="h-10 w-10 text-dark-section/30" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className={kompakt ? "min-w-0 p-6 max-sm:px-4 max-sm:py-3" : "p-6"}>
        <div className={`flex items-center gap-2 flex-wrap ${kompakt ? "max-sm:hidden" : ""}`}>
          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-[12px] font-medium text-foreground">
            {guide.category}
          </span>
          <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {guide.readingTime}
          </span>
        </div>
        <h3
          className={`mt-3 text-[17px] font-semibold text-foreground transition-colors ${kompakt ? "max-sm:mt-0 max-sm:text-[15.5px] max-sm:leading-snug" : ""}`}
        >
          {guide.title}
        </h3>
        {kompakt ? (
          <span className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-foreground/65 sm:hidden">
            <Clock className="w-3.5 h-3.5" aria-hidden />
            {guide.readingTime}
          </span>
        ) : null}
        <p
          className={`mt-2 text-[14px] text-muted-foreground line-clamp-2 ${kompakt ? "max-sm:hidden" : ""}`}
        >
          {guide.excerpt}
        </p>
        <span
          className={`inline-block mt-3 text-[13px] font-semibold text-primary ${kompakt ? "max-sm:hidden" : ""}`}
        >
          Läs mer →
        </span>
      </div>
    </Link>
  );
}
