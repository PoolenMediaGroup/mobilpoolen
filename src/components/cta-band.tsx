import { Link } from "@tanstack/react-router";
import { Ersattningsrad } from "@/components/ersattningsrad";
import { bild, type Bildnyckel } from "@/lib/bildbank";
import { storMatt } from "@/lib/bildbank-matt";

/**
 * Sajtens avslutande CTA-band. Ett och samma utseende överallt: kant till kant,
 * bakgrundsbild med mörk övertoning, centrerad text och en enda orange knapp.
 *
 * Bandet bryter medvetet ut ur sidans container, så det ska ligga som ett eget
 * syskon direkt i <main>, inte inuti en maxbreddad div.
 *
 * Övertoningen är något mörkare än en ren dekorövertoning, så att vit text
 * håller kontrast även mot en ljus bild.
 */
export function CtaBand({
  rubrik,
  ingress,
  knapptext,
  to = "/",
  hash = "jamfor",
  bildnyckel,
}: {
  rubrik: string;
  ingress?: string;
  knapptext: string;
  to?: string;
  hash?: string;
  bildnyckel: Bildnyckel;
}) {
  const bakgrund = bild(bildnyckel);
  const knapp = knapptext;
  return (
    <section className="relative overflow-hidden" data-reveal>
      <div className="absolute inset-0">
        <picture>
          <source srcSet={bakgrund.webp} type="image/webp" />
          {/* Dekorbild: rubriken bär innebörden, därför tom alt. */}
          <img
            src={bakgrund.jpg}
            alt=""
            {...storMatt(bakgrund.nyckel)}
            aria-hidden
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in srgb, var(--scrim) 66%, transparent) 0%, color-mix(in srgb, var(--scrim) 86%, transparent) 100%)",
          }}
        />
      </div>
      {/* Samma luft som Elpoolens bildband: 80 px mobil, 112 px dator. */}
      <div className="relative mx-auto max-w-[1140px] px-6 py-20 text-center lg:py-28">
        <h2
          className="font-bold text-white"
          style={{
            fontSize: "clamp(30px, 4.2vw, 44px)",
            lineHeight: 1.12,
            letterSpacing: "-0.025em",
          }}
        >
          {rubrik}
        </h2>
        {ingress ? (
          <p
            className="text-[18px] leading-relaxed text-white"
            style={{ maxWidth: 640, margin: "20px auto 0" }}
          >
            {ingress}
          </p>
        ) : null}
        <div className="mt-10">
          <Link to={to as never} hash={hash} className="btn-cta inline-flex h-14 px-8 text-base">
            {knapp}
          </Link>
          {/* Upplysningen om ersättningen står vid knappen, där valet görs.
              Dämpad, men kontrollerad mot övertoningen: vit 70 procent ligger
              över 6:1 även mot en helvit bildpunkt här nere i bandet. */}
          <Ersattningsrad
            className="mt-4 text-[13px] leading-relaxed text-white/70"
            linkClassName="underline underline-offset-2 hover:text-white"
          />
        </div>
      </div>
    </section>
  );
}
