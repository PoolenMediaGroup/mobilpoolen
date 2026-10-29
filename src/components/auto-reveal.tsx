import { useEffect } from "react";

/**
 * Globalt "lyft-lager": tonar in kort och sektionsrubriker när de kommer in i vy.
 * Rent additivt, inget innehåll ändras. Respekterar prefers-reduced-motion.
 */
const SELECTOR = [
  "[data-reveal]",
  ".elp-reveal",
  ".card-soft",
  ".card-dark",
  ".card-dark-elevated",
  ".elp-lift",
].join(", ");

export function AutoReveal() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const seen = new WeakSet<Element>();
    const delays = new WeakMap<Element, number>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            // Web Animations API: ändrar inga attribut, så SSR-HTML:en rörs aldrig före/under hydreringen.
            e.target.animate(
              [
                { opacity: 0, translate: "0 16px" },
                { opacity: 1, translate: "0 0" },
              ],
              {
                // Samma tempo och kurva som Elpoolen (--elp-ease, 520 ms).
                duration: 520,
                delay: delays.get(e.target) ?? 0,
                easing: "cubic-bezier(0.22, 1, 0.36, 1)",
                fill: "backwards",
              },
            );
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0 },
    );

    const arm = () => {
      document.querySelectorAll<HTMLElement>(SELECTOR).forEach((el) => {
        if (seen.has(el)) return;
        if (el.closest("[data-no-reveal]") || el.closest('[role="dialog"]')) return;
        seen.add(el);
        // Det som redan syns vid start tonas inte in (ingen blink).
        if (el.getBoundingClientRect().top < window.innerHeight) return;
        const parent = el.parentElement;
        const idx = parent ? Array.prototype.indexOf.call(parent.children, el) : 0;
        delays.set(el, parseFloat(el.style.transitionDelay) || Math.min(Math.max(idx, 0), 6) * 50);
        io.observe(el);
      });
    };

    arm();
    const mo = new MutationObserver(() => arm());
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
