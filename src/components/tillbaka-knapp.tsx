/**
 * Flytande knapp på startsidan som tar besökaren tillbaka till jämförelsen
 * (Leons önskemål 1 nov 2026, samma knapp och regler som på Elpoolen och Larmpoolen).
 *
 * Syns bara när räknaren i heron har scrollats förbi uppåt. Försvinner när
 * den syns igen, när sidfoten kommer in i bild (annars går sidfoten inte att
 * läsa) och medan chatten eller dess hälsningsbubbla syns (regel i styles.css).
 * Det som är ifyllt i räknaren ligger kvar, eftersom knappen bara scrollar inom sidan.
 *
 * Placering: vänster nere på mobil så den inte krockar med chattknappen till
 * höger, centrerad från surfplatta och uppåt.
 */
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function TillbakaKnapp({
  malId,
}: {
  /** id på elementet knappen leder till. */ malId: string;
}) {
  const [forbi, setForbi] = useState(false);
  const [vidSidfot, setVidSidfot] = useState(false);
  const [harResultat, setHarResultat] = useState(false);
  const synlig = forbi && !vidSidfot;

  useEffect(() => {
    const el = document.getElementById(malId);
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([e]) => {
        // Bara när målet ligger ovanför skärmen, inte innan besökaren nått det.
        const ovanfor = !e.isIntersecting && e.boundingClientRect.bottom < 0;
        setForbi(ovanfor);
        // Har besökaren räknat ut ett svar heter knappen "resultatet".
        if (ovanfor) setHarResultat(!!el.querySelector("[data-resultat]"));
      },
      { threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [malId]);

  // Dold så fort sidfoten syns, så att den går att läsa längst ner.
  useEffect(() => {
    const sidfot = document.querySelector("footer");
    if (!sidfot || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([e]) => setVidSidfot(e.isIntersecting), {
      threshold: 0,
    });
    obs.observe(sidfot);
    return () => obs.disconnect();
  }, []);

  const tillMalet = () =>
    document.getElementById(malId)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div
      className={`tillbaka-knapp pointer-events-none fixed bottom-5 left-4 z-40 sm:left-1/2 sm:-translate-x-1/2 transition-[opacity,translate] duration-300 motion-reduce:transition-none ${
        synlig ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      aria-hidden={!synlig}
    >
      <button
        type="button"
        tabIndex={synlig ? 0 : -1}
        onClick={tillMalet}
        className="pointer-events-auto inline-flex h-14 items-center gap-2 rounded-full bg-cta px-6 text-[16px] font-semibold text-cta-foreground shadow-[0_10px_28px_-8px_rgba(22,19,58,0.45)] ring-[3px] ring-white transition-colors hover:bg-cta-hover focus-visible:outline-none focus-visible:ring-primary/40"
        style={{ pointerEvents: synlig ? "auto" : "none" }}
      >
        <ArrowUp className="size-5" aria-hidden />
        {harResultat ? "Tillbaka till resultatet" : "Tillbaka till jämförelsen"}
      </button>
    </div>
  );
}
