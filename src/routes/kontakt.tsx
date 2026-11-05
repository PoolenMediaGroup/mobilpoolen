import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronDown, Mail } from "lucide-react";
import { pageHead } from "@/lib/seo";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";

const EPOST = "info@mobilpoolen.se";

/**
 * Funktionen mobilpoolen-kontakt i PMG:s gemensamma Supabase-projekt skickar meddelandet
 * vidare via Resend. Källkod i supabase/functions/mobilpoolen-kontakt/. Ärendena måste
 * vara samma som RECIPIENTS där.
 */
const KONTAKT_URL = "https://rilpjkuozcglwnxwfxgl.supabase.co/functions/v1/mobilpoolen-kontakt";

const ARENDEN: { namn: string; ledtext: string }[] = [
  { namn: "Allmän fråga", ledtext: "Vad kan vi hjälpa dig med?" },
  {
    namn: "Fel pris eller villkor",
    ledtext:
      "Vilken operatör och vilket abonnemang? Vad står hos oss och vad står hos operatören? Klistra gärna in länken till operatörens sida.",
  },
  {
    namn: "Operatör eller samarbete",
    ledtext: "Berätta vilken operatör du företräder och vad det gäller.",
  },
  {
    namn: "Personuppgifter",
    ledtext: "Vad gäller din fråga? Skriv inte personnummer eller andra känsliga uppgifter.",
  },
];

const FELTEXT: Record<string, string> = {
  invalid_email: "Kontrollera e-postadressen.",
  invalid_name: "Skriv ditt namn.",
  invalid_message: "Skriv ett meddelande.",
  rate_limited:
    "Du har skickat många meddelanden på kort tid. Vänta några minuter och försök igen.",
};

export const Route = createFileRoute("/kontakt")({
  head: () =>
    pageHead({
      title: "Kontakta oss | Mobilpoolen",
      description:
        "Kontakta Mobilpoolen om du har frågor om tjänsten, vill rapportera ett fel pris eller är operatör och vill rätta en uppgift. Vi svarar oftast inom en arbetsdag.",
      canonical: "https://mobilpoolen.se/kontakt",
    }),
  component: KontaktPage,
});

function KontaktPage() {
  const [form, setForm] = useState({ subject: ARENDEN[0].namn, name: "", email: "", message: "" });
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [fel, setFel] = useState("");

  const arende = ARENDEN.find((a) => a.namn === form.subject) ?? ARENDEN[0];

  const skicka = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setFel("");
    try {
      const res = await fetch(KONTAKT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, website }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (data?.ok === true) {
        setStatus("success");
        return;
      }
      setFel((data?.error && FELTEXT[data.error]) || "");
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const nytt = () => {
    setForm({ subject: ARENDEN[0].namn, name: "", email: "", message: "" });
    setWebsite("");
    setFel("");
    setStatus("idle");
  };

  const falt =
    "w-full rounded-xl border border-gray-300 bg-white px-4 text-[16px] md:text-[15px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";
  const etikett = "mb-1.5 block text-sm font-semibold text-foreground";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden hero-mesh">
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
              Frågor om tjänsten, ett pris som inte stämmer eller ett samarbete? Skriv till oss här.
              Vi läser varje meddelande och svarar personligen, oftast inom en arbetsdag.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pb-24">
          <div className="max-w-[680px]">
            <div className="card-soft p-6 sm:p-8">
              {status === "success" ? (
                <div className="py-6 text-center">
                  <h2 className="text-lg font-bold text-foreground">Tack för ditt meddelande!</h2>
                  <p className="mt-2 text-sm text-foreground/75">
                    Vi svarar till {form.email || "din e-postadress"}, oftast inom en arbetsdag.
                  </p>
                  <button
                    type="button"
                    onClick={nytt}
                    className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-primary/30 px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
                  >
                    Skicka ett till
                  </button>
                </div>
              ) : (
                <form onSubmit={skicka} className="space-y-4">
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="kontakt-webbplats">Fyll inte i detta fält</label>
                    <input
                      id="kontakt-webbplats"
                      type="text"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label htmlFor="kontakt-arende" className={etikett}>
                      Vad gäller det?
                    </label>
                    <div className="relative">
                      <select
                        id="kontakt-arende"
                        value={form.subject}
                        onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                        className={`${falt} h-12 appearance-none pr-10`}
                      >
                        {ARENDEN.map((a) => (
                          <option key={a.namn}>{a.namn}</option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="kontakt-namn" className={etikett}>
                      Namn
                    </label>
                    <input
                      id="kontakt-namn"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="Ditt namn"
                      className={`${falt} h-12`}
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="kontakt-epost" className={etikett}>
                      E-postadress
                    </label>
                    <input
                      id="kontakt-epost"
                      type="email"
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                      placeholder="namn@exempel.se"
                      className={`${falt} h-12`}
                      maxLength={200}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="kontakt-meddelande" className={etikett}>
                      Meddelande
                    </label>
                    <textarea
                      id="kontakt-meddelande"
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder={arende.ledtext}
                      rows={5}
                      maxLength={5000}
                      className={`${falt} resize-y py-3`}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cta font-semibold text-cta-foreground transition-colors hover:bg-cta-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Mail className="h-4 w-4" aria-hidden />
                    {status === "sending" ? "Skickar…" : "Skicka meddelande"}
                  </button>
                  {status === "error" && (
                    <p className="text-sm text-red-600" role="alert">
                      {fel || "Något gick fel."} Du kan också mejla oss direkt på{" "}
                      <a href={`mailto:${EPOST}`} className="underline underline-offset-2">
                        {EPOST}
                      </a>
                      .
                    </p>
                  )}
                  <p className="text-[13px] leading-relaxed text-foreground/65">
                    Vi använder bara uppgifterna för att svara dig. Läs mer i vår{" "}
                    <Link to="/integritetspolicy" className="underline underline-offset-2">
                      integritetspolicy
                    </Link>
                    .
                  </p>
                </form>
              )}
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
                Skriv inga känsliga uppgifter, som personnummer, i meddelandet. Hur vi hanterar det
                du skickar står i vår{" "}
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
