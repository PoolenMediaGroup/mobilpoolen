import { Link } from "@tanstack/react-router";
import { logotyp } from "@/lib/mobil/logotyper";

export type LogoOperator = { slug: string; namn: string };

/**
 * Logoraden under startsidans hero, byggd som Elpoolens PartnerLogoStrip:
 * rubrik i mitten, logotyp med namn under på dator och en rad som rullar av
 * sig själv i mobilen. Varje logotyp länkar till operatörens sida.
 * Operatörer utan logotyp hoppas över.
 */
export function OperatorLogoRad({
  operatorer,
  rubrik,
}: {
  operatorer: readonly LogoOperator[];
  rubrik: string;
}) {
  const med = operatorer.filter((o) => logotyp(o.slug));
  return (
    <section className="bg-surface py-10 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center font-sans text-[12px] font-normal uppercase tracking-[0.08em] text-primary/60 sm:mb-10">
          {rubrik}
        </h2>

        {/* Mobil: en rad som rullar. Andra varvet är en kopia för en sömlös loop. */}
        <div className="elp-marquee sm:hidden">
          <div className="elp-marquee-track">
            {[0, 1].map((kopia) => (
              <ul
                key={kopia}
                className="flex shrink-0 items-center"
                aria-hidden={kopia === 1 || undefined}
              >
                {med.map((o) => {
                  const l = logotyp(o.slug)!;
                  return (
                    <li key={o.slug} className="flex h-10 shrink-0 items-center pr-10">
                      <img
                        src={l.src}
                        width={l.w}
                        height={l.h}
                        alt={o.namn}
                        loading="eager"
                        className="block h-auto max-h-7 w-auto max-w-[110px] object-contain"
                      />
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>

        {/* Surfplatta och dator: rutnät med namn under logotypen. */}
        <ul className="mx-auto hidden max-w-[1180px] flex-wrap justify-center gap-x-8 gap-y-10 sm:flex">
          {med.map((o) => {
            const l = logotyp(o.slug)!;
            return (
              <li key={o.slug} className="w-[150px]">
                <Link
                  to="/operatorer/$slug"
                  params={{ slug: o.slug }}
                  className="group flex flex-col items-center gap-3"
                >
                  <span className="flex h-12 w-full items-center justify-center">
                    <img
                      src={l.src}
                      width={l.w}
                      height={l.h}
                      alt={o.namn}
                      loading="lazy"
                      decoding="async"
                      className="block h-auto max-h-9 w-auto max-w-[130px] object-contain transition-transform group-hover:scale-105"
                    />
                  </span>
                  <span className="whitespace-nowrap text-center text-[12px] font-medium leading-4 text-muted-foreground group-hover:text-primary">
                    {o.namn}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
