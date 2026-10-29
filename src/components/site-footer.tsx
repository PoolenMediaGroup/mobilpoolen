import { Link } from "@tanstack/react-router";
import { BrandLogo } from "@/components/brand-logo";
import type { MouseEvent } from "react";
import { ArrowRight } from "lucide-react";

type FooterLink = {
  label: string;
  href?: string;
  to?: string;
  hash?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement> | MouseEvent<HTMLButtonElement>) => void;
  asButton?: boolean;
};

// Sex kolumner som på Elpoolen, med korta etiketter som beskriver sidan de
// pekar på (ankartexten räknas för sökmotorerna). Alla mål är indexerbara
// sidor som svarar 200. "Så tjänar vi pengar" ska stå kvar (CLAUDE.md).
const COLS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Jämför",
    links: [
      { label: "Jämför mobilabonnemang", to: "/", hash: "alla" },
      { label: "Billigaste mobilabonnemang", to: "/billigaste-mobilabonnemang" },
      { label: "Bästa mobilabonnemang", to: "/basta-mobilabonnemang" },
      { label: "Obegränsad surf", to: "/obegransad-surf" },
      { label: "Utan bindningstid", to: "/utan-bindningstid" },
      { label: "Kontantkort", to: "/kontantkort" },
      { label: "Kampanjer just nu", to: "/kampanjer" },
      { label: "Mobilt bredband", to: "/mobilt-bredband" },
      { label: "Mobil med abonnemang", to: "/mobil-med-abonnemang" },
    ],
  },
  {
    title: "För vem",
    links: [
      { label: "Familjeabonnemang", to: "/familjeabonnemang" },
      { label: "Barn", to: "/barn" },
      { label: "Studentabonnemang", to: "/studentabonnemang" },
      { label: "Pensionärer", to: "/pensionar" },
      { label: "5G-abonnemang", to: "/5g-abonnemang" },
      { label: "eSIM", to: "/esim" },
    ],
  },
  {
    title: "Operatörer",
    links: [
      { label: "Alla operatörer", to: "/operatorer" },
      { label: "Jämför operatörer", to: "/jamfor" },
      { label: "Mobilnät och täckning", to: "/nat" },
      { label: "Telia", to: "/operatorer/telia" },
      { label: "Tele2", to: "/operatorer/tele2" },
      { label: "Comviq", to: "/operatorer/comviq" },
    ],
  },
  {
    title: "Guider",
    links: [
      { label: "Byta operatör", to: "/guider/byta-operator-behalla-nummer" },
      { label: "Säga upp abonnemang", to: "/saga-upp" },
      { label: "Hur mycket surf behöver jag?", to: "/verktyg/hur-mycket-surf-behover-jag" },
      { label: "Prisindex", to: "/prisindex" },
      { label: "Verktyg", to: "/verktyg" },
      { label: "Alla guider", to: "/guider" },
    ],
  },
  {
    title: "Företag",
    links: [
      { label: "Mobilabonnemang för företag", to: "/foretag" },
      { label: "Billigaste företagsabonnemang", to: "/foretag/billigaste-foretagsabonnemang" },
      { label: "Enskild firma", to: "/foretag/enskild-firma" },
      { label: "Företagskalkylator", to: "/verktyg/foretagskalkylator" },
      { label: "Jobbmobil och förmån", to: "/guider/jobbmobil-formansskatt" },
      { label: "Moms på mobilabonnemang", to: "/guider/moms-mobilabonnemang" },
    ],
  },
  {
    title: "Om oss",
    links: [
      { label: "Om Mobilpoolen", to: "/om-oss" },
      { label: "Så fungerar Mobilpoolen", to: "/sa-fungerar-mobilpoolen" },
      { label: "Så jämför vi", to: "/sa-jamfor-vi" },
      { label: "Så tjänar vi pengar", to: "/sa-tjanar-vi-pengar" },
      { label: "Frågor och svar", to: "/faq" },
      { label: "Kontakt", to: "/kontakt" },
    ],
  },
];

const SYSKON = [
  {
    href: "https://elpoolen.se/",
    namn: "Elpoolen",
    text: "Jämför elavtal på",
    aria: "Jämför elavtal för hem och företag på Elpoolen",
    logo: "/img/elpoolen-logo-white.webp",
    bredd: 400,
    hojd: 95,
  },
  {
    href: "https://larmpoolen.se/",
    namn: "Larmpoolen",
    text: "Jämför hemlarm på",
    aria: "Jämför hemlarm och larmbolag på Larmpoolen",
    logo: "/img/larmpoolen-logo-white.svg",
    bredd: 936,
    hojd: 158,
  },
] as const;

const LEGAL_LINKS: FooterLink[] = [
  { label: "Användarvillkor", to: "/anvandarvillkor" },
  { label: "Integritetspolicy", to: "/integritetspolicy" },
  { label: "Cookiepolicy", to: "/cookiepolicy" },
];

/* Samma täta rytm som Elpoolens sidfot på alla skärmar (beslut 26 oktober 2026):
   länkarna har ingen egen minsta höjd, och listan har 6 px mellan raderna. */
const LANK = "hover:text-white transition-colors";

function FooterLinkItem({ link }: { link: FooterLink }) {
  const LANK_KLASS = LANK;
  if (link.to) {
    return (
      <Link to={link.to} hash={link.hash} className={LANK_KLASS}>
        {link.label}
      </Link>
    );
  }
  if (link.asButton && link.onClick) {
    return (
      <button type="button" onClick={link.onClick} className={`${LANK_KLASS} cursor-pointer`}>
        {link.label}
      </button>
    );
  }
  if (link.onClick) {
    return (
      <a href={link.href || "#"} onClick={link.onClick} className={LANK_KLASS}>
        {link.label}
      </a>
    );
  }
  return (
    <a href={link.href} className={LANK_KLASS}>
      {link.label}
    </a>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-footer text-footer-foreground pt-14 pb-8 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <BrandLogo variant="dark" width={170} />

        <p className="mt-2 max-w-xl text-sm leading-[1.6] text-white/70">
          Vi jämför mobilabonnemang för privatpersoner och företag.
          <br />
          Priser med källa och datum, och guider som hjälper dig betala mindre.
        </p>

        {/* Kolumnerna som på Elpoolen: tätare rutnät och samma rytm. Rubrikerna
            står i gemener med versal begynnelsebokstav (Mobilpoolens regel),
            vit 80 procent ger 10,9:1 mot marinblått. */}
        <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 items-start sm:grid-cols-3 lg:grid-cols-6">
          {COLS.map((c) => (
            <div key={c.title}>
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/60">
                {c.title}
              </div>
              <ul className="space-y-1.5 text-sm text-white/70">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <FooterLinkItem link={l} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Syskonsajterna inom PMG Poolen Media Group, byggda som Elpoolens knapp
            till sina syskonsajter: samma flik, ingen rel, eftersom alla sajterna
            drivs av samma bolag. Texten i vit 80 procent ger 10,9:1 mot
            marinblått, pilen i --dark-accent 12,0:1. */}
        <div className="mt-12 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-10">
          {SYSKON.map((s) => (
            <a
              key={s.href}
              href={s.href}
              aria-label={s.aria}
              className="group inline-flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 text-base text-white/80 transition-colors hover:text-white"
            >
              <span>{s.text}</span>
              <img
                src={s.logo}
                alt={s.namn}
                width={s.bredd}
                height={s.hojd}
                loading="lazy"
                decoding="async"
                className="h-[26px] w-auto"
              />
              <ArrowRight
                className="h-4 w-4 text-dark-accent transition-transform group-hover:translate-x-0.5"
                aria-hidden
              />
            </a>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/60 sm:flex-row sm:items-center">
          <span>
            Mobilpoolen © {new Date().getFullYear()}, en del av PMG Poolen Media Group AB · Org.nr
            559602-5287
          </span>
          <div className="flex flex-wrap items-center gap-x-2">
            {LEGAL_LINKS.map((l, i) => (
              <span key={l.label} className="inline-flex items-center gap-x-2">
                <FooterLinkItem link={l} />
                {i < LEGAL_LINKS.length - 1 && <span aria-hidden>·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
