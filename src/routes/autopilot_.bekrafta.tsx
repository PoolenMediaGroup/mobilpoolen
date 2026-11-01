import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { LegalPage } from "@/components/legal-page";
import { pageHead } from "@/lib/seo";
import { anropaAutopilot } from "@/lib/autopilot";

/**
 * Kunden bekräftar sin e-post med ett klick på knappen. Inget händer när sidan bara
 * öppnas, eftersom mejlprogram förhämtar länkar för att leta efter skadlig kod.
 */
export const Route = createFileRoute("/autopilot_/bekrafta")({
  validateSearch: z.object({ token: z.string().optional() }),
  head: () =>
    pageHead({
      title: "Bekräfta Mobilpoolen Autopilot",
      description: "Bekräfta din e-post så startar bevakningen av ditt mobilabonnemang.",
      canonical: "/autopilot/bekrafta",
      noindex: true,
    }),
  component: Sida,
});

type Status = "vantar" | "skickar" | "ok" | "redan" | "ogiltig" | "fel";

function Sida() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<Status>(token ? "vantar" : "ogiltig");
  const [fornamn, setFornamn] = useState("");

  async function bekrafta() {
    setStatus("skickar");
    const s = await anropaAutopilot({ action: "bekrafta", token });
    if (s.fornamn) setFornamn(s.fornamn);
    setStatus(
      s.status === "ok" || s.status === "redan" || s.status === "ogiltig" ? s.status : "fel",
    );
  }

  return (
    <LegalPage>
      <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {status === "ok" || status === "redan"
          ? `Klart${fornamn ? `, ${fornamn}` : ""}!`
          : "Bekräfta Autopilot"}
      </h1>
      {(status === "vantar" || status === "skickar") && (
        <>
          <p>Klicka på knappen så att vi vet att det är din e-post. Bevakningen börjar direkt.</p>
          <button
            type="button"
            onClick={bekrafta}
            disabled={status === "skickar"}
            className="btn-cta mt-6"
          >
            {status === "skickar" ? "Bekräftar …" : "Bekräfta och starta"}
          </button>
        </>
      )}
      {status === "ok" && (
        <p>
          Mobilpoolen Autopilot är igång. Vi har skickat ett mejl med det vi har registrerat och vad
          som är billigast för dig just nu. Du hör av oss i god tid innan din bindningstid eller
          rabatt tar slut.
        </p>
      )}
      {status === "redan" && <p>Din e-post är redan bekräftad och bevakningen är igång.</p>}
      {status === "ogiltig" && (
        <p>
          Länken fungerar inte. Den kan vara gammal eller redan använd. Fyll i{" "}
          <Link to={"/autopilot" as never} className="text-primary underline underline-offset-2">
            formuläret
          </Link>{" "}
          igen, så skickar vi en ny.
        </p>
      )}
      {status === "fel" && (
        <p>Något gick fel. Försök igen om en stund, eller mejla info@mobilpoolen.se.</p>
      )}
    </LegalPage>
  );
}
