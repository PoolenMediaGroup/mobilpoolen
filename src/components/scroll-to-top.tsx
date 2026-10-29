import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useRouter } from "@tanstack/react-router";

function findHashEl(hash: string): Element | null {
  if (!hash) return null;
  try {
    return document.querySelector(hash);
  } catch {
    return null;
  }
}

// Väntar på att målet renderats och scrollar om tills positionen är stabil,
// så att sen inladdning av innehåll ovanför inte skjuter ner sektionen.
function scrollToHashUntilSettled(hash: string): () => void {
  let cancelled = false;
  let stableCount = 0;
  let lastTop = Number.NaN;

  const tick = () => {
    if (cancelled) return;
    const el = findHashEl(hash);
    if (el) {
      const topBefore = el.getBoundingClientRect().top;
      if (Math.abs(topBefore - lastTop) > 1 || stableCount < 2) {
        el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
      }
      const topAfter = el.getBoundingClientRect().top;
      if (Number.isFinite(lastTop) && Math.abs(topAfter - lastTop) <= 1) {
        stableCount += 1;
      } else {
        stableCount = 0;
      }
      lastTop = topAfter;
      if (stableCount >= 3) return; // positionen har stabiliserats
    }
    window.setTimeout(tick, 100);
  };

  const frame = requestAnimationFrame(tick);
  // Hårddäck: avbryt efter 2,5 s oavsett.
  const hardStop = window.setTimeout(() => {
    cancelled = true;
  }, 2500);

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    clearTimeout(hardStop);
  };
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

// Sparade scrollpositioner per historikpost, så att bakåt och framåt
// hamnar där besökaren var. sessionStorage gör att det fungerar även när
// besökaren kommer tillbaka från en annan sajt.
const STORAGE_PREFIX = "lp-scroll:";

function historyKey(state: unknown): string | null {
  if (!state || typeof state !== "object") return null;
  const s = state as { __TSR_key?: string; key?: string };
  return s.__TSR_key ?? s.key ?? null;
}

function savePosition(key: string | null) {
  if (!key) return;
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(Math.round(window.scrollY)));
  } catch {
    /* ignore */
  }
}

function readPosition(key: string | null): number | null {
  if (!key) return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    const y = raw === null ? Number.NaN : Number(raw);
    return Number.isFinite(y) ? y : null;
  } catch {
    return null;
  }
}

// Återställ en sparad position. Sidan kan vara kortare än positionen tills
// innehållet har renderats, så försök några bildrutor till. Avbryt så fort
// besökaren själv scrollar, så att vi aldrig drar tillbaka någon som läser.
function restorePosition(y: number): () => void {
  let cancelled = false;
  let frame = 0;
  const started = performance.now();
  const stop = () => {
    cancelled = true;
  };
  const userEvents = ["wheel", "touchstart", "keydown", "mousedown"] as const;
  userEvents.forEach((e) => window.addEventListener(e, stop, { passive: true, once: true }));

  const tick = () => {
    if (cancelled) return;
    window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
    const reached = Math.abs(window.scrollY - y) <= 1;
    if (!reached && performance.now() - started < 1000) {
      frame = requestAnimationFrame(tick);
    }
  };
  tick();

  return () => {
    cancelled = true;
    cancelAnimationFrame(frame);
    userEvents.forEach((e) => window.removeEventListener(e, stop));
  };
}

export default function ScrollToTop() {
  const router = useRouter();
  const { pathname, hash, state } = useLocation();
  const key = historyKey(state);
  const lastRef = useRef({ pathname: "", hash: "" });
  const keyRef = useRef<string | null>(key);
  const popRef = useRef(false);
  const pendingRef = useRef<number | null>(null);

  // Stoppa webbläsarens automatiska scroll-återställning; vi sköter den själva.
  useEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      /* ignore */
    }
  }, []);

  // Routern nollställer själv scrollen varje gång en sida har renderats,
  // även vid hydreringen och vid bakåt. Positioner som ska stå kvar sätts
  // därför tillbaka efter routerns onRendered. Prenumerationen ligger i en
  // layout-effekt så att den hinner före den första onRendered.
  useLayoutEffect(() => {
    let cancelRestore: (() => void) | undefined;
    const unsubscribeHistory = router.history.subscribe(({ action }) => {
      // Spara positionen för sidan vi lämnar, innan nästa sida renderas.
      savePosition(keyRef.current);
      popRef.current = action.type === "BACK" || action.type === "FORWARD" || action.type === "GO";
    });
    const unsubscribeRendered = router.subscribe("onRendered", (event) => {
      let target = pendingRef.current;
      pendingRef.current = null;
      if (popRef.current) {
        popRef.current = false;
        target = readPosition(historyKey(event.toLocation.state));
      }
      if (target === null) return;
      cancelRestore?.();
      cancelRestore = restorePosition(target);
    });
    const onPageHide = () => savePosition(keyRef.current);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      unsubscribeHistory();
      unsubscribeRendered();
      cancelRestore?.();
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [router]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    keyRef.current = key;
    const prev = lastRef.current;
    const isFirstRender = prev.pathname === "";
    const pathChanged = prev.pathname !== pathname;
    const hashChanged = prev.hash !== hash;

    if (!pathChanged && !hashChanged) return;

    lastRef.current = { pathname, hash };

    // Första renderingen sker vid hydreringen, som på mobil kan komma flera
    // sekunder in. En ny laddning börjar högst upp av sig själv. Har
    // besökaren redan börjat scrolla ligger positionen kvar, och vid bakåt,
    // framåt och omladdning återställs den sparade positionen.
    if (isFirstRender) {
      if (hash) return scrollToHashUntilSettled(hash);
      if (window.scrollY > 0) {
        pendingRef.current = window.scrollY;
        return;
      }
      const nav = performance.getEntriesByType("navigation")[0] as
        | PerformanceNavigationTiming
        | undefined;
      if (nav?.type === "back_forward" || nav?.type === "reload") {
        pendingRef.current = readPosition(key);
      }
      return;
    }

    // Bakåt och framåt: positionen återställs efter onRendered ovan.
    if (popRef.current) return;

    if (hash) {
      return scrollToHashUntilSettled(hash);
    }

    if (pathChanged) {
      scrollToTop();
      const frame = requestAnimationFrame(scrollToTop);
      const timer = window.setTimeout(scrollToTop, 60);
      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }
  }, [pathname, hash, key]);

  return null;
}
