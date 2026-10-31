import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { FORSLAG_KONTROLLERAD, forslagFor, tillForslag } from "@/lib/mobil/autopilot-forslag";

/**
 * De billigaste abonnemangen för ett behov, som JSON. Hämtas av Autopilots mejlfunktioner
 * i Supabase, så att mejlen alltid visar samma priser som sajten.
 *   /api/autopilot/forslag?gb=20&eu=10
 *   /api/autopilot/forslag?obegransad=1
 */
const tal = (v: string | null) => {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 5000 ? n : null;
};

export const Route = createFileRoute("/api/autopilot/forslag")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const p = new URL(request.url).searchParams;
        const lista = forslagFor({
          gb: tal(p.get("gb")),
          obegransad: p.get("obegransad") === "1",
          euGb: tal(p.get("eu")),
        }).map(tillForslag);
        return new Response(
          JSON.stringify({ kontrollerad: FORSLAG_KONTROLLERAD, forslag: lista }),
          {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "public, max-age=3600",
              "x-robots-tag": "noindex",
            },
          },
        );
      },
    },
  },
});
