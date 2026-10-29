import { Link, createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const EPOST = "info@mobilpoolen.se";

/** Färdiga mejl, så att det som behövs för att rätta ett pris kommer med direkt. */
const ARENDEN: { rubrik: string; text: string; amne: string; brodtext?: string }[] = [
  {
    rubrik: "Allmänna frågor",
    text: "Frågor om tjänsten, jämförelsen eller guiderna.",
    amne: "Fråga till Mobilpoolen",
  },
  {
    rubrik: "Rapportera fel pris",
    text: "Har en operatör ändrat pris eller villkor? Skriv vilket abonnemang det gäller och länka gärna till operatörens sida.",
    amne: "Fel pris på Mobilpoolen",
    brodtext:
      "Operatör och abonnemang:\nVad som står på Mobilpoolen:\nVad som står hos operatören (länk):\n",
  },
  {
    rubrik: "Operatörer och samarbeten",
    text: "Är du operatör och vill rätta en uppgift eller prata samarbete?",
    amne: "Operatör eller samarbete",
  },
  {
    rubrik: "Dina personuppgifter",
    text: "Frågor om hur vi behandlar personuppgifter eller om dina rättigheter.",
    amne: "Personuppgifter",
  },
];

function mailto(amne: string, brodtext?: string) {
  const delar = [`subject=${encodeURIComponent(amne)}`];
  if (brodtext) delar.push(`body=${encodeURIComponent(brodtext)}`);
  return `mailto:${EPOST}?${delar.join("&")}`;
}

export const Route = createFileRoute("/kontakt")({
  head: () =>
    pageHead({
      title: "Kontakta oss | Mobilpoolen",
      description:
        "Mejla Mobilpoolen på info@mobilpoolen.se om du har frågor om tjänsten, vill rapportera ett fel pris eller är operatör och vill rätta en uppgift.",
      canonical: "https://mobilpoolen.se/kontakt",
    }),
  component: KontaktPage,
});

function KontaktPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden bg-dark-section">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-40 -right-32 w-[480px] h-[480px] rounded-full"
            style={{
              background: "color-mix(in srgb, var(--primary) 35%, transparent)",
              filter: "blur(4px)",
            }}
          />
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-8 lg:pt-12 lg:pb-10">
            <h1
              className="font-bold text-white"
              style={{
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                fontSize: "clamp(28px, 4.4vw, 40px)",
              }}
            >
              Kontakta oss
            </h1>
            <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-white/82">
              Mejla oss på{" "}
              <a href={`mailto:${EPOST}`} className="underline underline-offset-2 hover:text-white">
                {EPOST}
              </a>
              . Vi har ingen telefon och inget formulär, men vi läser varje mejl och svarar så fort
              vi kan.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pb-24">
          <div className="max-w-[680px]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {ARENDEN.map((a) => (
                <div key={a.rubrik} className="card-soft flex flex-col p-5">
                  <h2 className="text-[16px] font-semibold text-foreground">{a.rubrik}</h2>
                  <p className="mt-2 flex-1 text-[14.5px] leading-relaxed text-foreground/80">
                    {a.text}
                  </p>
                  <a
                    href={mailto(a.amne, a.brodtext)}
                    className="mt-3 inline-flex min-h-11 items-center gap-2 text-[15px] font-semibold text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    Mejla oss
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-12 space-y-4 text-[16px] leading-relaxed text-foreground/90">
              <h2 className="text-xl font-bold text-foreground">
                Hittat ett pris som inte stämmer?
              </h2>
              <p>
                Operatörerna ändrar priser och kampanjer ofta. Varje abonnemang i jämförelsen har en
                länk till operatörens sida och ett datum för när vi senast kontrollerade det. Ser du
                att något har ändrats vill vi gärna veta det. Skriv vilket abonnemang det gäller,
                vad som står hos oss och vad som står hos operatören, så rättar vi efter att ha
                kontrollerat det mot operatörens egen sida.{" "}
                <Link to="/sa-jamfor-vi" className="text-primary underline underline-offset-2">
                  Så jämför vi
                </Link>
                .
              </p>
              <p>
                Gäller frågan ditt eget abonnemang, din faktura eller en uppsägning? Då behöver du
                kontakta operatören direkt, eftersom vi inte har tillgång till ditt avtal. Hur du
                säger upp hos varje operatör står på{" "}
                <Link to="/saga-upp" className="text-primary underline underline-offset-2">
                  säga upp mobilabonnemang
                </Link>
                .
              </p>
              <p>
                Skriv inga känsliga uppgifter, som personnummer, i mejlet. Hur vi hanterar det du
                skickar står i vår{" "}
                <Link to="/integritetspolicy" className="text-primary underline underline-offset-2">
                  integritetspolicy
                </Link>
                .
              </p>
            </div>

            <div className="mt-16 text-sm text-foreground/65">
              <p>
                Mobilpoolen drivs av PMG Poolen Media Group AB.{" "}
                <Link to="/om-oss" className="underline underline-offset-2 hover:text-foreground">
                  Om oss
                </Link>
              </p>
              <p>Org.nr: 559602-5287 · Säte: Stockholm</p>
              <p>Postadress: Valfrid Palmgrens gata 12, 113 69 Stockholm</p>
              <p>
                E-post:{" "}
                <a href={`mailto:${EPOST}`} className="underline underline-offset-2">
                  {EPOST}
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
