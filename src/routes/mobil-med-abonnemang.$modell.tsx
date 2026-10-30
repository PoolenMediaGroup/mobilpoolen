import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { TelefonKort } from "@/components/mobil/telefon-kort";
import { GuideTable } from "@/components/guide-page";
import { datumText, gbText, kr } from "@/lib/mobil/berakna";
import {
  TELEFONMODELLER,
  TELEFON_KONTROLLERAD,
  erbjudandenFor,
  lagring,
  mobilRabatt,
  modellNamn,
  opNamn,
  sjalvKop,
  telefonmodell,
} from "@/lib/mobil/telefon";
import { operator } from "@/lib/mobil/data";
import type { Telefonmodell } from "@/lib/mobil/typer";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript, pageHead } from "@/lib/seo";

const HUB = "/mobil-med-abonnemang";

function trail(m: Telefonmodell) {
  return [
    { name: "Start", path: "/" },
    { name: "Mobil med abonnemang", path: HUB },
    { name: modellNamn(m), path: `${HUB}/${m.slug}` },
  ];
}

function data(m: Telefonmodell) {
  const lista = erbjudandenFor(m.slug);
  const medTotal = lista.filter((e) => e.minstaTotal != null);
  const billigast = medTotal[0] ?? null;
  const lagstManad = [...lista]
    .filter((e) => e.perManad != null)
    .sort((a, b) => (a.perManad as number) - (b.perManad as number))[0];
  const sjalv = billigast ? sjalvKop(m, billigast) : null;
  return { lista, medTotal, billigast, lagstManad, sjalv };
}

function faq(m: Telefonmodell) {
  const { lista, billigast, lagstManad, sjalv } = data(m);
  const namn = modellNamn(m);
  const f: { q: string; a: string; kalla?: string }[] = [];
  if (billigast) {
    f.push({
      q: `Var är ${namn} billigast med abonnemang?`,
      a: `Räknat på mobilen plus abonnemanget under bindningstiden är ${opNamn(billigast)} billigast, ${kr(billigast.minstaTotal as number)} totalt med ${billigast.abonnemang} i ${billigast.bindning} månader. ${billigast.perManad != null && billigast.manader ? `Mobilen kostar ${kr(billigast.perManad)} i månaden i ${billigast.manader} månader.` : ""}`,
    });
  }
  if (lagstManad) {
    f.push({
      q: `Vad kostar ${namn} per månad?`,
      a: `Lägst månadskostnad för själva mobilen har ${opNamn(lagstManad)}, ${kr(lagstManad.perManad as number)} i ${lagstManad.manader} månader. Abonnemanget betalar du utöver det. Ett lågt månadspris kan bero på en längre avbetalningstid, så jämför totalkostnaden.`,
    });
  }
  if (m.tillverkarpris != null) {
    f.push({
      q: `Är det billigare att köpa ${namn} själv?`,
      a: sjalv
        ? `${m.marke} säljer ${namn} för ${kr(m.tillverkarpris)}. Köper du den där och tar ${operator(sjalv.abonnemang.operator)?.namn ?? ""} ${sjalv.abonnemang.namn} utan bindningstid i ${sjalv.manader} månader blir det ${kr(sjalv.total)}, mot ${kr(billigast?.minstaTotal ?? 0)} hos ${billigast ? opNamn(billigast) : "billigaste operatören"}. ${sjalv.total < (billigast?.minstaTotal ?? 0) ? "Att köpa själv är alltså billigare just nu, och du slipper bindningstid." : "Operatörens paket är alltså billigare just nu, men då binder du dig."}`
        : `${m.marke} säljer ${namn} för ${kr(m.tillverkarpris)}. Jämför med vad mobilen kostar hos operatörerna i tabellen på sidan.`,
    });
  }
  f.push({
    q: "Kostar det ränta att delbetala mobilen?",
    a: "Hos de flesta operatörerna är delbetalningen räntefri. Telenor tar en uppläggningsavgift på 295 kr. Operatören gör en kreditprövning innan du får delbetala, och du har 14 dagars ångerrätt på kreditavtalet.",
    kalla: "Operatörernas webbplatser och Konsumenternas Bank- och finansbyrå",
  });
  f.push({
    q: "Vad händer om jag säger upp abonnemanget innan mobilen är betald?",
    a: "Då betalar du resten av mobilen ändå, och under bindningstiden även abonnemanget. Hur restskulden betalas står i operatörens villkor.",
  });
  return { f, lista };
}

export const Route = createFileRoute("/mobil-med-abonnemang/$modell")({
  loader: ({ params }) => {
    const m = telefonmodell(params.modell);
    if (!m) throw notFound();
    return { slug: m.slug };
  },
  head: ({ params }) => {
    const m = telefonmodell(params.modell);
    if (!m) return {};
    const { lista, billigast } = data(m);
    const namn = modellNamn(m);
    return pageHead({
      title: `${namn} med abonnemang: jämför pris 2026 | Mobilpoolen`,
      description: `${namn} med abonnemang hos ${lista.length} operatörer.${billigast ? ` Lägst totalkostnad: ${kr(billigast.minstaTotal as number)} hos ${opNamn(billigast)}.` : ""} Jämför med att köpa mobilen själv.`,
      canonical: `${HUB}/${m.slug}`,
      scripts: [
        breadcrumbJsonLd(trail(m)),
        faqJsonLd(faq(m).f),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: `${namn} med abonnemang, lägst totalkostnad först`,
          itemListElement: lista.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: `${opNamn(e)}: ${e.perManad != null ? `${kr(e.perManad)} per månad i ${e.manader} månader` : "kontant"}${e.minstaTotal != null ? `, totalt ${kr(e.minstaTotal)}` : ""}`,
          })),
        }),
      ],
    });
  },
  component: Sida,
});

function Sida() {
  const { slug } = Route.useLoaderData();
  const m = telefonmodell(slug)!;
  const { lista, medTotal, billigast, lagstManad, sjalv } = data(m);
  const { f } = faq(m);
  const namn = modellNamn(m);
  const andra = TELEFONMODELLER.filter((x) => x.slug !== m.slug);
  const saknas = ["telia", "tele2", "telenor", "tre", "comviq", "hallon", "vimla"].filter(
    (op) => !lista.some((e) => e.operator === op),
  );

  return (
    <PelarSida
      trail={trail(m)}
      rubrik={`${namn} med abonnemang: jämför operatörerna`}
      ingress={
        <p>
          {billigast && (
            <>
              Lägst totalkostnad för {namn} med abonnemang har {opNamn(billigast)}:{" "}
              {kr(billigast.minstaTotal as number)} för mobilen och {billigast.abonnemang} under{" "}
              {billigast.bindning} månaders bindningstid.{" "}
            </>
          )}
          {m.tillverkarpris != null && (
            <>
              {m.marke} säljer {namn} {lagring(m)} för {kr(m.tillverkarpris)}.{" "}
            </>
          )}
          {sjalv && billigast && (
            <>
              Köper du mobilen själv och tar billigaste abonnemanget utan bindning med minst{" "}
              {billigast.abonnemangGb} GB blir det {kr(sjalv.total)} under samma tid.
            </>
          )}
        </p>
      }
      nyckeltal={[
        ...(billigast
          ? [
              {
                varde: kr(billigast.minstaTotal as number),
                text: "lägst totalt, mobil + abonnemang",
              },
            ]
          : []),
        ...(lagstManad
          ? [
              {
                varde: `${kr(lagstManad.perManad as number)}/mån`,
                text: `lägst för mobilen (${opNamn(lagstManad)}, ${lagstManad.manader} mån)`,
              },
            ]
          : []),
        ...(m.tillverkarpris != null
          ? [{ varde: kr(m.tillverkarpris), text: `${m.marke}s eget pris utan abonnemang` }]
          : []),
      ]}
      jamforelse={
        <ul className="grid gap-4 md:grid-cols-2">
          {lista.map((e, i) => (
            <TelefonKort key={e.operator} m={m} e={e} etta={i === 0 && e.minstaTotal != null} />
          ))}
        </ul>
      }
      jamforelseRubrik={`${namn} hos ${lista.length} operatörer`}
      jamforelseIngress="Sorterade på totalkostnad: mobilen plus operatörens exempelabonnemang under bindningstiden, med engångsavgifter. Där abonnemanget väljs fritt står bara mobilens pris."
      faq={f}
      lankar={[
        { href: HUB, label: "Alla mobiler med abonnemang", text: "Jämför alla modeller." },
        ...andra.slice(0, 4).map((x) => ({
          href: `${HUB}/${x.slug}`,
          label: `${modellNamn(x)} med abonnemang`,
        })),
        {
          href: "/guider/mobil-med-eller-utan-abonnemang",
          label: "Mobil med eller utan abonnemang?",
          text: "Så räknar du på det.",
        },
      ]}
      ctaRubrik="Hitta abonnemanget till din nya mobil"
      ctaBild="kort-laptop-betalning"
      uppdaterad={TELEFON_KONTROLLERAD}
    >
      {medTotal.length > 0 && m.tillverkarpris != null && (
        <>
          <h2>Med abonnemang eller köpa {namn} själv?</h2>
          <p>
            Här jämförs operatörens paket med att köpa mobilen hos {m.marke} för{" "}
            {kr(m.tillverkarpris)} och ta billigaste abonnemanget utan bindningstid med minst lika
            mycket surf, under samma antal månader.
          </p>
          <GuideTable
            brytForsta
            head={["Operatör", "Paketet", "Köpa själv", "Skillnad"]}
            rows={medTotal.map((e) => {
              const s = sjalvKop(m, e);
              return [
                `${opNamn(e)}, ${e.abonnemang} i ${e.bindning} mån`,
                kr(e.minstaTotal as number),
                s
                  ? `${kr(s.total)} (${operator(s.abonnemang.operator)?.namn} ${gbText(s.abonnemang.gb)})`
                  : "–",
                s
                  ? s.total < (e.minstaTotal as number)
                    ? `${kr((e.minstaTotal as number) - s.total)} billigare själv`
                    : `${kr(s.total - (e.minstaTotal as number))} billigare med paketet`
                  : "–",
              ];
            })}
          />
          <p>
            Paketet kan ändå passa dig om operatören ger rabatt på mobilen, om du vill sprida
            kostnaden utan ränta eller om du ändå skulle stanna hos operatören. Läs mer i guiden{" "}
            <Link to={"/guider/mobil-med-eller-utan-abonnemang" as never}>
              mobil med eller utan abonnemang
            </Link>
            .
          </p>
        </>
      )}

      <h2>Vad kostar {namn} hos operatörerna?</h2>
      {/* Kolumnen mot tillverkarens pris visas bara när det priset finns. */}
      <GuideTable
        brytForsta
        head={
          lista.some((e) => mobilRabatt(m, e) != null)
            ? ["Operatör", "Per månad", "Mobilen totalt", `Mot ${m.marke}`]
            : ["Operatör", "Per månad", "Mobilen totalt"]
        }
        rows={lista.map((e) => {
          const r = mobilRabatt(m, e);
          const rad = [
            opNamn(e),
            e.perManad != null ? `${kr(e.perManad)} i ${e.manader} mån` : "Kontant",
            kr((e.telefonTotalt ?? e.kontantpris) as number),
          ];
          if (!lista.some((x) => mobilRabatt(m, x) != null)) return rad;
          return [
            ...rad,
            r == null ? "–" : r === 0 ? "Samma" : r > 0 ? `${kr(r)} billigare` : `${kr(-r)} dyrare`,
          ];
        })}
      />
      {saknas.length > 0 && (
        <p>
          {saknas.map((s) => operator(s)?.namn ?? s).join(", ")} sålde inte {namn} när vi
          kontrollerade.
        </p>
      )}

      <h2>Det här ska du kolla innan du köper</h2>
      <ul>
        <li>
          <strong>Totalkostnaden, inte månadspriset.</strong> En längre avbetalningstid ger lägre
          månadspris men samma eller högre totalkostnad.
        </li>
        <li>
          <strong>Abonnemanget efter kampanjen.</strong> Exempelabonnemangen har ofta ett lägre pris
          de första månaderna.
        </li>
        <li>
          <strong>Avgifter.</strong> Delbetalningen är räntefri hos de flesta, men Telenor tar 295
          kr i uppläggningsavgift. Betalar du för sent kan räntefriheten försvinna.
        </li>
        <li>
          <strong>Kreditprövning och ångerrätt.</strong> Operatören prövar om du kan betala, och du
          har 14 dagar att ångra kreditavtalet.
        </li>
      </ul>
      <p className="kalla">
        Källa: operatörernas och {m.marke}s webbplatser, kontrollerade{" "}
        {datumText(TELEFON_KONTROLLERAD)}.
        {m.tillverkarkalla && (
          <>
            {" "}
            <a href={m.tillverkarkalla} target="_blank" rel="noopener nofollow">
              {m.marke}s pris
            </a>
            .
          </>
        )}{" "}
        Priser på mobiler ändras ofta. Kontrollera hos operatören innan du beställer.
      </p>
    </PelarSida>
  );
}
