import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { MOBILNAT, OPERATORER } from "@/lib/mobil/data";
import { kr, snittForstaAret } from "@/lib/mobil/berakna";
import { billigasteFor, bindningsSpann, privataFor, surfSpann } from "@/lib/mobil/sidtexter";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { NatId } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Operatörer", path: "/operatorer" },
];

const FAQ = [
  {
    q: "Hur många mobiloperatörer finns det i Sverige?",
    a: "Fyra operatörer äger mobilnät: Telia, Tele2, Telenor och Tre. Utöver dem finns ett tjugotal varumärken och virtuella operatörer som kör i något av näten, till exempel Comviq, Hallon, Vimla och Fello.",
    kalla: "Telekområdgivarna",
  },
  {
    q: "Vilken operatör har flest kunder?",
    a: "Telia, med 30,3 procent av alla mobilabonnemang 2025. Tele2 hade 25,8 procent, Telenor 20,5 procent och Tre 19,1 procent. De fyra koncernerna har tillsammans 96 procent av marknaden, inklusive sina egna lågprisvarumärken.",
    kalla: "PTS, Svensk telekommarknad 2025",
  },
  {
    q: "Vilken operatör har nöjdast kunder?",
    a: "Vimla, med 82,5 av 100 bland privatkunderna i Svenskt Kvalitetsindex mätning 2025, följt av Fello (81,7) och Comviq (75,5). Bland företagskunderna var Telia bäst med 70,1.",
    kalla: "Svenskt Kvalitetsindex, SKI Mobil 2025",
  },
];

export const Route = createFileRoute("/operatorer/")({
  head: () =>
    pageHead({
      title: "Mobiloperatörer i Sverige 2026 – alla jämförda | Mobilpoolen",
      description:
        "Alla mobiloperatörer i Sverige: vilket nät de kör i, billigaste abonnemang, bindningstid och kundnöjdhet. Telia, Tele2, Telenor, Tre, Comviq, Hallon med flera.",
      canonical: "/operatorer",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  const aktiva = OPERATORER.filter((o) => o.aktiv);
  const inaktiva = OPERATORER.filter((o) => !o.aktiv);
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Alla mobiloperatörer i Sverige"
      ingress={
        <p>
          Sverige har fyra mobilnät och betydligt fler operatörer. Här ser du varje operatör vi
          bevakar, vilket nät den kör i och vad det billigaste abonnemanget kostar i snitt under
          första året.
        </p>
      }
      nyckeltal={[
        { varde: "4", text: "mobilnät: Telias, Tele2s, Telenors och Tres" },
        { varde: String(aktiva.length), text: "operatörer på Mobilpoolen" },
        { varde: "15,1 milj.", text: "mobilabonnemang i Sverige 2025 enligt PTS" },
      ]}
      jamforelse={
        <div className="space-y-12">
          {(Object.keys(MOBILNAT) as NatId[]).map((id) => {
            const lista = aktiva.filter((o) => o.nat === id);
            if (!lista.length) return null;
            return (
              <div key={id}>
                <h2 className="text-[24px] font-bold sm:text-[30px]">
                  <Link to="/nat/$slug" params={{ slug: id }} className="hover:text-primary">
                    {MOBILNAT[id].namn}
                  </Link>
                </h2>
                <p className="mt-2 max-w-[680px] text-[16px] text-foreground/75">
                  {MOBILNAT[id].beskrivning}
                </p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {lista.map((o) => {
                    const b = billigasteFor(o.slug);
                    const privata = privataFor(o.slug);
                    return (
                      <li key={o.slug}>
                        <Link
                          to="/operatorer/$slug"
                          params={{ slug: o.slug }}
                          className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-5 transition-shadow hover:shadow-kort"
                        >
                          <span className="flex items-center gap-3">
                            <OperatorMonogram namn={o.namn} size={40} />
                            <span className="font-display text-[18px] font-bold group-hover:text-primary">
                              {o.namn}
                            </span>
                          </span>
                          <span className="mt-3 text-[14px] text-foreground/75">
                            {b
                              ? `Från ${kr(snittForstaAret(b))}/mån i snitt första året`
                              : "Priserna är inte kontrollerade än"}
                          </span>
                          {privata.length > 0 && (
                            <span className="mt-1 text-[13.5px] text-foreground/60">
                              {surfSpann(privata)} ·{" "}
                              {bindningsSpann(privata) ?? "bindning framgår inte"}
                            </span>
                          )}
                          {o.skiPrivat != null && (
                            <span className="mt-1 text-[13.5px] text-foreground/60">
                              SKI 2025: {o.skiPrivat.toString().replace(".", ",")}
                            </span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
          {inaktiva.length > 0 && (
            <div className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="text-[20px] font-bold">Avvecklas</h2>
              <ul className="mt-2">
                {inaktiva.map((o) => (
                  <li key={o.slug}>
                    <Link
                      to="/operatorer/$slug"
                      params={{ slug: o.slug }}
                      className="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
                    >
                      {o.namn}
                    </Link>
                    <span className="text-[14.5px] text-foreground/70"> {o.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      }
      faq={FAQ}
      lankar={[
        {
          href: "/jamfor",
          label: "Jämför två operatörer",
          text: "Sida vid sida: pris, nät och villkor.",
        },
        {
          href: "/nat",
          label: "Mobilnät och täckning",
          text: "Vad mätningarna säger om de fyra näten.",
        },
        {
          href: "/basta-mobilabonnemang",
          label: "Bästa mobilabonnemang 2026",
          text: "Utnämningar som räknas fram ur datan.",
        },
      ]}
      ctaBild="mast-stjarnhimmel"
      uppdaterad="2026-10-29"
    />
  );
}
