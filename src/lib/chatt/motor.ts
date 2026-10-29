/**
 * AI-chatten: motorn som pratar med Claude. Körs bara på servern (Cloudflare-workern).
 *
 * Samma fil finns i Mobilpoolens repo. Ändra i båda.
 *
 * Claude svarar med strömmande text. Behöver svaret fakta anropar Claude ett
 * verktyg (läs en sida på sajten, hämta dagens elpris, visa en knapp). Motorn
 * kör verktyget, skickar tillbaka resultatet och låter Claude fortsätta.
 * Högst MAX_RUNDOR varv per fråga, sista varvet utan verktyg.
 *
 * Det enda som går till webbläsaren är händelserna i protokoll.ts. Systemprompten,
 * verktygens resultat och API-nyckeln stannar här.
 */
import type { ChattHandelse, ChattMeddelande } from "./protokoll";

export type VerktygKontext = {
  skicka: (h: ChattHandelse) => void;
};

export type ChattVerktyg = {
  namn: string;
  beskrivning: string;
  schema: Record<string, unknown>;
  /** Lägesrad i chatten medan verktyget körs. Null betyder ingen rad. */
  status?: (input: Record<string, unknown>) => string | null;
  /** Kör verktyget. Returnerar texten Claude får som resultat. */
  kor: (input: Record<string, unknown>, ktx: VerktygKontext) => Promise<string>;
};

export type ChattKnappDef = { etikett: string; href?: string };

export type ChattSajt = {
  /** Fast systemprompt. Cachas hos Anthropic, så den får inte ändras per anrop. */
  system: string;
  /** Liten del som ändras per anrop (datum, sidan besökaren står på). Cachas inte. */
  kontext: string;
  verktyg: ChattVerktyg[];
  /**
   * Knappar Claude kan visa genom att skriva [[knapp:id]] i svaret. Markeringen
   * plockas bort ur texten medan den strömmar och blir en knapp under svaret.
   * Det sparar ett helt varv mot API:t jämfört med ett verktyg för knappar.
   */
  knappar?: Record<string, ChattKnappDef>;
  /**
   * Hämtar innehåll som troligen svarar på frågan innan Claude anropas (se
   * forhamtning.ts). Läggs före frågan. Null betyder inget.
   */
  forhamta?: (fraga: string) => Promise<string | null>;
};

/**
 * Plockar ut [[knapp:id]] ur texten medan den strömmar. Text utan markering går
 * vidare direkt. Högst `max` olika knappar per svar, okända id:n tas bort tyst.
 */
export function skapaKnappFilter(
  knappar: Record<string, ChattKnappDef>,
  text: (d: string) => void,
  knapp: (id: string, def: ChattKnappDef) => void,
  max = 2,
) {
  let buf = "";
  const visade = new Set<string>();
  const ut = (s: string) => {
    if (s) text(s);
  };
  const tom = (slut: boolean) => {
    for (;;) {
      const i = buf.indexOf("[[");
      if (i === -1) {
        // Ett ensamt "[" sist kan vara början på en markering: vänta på nästa bit.
        if (!slut && buf.endsWith("[")) {
          ut(buf.slice(0, -1));
          buf = "[";
        } else {
          ut(buf);
          buf = "";
        }
        return;
      }
      ut(buf.slice(0, i));
      buf = buf.slice(i);
      const j = buf.indexOf("]]");
      if (j === -1) {
        if (slut || buf.length > 60) {
          ut(buf);
          buf = "";
        }
        return;
      }
      const inre = buf.slice(2, j).trim();
      buf = buf.slice(j + 2);
      const m = inre.match(/^knapp\s*:\s*([a-z_]+)$/i);
      if (!m) {
        ut(`[[${inre}]]`);
        continue;
      }
      const id = m[1].toLowerCase();
      const def = knappar[id];
      if (def && !visade.has(id) && visade.size < max) {
        visade.add(id);
        knapp(id, def);
      }
    }
  };
  return { in: (d: string) => ((buf += d), tom(false)), slut: () => tom(true) };
}

export type ChattUtfall = {
  svar: string;
  verktyg: string[];
  rundor: number;
  tokensIn: number;
  tokensUt: number;
  cacheLas: number;
  cacheSkriv: number;
  stopp: string | null;
};

export class ChattAiFel extends Error {
  constructor(public status: number) {
    super(`anthropic ${status}`);
  }
}

const MAX_RUNDOR = 5;
const MAX_TOKENS = 1200;

type Block =
  | { type: "text"; text: string; cache_control?: { type: "ephemeral" } }
  | { type: "tool_use"; id: string; name: string; input: Record<string, unknown> }
  | {
      type: "tool_result";
      tool_use_id: string;
      content: string;
      is_error?: boolean;
      cache_control?: { type: "ephemeral" };
    };

type ApiMeddelande = { role: "user" | "assistant"; content: Block[] };

type Runda = {
  text: string;
  block: Block[];
  stopp: string | null;
  tokensIn: number;
  tokensUt: number;
  cacheLas: number;
  cacheSkriv: number;
};

/** Läser Anthropics SSE-ström. Skickar textbitar vidare medan de kommer. */
async function lasStrom(res: Response, nyText: (d: string) => void): Promise<Runda> {
  const r: Runda = {
    text: "",
    block: [],
    stopp: null,
    tokensIn: 0,
    tokensUt: 0,
    cacheLas: 0,
    cacheSkriv: 0,
  };
  const pagaende = new Map<
    number,
    { typ: "text" | "tool_use"; id?: string; namn?: string; text: string; json: string }
  >();
  const reader = res.body!.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";

  const hantera = (data: string) => {
    let e: Record<string, unknown>;
    try {
      e = JSON.parse(data) as Record<string, unknown>;
    } catch {
      return;
    }
    const typ = e.type;
    if (typ === "message_start") {
      const u = (e.message as { usage?: Record<string, number> } | undefined)?.usage ?? {};
      r.tokensIn += u.input_tokens ?? 0;
      r.cacheLas += u.cache_read_input_tokens ?? 0;
      r.cacheSkriv += u.cache_creation_input_tokens ?? 0;
      r.tokensUt += u.output_tokens ?? 0;
    } else if (typ === "content_block_start") {
      const cb = e.content_block as { type: string; id?: string; name?: string; text?: string };
      const i = e.index as number;
      if (cb.type === "text") {
        pagaende.set(i, { typ: "text", text: cb.text ?? "", json: "" });
        if (cb.text) nyText(cb.text);
      } else if (cb.type === "tool_use") {
        pagaende.set(i, { typ: "tool_use", id: cb.id, namn: cb.name, text: "", json: "" });
      }
    } else if (typ === "content_block_delta") {
      const d = e.delta as { type: string; text?: string; partial_json?: string };
      const p = pagaende.get(e.index as number);
      if (!p) return;
      if (d.type === "text_delta" && d.text) {
        p.text += d.text;
        nyText(d.text);
      } else if (d.type === "input_json_delta" && d.partial_json) {
        p.json += d.partial_json;
      }
    } else if (typ === "content_block_stop") {
      const i = e.index as number;
      const p = pagaende.get(i);
      if (!p) return;
      pagaende.delete(i);
      if (p.typ === "text") {
        if (p.text) {
          r.block.push({ type: "text", text: p.text });
          r.text += p.text;
        }
      } else {
        let input: Record<string, unknown> = {};
        try {
          const v = p.json ? JSON.parse(p.json) : {};
          if (v && typeof v === "object" && !Array.isArray(v)) input = v as Record<string, unknown>;
        } catch {
          /* trasig JSON ger tom input, verktyget svarar då med ett fel */
        }
        r.block.push({ type: "tool_use", id: p.id!, name: p.namn!, input });
      }
    } else if (typ === "message_delta") {
      const d = e.delta as { stop_reason?: string } | undefined;
      if (d?.stop_reason) r.stopp = d.stop_reason;
      const u = e.usage as Record<string, number> | undefined;
      if (u?.output_tokens) r.tokensUt = u.output_tokens;
    } else if (typ === "error") {
      const fel = e.error as { type?: string } | undefined;
      throw new ChattAiFel(fel?.type === "overloaded_error" ? 529 : 500);
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += value;
    let slut: number;
    while ((slut = buffer.indexOf("\n\n")) !== -1) {
      const handelse = buffer.slice(0, slut);
      buffer = buffer.slice(slut + 2);
      const data = handelse
        .split("\n")
        .filter((rad) => rad.startsWith("data:"))
        .map((rad) => rad.slice(5).trimStart())
        .join("\n");
      if (data) hantera(data);
    }
  }
  return r;
}

export type KorChattOpt = {
  nyckel: string;
  modell: string;
  sajt: ChattSajt;
  samtal: ChattMeddelande[];
  skicka: (h: ChattHandelse) => void;
  signal?: AbortSignal;
  /** Bara för tester. */
  apiUrl?: string;
  /** Felsökning: skickar tider per varv som statusrader. */
  diag?: boolean;
};

export async function korChatt(opt: KorChattOpt): Promise<ChattUtfall> {
  const { sajt, skicka } = opt;
  const verktygPerNamn = new Map(sajt.verktyg.map((v) => [v.namn, v]));
  const tools = sajt.verktyg.map((v) => ({
    name: v.namn,
    description: v.beskrivning,
    input_schema: v.schema,
  }));

  const meddelanden: ApiMeddelande[] = opt.samtal.map((m) => ({
    role: m.roll,
    content: [{ type: "text", text: m.text }],
  }));
  const sistaMeddelande = meddelanden[meddelanden.length - 1];
  const fragan = sistaMeddelande.content[0];

  // Förhämtning: sidor som troligen svarar på frågan läggs före den, så att Claude
  // oftast klarar sig utan verktygsvarv. Får aldrig ta lång tid eller fälla svaret.
  if (sajt.forhamta && fragan.type === "text") {
    skicka({ t: "status", d: "Läser på sajten" });
    const innehall = await Promise.race([
      sajt.forhamta(fragan.text).catch(() => null),
      new Promise<null>((r) => setTimeout(() => r(null), 4000)),
    ]);
    if (innehall) sistaMeddelande.content.unshift({ type: "text", text: innehall });
  }

  // Cachepunkt på besökarens senaste fråga: nästa varv i samma fråga läser
  // allt fram hit ur cachen i stället för att betala för det igen.
  if (fragan.type === "text") fragan.cache_control = { type: "ephemeral" };

  const utfall: ChattUtfall = {
    svar: "",
    verktyg: [],
    rundor: 0,
    tokensIn: 0,
    tokensUt: 0,
    cacheLas: 0,
    cacheSkriv: 0,
    stopp: null,
  };

  const filter = skapaKnappFilter(
    sajt.knappar ?? {},
    (d) => {
      utfall.svar += d;
      skicka({ t: "text", d });
    },
    (id, def) => skicka({ t: "atgard", atgard: { id, ...def } }),
  );

  for (let runda = 1; runda <= MAX_RUNDOR; runda++) {
    utfall.rundor = runda;
    const body = {
      model: opt.modell,
      max_tokens: MAX_TOKENS,
      stream: true,
      system: [
        { type: "text", text: sajt.system, cache_control: { type: "ephemeral" } },
        { type: "text", text: sajt.kontext },
      ],
      tools,
      // Sista varvet: inga fler verktyg, Claude måste svara med det den har.
      tool_choice: runda === MAX_RUNDOR ? { type: "none" } : { type: "auto" },
      messages: meddelanden,
    };

    const t0 = Date.now();
    let res: Response | null = null;
    // Ett nytt försök om Anthropic är överbelastat, men bara innan något visats.
    for (let forsok = 0; forsok < 2; forsok++) {
      res = await fetch(opt.apiUrl ?? "https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": opt.nyckel,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          // Okomprimerat: komprimerad SSE buffras på vägen, och då kommer hela
          // svaret i ett klump i stället för ord för ord.
          "accept-encoding": "identity",
        },
        body: JSON.stringify(body),
        signal: opt.signal,
      });
      if (res.ok) break;
      const kanForsoka =
        (res.status === 529 || res.status >= 500 || res.status === 429) && !utfall.svar;
      if (!kanForsoka || forsok === 1) throw new ChattAiFel(res.status);
      await new Promise((r) => setTimeout(r, 900));
    }

    const tHuvud = Date.now() - t0;
    let tForsta = -1;
    let tSista = -1;
    let antal = 0;
    const r = await lasStrom(res!, (d) => {
      const t = Date.now() - t0;
      if (tForsta < 0) tForsta = t;
      tSista = t;
      antal++;
      filter.in(d);
    });
    if (opt.diag) {
      skicka({
        t: "status",
        d: `diag varv ${runda}: huvud ${tHuvud} ms, text ${tForsta}–${tSista} ms, ${antal} bitar, slut ${Date.now() - t0} ms, enc ${res!.headers.get("content-encoding") ?? "-"}, typ ${res!.headers.get("content-type") ?? "-"}`,
      });
    }
    filter.slut();
    utfall.tokensIn += r.tokensIn;
    utfall.tokensUt += r.tokensUt;
    utfall.cacheLas += r.cacheLas;
    utfall.cacheSkriv += r.cacheSkriv;
    utfall.stopp = r.stopp;

    const anrop = r.block.filter(
      (b): b is Extract<Block, { type: "tool_use" }> => b.type === "tool_use",
    );
    if (r.stopp !== "tool_use" || anrop.length === 0) break;

    // Text före ett verktygsanrop och texten efter ska inte klistras ihop.
    if (r.text && !/\s$/.test(r.text)) {
      utfall.svar += "\n\n";
      skicka({ t: "text", d: "\n\n" });
    }

    meddelanden.push({ role: "assistant", content: r.block });
    const resultat = await Promise.all(
      anrop.map(async (a): Promise<Block> => {
        utfall.verktyg.push(a.name);
        const v = verktygPerNamn.get(a.name);
        if (!v)
          return {
            type: "tool_result",
            tool_use_id: a.id,
            content: "Okänt verktyg.",
            is_error: true,
          };
        const status = v.status?.(a.input);
        if (status) skicka({ t: "status", d: status });
        try {
          const text = await v.kor(a.input, { skicka });
          return { type: "tool_result", tool_use_id: a.id, content: text || "Klart." };
        } catch (e) {
          console.warn("[chatt] verktyg", a.name, e instanceof Error ? e.message : "fel");
          return {
            type: "tool_result",
            tool_use_id: a.id,
            content:
              "Verktyget fungerade inte just nu. Svara utan det, och säg inte att du har uppgifter du inte fått.",
            is_error: true,
          };
        }
      }),
    );
    // Cachepunkt på senaste verktygsresultatet, så att nästa varv läser sidtexten
    // ur cachen. Bara en sådan punkt åt gången (API:t tillåter fyra totalt).
    for (const m of meddelanden) {
      for (const b of m.content) if (b.type === "tool_result") delete b.cache_control;
    }
    const sistaResultat = resultat[resultat.length - 1];
    if (sistaResultat?.type === "tool_result") sistaResultat.cache_control = { type: "ephemeral" };
    meddelanden.push({ role: "user", content: resultat });
  }

  return utfall;
}
