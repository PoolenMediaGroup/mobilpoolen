import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { OPERATORER } from "@/lib/mobil/data";
import { KALLOR } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Säga upp abonnemang", path: "/saga-upp" },
];

const FAQ = [
  {
    q: "Hur säger jag upp mitt mobilabonnemang?",
    a: "Byter du operatör och vill behålla numret ska du inte säga upp själv. Beställ hos den nya operatören, som flyttar numret och avslutar det gamla abonnemanget. Vill du sluta använda numret säger du upp hos din operatör via Mina sidor, appen eller kundtjänst.",
  },
  {
    q: "Hur lång uppsägningstid får ett mobilabonnemang ha?",
    a: "Högst en månad för privatpersoner. Har avtalet bindningstid får du inte behöva säga upp det tidigare än en månad före bindningstidens slut för att det ska upphöra då.",
    kalla: KALLOR.lek.namn,
  },
  {
    q: "Vad händer om jag säger upp innan bindningstiden är slut?",
    a: "Då betalar du som regel resten av bindningstiden. Har operatören ändrat villkoren till din nackdel, till exempel höjt priset, får du säga upp utan extra kostnad.",
    kalla: KALLOR.lek.namn,
  },
];

export const Route = createFileRoute("/saga-upp/")({
  head: () =>
    pageHead({
      title: "Säga upp mobilabonnemang – så gör du hos varje operatör | Mobilpoolen",
      description:
        "Så säger du upp ditt mobilabonnemang hos Telia, Tele2, Telenor, Tre, Comviq, Hallon med flera. Uppsägningstid, bindningstid och hur du behåller numret.",
      canonical: "/saga-upp",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  const ops = OPERATORER.filter((o) => o.aktiv);
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Säga upp mobilabonnemang"
      ingress={
        <p>
          Det viktigaste först: byter du operatör och vill behålla numret ska du inte säga upp
          själv. Den nya operatören sköter flytten och avslutar det gamla abonnemanget. Välj din
          nuvarande operatör nedan för villkor och steg.
        </p>
      }
      jamforelse={
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ops.map((o) => (
            <li key={o.slug}>
              <Link
                to="/saga-upp/$slug"
                params={{ slug: o.slug }}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 hover:shadow-kort"
              >
                <OperatorMonogram namn={o.namn} size={40} />
                <span className="font-semibold group-hover:text-primary">Säga upp {o.namn}</span>
              </Link>
            </li>
          ))}
        </ul>
      }
      jamforelseRubrik="Välj din operatör"
      faq={FAQ}
      lankar={[
        { href: "/guider/byta-operator-behalla-nummer", label: "Byta operatör och behålla numret" },
        { href: "/guider/bindningstid-uppsagningstid", label: "Bindningstid och uppsägningstid" },
        { href: "/utan-bindningstid", label: "Abonnemang utan bindningstid" },
      ]}
      ctaBild="flyttkartong-nyckel"
      uppdaterad="2026-10-29"
    />
  );
}
