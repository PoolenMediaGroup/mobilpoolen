import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { mobilpoolenSupabase } from "@/lib/mobilpoolen-supabase";
import { normaliseraSokvag } from "@/lib/chatt/las-sida";
import { ChattAiFel, korChatt } from "@/lib/chatt/motor";
import {
  arForLangt,
  rensaSamtal,
  type ChattFelkod,
  type ChattHandelse,
} from "@/lib/chatt/protokoll";
import { CHATT_MODELL_STANDARD, mobilpoolenChatt } from "@/lib/chatt/sajt-server";
import {
  besokarnyckel,
  forManga,
  loggaChatt,
  tillatenOrigin,
  underDagstak,
} from "@/lib/chatt/skydd";

/**
 * AI-chatten. Tar emot samtalet och svarar med en ström av JSON-rader
 * (se src/lib/chatt/protokoll.ts).
 *
 * Hemligheter och inställningar på workern i Cloudflare (aldrig i koden):
 *  - ANTHROPIC_API_KEY: krävs. Saknas den svarar chatten "inte_igang".
 *  - CHATT_MODELL (valfri): annan modell än standard.
 *  - CHATT_DAGSTAK (valfri): högsta antal frågor per dygn för hela sajten, standard 1500.
 *  - CHATT_DB_NYCKEL (valfri): samma värde som i tabellen chatt_installning, se SQL-filen för chatten.
 *  - CHATT_API_URL (bara för tester): annan adress än Anthropics API.
 */

const SAJT = "mobilpoolen";
const VARDAR = ["mobilpoolen.se", "www.mobilpoolen.se"] as const;
const MAX_KROPP = 60_000;

const rpc = async (fn: string, args: Record<string, unknown>) => {
  if (!mobilpoolenSupabase) return { data: null, error: { message: "ingen databas" } };
  return mobilpoolenSupabase.rpc(fn, args);
};

const rubriker = {
  "cache-control": "no-store",
  "x-robots-tag": "noindex",
};

function felsvar(kod: ChattFelkod, status: number): Response {
  return new Response(JSON.stringify({ t: "fel", kod } satisfies ChattHandelse) + "\n", {
    status,
    headers: { ...rubriker, "content-type": "application/x-ndjson; charset=utf-8" },
  });
}

export const Route = createFileRoute("/api/chatt")({
  server: {
    handlers: {
      GET: async () => new Response(null, { status: 405, headers: { ...rubriker, allow: "POST" } }),
      POST: async ({ request }) => {
        if (!tillatenOrigin(request, VARDAR)) return felsvar("ogiltig", 403);

        // trim(): ett inklistrat radbyte eller mellanslag i Cloudflare ska inte göra nyckeln ogiltig.
        const nyckel = process.env.ANTHROPIC_API_KEY?.trim();
        if (!nyckel) return felsvar("inte_igang", 503);

        const langd = Number(request.headers.get("content-length") ?? "0");
        if (langd > MAX_KROPP) return felsvar("for_langt", 413);
        let kropp: Record<string, unknown>;
        try {
          const text = await request.text();
          if (text.length > MAX_KROPP) return felsvar("for_langt", 413);
          kropp = JSON.parse(text) as Record<string, unknown>;
        } catch {
          return felsvar("ogiltig", 400);
        }

        const samtal = rensaSamtal(kropp.samtal);
        if (!samtal) {
          const forLangt =
            Array.isArray(kropp.samtal) &&
            arForLangt(
              kropp.samtal.map((m) => ({
                text: typeof m?.text === "string" ? m.text : "",
              })),
            );
          return felsvar(forLangt ? "for_langt" : "ogiltig", 400);
        }
        const sida = normaliseraSokvag(kropp.sida);
        const samtalId =
          typeof kropp.samtalId === "string" && /^[0-9a-f-]{36}$/i.test(kropp.samtalId)
            ? kropp.samtalId
            : null;

        if (forManga(await besokarnyckel(request))) return felsvar("for_manga", 429);
        const tak = Number(process.env.CHATT_DAGSTAK ?? "1500") || 1500;
        const dbNyckel = process.env.CHATT_DB_NYCKEL?.trim() || undefined;
        if (!(await underDagstak(rpc, SAJT, tak, dbNyckel))) return felsvar("dagstak", 429);

        const modell = process.env.CHATT_MODELL || CHATT_MODELL_STANDARD;
        const origin = new URL(request.url).origin;
        const sajt = mobilpoolenChatt({ origin, sida });
        const start = Date.now();
        const enc = new TextEncoder();

        // Avbryts när besökaren stänger chatten eller sidan, så att Claude slutar
        // skriva (och kosta) direkt. Kräver flaggan enable_request_signal i wrangler.jsonc.
        const avbryt = new AbortController();
        request.signal.addEventListener("abort", () => avbryt.abort(), { once: true });

        const strom = new ReadableStream<Uint8Array>({
          cancel() {
            avbryt.abort();
          },
          async start(controller) {
            const atgarder: string[] = [];
            let oppen = true;
            const skicka = (h: ChattHandelse) => {
              if (h.t === "atgard") atgarder.push(h.atgard.id);
              if (!oppen) return;
              try {
                controller.enqueue(enc.encode(JSON.stringify(h) + "\n"));
              } catch {
                oppen = false;
              }
            };

            let fel: string | null = null;
            let utfall: Awaited<ReturnType<typeof korChatt>> | null = null;
            try {
              utfall = await korChatt({
                nyckel,
                modell,
                sajt,
                samtal,
                skicka,
                signal: avbryt.signal,
                apiUrl: process.env.CHATT_API_URL || undefined,
                diag: request.headers.get("x-chatt-diag") === "1",
              });
              skicka({ t: "klar" });
            } catch (e) {
              if (avbryt.signal.aborted) {
                fel = "avbruten";
              } else {
                fel = e instanceof ChattAiFel ? `ai_${e.status}` : "ai_fel";
                console.warn("[chatt]", fel);
                skicka({ t: "fel", kod: "ai_fel" });
              }
            }

            await loggaChatt(
              rpc,
              {
                sajt: SAJT,
                samtal_id: samtalId,
                tur: samtal.filter((m) => m.roll === "user").length,
                sida,
                fraga: samtal[samtal.length - 1].text,
                svar: utfall?.svar ?? "",
                verktyg: utfall?.verktyg ?? [],
                atgarder,
                modell,
                tokens_in: utfall?.tokensIn ?? 0,
                tokens_ut: utfall?.tokensUt ?? 0,
                cache_las: utfall?.cacheLas ?? 0,
                cache_skriv: utfall?.cacheSkriv ?? 0,
                svarstid_ms: Date.now() - start,
                fel,
              },
              dbNyckel,
            );

            if (oppen) {
              try {
                controller.close();
              } catch {
                /* redan stängd */
              }
            }
          },
        });

        // text/event-stream även om innehållet är JSON-rader: Cloudflare buffrar och
        // komprimerar andra typer, och då kom hela svaret i ett klump. Klienten läser rad för rad.
        return new Response(strom, {
          status: 200,
          headers: {
            ...rubriker,
            "cache-control": "no-cache, no-transform",
            "content-type": "text/event-stream; charset=utf-8",
            "x-accel-buffering": "no",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
