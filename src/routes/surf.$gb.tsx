import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { GuideTable } from "@/components/guide-page";
import { SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import {
  bindningText,
  datumText,
  formatTal,
  gbText,
  kr,
  prisPerGb,
  snittForstaAret,
  totalKostnad,
} from "@/lib/mobil/berakna";
import { MARKNAD } from "@/lib/mobil/fakta";
import {
  ANVANDNING,
  SURF_NIVAER,
  nivaData,
  surfNiva,
  vem,
  type NivaData,
  type SurfNiva,
} from "@/lib/mobil/surf";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

function trail(n: SurfNiva) {
  return [
    { name: "Start", path: "/" },
    { name: "Billigaste mobilabonnemang", path: "/billigaste-mobilabonnemang" },
    { name: `${n.gb} GB surf`, path: `/surf/${n.slug}` },
  ];
}

function faq(n: SurfNiva, d: NivaData) {
  const f: { q: string; a: string; kalla?: string }[] = [];
  if (d.minst) {
    f.push({
      q: `Vilket är det billigaste mobilabonnemanget med ${n.gb} GB surf?`,
      a: `Med minst ${n.gb} GB är ${vem(d.minst)} billigast, för ${kr(snittForstaAret(d.minst))} i månaden i snitt första året (${gbText(d.minst.gb).toLowerCase()} surf). ${bindningText(d.minst.bindning)}.${
        d.billigast && d.billigast.id !== d.minst.id
          ? ` Bland abonnemangen på ${n.fran}–${n.till} GB är ${vem(d.billigast)} billigast, för ${kr(snittForstaAret(d.billigast))}.`
          : ""
      }`,
    });
  }
  if (d.minstUtan) {
    f.push({
      q: `Vilket abonnemang med ${n.gb} GB har ingen bindningstid?`,
      a: `${d.utanBindning} av ${d.iNivan.length} abonnemang på ${n.fran}–${n.till} GB saknar bindningstid. Billigast med minst ${n.gb} GB och utan bindning är ${vem(d.minstUtan)}, för ${kr(snittForstaAret(d.minstUtan))} i månaden i snitt första året.`,
    });
  }
  f.push({
    q: `Räcker ${n.gb} GB surf i månaden?`,
    a: `${n.gb} GB räcker till ungefär ${d.hdTimmar} timmar film i HD eller ${d.mediumTimmar} timmar i medium kvalitet, enligt Netflix uppgifter om data per timme. Musik i normal kvalitet drar cirka ${ANVANDNING.spotifyNormalMb} MB i timmen. Ett abonnemang med samtal och data använde i snitt ${MARKNAD.surfPerManad} GB i månaden 2025 enligt PTS.`,
    kalla: "Netflix Help Center, Spotify Support och PTS, Svensk telekommarknad 2025",
  });
  if (d.billigastObegr && d.minst && d.minst.gb != null) {
    const diff = snittForstaAret(d.billigastObegr) - snittForstaAret(d.minst);
    f.push({
      q: `Är obegränsad surf dyrare än ${n.gb} GB?`,
      a:
        diff > 0
          ? `Ja, just nu kostar billigaste obegränsade (${vem(d.billigastObegr)}) ${kr(diff)} mer i månaden i snitt första året än billigaste med minst ${n.gb} GB.`
          : `Nej, inte just nu. Billigaste obegränsade (${vem(d.billigastObegr)}) kostar lika mycket eller mindre än billigaste med en fast surfmängd på minst ${n.gb} GB. Kolla maxhastigheten innan du väljer.`,
    });
  }
  f.push({
    q: `Vad händer om jag surfar mer än ${n.gb} GB?`,
    a: "Det beror på operatören. Oftast sänks hastigheten kraftigt tills nästa månad, och du kan köpa extra surf. Hos vissa operatörer sparas surf du inte använder till nästa månad.",
  });
  return f;
}

export const Route = createFileRoute("/surf/$gb")({
  loader: ({ params }) => {
    const n = surfNiva(params.gb);
    if (!n) throw notFound();
    return { slug: n.slug };
  },
  head: ({ params }) => {
    const n = surfNiva(params.gb);
    if (!n) return {};
    const d = nivaData(n);
    const fran = d.minst ? kr(snittForstaAret(d.minst)) : "";
    return pageHead({
      title: `Mobilabonnemang ${n.gb} GB: billigaste 2026 | Mobilpoolen`,
      description: `Billigaste mobilabonnemanget med ${n.gb} GB surf kostar ${fran}/mån i snitt. Jämför ${d.iNivan.length} abonnemang på ${n.fran}–${n.till} GB, med och utan bindningstid.`,
      canonical: `/surf/${n.slug}`,
      scripts: [
        breadcrumbJsonLd(trail(n)),
        faqJsonLd(faq(n, d)),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `Billigaste mobilabonnemang med ${n.fran}–${n.till} GB surf`,
          itemListElement: d.iNivan.slice(0, 10).map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${vem(a)}, ${gbText(a.gb)}, ${kr(snittForstaAret(a))} per månad i snitt första året`,
          })),
        }),
      ],
    });
  },
  component: Sida,
});

function Sida() {
  const { slug } = Route.useLoaderData();
  const n = surfNiva(slug)!;
  const d = nivaData(n);
  const fragor = faq(n, d);
  const grannar = SURF_NIVAER.filter((x) => x.slug !== n.slug);

  const steg = [
    d.billigastLagre && {
      niva: d.lagre ? `Minst ${d.lagre.gb} GB` : "Minst 5 GB",
      a: d.billigastLagre,
    },
    d.minst && { niva: `Minst ${n.gb} GB`, a: d.minst },
    d.billigastHogre && d.hogre && { niva: `Minst ${d.hogre.gb} GB`, a: d.billigastHogre },
    d.billigastObegr && { niva: "Obegränsad", a: d.billigastObegr },
  ].filter((x): x is { niva: string; a: NonNullable<typeof d.minst> } => Boolean(x));

  return (
    <PelarSida
      trail={trail(n)}
      rubrik={`Mobilabonnemang med ${n.gb} GB: billigaste just nu`}
      ingress={
        <p>
          {d.minst && (
            <>
              Billigast med minst {n.gb} GB surf är {vem(d.minst)} för{" "}
              {kr(snittForstaAret(d.minst))} i månaden i snitt första året.
              {d.minst.gb == null && d.minst.hastighet
                ? ` Surfen är obegränsad men hastigheten är högst ${d.minst.hastighet}.`
                : ""}{" "}
            </>
          )}
          {d.minstUtan && d.minstUtan.id !== d.minst?.id && (
            <>
              Utan bindningstid är {vem(d.minstUtan)} billigast för{" "}
              {kr(snittForstaAret(d.minstUtan))}.{" "}
            </>
          )}
          Vi jämför {d.iNivan.length} abonnemang på {n.fran}–{n.till} GB hos {d.operatorer}{" "}
          operatörer. Mittenpriset är {kr(d.median)} i månaden, så du kan spara mycket på att välja
          rätt.
        </p>
      }
      nyckeltal={[
        ...(d.minst
          ? [
              {
                varde: kr(snittForstaAret(d.minst)),
                text:
                  d.minst.bindning === 0
                    ? `billigast med minst ${n.gb} GB, utan bindningstid`
                    : `billigast med minst ${n.gb} GB`,
              },
            ]
          : []),
        ...(d.minstUtan && d.minstUtan.id !== d.minst?.id
          ? [{ varde: kr(snittForstaAret(d.minstUtan)), text: "billigast utan bindningstid" }]
          : []),
        { varde: String(d.iNivan.length), text: `abonnemang på ${n.fran}–${n.till} GB` },
        { varde: kr(d.median), text: `mittenpris för ${n.fran}–${n.till} GB` },
      ].slice(0, 3)}
      jamforelse={<Jamforelse forval={{ behovGb: n.gb, sortering: "snitt-ar" }} id="lista" />}
      jamforelseRubrik={`Alla abonnemang med minst ${n.gb} GB`}
      jamforelseIngress="Sorterade efter snittpris per månad första året, med kampanj och startavgift inräknade. Obegränsad surf räknas med, eftersom den också täcker behovet."
      faq={fragor}
      lankar={[
        ...grannar.map((x) => ({
          href: `/surf/${x.slug}`,
          label: `${x.gb} GB surf`,
          text: `Billigaste abonnemangen med ${x.gb} GB.`,
        })),
        {
          href: "/obegransad-surf",
          label: "Obegränsad surf",
          text: "Om du inte vill hålla koll på surfen.",
        },
        {
          href: "/verktyg/hur-mycket-surf-behover-jag",
          label: "Hur mycket surf behöver jag?",
          text: "Räkna ut rätt surfmängd på en minut.",
        },
      ]}
      ctaRubrik={`Hitta billigaste ${n.gb} GB`}
      ctaBild={n.bild}
      uppdaterad="2026-10-29"
    >
      <h2>Billigaste abonnemangen med {n.gb} GB</h2>
      <p>
        Här är abonnemangen på {n.fran}–{n.till} GB som alla kan teckna, sorterade efter vad de
        kostar i snitt per månad första året. Abonnemang som kräver att du är student, ung eller
        pensionär står inte med här.
      </p>
      <GuideTable
        brytForsta
        head={["Abonnemang", "Surf", "Snitt år 1", "Sedan", "Bindning", "Kr/GB"]}
        rows={d.iNivan
          .slice(0, 12)
          .map((a) => [
            vem(a),
            gbText(a.gb),
            `${kr(snittForstaAret(a))}/mån`,
            `${kr(a.pris)}/mån`,
            a.bindning == null ? "Framgår inte" : a.bindning === 0 ? "Ingen" : `${a.bindning} mån`,
            prisPerGb(a) != null ? `${formatTal(prisPerGb(a) as number)} kr` : "",
          ])}
      />

      {steg.length > 1 && (
        <>
          <h2>Vad kostar det att ta ett steg upp eller ner?</h2>
          <p>
            Skillnaden mellan surfnivåerna är ofta mindre än man tror. Så här mycket kostar
            billigaste abonnemanget på varje nivå, räknat som snittpris första året:
          </p>
          <GuideTable
            brytForsta
            head={["Behov", "Billigast", "Snitt år 1", "Totalt 24 mån"]}
            rows={steg.map((s) => [
              s.niva,
              `${vem(s.a)} (${gbText(s.a.gb)})`,
              `${kr(snittForstaAret(s.a))}/mån`,
              kr(totalKostnad(s.a, 24)),
            ])}
          />
          {d.minst && d.billigastHogre && d.hogre && (
            <p>
              {snittForstaAret(d.billigastHogre) - snittForstaAret(d.minst) > 0
                ? `Att gå från minst ${n.gb} till minst ${d.hogre.gb} GB kostar ${kr(snittForstaAret(d.billigastHogre) - snittForstaAret(d.minst))} mer i månaden just nu.`
                : `Just nu kostar minst ${d.hogre.gb} GB inte mer än minst ${n.gb} GB. Då kan du lika gärna ta mer surf.`}{" "}
              Använder du sällan allt kan ett abonnemang med sparad surf vara ett bättre val än att
              gå upp en nivå.
            </p>
          )}
        </>
      )}

      <h2>Räcker {n.gb} GB?</h2>
      <p>
        Enligt PTS använde ett abonnemang med samtal och data i snitt {MARKNAD.surfPerManad} GB i
        månaden 2025.{" "}
        {n.gb < MARKNAD.surfPerManad
          ? `${n.gb} GB är alltså lite under snittet.`
          : n.gb <= MARKNAD.surfPerManad * 2
            ? `${n.gb} GB räcker alltså för de flesta.`
            : `${n.gb} GB är mer än ${Math.floor(n.gb / MARKNAD.surfPerManad)} gånger snittet.`}{" "}
        Det är video som drar mest. Så här långt räcker {n.gb} GB om du bara gör en sak:
      </p>
      <ul>
        <li>
          cirka {d.hdTimmar} timmar film i HD ({ANVANDNING.netflixHd} GB i timmen)
        </li>
        <li>
          cirka {d.mediumTimmar} timmar film i medium kvalitet (
          {formatTal(ANVANDNING.netflixMedium)} GB i timmen)
        </li>
        <li>
          cirka {formatTal(d.musikTimmar)} timmar musik i normal kvalitet (
          {ANVANDNING.spotifyNormalMb} MB i timmen)
        </li>
      </ul>
      <p>
        Siffrorna är maxvärden som tjänsterna själva anger. Räkna på dina egna vanor med verktyget{" "}
        <Link to={"/verktyg/hur-mycket-surf-behover-jag" as never}>
          hur mycket surf behöver jag
        </Link>
        , eller läs hur mycket{" "}
        <Link to={"/guider/hur-mycket-surf-drar-appar" as never}>olika appar drar</Link>.
      </p>

      <h2>Billigast med {n.gb} GB i varje mobilnät</h2>
      <p>
        Alla operatörer kör i något av Sveriges fyra mobilnät. Har ett nät dålig täckning där du bor
        kan du välja billigaste abonnemanget i ett annat.
      </p>
      <GuideTable
        brytForsta
        head={["Nät", "Billigast", "Snitt år 1"]}
        rows={d.perNat.map((r) => [
          r.namn,
          r.a ? `${vem(r.a)} (${gbText(r.a.gb)})` : `Inget abonnemang på ${n.fran}–${n.till} GB`,
          r.a ? `${kr(snittForstaAret(r.a))}/mån` : "",
        ])}
      />
      <p>
        Läs mer om näten och täckningen på <Link to={"/nat" as never}>mobilnät och täckning</Link>.
      </p>

      <h2>Bindningstid, sparad surf och 5G</h2>
      <p>
        Av de {d.iNivan.length} abonnemangen på {n.fran}–{n.till} GB har {d.utanBindning} ingen
        bindningstid och {d.medBindning} har bindningstid.
        {d.okandBindning > 0 &&
          ` För ${d.okandBindning} framgår bindningstiden inte av operatörens sida.`}{" "}
        {d.sparad > 0 &&
          `${d.sparad} har sparad surf, där det du inte använder följer med till nästa månad. `}
        {d.femg} av dem har 5G.
      </p>
      {d.kronorPerGb.length > 1 && (
        <p>
          Räknat på ordinarie pris kostar surfen från {formatTal(d.kronorPerGb[0])} kronor per GB
          upp till {formatTal(d.kronorPerGb[d.kronorPerGb.length - 1])} kronor per GB på den här
          nivån.
        </p>
      )}
      <p>
        Kampanjpriser gäller oftast bara några månader. Läs{" "}
        <Link to={"/guider/kampanjpris-efter-kampanjen" as never}>
          vad du betalar efter kampanjen
        </Link>{" "}
        innan du beställer.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Data per
        timme:{" "}
        <a href={ANVANDNING.netflixKalla} target="_blank" rel="noopener nofollow">
          Netflix Help Center
        </a>{" "}
        och{" "}
        <a href={ANVANDNING.spotifyKalla} target="_blank" rel="noopener nofollow">
          Spotify Support
        </a>
        . Surf per abonnemang: PTS, Svensk telekommarknad 2025.
      </p>
    </PelarSida>
  );
}
