import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { registreraSidvisning } from "./matning";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Säkerhetsheaders på alla svar. Ingen Content-Security-Policy ännu: den
// måste först provas mot Supabase och de externa resurser sidorna laddar.
const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "SAMEORIGIN",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function withSecurityHeaders(response: Response): Response {
  // Svar på protokollbyte (websocket) och redirect-svar från fetch kan ha
  // låsta headers. Kopiera till ett nytt svar i stället för att ändra dem.
  if (response.status === 101) return response;
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (!headers.has(name)) headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Adresser med avslutande snedstreck (/villalarm/) skickas permanent till
// adressen utan, så att Google räknar dem som samma sida. Routern gör annars
// en tillfällig 307.
function utanAvslutandeSnedstreck(request: Request): Response | null {
  if (request.method !== "GET" && request.method !== "HEAD") return null;
  const url = new URL(request.url);
  if (url.pathname.length < 2 || !url.pathname.endsWith("/")) return null;
  url.pathname = url.pathname.replace(/\/+$/, "") || "/";
  return new Response(null, { status: 301, headers: { Location: url.toString() } });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const omdirigering = utanAvslutandeSnedstreck(request);
    if (omdirigering) return withSecurityHeaders(omdirigering);
    try {
      const handler = await getServerEntry();
      const response = withSecurityHeaders(
        await normalizeCatastrophicSsrResponse(await handler.fetch(request, env, ctx)),
      );
      registreraSidvisning(request, response);
      return response;
    } catch (error) {
      console.error(error);
      const response = withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
      registreraSidvisning(request, response);
      return response;
    }
  },
};
