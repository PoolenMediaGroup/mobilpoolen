/**
 * AI-chatten: anropet från webbläsaren. Samma fil finns i Mobilpoolens repo.
 * Läser svaret rad för rad medan det strömmar in.
 */
import type { ChattHandelse, ChattMeddelande } from "./protokoll";

export async function skickaTillChatten(opt: {
  samtal: ChattMeddelande[];
  sida: string;
  samtalId: string;
  signal: AbortSignal;
  pa: (h: ChattHandelse) => void;
}): Promise<void> {
  let res: Response;
  try {
    res = await fetch("/api/chatt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ samtal: opt.samtal, sida: opt.sida, samtalId: opt.samtalId }),
      signal: opt.signal,
    });
  } catch {
    if (!opt.signal.aborted) opt.pa({ t: "fel", kod: "natverk" });
    return;
  }
  if (!res.body) {
    opt.pa({ t: "fel", kod: "natverk" });
    return;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let avslutad = false;
  const rad = (r: string) => {
    if (!r.trim()) return;
    try {
      const h = JSON.parse(r) as ChattHandelse;
      if (h.t === "klar" || h.t === "fel") avslutad = true;
      opt.pa(h);
    } catch {
      /* trasig rad hoppas över */
    }
  };
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let i: number;
      while ((i = buffer.indexOf("\n")) !== -1) {
        rad(buffer.slice(0, i));
        buffer = buffer.slice(i + 1);
      }
    }
    rad(buffer);
  } catch {
    if (opt.signal.aborted) return;
  }
  if (!avslutad && !opt.signal.aborted) opt.pa({ t: "fel", kod: res.ok ? "ai_fel" : "natverk" });
}

export function nyttSamtalsId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    // Äldre webbläsare: en slumpad v4-liknande id räcker för att knyta ihop frågorna.
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}
