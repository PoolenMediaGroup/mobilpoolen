import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { MOBILNAT, operator } from "@/lib/mobil/data";
import { datumText } from "@/lib/mobil/berakna";
import { billigasteFor, bindningsSpann, privataFor, samtNat } from "@/lib/mobil/sidtexter";
import { KALLOR } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Operator } from "@/lib/mobil/typer";

function uppsagFaq(o: Operator) {
  return [
    {
      q: `Hur lång uppsägningstid har ${o.namn}?`,
      a: o.villkor.uppsagningstid
        ? `Enligt ${o.namn}: ${o.villkor.uppsagningstid}. Lagen tillåter högst en månads uppsägningstid för privatpersoner.`
        : `Vi har inte kunnat belägga ${o.namn}s uppsägningstid. Lagen tillåter högst en månads uppsägningstid för privatpersoner, så längre än så får den inte vara.`,
      kalla: KALLOR.lek.namn,
    },
    {
      q: `Måste jag säga upp ${o.namn} om jag byter operatör?`,
      a: `Nej, inte om du tar med numret. Beställ hos den nya operatören och välj att flytta numret. Abonnemanget hos ${o.namn} avslutas när numret flyttats, och avbrottet får vara högst en arbetsdag.`,
    },
    {
      q: `Kan jag säga upp ${o.namn} med bindningstid kvar?`,
      a: "Ja, men du betalar som regel månadsavgiften för resten av bindningstiden. Undantaget är om operatören ändrar villkoren till din nackdel, till exempel höjer priset. Då får du säga upp avtalet utan extra kostnad.",
      kalla: KALLOR.lek.namn,
    },
  ];
}

export const Route = createFileRoute("/saga-upp/$slug")({
  loader: ({ params }) => {
    const o = operator(params.slug);
    if (!o) throw notFound();
    return { slug: o.slug };
  },
  head: ({ params }) => {
    const o = operator(params.slug);
    if (!o) return {};
    return pageHead({
      title: `Säga upp ${o.namn}: uppsägningstid och så gör du | Mobilpoolen`,
      description: `Så säger du upp ditt abonnemang hos ${o.namn}, vilken uppsägningstid som gäller och varför du inte ska säga upp om du vill behålla numret.`,
      canonical: `/saga-upp/${o.slug}`,
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: "Säga upp abonnemang", path: "/saga-upp" },
          { name: o.namn, path: `/saga-upp/${o.slug}` },
        ]),
        faqJsonLd(uppsagFaq(o)),
      ],
    });
  },
  component: Sida,
});

function Sida() {
  const { slug } = Route.useLoaderData();
  const o = operator(slug)!;
  const bindning = bindningsSpann(privataFor(o.slug));
  const alternativ = samtNat(o).filter((g) => billigasteFor(g.slug));
  return (
    <PelarSida
      trail={[
        { name: "Start", path: "/" },
        { name: "Säga upp abonnemang", path: "/saga-upp" },
        { name: o.namn, path: `/saga-upp/${o.slug}` },
      ]}
      rubrik={`Säga upp ${o.namn}`}
      ingress={
        <p>
          Vill du byta operatör och behålla numret ska du inte säga upp {o.namn} själv. Beställ hos
          den nya operatören, så flyttas numret och abonnemanget avslutas automatiskt. Säg bara upp
          själv om du vill sluta använda numret.
        </p>
      }
      nyckeltal={[
        { varde: "Max 1 mån", text: "uppsägningstid enligt lagen för privatpersoner" },
        {
          varde: bindning ?? "Varierar",
          text: `bindningstid på ${o.namn}s abonnemang i vår jämförelse`,
        },
        { varde: "1 dag", text: "längsta tillåtna avbrott när numret flyttas" },
      ]}
      faq={uppsagFaq(o)}
      lankar={[
        {
          href: `/operatorer/${o.slug}`,
          label: `Allt om ${o.namn}`,
          text: "Priser, nät och villkor.",
        },
        { href: "/guider/byta-operator-behalla-nummer", label: "Byta operatör steg för steg" },
        { href: "/saga-upp", label: "Säga upp andra operatörer" },
      ]}
      ctaRubrik={`Hitta något billigare än ${o.namn}`}
      ctaBild="flyttkartong-nyckel"
      uppdaterad="2026-10-29"
    >
      <h2>Så säger du upp {o.namn}</h2>
      <h3>Om du byter operatör och behåller numret</h3>
      <ol>
        <li>Välj nytt abonnemang och beställ hos den nya operatören.</li>
        <li>
          Välj att flytta ditt nuvarande nummer och ange ett datum. Den nya operatören kontaktar{" "}
          {o.namn}.
        </li>
        <li>
          Sätt i det nya SIM-kortet eller aktivera eSIM när flytten är klar. Abonnemanget hos{" "}
          {o.namn} avslutas samtidigt.
        </li>
        <li>Spara bekräftelsen och kolla att slutfakturan stämmer.</li>
      </ol>
      <h3>Om du vill avsluta numret</h3>
      <ol>
        <li>
          Kontakta {o.namn}
          {o.kundtjanst ? ` (${o.kundtjanst})` : ""} eller säg upp via Mina sidor eller appen om det
          går.
        </li>
        <li>Be om en skriftlig bekräftelse med slutdatum.</li>
        <li>
          Har du köpt en telefon på avbetalning via {o.namn} fortsätter avbetalningen tills den är
          betald.
        </li>
      </ol>
      <h2>Villkor hos {o.namn}</h2>
      <ul>
        <li>
          <strong>Uppsägningstid:</strong>{" "}
          {o.villkor.uppsagningstid ?? "uppgift saknas, men högst en månad enligt lagen"}
        </li>
        <li>
          <strong>Bindningstid:</strong> {bindning ?? "framgår inte av operatörens sida"}
        </li>
        <li>
          <strong>Nät:</strong> {MOBILNAT[o.nat].namn}
        </li>
      </ul>
      <p className="kalla">
        {o.namn}s villkor kontrollerade {datumText(o.kontrollerad)}. Lagkrav enligt{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        .
      </p>
      {alternativ.length > 0 && (
        <>
          <h2>Alternativ i samma nät</h2>
          <p>
            Vill du ha samma täckning som hos {o.namn} kan du välja en annan operatör i{" "}
            {MOBILNAT[o.nat].namn.toLowerCase()}:{" "}
            {alternativ.map((g, i) => (
              <span key={g.slug}>
                {i > 0 ? (i === alternativ.length - 1 ? " och " : ", ") : ""}
                <Link to="/operatorer/$slug" params={{ slug: g.slug }}>
                  {g.namn}
                </Link>
              </span>
            ))}
            .
          </p>
        </>
      )}
    </PelarSida>
  );
}
