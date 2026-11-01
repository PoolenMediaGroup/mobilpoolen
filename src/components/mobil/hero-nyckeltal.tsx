import type { LucideIcon } from "lucide-react";
import {
  CalendarCheck,
  Gauge,
  Infinity as InfinityIcon,
  ListChecks,
  Signal,
  Smile,
  Sparkles,
  Tag,
  Wallet,
} from "lucide-react";

/** Ikon efter vad nyckeltalet handlar om, så att korten går att skumma. */
function ikonFor(varde: string, text: string): LucideIcon {
  const t = `${varde} ${text}`.toLowerCase();
  if (/ski|nöjd/.test(t)) return Smile;
  if (/kampanj|rabatt/.test(t)) return Tag;
  if (/bindning|månader|mån\b/.test(t) && !/kr/.test(varde.toLowerCase())) return CalendarCheck;
  if (/obegräns/.test(t)) return InfinityIcon;
  if (/\d+\s*gb|5g|mbit/.test(t)) return Signal;
  if (/kr/.test(varde.toLowerCase())) return Wallet;
  if (/abonnemang|operatör/.test(t)) return ListChecks;
  if (/%|gånger|×/.test(t)) return Gauge;
  return Sparkles;
}

/**
 * Ett nyckeltal i en mörk hero: glaskort med gradientkant, ikon och värdet i
 * gradienttext. Saknas värdet ("–") visas det dämpat, så att ett tomt kort
 * inte ser ut som en siffra.
 */
export function HeroNyckeltal({
  varde,
  text,
  ikon,
}: {
  varde: string;
  text: string;
  ikon?: LucideIcon;
}) {
  const Ikon = ikon ?? ikonFor(varde, text);
  const saknas = varde.trim() === "–" || varde.trim() === "-";
  return (
    <div className="group relative rounded-2xl bg-gradient-to-br from-white/30 via-white/10 to-[#e8842c]/30 p-px shadow-[0_24px_48px_-24px_rgba(4,6,24,0.7)] transition-transform duration-300 hover:-translate-y-0.5 motion-reduce:hover:translate-y-0">
      <div className="relative h-full overflow-hidden rounded-[15px] bg-[#1b1650]/85 px-4 py-3 backdrop-blur-md sm:px-5 sm:py-5">
        {/* Ljusfläck i hörnet som tänds vid hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#7c63ff]/30 blur-2xl transition-opacity duration-300 group-hover:opacity-100 sm:opacity-60"
        />
        <dt className="sr-only">{text}</dt>
        <dd className="relative flex items-center gap-3.5 sm:block">
          <span
            aria-hidden
            className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
              saknas
                ? "bg-white/10 text-white/50"
                : "bg-gradient-to-br from-[#7c63ff] to-primary text-white shadow-[0_8px_20px_-6px_rgba(124,99,255,0.8)]"
            }`}
          >
            <Ikon className="h-5 w-5" strokeWidth={2.2} />
          </span>
          <span className="min-w-0 sm:mt-4 sm:block">
            {saknas ? (
              <span className="block font-display text-[17px] font-semibold leading-tight text-white/60 sm:text-[19px]">
                Ingen uppgift
              </span>
            ) : (
              <span className="text-gradient-ljus block font-display text-[24px] font-bold leading-none tracking-tight sm:text-[34px]">
                {varde}
              </span>
            )}
            <span className="mt-1.5 block text-[13px] leading-snug text-white/70 sm:mt-2 sm:text-[14px]">
              {text}
            </span>
          </span>
        </dd>
      </div>
    </div>
  );
}
