import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { bild } from "@/lib/bildbank";
import { litenMatt, storMatt } from "@/lib/bildbank-matt";
import { KATEGORI_BAKGRUND, nyhetsdatum, textdelar, type Nyhet } from "@/lib/nyheter";

/**
 * Nyckeltalsytan: nyhetens foto (eller indigo bakgrund om foto saknas) med
 * kategori och nyhetens viktigaste siffra ovanpå. Används på kortet och överst
 * i nyheten.
 */
export function NyckeltalYta({ nyhet, stor = false }: { nyhet: Nyhet; stor?: boolean }) {
  const b = nyhet.bild ? bild(nyhet.bild) : null;
  const matt = b ? (stor ? storMatt(b.nyckel) : litenMatt(b.nyckel)) : null;
  return (
    <div
      className={`relative flex h-full flex-col justify-between overflow-hidden text-white ${
        stor ? "p-7 sm:p-9" : "p-6"
      }`}
      style={{ background: KATEGORI_BAKGRUND[nyhet.kategori] }}
    >
      {b && matt ? (
        <>
          <picture>
            <source srcSet={stor ? b.webp : b.thumbWebp} type="image/webp" />
            <img
              src={stor ? b.jpg : b.thumb}
              alt={b.alt}
              {...matt}
              loading={stor ? "eager" : "lazy"}
              fetchPriority={stor ? "high" : undefined}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:group-hover:scale-100"
            />
          </picture>
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(22,19,58,0.15) 0%, rgba(22,19,58,0.4) 45%, rgba(22,19,58,0.88) 100%)",
            }}
          />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-20 h-[260px] w-[260px] rounded-full"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
      )}
      <span className="relative inline-flex w-fit items-center rounded-full bg-[rgba(22,19,58,0.55)] px-3 py-1 text-[12px] font-semibold text-white backdrop-blur-sm">
        {nyhet.kategori}
      </span>
      <div className="relative">
        <p
          className="font-bold"
          style={{
            fontSize: stor ? "clamp(40px, 6vw, 60px)" : 36,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            textShadow: b ? "0 2px 12px rgba(0,0,0,0.35)" : undefined,
          }}
        >
          {nyhet.nyckeltal.varde.replace(/ /g, " ")}
        </p>
        <p className={`mt-1 text-white/90 ${stor ? "text-[16px]" : "text-[14px]"}`}>
          {nyhet.nyckeltal.text}
        </p>
      </div>
    </div>
  );
}

export function NyhetKort({ nyhet }: { nyhet: Nyhet }) {
  return (
    <Link
      to="/nyheter/$slug"
      params={{ slug: nyhet.slug }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[translate,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_48px_-12px_rgba(22,19,58,0.25)] motion-reduce:hover:translate-y-0"
    >
      <div className="aspect-[2/1] w-full">
        <NyckeltalYta nyhet={nyhet} />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-[14px] text-muted-foreground">
          {nyhet.avsandare},{" "}
          <time dateTime={nyhet.handelseIso}>{nyhetsdatum(nyhet.handelseIso)}</time>
        </p>
        <h2 className="mt-2 text-[17px] font-semibold text-foreground">{nyhet.titel}</h2>
        <p className="mt-2 line-clamp-3 text-[15px] text-muted-foreground">{nyhet.ingress}</p>
        <span className="mt-auto pt-3 text-[14px] font-semibold text-primary">Läs nyheten →</span>
      </div>
    </Link>
  );
}

/** Brödtext med [text](/sökväg)-länkar. */
export function NyhetText({ text }: { text: string }) {
  return (
    <>
      {textdelar(text).map((d, i) =>
        d.href ? (
          d.href.startsWith("/") ? (
            <Link
              key={i}
              to={d.href as never}
              className="text-primary underline underline-offset-2"
            >
              {d.text}
            </Link>
          ) : (
            <a
              key={i}
              href={d.href}
              rel="noopener"
              className="text-primary underline underline-offset-2"
            >
              {d.text}
            </a>
          )
        ) : (
          <Fragment key={i}>{d.text}</Fragment>
        ),
      )}
    </>
  );
}
