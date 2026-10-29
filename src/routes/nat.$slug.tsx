import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
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
      q: `Vilka operatörer finns i ${nat.namn.toLowerCase()}?`,
      a: `${ops.map((o) => o.namn).join(", ")}. Alla får samma täckning eftersom de kör i samma nät, men pris, maxhastighet och tjänster skiljer sig.`,
    },
  ];
  if (billigast) {
    const o = OPERATORER.find((x) => x.slug === billigast.operator)!;
    fragor.push({
      q: `Vilket är det billigaste abonnemanget i ${nat.namn.toLowerCase()}?`,
      a: `Räknat som snittpris per månad första året är ${o.namn} ${billigast.namn} billigast just nu, för ${kr(snittForstaAret(billigast))} i månaden. Behöver du mer surf, se tabellen per surfmängd på sidan.`,
    });
  }
  if (egen) {
    const ski = SKI_PRIVAT.find((s) => s.namn === egen.namn);
    const vinster = OPENSIGNAL.filter((r) => r.vinnare === egen.namn);
    fragor.push({
      q: `Hur bra är ${nat.namn.toLowerCase()}?`,
      a: `${
        vinster.length
          ? `I Opensignals mätning från december 2025 vann ${egen.namn} ${vinster.map((v) => v.kategori.toLowerCase()).join(" och ")}.`
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
      title: `Operatörer i ${nat.namn.toLowerCase()} – billigaste abonnemang | Mobilpoolen`,
      description: `Alla operatörer som kör i ${nat.namn.toLowerCase()}, billigaste abonnemanget per surfmängd och vad mätningarna säger om nätet. Priser med källa och datum.`,
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
      rubrik={`Billigaste mobilabonnemangen i ${nat.namn.toLowerCase()}`}
      ingress={
        <p>
          {nat.beskrivning} Här ser du alla {antal} abonnemang vi jämför i nätet, sorterade efter
          vad de kostar i snitt under första året.
        </p>
      }
      nyckeltal={[
        { varde: String(ops.length), text: `operatörer i ${nat.namn.toLowerCase()}` },
        { varde: String(antal), text: "abonnemang i jämförelsen" },
        { varde: nat.agare.split(",")[0], text: "äger nätet" },
      ]}
      jamforelse={
        <div className="space-y-12">
          <BilligastTabell filter={(a) => iNatet(a.operator)} />
          <Jamforelse urval={(a) => iNatet(a.operator)} id="lista" />
        </div>
      }
      jamforelseRubrik={`Billigast per surfmängd i ${nat.namn.toLowerCase()}`}
      faq={natFaq(id)}
      lankar={[
        ...ops
          .slice(0, 4)
          .map((o) => ({
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
      <ul>
        {ops.map((o) => (
          <li key={o.slug}>
            <Link to="/operatorer/$slug" params={{ slug: o.slug }}>
              {o.namn}
            </Link>
            {o.grupp === "natagare"
              ? " äger nätet."
              : o.agare !== "Uppgift saknas"
                ? `, ägs av ${o.agare}.`
                : "."}
          </li>
        ))}
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
