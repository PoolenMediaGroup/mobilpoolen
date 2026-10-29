/**
 * AI-chatten: den runda knappen nere till höger. Samma fil finns i Mobilpoolens repo.
 *
 * Knappen ritas först i webbläsaren och chattfönstret laddas först vid första
 * klicket, så chatten kostar nästan ingenting för sidor som inte använder den.
 * Med CHATT_PA = false syns knappen bara med ?chatt=1 i adressen.
 *
 * En liten bubbla bredvid knappen berättar att det är en chatt. Den visas en gång
 * per sidladdning efter några sekunder, försvinner av sig själv och går att stänga.
 * Den kommer inte ihåg något mellan besök (inget sparas i webbläsaren).
 */
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { MessageCircle, X } from "lucide-react";
import { CHATT_PA, CHATT_SAJT, CHATT_DOLD_PA } from "@/lib/chatt/sajt-klient";

const laddaPanel = () => import("./chatt-panel");
const ChattPanel = lazy(laddaPanel);

export function ChattKnapp() {
  const [synlig, setSynlig] = useState(false);
  const [oppen, setOppen] = useState(false);
  const [startad, setStartad] = useState(false);
  const [bubbla, setBubbla] = useState(false);
  const bubblaVisad = useRef(false);
  const knapp = useRef<HTMLButtonElement>(null);
  const sida = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (CHATT_PA) {
      setSynlig(true);
      return;
    }
    try {
      if (new URLSearchParams(window.location.search).get("chatt") === "1") setSynlig(true);
    } catch {
      /* ingen adress att läsa */
    }
  }, []);

  // Bubblan: efter 2,5 sekunder, i 12 sekunder, en gång per sidladdning. Inte på
  // mobil: där täcker den knappar och text längst ner i bild, och den runda
  // knappen räcker för att hitta chatten.
  useEffect(() => {
    if (!synlig || bubblaVisad.current) return;
    try {
      if (window.matchMedia("(max-width: 639px)").matches) return;
    } catch {
      /* matchMedia saknas, visa bubblan som vanligt */
    }
    const visa = window.setTimeout(() => {
      bubblaVisad.current = true;
      setBubbla(true);
    }, 2500);
    const gom = window.setTimeout(() => setBubbla(false), 14500);
    return () => {
      window.clearTimeout(visa);
      window.clearTimeout(gom);
    };
  }, [synlig]);

  const oppna = () => {
    setStartad(true);
    setBubbla(false);
    bubblaVisad.current = true;
    setOppen((o) => !o);
  };

  const stang = useCallback(() => {
    setOppen(false);
    window.setTimeout(() => knapp.current?.focus({ preventScroll: true }), 0);
  }, []);

  if (!synlig) return null;
  const dold = CHATT_DOLD_PA.test(sida);

  return (
    <>
      {startad ? (
        <Suspense fallback={null}>
          <ChattPanel oppen={oppen && !dold} onStang={stang} />
        </Suspense>
      ) : null}
      {!dold && bubbla && !oppen ? (
        <div className="chatt-bubbla fixed bottom-[1.6rem] right-[5.5rem] z-50 flex max-w-[calc(100vw-7rem)] items-center gap-1 rounded-2xl rounded-br-md border border-border bg-card py-1.5 pl-3.5 pr-1.5 text-[14px] text-foreground shadow-[0_10px_28px_-10px_rgba(12,42,49,0.4)] motion-safe:animate-[chatt-in_300ms_ease-out]">
          <button type="button" onClick={oppna} className="text-left font-medium leading-snug">
            {CHATT_SAJT.bubbla}
          </button>
          <button
            type="button"
            onClick={() => setBubbla(false)}
            aria-label="Dölj"
            className="grid size-7 shrink-0 place-items-center rounded-full text-foreground/50 hover:bg-secondary hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
      {dold ? null : (
        <button
          ref={knapp}
          type="button"
          onClick={oppna}
          onPointerEnter={() => void laddaPanel()}
          onFocus={() => void laddaPanel()}
          aria-expanded={oppen}
          aria-label={oppen ? "Stäng chatten" : `Öppna chatten med ${CHATT_SAJT.rubrik}`}
          className={`chatt-knapp fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_10px_28px_-8px_rgba(12,42,49,0.55)] ring-[3px] ring-white transition-[transform,background-color] duration-300 hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-primary/40 ${oppen ? "max-sm:hidden" : ""}`}
        >
          {oppen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <MessageCircle className="size-6" aria-hidden="true" />
          )}
        </button>
      )}
    </>
  );
}
