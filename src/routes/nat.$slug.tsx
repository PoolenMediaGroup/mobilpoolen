import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { BilligastTabell } from "@/components/mobil/billigast-tabell";
import { MOBILNAT, OPERATORER, PRIVATA } from "@/lib/mobil/data";
import { kr, snittForstaAret, sortera } from "@/lib/mobil/berakna";
import { KALLOR, OPENSIGNAL, SKI_PRIVAT, decimal } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { NatId } from "@/lib/mobil/typer";

const NAT_IDS = Object.keys(MOBILNAT) as NatId[];

function natFaq(id: NatId) {
  const nat = MOBILNAT[id];
  const ops = OPERATORER.filter((o) => o.nat === id && o.aktiv);
  const billigast = sortera(
    PRIVATA.filter((a) => OPERATORER.find((o) => o.slug === a.operator)?.nat === id),
    "snitt-ar",
  )[0];
  const egen = OPERATORER.find((o) => o.slug === id);
  const fragor = [
    {
      q: `Vilka operatörer finns i ${nat.namn}?`,
      a: `${ops.map((o) => o.namn).join(", ")}. Alla får samma täckning eftersom de kör i samma nät, men pris, maxhastighet och tjänster skiljer sig.`,
    },
  ];
  if (billigast) {
    const o = OPERATORER.find((x) => x.slug === billigast.operator)!;
    fragor.push({
      q: `Vilket är det billigaste abonnemanget i ${nat.namn}?`,
      a: `Räknat som snittpris per månad första året är ${o.namn} ${billigast.namn} billigast just nu, för ${kr(snittForstaAret(billigast))} i månaden. Behöver du mer surf, se tabellen per surfmängd på sidan.`,
    });
  }
  if (egen) {
    const ski = SKI_PRIVAT.find((s) => s.namn === egen.namn);
    const vinster = OPENSIGNAL.filter((r) => r.vinnare === egen.namn);
    fragor.push({
      q: `Hur bra är ${nat.namn}?`,
      a: `${
        vinster.length
          ? `I Opensignals mätning från december 2025 vann ${egen.namn} ${vinster.map((v) => v.kategori.charAt(0).toLowerCase() + v.kategori.slice(1)).join(" och ")}.`
          : `${egen.namn} vann ingen kategori ensam i Opensignals mätning från december 2025.`
      }${ski ? ` I Svenskt Kvalitetsindex 2025 fick ${egen.namn} ${decimal(ski.varde)} bland privatkunderna.` : ""} Täckningen där du bor avgör mest, så kolla operatörens täckningskarta.`,
    });
  }
  return fragor;
}

export const Route = createFileRoute("/nat/$slug")({
  loader: ({ params }) => {
    if (!NAT_IDS.includes(params.slug as NatId)) throw notFound();
    return { id: params.slug as NatId };
  },
  head: ({ params }) => {
    if (!NAT_IDS.includes(params.slug as NatId)) return {};
    const id = params.slug as NatId;
    const nat = MOBILNAT[id];
    return pageHead({
      title: `Operatörer i ${nat.namn} – billigaste abonnemang | Mobilpoolen`,
      description: `Alla operatörer som kör i ${nat.namn}, billigaste abonnemanget per surfmängd och vad mätningarna säger om nätet. Priser med källa och datum.`,
      canonical: `/nat/${id}`,
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Mobilnät och täckning", path: "/nat" },
          { name: nat.namn, path: `/nat/${id}` },
        ]),
        faqJsonLd(natFaq(id)),
      ],
    });
  },
  component: Sida,
});

function Sida() {
  const { id } = Route.useLoaderData();
  const nat = MOBILNAT[id];
  const ops = OPERATORER.filter((o) => o.nat === id && o.aktiv);
  const iNatet = (slug: string) => OPERATORER.find((o) => o.slug === slug)?.nat === id;
  const antal = PRIVATA.filter((a) => iNatet(a.operator)).length;
  return (
    <PelarSida
      trail={[
        { name: "Start", path: "/" },
        { name: "Mobilnät och täckning", path: "/nat" },
        { name: nat.namn, path: `/nat/${id}` },
      ]}
      rubrik={`Billigaste mobilabonnemangen i ${nat.namn}`}
      ingress={
        <p>
          {nat.beskrivning} Här ser du alla {antal} abonnemang vi jämför i nätet, sorterade efter
          vad de kostar i snitt under första året.
        </p>
      }
      nyckeltal={[
        { varde: String(ops.length), text: `operatörer i ${nat.namn}` },
        { varde: String(antal), text: "abonnemang i jämförelsen" },
        { varde: nat.agare.split(",")[0], text: "äger nätet" },
      ]}
      jamforelse={
        <div className="space-y-12">
          <BilligastTabell filter={(a) => iNatet(a.operator)} />
          <Jamforelse urval={(a) => iNatet(a.operator)} id="lista" />
        </div>
      }
      jamforelseRubrik={`Billigast per surfmängd i ${nat.namn}`}
      faq={natFaq(id)}
      lankar={[
        ...ops.slice(0, 4).map((o) => ({
          href: `/operatorer/${o.slug}`,
          label: o.namn,
          text: `Alla ${o.namn}s abonnemang och villkor.`,
        })),
        { href: "/nat", label: "Alla fyra mobilnät", text: "Jämför näten och mätningarna." },
      ]}
      ctaBild="mobilmast-bla-himmel"
      uppdaterad="2026-10-29"
    >
      <h2>Operatörerna i nätet</h2>
      <ul className="ingen-prosa grid gap-3 sm:grid-cols-2">
        {ops.map((o) => {
          const billigast = sortera(
            PRIVATA.filter((x) => x.operator === o.slug),
            "snitt-ar",
          )[0];
          const agare = o.grupp === "natagare";
          return (
            <li key={o.slug} className={`!mt-0 ${agare ? "sm:col-span-2" : ""}`}>
              <Link
                to="/operatorer/$slug"
                params={{ slug: o.slug }}
                className={`group flex h-full items-center gap-4 rounded-2xl border bg-white p-4 shadow-kort-litet transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-20px_rgba(59,40,204,0.45)] motion-reduce:hover:translate-y-0 ${
                  agare
                    ? "border-primary/30 sm:col-span-2"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <OperatorMonogram namn={o.namn} size={agare ? 48 : 40} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-[17px] font-bold text-foreground group-hover:text-primary">
                      {o.namn}
                    </span>
                    {agare && (
                      <span className="rounded-full bg-gradient-to-r from-primary to-[#7c63ff] px-2.5 py-0.5 text-[11.5px] font-semibold text-white">
                        Äger nätet
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-[13.5px] leading-snug text-foreground/65">
                    {agare
                      ? "Bygger och driver nätet"
                      : o.agare !== "Uppgift saknas"
                        ? `Virtuell operatör, ägs av ${o.agare}`
                        : "Virtuell operatör"}
                    {billigast ? ` · från ${kr(snittForstaAret(billigast))}/mån` : ""}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            </li>
          );
        })}
      </ul>
      <p>
        Täckningen är densamma hos alla operatörer i nätet. Skillnaderna ligger i pris,
        maxhastighet, om 5G och wifi-samtal ingår och hur kundtjänsten fungerar. Läs mer om{" "}
        <Link to={"/guider/virtuella-operatorer" as never}>virtuella operatörer</Link>.
      </p>
      <p className="kalla">
        Mätningar:{" "}
        <a href={KALLOR.opensignal.url} target="_blank" rel="noopener nofollow">
          {KALLOR.opensignal.namn}
        </a>
        .
      </p>
    </PelarSida>
  );
}
