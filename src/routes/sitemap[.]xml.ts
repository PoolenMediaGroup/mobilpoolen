import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { PUBLISHED_GUIDES } from "@/lib/guides";
import { FASTA_SIDOR } from "@/lib/sidor";
import { MOBILNAT, OPERATORER } from "@/lib/mobil/data";
import { GILTIGA_PAR, parSlug } from "@/lib/mobil/sidtexter";

const BASE_URL = "https://mobilpoolen.se";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries = [
          ...FASTA_SIDOR,
          ...OPERATORER.map((o) => ({ path: `/operatorer/${o.slug}`, lastmod: o.kontrollerad })),
          ...OPERATORER.filter((o) => o.aktiv).map((o) => ({
            path: `/saga-upp/${o.slug}`,
            lastmod: o.kontrollerad,
          })),
          ...Object.keys(MOBILNAT).map((id) => ({ path: `/nat/${id}`, lastmod: "2026-10-29" })),
          ...GILTIGA_PAR.map((p) => ({ path: `/jamfor/${parSlug(p)}`, lastmod: "2026-10-29" })),
          ...PUBLISHED_GUIDES.map((g) => ({ path: `/guider/${g.slug}`, lastmod: g.updatedIso })),
        ];
        const urls = entries.map(
          (e) =>
            `  <url>\n    <loc>${BASE_URL}${e.path === "/" ? "/" : e.path}</loc>\n    <lastmod>${e.lastmod}</lastmod>\n  </url>`,
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
