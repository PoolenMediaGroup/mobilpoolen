import { useEffect, useRef, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { ChevronDown, Mail } from "lucide-react";

/**
 * Kontaktformulärets mottagare: edge function i Elpoolens Supabase-projekt, där
 * Resend-nyckeln finns. Källkoden ligger i supabase/functions/mobilpoolen-kontakt.
 * verify_jwt är av, så ingen nyckel behövs.
 */
const KONTAKT_URL = "https://rilpjkuozcglwnxwfxgl.supabase.co/functions/v1/mobilpoolen-kontakt";

const AMNEN = ["Allmän fråga", "Larmbolag eller samarbete"] as const;

const NAMN_MAX = 100;
const EPOST_MAX = 200;
const MEDDELANDE_MAX = 5000;
const EPOST_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Falt = "name" | "email" | "message";
type FaltFel = Partial<Record<Falt, string>>;

const FALTFEL: Record<string, [Falt, string]> = {
  invalid_name: ["name", "Fyll i ditt namn."],
  invalid_email: ["email", "Fyll i en giltig e-postadress, till exempel namn@exempel.se."],
  invalid_message: ["message", "Skriv ett meddelande på minst två tecken."],
};

const FELMEDDELANDEN: Record<string, string> = {
  rate_limited: "Du har skickat flera meddelanden på kort tid. Vänta en stund och försök igen.",
  invalid_subject: "Välj vad ärendet gäller och försök igen.",
  send_failed:
    "Meddelandet kunde inte skickas just nu. Försök igen om en stund eller mejla oss direkt på info@mobilpoolen.se.",
};

const STANDARDFEL =
  "Något gick fel. Försök igen eller mejla oss direkt på info@mobilpoolen.se. Ditt meddelande finns kvar.";

function validera(form: { name: string; email: string; message: string }): FaltFel {
  const fel: FaltFel = {};
  const namn = form.name.trim();
  if (!namn) fel.name = "Fyll i ditt namn.";
  else if (namn.length > NAMN_MAX) fel.name = `Namnet får vara högst ${NAMN_MAX} tecken.`;
  const epost = form.email.trim();
  if (!epost) fel.email = "Fyll i din e-postadress.";
  else if (!EPOST_RE.test(epost) || epost.length > EPOST_MAX)
    fel.email = "Fyll i en giltig e-postadress, till exempel namn@exempel.se.";
  const meddelande = form.message.trim();
  if (meddelande.length < 2) fel.message = "Skriv ett meddelande på minst två tecken.";
  else if (meddelande.length > MEDDELANDE_MAX)
    fel.message = `Meddelandet får vara högst ${MEDDELANDE_MAX} tecken.`;
  return fel;
}

export const Route = createFileRoute("/kontakt")({
  head: () =>
    pageHead({
      title: "Kontakta oss | Mobilpoolen",
      description:
        "Frågor om Mobilpoolens jämförelsetjänst, dina uppgifter eller samarbeten? Mejla oss så svarar vi så fort vi kan.",
      canonical: "https://mobilpoolen.se/kontakt",
    }),
  component: KontaktPage,
});

function KontaktPage() {
  const [form, setForm] = useState({
    subject: "Allmän fråga",
    name: "",
    email: "",
    message: "",
  });
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [felText, setFelText] = useState(STANDARDFEL);
  const [faltFel, setFaltFel] = useState<FaltFel>({});
  const skickar = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const felRuta = useRef<HTMLParagraphElement>(null);
  const tackRubrik = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (status === "success") tackRubrik.current?.focus();
    if (status === "error") felRuta.current?.focus();
  }, [status]);

  const andra = (falt: "subject" | Falt, value: string) => {
    setForm((f) => ({ ...f, [falt]: value }));
    if (falt !== "subject") setFaltFel((fel) => ({ ...fel, [falt]: undefined }));
  };

  const fokuseraForstaFel = () =>
    window.requestAnimationFrame(() =>
      formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending" || skickar.current) return;
    const fel = validera(form);
    setFaltFel(fel);
    if (Object.keys(fel).length > 0) {
      setStatus("idle");
      fokuseraForstaFel();
      return;
    }
    skickar.current = true;
    setStatus("sending");
    try {
      const res = await fetch(KONTAKT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.subject,
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          website,
        }),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;
      if (data?.ok === true) {
        setStatus("success");
        return;
      }
      const kod = data?.error ?? (res.status === 429 ? "rate_limited" : "");
      const falt = FALTFEL[kod];
      if (falt) {
        setFaltFel({ [falt[0]]: falt[1] });
        setStatus("idle");
        fokuseraForstaFel();
        return;
      }
      setFelText(FELMEDDELANDEN[kod] ?? STANDARDFEL);
      setStatus("error");
    } catch {
      setFelText(STANDARDFEL);
      setStatus("error");
    } finally {
      skickar.current = false;
    }
  };

  const resetForm = () => {
    setForm({
      subject: "Allmän fråga",
      name: "",
      email: "",
      message: "",
    });
    setWebsite("");
    setFaltFel({});
    setStatus("idle");
  };

  // Samma fält som hero-, offert- och väntelisteformulären (input-lg): 56 px
  // höga och med en kant som har 3,4:1 mot vitt. Den gamla grå kanten hade 1,5:1.
  const fieldClass = "input-lg text-foreground placeholder:text-muted-foreground";

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
              Frågor om tjänsten, dina uppgifter eller samarbeten? Mejla oss så svarar vi så fort vi
              kan.
            </p>
            <p className="mt-2 max-w-2xl text-[17px] leading-relaxed text-white/82">
              Vi som grundade Mobilpoolen svarar personligen, oftast inom 24 timmar.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pb-24">
          <div className="max-w-[560px]">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="card-soft p-3 flex flex-col justify-center items-center min-h-[90px]">
                <h2 className="text-sm font-semibold text-foreground text-center leading-tight">
                  Allmänna frågor &amp; support
                </h2>
                <a
                  href="mailto:info@mobilpoolen.se"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                >
                  info@mobilpoolen.se
                </a>
              </div>
              <div className="card-soft p-3 flex flex-col justify-center items-center min-h-[90px]">
                <h2 className="text-sm font-semibold text-foreground text-center leading-tight">
                  Larmbolag &amp; samarbeten
                </h2>
                <a
                  href="mailto:samarbeten@mobilpoolen.se"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline"
                >
                  samarbeten@mobilpoolen.se
                </a>
              </div>
            </div>

            <div className="card-soft mt-12 p-8">
              {status === "success" ? (
                <div className="text-center py-6">
                  <h2
                    ref={tackRubrik}
                    tabIndex={-1}
                    className="text-lg font-bold text-foreground outline-none"
                  >
                    Tack för ditt meddelande!
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Vi svarar oftast inom 24 timmar.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="mt-6 inline-flex items-center justify-center rounded-xl border border-primary/30 px-5 h-11 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
                  >
                    Skicka ett till
                  </button>
                </div>
              ) : (
                <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="absolute left-[-9999px]" aria-hidden="true">
                    <label htmlFor="contact-website" className="sr-only">
                      Fyll inte i detta fält
                    </label>
                    <input
                      id="contact-website"
                      type="text"
                      name="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Vad gäller det?
                    </label>
                    <div className="relative">
                      <select
                        id="contact-subject"
                        value={form.subject}
                        onChange={(e) => andra("subject", e.target.value)}
                        className={`${fieldClass} pr-10 appearance-none`}
                      >
                        {AMNEN.map((amne) => (
                          <option key={amne}>{amne}</option>
                        ))}
                      </select>
                      <ChevronDown
                        aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Namn
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={form.name}
                      onChange={(e) => andra("name", e.target.value)}
                      aria-required
                      aria-invalid={faltFel.name ? true : undefined}
                      aria-describedby={faltFel.name ? "contact-name-error" : undefined}
                      placeholder="Ditt namn"
                      autoComplete="name"
                      maxLength={NAMN_MAX}
                      className={fieldClass}
                    />
                    {faltFel.name && (
                      <p
                        id="contact-name-error"
                        role="alert"
                        className="mt-1 text-sm text-destructive"
                      >
                        {faltFel.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      E-postadress
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => andra("email", e.target.value)}
                      aria-required
                      aria-invalid={faltFel.email ? true : undefined}
                      aria-describedby={faltFel.email ? "contact-email-error" : undefined}
                      placeholder="namn@exempel.se"
                      autoComplete="email"
                      inputMode="email"
                      maxLength={EPOST_MAX}
                      className={fieldClass}
                    />
                    {faltFel.email && (
                      <p
                        id="contact-email-error"
                        role="alert"
                        className="mt-1 text-sm text-destructive"
                      >
                        {faltFel.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Meddelande
                    </label>
                    <textarea
                      id="contact-message"
                      value={form.message}
                      onChange={(e) => andra("message", e.target.value)}
                      aria-required
                      aria-invalid={faltFel.message ? true : undefined}
                      aria-describedby={faltFel.message ? "contact-message-error" : undefined}
                      placeholder="Vad kan vi hjälpa dig med?"
                      rows={4}
                      maxLength={MEDDELANDE_MAX}
                      className={`${fieldClass} py-3 resize-vertical`}
                    />
                    {faltFel.message && (
                      <p
                        id="contact-message-error"
                        role="alert"
                        className="mt-1 text-sm text-destructive"
                      >
                        {faltFel.message}
                      </p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    aria-busy={status === "sending"}
                    className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl bg-cta text-cta-foreground font-semibold hover:bg-cta-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Mail className="w-4 h-4" aria-hidden />
                    {status === "sending" ? "Skickar…" : "Skicka meddelande"}
                  </button>
                  <p className="text-[13px] leading-relaxed text-foreground/65">
                    Vi använder dina uppgifter bara för att svara på ditt meddelande. Läs mer i vår{" "}
                    <Link
                      to="/integritetspolicy"
                      className="text-primary underline underline-offset-2"
                    >
                      integritetspolicy
                    </Link>
                    .
                  </p>
                  {status === "error" && (
                    <p
                      ref={felRuta}
                      tabIndex={-1}
                      className="text-sm text-destructive outline-none"
                      role="alert"
                    >
                      {felText}
                    </p>
                  )}
                </form>
              )}
            </div>

            <div className="mt-16 text-sm text-muted-foreground">
              <p>
                Mobilpoolen drivs av PMG Poolen Media Group AB.{" "}
                <Link to="/om-oss" className="underline underline-offset-2 hover:text-foreground">
                  Om oss
                </Link>
              </p>
              <p>Org.nr: 559602-5287 · Säte: Stockholm</p>
              <p>Postadress: Valfrid Palmgrens gata 12, 113 69 Stockholm</p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
