import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calculator,
  Radio,
  Scale,
  Sparkles,
  Tag,
  Wallet,
} from "lucide-react";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { OPERATORER } from "@/lib/mobil/data";

/** Ikon efter vart länken går, så att korten går att skumma. */
function ikonFor(href: string): LucideIcon {
  if (href.startsWith("/nat")) return Radio;
  if (href.startsWith("/guider")) return BookOpen;
  if (href.startsWith("/jamfor")) return Scale;
  if (href.startsWith("/kampanjer")) return Tag;
  if (href.startsWith("/verktyg")) return Calculator;
  if (href.startsWith("/foretag")) return Building2;
  if (/billig|pris/.test(href)) return Wallet;
  return Sparkles;
}

/**
 * Länkkort för "Läs vidare" och liknande listor. Pekar kortet på en operatör
 * visas operatörens logotyp, annars en ikon efter målet. Kortet lyfts och får en
 * gradientkant vid hover, och pilen glider ut.
 */
export function LankKort({ href, label, text }: { href: string; label: string; text?: string }) {
  const opSlug = href.match(/^\/operatorer\/([^/#?]+)/)?.[1];
  const op = opSlug ? OPERATORER.find((o) => o.slug === opSlug) : undefined;
  const Ikon = ikonFor(href);
  return (
    <Link
      to={href as never}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-kort-litet transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_44px_-20px_rgba(59,40,204,0.45)] motion-reduce:hover:translate-y-0 sm:p-6"
    >
      {/* Gradientlinje i underkanten som växer fram vid hover. */}
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-primary via-[#7c63ff] to-[#e8842c] transition-transform duration-500 group-hover:scale-x-100"
      />
      <span className="flex items-center gap-3.5">
        {op ? (
          <OperatorMonogram namn={op.namn} size={40} />
        ) : (
          <span
            aria-hidden
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-highlight text-primary transition-colors duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-[#7c63ff] group-hover:text-white"
          >
            <Ikon className="h-5 w-5" strokeWidth={2.2} />
          </span>
        )}
        <span className="min-w-0 flex-1 font-display text-[17.5px] font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {label}
        </span>
        <span
          aria-hidden
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-foreground/70 transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-primary group-hover:text-white"
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      </span>
      {text && (
        <span className="mt-3 text-[14.5px] leading-relaxed text-foreground/70">{text}</span>
      )}
    </Link>
  );
}
