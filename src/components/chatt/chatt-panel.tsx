/**
 * AI-chatten: själva chattfönstret. Laddas först när besökaren öppnar chatten.
 * Samma fil finns i Mobilpoolens repo. Texter och knappar per sajt ligger i
 * src/lib/chatt/sajt-klient.ts, formulär i chatten i chatt-formular.tsx.
 *
 * Samtalet finns bara i minnet så länge sidan är öppen. Inget sparas i webbläsaren.
 */
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { ArrowUp, RotateCcw, X } from "lucide-react";
import { ChattFormular } from "./chatt-formular";
import { ChattText } from "./chatt-text";
import { nyttSamtalsId, skickaTillChatten } from "@/lib/chatt/klient";
import {
  arForLangt,
  CHATT_FELTEXT,
  CHATT_GRANSER,
  type ChattAtgard,
  type ChattFelkod,
  type ChattMeddelande,
} from "@/lib/chatt/protokoll";
import { CHATT_SAJT } from "@/lib/chatt/sajt-klient";

type Rad = {
  roll: "user" | "assistant";
  text: string;
  atgarder: ChattAtgard[];
  fel?: ChattFelkod;
};

type Props = {
  oppen: boolean;
  onStang: () => void;
};

const SMAL = "(max-width: 639px)";

export default function ChattPanel({ oppen, onStang }: Props) {
  const router = useRouter();
  const sida = useRouterState({ select: (s) => s.location.pathname });
  const [rader, setRader] = useState<Rad[]>([]);
  const [utkast, setUtkast] = useState("");
  const [skriver, setSkriver] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [annons, setAnnons] = useState("");
  const samtalId = useRef(nyttSamtalsId());
  const avbryt = useRef<AbortController | null>(null);
  const lista = useRef<HTMLDivElement>(null);
  const falt = useRef<HTMLTextAreaElement>(null);
  const folj = useRef(true);
  const skickar = useRef(false);
  const panel = useRef<HTMLDivElement>(null);
  const [smal, setSmal] = useState(false);

  // Fokus i skrivfältet när chatten öppnas. Escape stänger.
  useEffect(() => {
    if (!oppen) return;
    const t = window.setTimeout(() => falt.current?.focus({ preventScroll: true }), 60);
    const tangent = (e: KeyboardEvent) => {
      const inne = panel.current?.contains(document.activeElement);
      if (e.key === "Escape" && inne) onStang();
      // På mobil täcker chatten skärmen: håll tabbningen inne i chatten.
      if (e.key === "Tab" && inne && window.matchMedia(SMAL).matches && panel.current) {
        const fokuserbara = panel.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input:not([tabindex="-1"]), [tabindex]:not([tabindex="-1"])',
        );
        const forsta = fokuserbara[0];
        const sista = fokuserbara[fokuserbara.length - 1];
        if (e.shiftKey && document.activeElement === forsta) {
          e.preventDefault();
          sista?.focus();
        } else if (!e.shiftKey && document.activeElement === sista) {
          e.preventDefault();
          forsta?.focus();
        }
      }
    };
    window.addEventListener("keydown", tangent);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", tangent);
    };
  }, [oppen, onStang]);

  // På mobil täcker chatten skärmen. Då ska sidan bakom inte scrolla.
  useEffect(() => {
    const mq = window.matchMedia(SMAL);
    const uppdatera = () => setSmal(mq.matches);
    uppdatera();
    mq.addEventListener("change", uppdatera);
    return () => mq.removeEventListener("change", uppdatera);
  }, []);
  useEffect(() => {
    if (!oppen || !smal) return;
    const html = document.documentElement.style.overflow;
    const body = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = html;
      document.body.style.overflow = body;
    };
  }, [oppen, smal]);

  useEffect(() => () => avbryt.current?.abort(), []);

  // Följ med nedåt medan svaret skrivs, men bara om besökaren redan är längst ner.
  useLayoutEffect(() => {
    const el = lista.current;
    if (el && folj.current) el.scrollTop = el.scrollHeight;
  }, [rader, status, skriver]);

  const onScroll = () => {
    const el = lista.current;
    if (el) folj.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const oppnaLank = useCallback(
    (href: string) => {
      if (window.matchMedia(SMAL).matches) onStang();
      void router.navigate({ href });
    },
    [router, onStang],
  );

  const skicka = useCallback(
    async (textIn: string, igen = false) => {
      const text = textIn.trim().slice(0, CHATT_GRANSER.maxFraga);
      // Spärren är en ref, inte state, så att två snabba Enter inte hinner skicka två gånger.
      if (!text || skickar.current) return;

      const bas = utanMisslyckade(igen ? rader.slice(0, -2) : rader);
      const tidigare: ChattMeddelande[] = bas
        .filter((r) => r.text.trim())
        .map((r) => ({ roll: r.roll, text: r.text }));
      const samtal: ChattMeddelande[] = [...tidigare, { roll: "user", text }];
      if (arForLangt(samtal)) {
        setRader((r) => [...r, { roll: "assistant", text: "", atgarder: [], fel: "for_langt" }]);
        return;
      }

      skickar.current = true;
      folj.current = true;
      setUtkast("");
      if (falt.current) falt.current.style.height = "";
      setSkriver(true);
      setStatus(null);
      setRader([
        ...bas,
        { roll: "user", text, atgarder: [] },
        { roll: "assistant", text: "", atgarder: [] },
      ]);

      const ac = new AbortController();
      avbryt.current = ac;
      const uppdatera = (f: (r: Rad) => Rad) =>
        setRader((alla) => {
          const kopia = alla.slice();
          kopia[kopia.length - 1] = f(kopia[kopia.length - 1]);
          return kopia;
        });

      let slutText = "";
      await skickaTillChatten({
        samtal,
        sida,
        samtalId: samtalId.current,
        signal: ac.signal,
        pa: (h) => {
          if (h.t === "text") {
            slutText += h.d;
            setStatus(null);
            uppdatera((r) => ({ ...r, text: r.text + h.d }));
          } else if (h.t === "status") {
            setStatus(h.d);
          } else if (h.t === "atgard") {
            uppdatera((r) =>
              r.atgarder.some((a) => a.id === h.atgard.id)
                ? r
                : { ...r, atgarder: [...r.atgarder, h.atgard] },
            );
          } else if (h.t === "fel") {
            uppdatera((r) => ({ ...r, fel: h.kod }));
          }
        },
      });
      if (ac.signal.aborted) return;
      skickar.current = false;
      avbryt.current = null;
      setStatus(null);
      setSkriver(false);
      if (slutText) setAnnons(slutText);
      window.setTimeout(() => falt.current?.focus({ preventScroll: true }), 0);
    },
    [rader, sida],
  );

  const borjaOm = () => {
    avbryt.current?.abort();
    avbryt.current = null;
    skickar.current = false;
    samtalId.current = nyttSamtalsId();
    setRader([]);
    setSkriver(false);
    setStatus(null);
    setUtkast("");
    falt.current?.focus();
  };

  const sistaFragan = [...rader].reverse().find((r) => r.roll === "user")?.text ?? "";
  const tomt = rader.length === 0;

  return (
    <div
      ref={panel}
      role="dialog"
      aria-modal={smal}
      aria-label={CHATT_SAJT.rubrik}
      hidden={!oppen}
      className="chatt-panel fixed inset-0 z-[1000] flex flex-col bg-card text-card-foreground sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[min(640px,calc(100dvh-11rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-2xl sm:border sm:border-border sm:shadow-[0_24px_60px_-12px_rgba(12,42,49,0.35)]"
    >
      <header className="flex items-center gap-3 bg-dark-section px-4 pb-3.5 pt-[max(0.875rem,env(safe-area-inset-top))] text-white">
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/12 font-display text-[13px] font-semibold"
        >
          AI
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-[15px] font-semibold leading-tight">
            {CHATT_SAJT.rubrik}
          </p>
          <p className="text-[12.5px] leading-tight text-white/70">Svarar direkt, dygnet runt</p>
        </div>
        {!tomt ? (
          <button
            type="button"
            onClick={borjaOm}
            className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="Börja om samtalet"
            title="Börja om"
          >
            <RotateCcw className="size-[18px]" aria-hidden="true" />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onStang}
          className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Stäng chatten"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </header>

      <div
        ref={lista}
        onScroll={onScroll}
        className="flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-5 text-[15px] leading-relaxed"
      >
        <Bubbla roll="assistant">
          <p>{CHATT_SAJT.valkomst}</p>
        </Bubbla>

        {tomt ? (
          <div className="flex flex-wrap gap-2 pl-1" aria-label="Förslag på frågor">
            {CHATT_SAJT.snabbval.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => void skicka(f)}
                className="rounded-full border border-primary/25 bg-card px-3.5 py-2 text-left text-[14px] font-medium text-primary transition-colors hover:border-primary/50 hover:bg-secondary"
              >
                {f}
              </button>
            ))}
          </div>
        ) : null}

        {rader.map((r, i) => {
          const sista = i === rader.length - 1;
          if (r.roll === "user") {
            return (
              <Bubbla key={i} roll="user">
                <p className="whitespace-pre-wrap break-words">{r.text}</p>
              </Bubbla>
            );
          }
          if (!r.text && !r.fel && sista && skriver) {
            return <Laddar key={i} status={status} />;
          }
          return (
            <div key={i} className="space-y-3">
              {r.text ? (
                <Bubbla roll="assistant">
                  <ChattText text={r.text} onLank={oppnaLank} />
                </Bubbla>
              ) : null}
              {sista && skriver && status ? <Laddar status={status} /> : null}
              {r.fel ? (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl bg-destructive/8 px-3.5 py-2.5 text-[14px] text-foreground/85">
                  <span>{CHATT_FELTEXT[r.fel]}</span>
                  {sista &&
                  r.fel !== "for_langt" &&
                  r.fel !== "dagstak" &&
                  r.fel !== "inte_igang" ? (
                    <button
                      type="button"
                      onClick={() => void skicka(sistaFragan, true)}
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Försök igen
                    </button>
                  ) : null}
                  {r.fel === "for_langt" ? (
                    <button
                      type="button"
                      onClick={borjaOm}
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      Börja om
                    </button>
                  ) : null}
                  {r.fel === "inte_igang" || r.fel === "dagstak" ? (
                    <a
                      href={`mailto:${CHATT_SAJT.kontaktEpost}`}
                      className="font-semibold text-primary underline underline-offset-2"
                    >
                      {CHATT_SAJT.kontaktEpost}
                    </a>
                  ) : null}
                </div>
              ) : null}
              {r.atgarder.length > 0 && (!sista || !skriver) ? (
                <div className="flex flex-wrap gap-2 pl-1">
                  {r.atgarder.map((a, j) =>
                    a.href ? (
                      <a
                        key={a.id}
                        href={a.href}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                          e.preventDefault();
                          oppnaLank(a.href!);
                        }}
                        className={
                          j === 0
                            ? "inline-flex min-h-11 items-center rounded-xl bg-cta px-4 font-display text-[14.5px] font-semibold text-cta-foreground shadow-[0_6px_16px_-6px_rgba(232,132,44,0.6)] transition-colors hover:bg-cta-hover"
                            : "inline-flex min-h-11 items-center rounded-xl border border-primary/30 bg-card px-4 font-display text-[14.5px] font-semibold text-primary transition-colors hover:bg-secondary"
                        }
                      >
                        {a.etikett}
                      </a>
                    ) : (
                      <ChattFormular key={a.id} atgard={a} sida={sida} />
                    ),
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void skicka(utkast);
        }}
        className="border-t border-border bg-card px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-input bg-background px-3 py-1.5 transition-colors focus-within:border-primary/60">
          <label htmlFor="chatt-falt" className="sr-only">
            Skriv din fråga
          </label>
          <textarea
            id="chatt-falt"
            ref={falt}
            rows={1}
            value={utkast}
            maxLength={CHATT_GRANSER.maxFraga}
            onChange={(e) => {
              setUtkast(e.target.value);
              const el = e.target;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                void skicka(utkast);
              }
            }}
            placeholder="Skriv din fråga"
            className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[16px] leading-snug text-foreground outline-none placeholder:text-foreground/45 sm:text-[15px]"
          />
          <button
            type="submit"
            disabled={!utkast.trim() || skriver}
            aria-label="Skicka"
            className="mb-1 grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-35"
          >
            <ArrowUp className="size-[18px]" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-2 px-1 text-[12px] leading-snug text-foreground/55">
          Svaren skapas av AI och kan bli fel. Skriv inga personuppgifter.{" "}
          <a
            href={CHATT_SAJT.integritet}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              oppnaLank(CHATT_SAJT.integritet);
            }}
            className="underline underline-offset-2 hover:text-foreground/80"
          >
            Så hanterar vi chatten
          </a>
        </p>
      </form>

      <p aria-live="polite" className="sr-only">
        {annons}
      </p>
    </div>
  );
}

/** Tar bort frågor som inte fick något svar, så att samtalet till servern håller ihop. */
function utanMisslyckade(rader: Rad[]): Rad[] {
  const ut: Rad[] = [];
  for (const r of rader) {
    if (r.fel) {
      if (ut[ut.length - 1]?.roll === "user") ut.pop();
      continue;
    }
    if (r.roll === "assistant" && !r.text.trim()) {
      if (ut[ut.length - 1]?.roll === "user") ut.pop();
      continue;
    }
    ut.push(r);
  }
  return ut;
}

function Bubbla({ roll, children }: { roll: "user" | "assistant"; children: ReactNode }) {
  return roll === "user" ? (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-primary-foreground">
        {children}
      </div>
    </div>
  ) : (
    <div className="flex">
      <div className="max-w-[92%] rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5 text-foreground">
        {children}
      </div>
    </div>
  );
}

function Laddar({ status }: { status: string | null }) {
  return (
    <div className="flex items-center gap-2.5 pl-1 text-[13.5px] text-foreground/60" role="status">
      <span className="chatt-prickar flex gap-1" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span>{status ?? "Skriver"}</span>
    </div>
  );
}
