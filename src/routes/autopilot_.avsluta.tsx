import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { LegalPage } from "@/components/legal-page";
import { pageHead } from "@/lib/seo";
import { anropaAutopilot } from "@/lib/autopilot";

/** Avsluta Autopilot med ett klick på knappen (inte när sidan öppnas, se bekrafta). */
export const Route = createFileRoute("/autopilot_/avsluta")({
  validateSearch: z.object({ token: z.string().optional() }),
  head: () =>
    pageHead({
      title: "Avsluta Mobilpoolen Autopilot",
      description: "Avsluta bevakningen av ditt mobilabonnemang.",
      canonical: "/autopilot/avsluta",
      noindex: true,
    }),
  component: Sida,
});

type Status = "vantar" | "skickar" | "ok" | "redan" | "ogiltig" | "fel";

function Sida() {
  const { token } = Route.useSearch();
  const [status, setStatus] = useState<Status>(token ? "vantar" : "ogiltig");

  async function avsluta() {
    setStatus("skickar");
    const s = await anropaAutopilot({ action: "avsluta", token });
    setStatus(
      s.status === "ok" || s.status === "redan" || s.status === "ogiltig" ? s.status : "fel",
    );
  }

  return (
    <LegalPage>
      <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
        {status === "ok" || status === "redan" ? "Autopilot är avslutad" : "Avsluta Autopilot"}
      </h1>
      {(status === "vantar" || status === "skickar") && (
        <>
          <p>
            Vill du sluta få påminnelser om ditt mobilabonnemang? Klicka på knappen. Du kan starta
            Autopilot igen när du vill.
          </p>
          <button
            type="button"
            onClick={avsluta}
            disabled={status === "skickar"}
            className="btn-cta mt-6"
          >
            {status === "skickar" ? "Avslutar …" : "Avsluta Autopilot"}
          </button>
        </>
      )}
      {(status === "ok" || status === "redan") && (
        <p>
          Du får inga fler mejl från Autopilot. Dina uppgifter raderas efter 90 dagar, och ditt
          mobilnummer har vi redan tagit bort. Ångrar du dig kan du{" "}
          <Link to={"/autopilot" as never} className="text-primary underline underline-offset-2">
            starta Autopilot igen
          </Link>
          .
        </p>
      )}
      {status === "ogiltig" && (
        <p>
          Länken fungerar inte. Mejla info@mobilpoolen.se från adressen du anmälde, så avslutar vi
          åt dig.
        </p>
      )}
      {status === "fel" && (
        <p>Något gick fel. Försök igen om en stund, eller mejla info@mobilpoolen.se.</p>
      )}
    </LegalPage>
  );
}
