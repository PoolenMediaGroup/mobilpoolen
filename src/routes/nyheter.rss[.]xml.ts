import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { NYHETER, NYHETER_SENAST_ANDRAD } from "@/lib/nyheter";

const BASE_URL = "https://mobilpoolen.se";

function xml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** RFC 822-datum, kl. 08.00 svensk tid räknat som 06.00 UTC. */
function rssDatum(iso: string): string {
  return new Date(`${iso}T06:00:00Z`).toUTCString();
}

export const Route = createFileRoute("/nyheter/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const items = NYHETER.map((n) => {
          const url = `${BASE_URL}/nyheter/${n.slug}`;
          return [
            "    <item>",
            `      <title>${xml(n.titel)}</title>`,
            `      <link>${url}</link>`,
            `      <guid isPermaLink="true">${url}</guid>`,
            `      <description>${xml(n.ingress)}</description>`,
            `      <pubDate>${rssDatum(n.publiceradIso)}</pubDate>`,
            "    </item>",
          ].join("\n");
        });

        const body = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">`,
          "  <channel>",
          "    <title>Mobilpoolen: nyheter om mobilabonnemang</title>",
          `    <link>${BASE_URL}/nyheter</link>`,
          `    <atom:link href="${BASE_URL}/nyheter/rss.xml" rel="self" type="application/rss+xml" />`,
          "    <description>Nyheter om mobilabonnemang, priser, operatörer, mobilnät och regler i Sverige, med källa och datum.</description>",
          "    <language>sv-SE</language>",
          `    <lastBuildDate>${rssDatum(NYHETER_SENAST_ANDRAD)}</lastBuildDate>`,
          ...items,
          "  </channel>",
          "</rss>",
        ].join("\n");

        return new Response(body, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
