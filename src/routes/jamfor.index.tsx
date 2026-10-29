import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { MOBILNAT, operator } from "@/lib/mobil/data";
import { GILTIGA_PAR, parSlug } from "@/lib/mobil/sidtexter";
import { breadcrumbJsonLd, pageHead } from "@/lib/seo";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Jämför operatörer", path: "/jamfor" },
];

export const Route = createFileRoute("/jamfor/")({
  head: () =>
    pageHead({
      title: "Jämför mobiloperatörer två och två | Mobilpoolen",
      description:
        "Hallon eller Comviq? Telia eller Tele2? Jämför två operatörer sida vid sida: pris per surfmängd, nät, bindningstid och kundnöjdhet.",
      canonical: "/jamfor",
      scripts: [breadcrumbJsonLd(TRAIL)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Jämför två operatörer"
      ingress={
        <p>
          Står du mellan två operatörer? Varje jämförelse visar billigaste abonnemanget per
          surfmängd, totalkostnaden över två år, vilket nät de kör i och vad kunderna tycker enligt
          Svenskt Kvalitetsindex.
        </p>
      }
      jamforelse={
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GILTIGA_PAR.map((p) => {
            const a = operator(p.a)!;
            const b = operator(p.b)!;
            return (
              <li key={parSlug(p)}>
                <Link
                  to="/jamfor/$slug"
                  params={{ slug: parSlug(p) }}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-kort"
                >
                  <span className="flex items-center justify-between gap-3 font-display text-[18px] font-bold group-hover:text-primary">
                    {a.namn} eller {b.namn}
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </span>
                  <span className="mt-2 text-[14px] text-foreground/70">
                    {a.nat === b.nat
                      ? `Samma nät: ${MOBILNAT[a.nat].namn.toLowerCase()}`
                      : `${MOBILNAT[a.nat].kortText} mot ${MOBILNAT[b.nat].kortText.toLowerCase()}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      }
      jamforelseRubrik="Populära jämförelser"
      lankar={[
        { href: "/operatorer", label: "Alla operatörer" },
        { href: "/nat", label: "Mobilnät och täckning" },
        { href: "/billigaste-mobilabonnemang", label: "Billigaste mobilabonnemang" },
      ]}
      ctaBild="miniraknare-kalkyl"
      uppdaterad="2026-10-29"
    />
  );
}
