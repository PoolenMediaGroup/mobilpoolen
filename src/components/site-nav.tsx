import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";

type NavLank = { href: string; label: string };
type NavKolumn = { rubrik?: string; lankar: NavLank[] };
/** En post är antingen en direktlänk (href) eller en dropdown (kolumner). */
type NavPost = { label: string; href?: string; hash?: string; kolumner?: NavKolumn[] };

const NAV: NavPost[] = [
  {
    label: "Jämför",
    kolumner: [
      {
        lankar: [
          { href: "/", label: "Alla mobilabonnemang" },
          { href: "/billigaste-mobilabonnemang", label: "Billigaste mobilabonnemang" },
          { href: "/basta-mobilabonnemang", label: "Bästa mobilabonnemang 2026" },
          { href: "/obegransad-surf", label: "Obegränsad surf" },
          { href: "/utan-bindningstid", label: "Utan bindningstid" },
          { href: "/kontantkort", label: "Kontantkort" },
          { href: "/5g-abonnemang", label: "5G-abonnemang" },
          { href: "/esim", label: "eSIM" },
          { href: "/kampanjer", label: "Kampanjer just nu" },
          { href: "/mobilt-bredband", label: "Mobilt bredband" },
        ],
      },
    ],
  },
  {
    label: "För vem",
    kolumner: [
      {
        lankar: [
          { href: "/familjeabonnemang", label: "Familj" },
          { href: "/barn", label: "Barn" },
          { href: "/studentabonnemang", label: "Studenter" },
          { href: "/pensionar", label: "Pensionärer" },
        ],
      },
    ],
  },
  {
    label: "Operatörer",
    kolumner: [
      {
        lankar: [
          { href: "/operatorer", label: "Alla operatörer" },
          { href: "/jamfor", label: "Jämför två operatörer" },
          { href: "/nat", label: "Mobilnät och täckning" },
          { href: "/operatorer/telia", label: "Telia" },
          { href: "/operatorer/tele2", label: "Tele2" },
          { href: "/operatorer/telenor", label: "Telenor" },
          { href: "/operatorer/tre", label: "Tre" },
          { href: "/operatorer/comviq", label: "Comviq" },
          { href: "/operatorer/hallon", label: "Hallon" },
          { href: "/operatorer/vimla", label: "Vimla" },
        ],
      },
    ],
  },
  {
    label: "Byta",
    kolumner: [
      {
        lankar: [
          { href: "/guider/byta-operator-behalla-nummer", label: "Byta operatör" },
          { href: "/saga-upp", label: "Säga upp abonnemang" },
          { href: "/guider/bindningstid-uppsagningstid", label: "Bindningstid" },
          { href: "/guider/kampanjpris-efter-kampanjen", label: "Kampanjpriser" },
          { href: "/verktyg/betalar-jag-for-mycket", label: "Betalar jag för mycket?" },
        ],
      },
    ],
  },
  {
    label: "Guider",
    kolumner: [
      {
        lankar: [
          { href: "/guider", label: "Alla guider" },
          { href: "/verktyg", label: "Verktyg och kalkylatorer" },
          { href: "/prisindex", label: "Prisindex" },
          { href: "/faq", label: "Frågor och svar" },
          { href: "/ordlista", label: "Ordlista" },
        ],
      },
    ],
  },
  {
    label: "Företag",
    kolumner: [
      {
        lankar: [
          { href: "/foretag", label: "Mobilabonnemang för företag" },
          {
            href: "/foretag/billigaste-foretagsabonnemang",
            label: "Billigaste företagsabonnemang",
          },
          { href: "/foretag/enskild-firma", label: "Enskild firma" },
          { href: "/verktyg/foretagskalkylator", label: "Företagskalkylator" },
        ],
      },
    ],
  },
];

const linkClass =
  "relative inline-flex items-center text-[15px] font-medium text-muted-foreground hover:text-primary transition-colors motion-reduce:transition-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm";

// Exakt route-matchning: hash-länkar är aldrig aktiva, inga delsträngar.
function isPathActive(pathname: string, href: string) {
  const path = href.split("#")[0];
  if (!path || path === "/") return false;
  return pathname === path;
}

/** En dropdown räknas som aktiv när man står på någon av dess undersidor. */
function isPostActive(pathname: string, post: NavPost) {
  if (post.href) return isPathActive(pathname, post.href);
  return (post.kolumner ?? []).some((kolumn) =>
    kolumn.lankar.some((lank) => isPathActive(pathname, lank.href)),
  );
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Vilken dropdown som är öppnad med klick. Hover sköts separat i CSS.
  const [oppenMeny, setOppenMeny] = useState<string | null>(null);
  // Vilken grupp som är utfälld i mobilmenyn.
  const [mobilGrupp, setMobilGrupp] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape stänger både mobilpanelen och en öppen dropdown.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setOppenMeny(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Klick utanför menyn stänger dropdownen.
  useEffect(() => {
    if (!oppenMeny) return;
    const onPointerDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOppenMeny(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [oppenMeny]);

  // Mobilpanel: scroll-lås som på Elpoolen. overflow på body räcker inte
  // (sidan scrollar på html, och iOS struntar i overflow), så body låses med
  // position: fixed på nuvarande scrollposition och återställs när menyn stängs.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const body = document.body;
    const y = window.scrollY;
    const lastPath = pathnameRef.current;
    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
    };
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      // Stängdes menyn av en navigering sköter routern scrollen, annars
      // tillbaka dit man var. "instant": sajten har scroll-behavior: smooth.
      if (pathnameRef.current === lastPath) {
        window.scrollTo({ top: y, behavior: "instant" as ScrollBehavior });
      }
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setOppenMeny(null);
    setMobilGrupp(null);
  }, [pathname]);

  const activeIndicator = (
    <span aria-hidden className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary" />
  );

  return (
    <>
      <div aria-hidden className="h-12 md:h-[72px]" />
      {/* Som på Elpoolen: navbaren har samma höjd och storlek hela tiden, även
          när man scrollar. Bara skuggan kommer till när sidan rört sig. */}
      <header
        className={`fixed top-0 left-0 right-0 w-full z-[100] border-b border-border bg-surface transition-shadow duration-200 motion-reduce:transition-none ${
          scrolled ? "shadow-nav" : ""
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between xl:grid xl:grid-cols-[auto_1fr_auto] h-12 md:h-[72px]">
          <BrandLogo width={170} mobileWidth={140} className="items-center" />

          <nav
            ref={navRef}
            className="site-nav-links hidden xl:flex items-center justify-self-center"
            style={{ gap: 26 }}
            aria-label="Huvudmeny"
          >
            {NAV.map((post, i) => {
              const active = isPostActive(pathname, post);
              if (post.href) {
                return (
                  <Link
                    key={post.label}
                    to={post.href}
                    hash={post.hash}
                    aria-current={active ? "page" : undefined}
                    className={`${linkClass} h-11 ${active ? "text-primary font-semibold" : ""}`}
                  >
                    {post.label}
                    {active && activeIndicator}
                  </Link>
                );
              }
              const oppen = oppenMeny === post.label;
              const panelId = `meny-panel-${i}`;
              return (
                <div key={post.label} className="group relative">
                  <button
                    type="button"
                    aria-haspopup="true"
                    aria-expanded={oppen}
                    aria-controls={panelId}
                    onClick={() => setOppenMeny(oppen ? null : post.label)}
                    className={`${linkClass} h-11 gap-1 ${active ? "text-primary font-semibold" : ""}`}
                  >
                    {post.label}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${oppen ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                    {active && activeIndicator}
                  </button>
                  <div
                    id={panelId}
                    className={`absolute left-0 top-full z-50 pt-2 transition-opacity duration-150 motion-reduce:transition-none ${
                      oppen
                        ? "visible opacity-100"
                        : "invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                    }`}
                  >
                    <div className="w-[260px] rounded-xl border border-border bg-surface p-4 shadow-lg">
                      {post.kolumner?.map((kolumn, k) => (
                        <div key={kolumn.rubrik ?? k}>
                          {kolumn.rubrik ? (
                            <div className="px-3 pb-1.5 pt-1 text-[12.5px] font-bold text-foreground/70">
                              {kolumn.rubrik}
                            </div>
                          ) : null}
                          {kolumn.lankar.map((lank) => {
                            const lankAktiv = isPathActive(pathname, lank.href);
                            return (
                              <Link
                                key={lank.href}
                                to={lank.href}
                                onClick={() => setOppenMeny(null)}
                                aria-current={lankAktiv ? "page" : undefined}
                                className={`block rounded-md px-2 py-1.5 text-[14px] hover:bg-muted hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                  lankAktiv ? "text-primary font-semibold" : "text-foreground"
                                }`}
                              >
                                {lank.label}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>

          <div className="site-nav-actions flex items-center justify-self-end gap-2">
            <Link
              to="/"
              hash="alla"
              className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-[10px] bg-cta px-4 py-2.5 lg:min-h-0 text-[15px] font-semibold text-cta-foreground shadow-none hover:bg-cta-hover min-[400px]:min-w-[164px] min-[400px]:px-5"
              style={{ lineHeight: 1.2, boxShadow: "none" }}
            >
              {/* Under 400 px rör loggan och knappen nästan varandra, så knappen blir kortare. */}
              <span className="min-[400px]:hidden">Jämför →</span>
              <span className="hidden min-[400px]:inline">Jämför gratis →</span>
            </Link>
            <button
              className="xl:hidden inline-flex items-center justify-center min-h-11 min-w-11 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label={open ? "Stäng meny" : "Öppna meny"}
              aria-expanded={open}
              aria-controls="mobilmeny"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {open && (
        <div
          id="mobilmeny"
          className="xl:hidden fixed inset-0 z-[110] bg-surface overflow-y-auto overscroll-contain"
        >
          <div className="flex items-center justify-between h-12 px-4 border-b border-border">
            <BrandLogo width={140} />
            <button
              className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-md hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-label="Stäng meny"
              onClick={() => setOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Som på Elpoolen: knappen överst och grupperna som dragspel, så att
              hela menyn ryms på en skärm. Alla länkar finns kvar. */}
          <nav className="px-4 py-5 flex flex-col" aria-label="Huvudmeny mobil">
            <Link
              to="/"
              hash="alla"
              onClick={() => setOpen(false)}
              className="mb-4 inline-flex min-h-12 items-center justify-center rounded-[10px] bg-cta px-5 py-2.5 font-display text-[16px] font-semibold text-cta-foreground hover:bg-cta-hover"
              style={{ lineHeight: 1.2 }}
            >
              Jämför gratis →
            </Link>

            {NAV.map((post, i) => {
              if (post.href) {
                const active = isPathActive(pathname, post.href);
                return (
                  <Link
                    key={post.label}
                    to={post.href}
                    hash={post.hash}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`mt-1 flex items-center min-h-11 px-3 py-2.5 rounded-md text-[16px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      active
                        ? "bg-muted text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {post.label}
                  </Link>
                );
              }
              const active = isPostActive(pathname, post);
              const utfalld = mobilGrupp === post.label;
              const gruppId = `mobil-grupp-${i}`;
              return (
                <div key={post.label} className="mt-1">
                  <button
                    type="button"
                    aria-expanded={utfalld}
                    aria-controls={gruppId}
                    onClick={() => setMobilGrupp(utfalld ? null : post.label)}
                    className={`w-full flex items-center justify-between min-h-11 px-3 py-2.5 rounded-md text-left text-[16px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      active
                        ? "bg-muted text-primary font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {post.label}
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-150 motion-reduce:transition-none ${
                        utfalld ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>
                  {/* Länkarna ligger kvar i HTML:en även när gruppen är stängd. */}
                  <div id={gruppId} className={`pl-3 pb-2 ${utfalld ? "" : "hidden"}`}>
                    {post.kolumner?.map((kolumn, k) => (
                      <div key={kolumn.rubrik ?? k}>
                        {kolumn.rubrik ? (
                          <p className="px-3 pt-3 pb-1 text-[13px] font-bold text-foreground/70">
                            {kolumn.rubrik}
                          </p>
                        ) : null}
                        {kolumn.lankar.map((lank) => {
                          const lankAktiv = isPathActive(pathname, lank.href);
                          return (
                            <Link
                              key={lank.href}
                              to={lank.href}
                              onClick={() => setOpen(false)}
                              aria-current={lankAktiv ? "page" : undefined}
                              className={`flex min-h-11 items-center rounded-md px-3 py-2 text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                                lankAktiv
                                  ? "bg-muted text-primary font-semibold"
                                  : "text-foreground hover:bg-muted"
                              }`}
                            >
                              {lank.label}
                            </Link>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
}
