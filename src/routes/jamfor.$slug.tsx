import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { MOBILNAT, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  billigastForBehov,
  gbText,
  kr,
  snittForstaAret,
  totalKostnad,
} from "@/lib/mobil/berakna";
import {
  billigasteFor,
  bindningsSpann,
  hittaPar,
  parSlug,
  privataFor,
  SKI_BRANSCH_PRIVAT,
  surfSpann,
} from "@/lib/mobil/sidtexter";
import { KALLOR, decimal } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Operator } from "@/lib/mobil/typer";

const NIVAER = [5, 10, 25, 50] as const;

function jamforFaq(a: Operator, b: Operator) {
  const ba = billigasteFor(a.slug);
  const bb = billigasteFor(b.slug);
  const fragor: { q: string; a: string; kalla?: string }[] = [];
  if (ba && bb) {
    const billigare = snittForstaAret(ba) <= snittForstaAret(bb) ? [a, ba] : [b, bb];
    fragor.push({
      q: `Vilket är billigast, ${a.namn} eller ${b.namn}?`,
      a: `Billigaste abonnemanget räknat som snittpris första året finns hos ${(billigare[0] as Operator).namn}: ${(billigare[1] as typeof ba).namn} för ${kr(snittForstaAret(billigare[1] as typeof ba))} i månaden. Vilket som är billigast för dig beror på hur mycket surf du behöver, så jämför per surfmängd i tabellen.`,
    });
  }
  fragor.push({
    q: `Har ${a.namn} och ${b.namn} samma nät?`,
    a:
      a.nat === b.nat
        ? `Ja. Båda kör i ${MOBILNAT[a.nat].namn}, så täckningen är densamma.`
        : `Nej. ${a.namn} kör i ${MOBILNAT[a.nat].namn} och ${b.namn} i ${MOBILNAT[b.nat].namn}. Kolla båda operatörernas täckningskartor för din adress.`,
  });
  if (a.skiPrivat != null && b.skiPrivat != null) {
    fragor.push({
      q: `Vem har nöjdast kunder, ${a.namn} eller ${b.namn}?`,
      a: `I Svenskt Kvalitetsindex 2025 fick ${a.namn} ${decimal(a.skiPrivat)} och ${b.namn} ${decimal(b.skiPrivat)} bland privatkunderna. Branschsnittet var ${decimal(SKI_BRANSCH_PRIVAT)}.`,
      kalla: KALLOR.ski.namn,
    });
  }
  return fragor;
}

export const Route = createFileRoute("/jamfor/$slug")({
  loader: ({ params }) => {
    const p = hittaPar(params.slug);
    if (!p || !operator(p.a) || !operator(p.b)) throw notFound();
    return p;
  },
  head: ({ params }) => {
    const p = hittaPar(params.slug);
    const a = p && operator(p.a);
    const b = p && operator(p.b);
    if (!p || !a || !b) return {};
    return pageHead({
      title: `${a.namn} eller ${b.namn}? Jämförelse 2026 | Mobilpoolen`,
      description: `${a.namn} mot ${b.namn}: pris per surfmängd, totalkostnad över två år, nät, bindningstid och kundnöjdhet. Med källa och datum.`,
      canonical: `/jamfor/${parSlug(p)}`,
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Jämför operatörer", path: "/jamfor" },
          { name: `${a.namn} eller ${b.namn}`, path: `/jamfor/${parSlug(p)}` },
        ]),
        faqJsonLd(jamforFaq(a, b)),
      ],
    });
  },
  component: Sida,
});

function Sida() {
  const p = Route.useLoaderData();
  const a = operator(p.a)!;
  const b = operator(p.b)!;
  // Bara abonnemang som alla kan köpa, utan ålders- eller studentkrav.
  const la = privataFor(a.slug).filter((x) => !arVillkorat(x));
  const lb = privataFor(b.slug).filter((x) => !arVillkorat(x));
  const samma = a.nat === b.nat;

  const rader = NIVAER.map((gb) => ({
    niva: `Minst ${gb} GB`,
    a: billigastForBehov(
      la.filter((x) => x.gb != null),
      gb,
    ),
    b: billigastForBehov(
      lb.filter((x) => x.gb != null),
      gb,
    ),
  }));
  rader.push({
    niva: "Obegränsad",
    a: billigastForBehov(
      la.filter((x) => x.gb == null),
      0,
    ),
    b: billigastForBehov(
      lb.filter((x) => x.gb == null),
      0,
    ),
  });

  const vinnare = { a: 0, b: 0 };
  for (const r of rader) {
    if (r.a && r.b) {
      if (snittForstaAret(r.a) < snittForstaAret(r.b)) vinnare.a++;
      else if (snittForstaAret(r.b) < snittForstaAret(r.a)) vinnare.b++;
    }
  }

  const egenskaper: { t: string; a: string; b: string }[] = [
    { t: "Mobilnät", a: MOBILNAT[a.nat].namn, b: MOBILNAT[b.nat].namn },
    { t: "Surf", a: surfSpann(la) ?? "–", b: surfSpann(lb) ?? "–" },
    {
      t: "Bindningstid",
      a: bindningsSpann(la) ?? "Framgår inte",
      b: bindningsSpann(lb) ?? "Framgår inte",
    },
    { t: "5G", a: a.femg ? "Ja" : "Uppgift saknas", b: b.femg ? "Ja" : "Uppgift saknas" },
    {
      t: "eSIM",
      a: a.esim == null ? "Uppgift saknas" : a.esim ? "Ja" : "Nej",
      b: b.esim == null ? "Uppgift saknas" : b.esim ? "Ja" : "Nej",
    },
    {
      t: "Uppsägning",
      a: a.villkor.uppsagningstid ?? "Uppgift saknas",
      b: b.villkor.uppsagningstid ?? "Uppgift saknas",
    },
    {
      t: "Kundnöjdhet (SKI 2025)",
      a: a.skiPrivat != null ? decimal(a.skiPrivat) : "Mäts inte separat",
      b: b.skiPrivat != null ? decimal(b.skiPrivat) : "Mäts inte separat",
    },
  ];

  const harPriser = la.length > 0 && lb.length > 0;

  return (
    <PelarSida
      trail={[
        { name: "Start", path: "/" },
        { name: "Jämför operatörer", path: "/jamfor" },
        { name: `${a.namn} eller ${b.namn}`, path: `/jamfor/${parSlug(p)}` },
      ]}
      rubrik={`${a.namn} eller ${b.namn}?`}
      ingress={
        <p>
          {samma
            ? `${a.namn} och ${b.namn} kör båda i ${MOBILNAT[a.nat].namn}, så täckningen är densamma. Skillnaden ligger i pris, villkor och tjänster.`
            : `${a.namn} kör i ${MOBILNAT[a.nat].namn} och ${b.namn} i ${MOBILNAT[b.nat].namn}. Börja med täckningen där du bor, jämför sedan priset för den surf du behöver.`}{" "}
          {harPriser &&
            (vinnare.a !== vinnare.b
              ? `Räknat som snittpris första året är ${vinnare.a > vinnare.b ? a.namn : b.namn} billigast på ${Math.max(vinnare.a, vinnare.b)} av ${rader.filter((r) => r.a && r.b).length} surfnivåer där båda har ett abonnemang.`
              : "Priserna är jämna, så det avgörs av hur mycket surf du behöver.")}
        </p>
      }
      jamforelse={
        <div className="space-y-12">
          <div className="grid grid-cols-2 gap-3">
            {[a, b].map((o) => (
              <Link
                key={o.slug}
                to="/operatorer/$slug"
                params={{ slug: o.slug }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 hover:shadow-kort"
              >
                <OperatorMonogram namn={o.namn} />
                <span className="font-display text-[18px] font-bold">{o.namn}</span>
              </Link>
            ))}
          </div>

          {harPriser ? (
            <div>
              <h2 className="text-[24px] font-bold sm:text-[30px]">Pris per surfmängd</h2>
              <p className="mt-2 text-[15.5px] text-foreground/75">
                Billigaste abonnemanget hos var och en som ger minst så mycket surf. Snitt per månad
                första året och totalt över 24 månader.
              </p>
              <div className="mt-5 overflow-x-auto rounded-2xl border border-border bg-surface">
                <table className="w-full min-w-[560px] text-[15px]">
                  <thead className="bg-muted/60 text-left text-[12.5px] uppercase tracking-wide text-foreground/70">
                    <tr>
                      <th className="px-4 py-3">Surf</th>
                      <th className="px-4 py-3">{a.namn}</th>
                      <th className="px-4 py-3">{b.namn}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rader.map((r) => {
                      const sa = r.a ? snittForstaAret(r.a) : null;
                      const sb = r.b ? snittForstaAret(r.b) : null;
                      const cell = (x: typeof r.a, s: number | null, annan: number | null) =>
                        x ? (
                          <div>
                            <div
                              className={`font-semibold ${s != null && annan != null && s < annan ? "text-savings" : ""}`}
                            >
                              {kr(s!)}/mån
                            </div>
                            <div className="text-[13px] text-foreground/65">
                              {x.namn} · {gbText(x.gb)} · 24 mån {kr(totalKostnad(x, 24))}
                            </div>
                          </div>
                        ) : (
                          <span className="text-foreground/50">Finns inte</span>
                        );
                      return (
                        <tr key={r.niva} className="border-t border-border align-top">
                          <th scope="row" className="px-4 py-3 text-left font-semibold">
                            {r.niva}
                          </th>
                          <td className="px-4 py-3">{cell(r.a, sa, sb)}</td>
                          <td className="px-4 py-3">{cell(r.b, sb, sa)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl border border-border bg-surface p-5 text-[16px]">
              Vi har inte kunnat kontrollera aktuella priser hos {la.length === 0 ? a.namn : b.namn}{" "}
              ännu, så prisjämförelsen visas inte. Fakta om nät och villkor står nedan.
            </p>
          )}

          <div>
            <h2 className="text-[24px] font-bold sm:text-[30px]">Villkor sida vid sida</h2>
            <dl className="mt-5 divide-y divide-border rounded-2xl border border-border bg-surface">
              {egenskaper.map((e) => (
                <div
                  key={e.t}
                  className="grid gap-2 px-5 py-3 text-[15px] sm:grid-cols-[200px_1fr_1fr]"
                >
                  <dt className="font-semibold text-foreground/70">{e.t}</dt>
                  <dd>
                    <span className="sm:hidden text-foreground/60">{a.namn}: </span>
                    {e.a}
                  </dd>
                  <dd>
                    <span className="sm:hidden text-foreground/60">{b.namn}: </span>
                    {e.b}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {[a, b].map((o) => (
              <div key={o.slug} className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="text-[22px] font-bold">Välj {o.namn} om du vill ha</h2>
                <ul className="mt-4 space-y-2.5">
                  {o.starkor.slice(0, 4).map((s) => (
                    <li key={s} className="flex items-start gap-2.5 text-[15.5px]">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-savings" aria-hidden />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      }
      faq={jamforFaq(a, b)}
      lankar={[
        { href: `/operatorer/${a.slug}`, label: `Allt om ${a.namn}` },
        { href: `/operatorer/${b.slug}`, label: `Allt om ${b.namn}` },
        { href: "/jamfor", label: "Fler jämförelser" },
      ]}
      ctaRubrik="Finns det något billigare än båda?"
      ctaIngress="Jämför alla operatörer på en gång, sorterade efter vad du betalar på ett år."
      ctaBild="miniraknare-kalkyl"
      uppdaterad="2026-10-29"
    />
  );
}
