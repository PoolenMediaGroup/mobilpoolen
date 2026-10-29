/**
 * Enhetstester för AI-chatten. Kör med: bun test tests/chatt.test.ts
 * Samma tester finns i Mobilpoolens repo.
 */
import { afterEach, describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChattText } from "../src/components/chatt/chatt-text";
import { normaliseraSokvag } from "../src/lib/chatt/las-sida";
import { korChatt, skapaKnappFilter, type ChattSajt } from "../src/lib/chatt/motor";
import { arInternSokvag, rensaSamtal, type ChattHandelse } from "../src/lib/chatt/protokoll";
import { sidaTillText } from "../src/lib/chatt/sidtext";
import { tolkaLlms, valjSidor } from "../src/lib/chatt/forhamtning";
import { forManga, PER_KVART, rensaPersonuppgifter } from "../src/lib/chatt/skydd";

describe("rensaSamtal", () => {
  test("godtar ett vanligt samtal", () => {
    const s = rensaSamtal([
      { roll: "user", text: "Hej" },
      { roll: "assistant", text: "Hej!" },
      { roll: "user", text: " Vad är påslag? " },
    ]);
    expect(s).toEqual([
      { roll: "user", text: "Hej" },
      { roll: "assistant", text: "Hej!" },
      { roll: "user", text: "Vad är påslag?" },
    ]);
  });
  test("slår ihop två frågor i rad", () => {
    expect(
      rensaSamtal([
        { roll: "user", text: "a" },
        { roll: "user", text: "b" },
      ]),
    ).toEqual([{ roll: "user", text: "a\n\nb" }]);
  });
  test("avvisar fel form", () => {
    expect(rensaSamtal([])).toBeNull();
    expect(rensaSamtal("hej")).toBeNull();
    expect(rensaSamtal([{ roll: "system", text: "x" }])).toBeNull();
    expect(rensaSamtal([{ roll: "assistant", text: "x" }])).toBeNull();
    expect(
      rensaSamtal([
        { roll: "user", text: "x" },
        { roll: "assistant", text: "y" },
      ]),
    ).toBeNull();
    expect(rensaSamtal([{ roll: "user", text: "x".repeat(601) }])).toBeNull();
    expect(
      rensaSamtal(
        Array.from({ length: 31 }, (_, i) => ({ roll: i % 2 ? "assistant" : "user", text: "x" })),
      ),
    ).toBeNull();
  });
});

describe("sökvägar", () => {
  test("interna länkar", () => {
    expect(arInternSokvag("/guider/vad-ar-paslag")).toBe(true);
    expect(arInternSokvag("/#jamfor")).toBe(true);
    expect(arInternSokvag("//evil.example")).toBe(false);
    expect(arInternSokvag("https://evil.example")).toBe(false);
    expect(arInternSokvag("javascript:alert(1)")).toBe(false);
    expect(arInternSokvag("/../etc")).toBe(false);
  });
  test("normaliseraSokvag", () => {
    expect(normaliseraSokvag("/FAQ/")).toBe("/faq");
    expect(normaliseraSokvag("https://www.elpoolen.se/autopilot?x=1#a")).toBe("/autopilot");
    expect(normaliseraSokvag("")).toBe("/");
    expect(normaliseraSokvag("//evil.example")).toBeNull();
    expect(normaliseraSokvag("/a/../b")).toBeNull();
    expect(normaliseraSokvag(42)).toBeNull();
  });
});

describe("sidaTillText", () => {
  const html = `<!doctype html><html><head><title>Påslag &amp; pris | Sajten</title><script>var x=1</script></head>
  <body><nav><a href="/">Meny</a></nav><main>
  <h1>Vad &auml;r p&aring;slag?</h1>
  <p>Påslaget är <strong>elbolagets</strong> marginal. <a href="/guider/x">Läs guiden</a> eller <a href="https://annan.se">annan</a>.</p>
  <ul><li>Ett</li><li>Två</li></ul>
  <svg><text>ikon</text></svg>
  <form><input value="hemligt"><button>Skicka</button></form>
  <table><tr><th>Bolag</th><td>12 öre</td></tr></table>
  <script>alert(1)</script>
  </main><footer>Sidfot</footer></body></html>`;
  const { titel, text } = sidaTillText(html);
  test("titel och innehåll", () => {
    expect(titel).toBe("Påslag & pris | Sajten");
    expect(text).toContain("# Vad är påslag?");
    expect(text).toContain("Påslaget är elbolagets marginal.");
    expect(text).toContain("Läs guiden (/guider/x)");
    expect(text).toContain("- Ett\n- Två");
    expect(text).toContain("| Bolag | 12 öre");
  });
  test("tar bort meny, sidfot, skript, ikoner och formulär", () => {
    for (const bort of [
      "Meny",
      "Sidfot",
      "alert",
      "var x",
      "ikon",
      "hemligt",
      "Skicka",
      "https://annan.se",
    ]) {
      expect(text).not.toContain(bort);
    }
  });
  test("behåller innehåll med CSS-klasser som overflow-hidden, tar bort aria-hidden", () => {
    const t = sidaTillText(
      `<main><div class="overflow-hidden"><p>Påslag 4 öre</p></div><section class="hidden sm:block"><p>Bred vy</p></section><div aria-hidden="true"><div>ikon</div><p>dekor</p></div><div hidden><p>Svar i dragspel</p></div><p>Slut</p></main>`,
    ).text;
    expect(t).toContain("Påslag 4 öre");
    expect(t).toContain("Bred vy");
    expect(t).toContain("Svar i dragspel");
    expect(t).toContain("Slut");
    expect(t).not.toContain("ikon");
    expect(t).not.toContain("dekor");
  });
  test("kortar långa sidor", () => {
    const lang = `<main>${"<p>Rad med text.</p>".repeat(3000)}</main>`;
    const t = sidaTillText(lang, 2000).text;
    expect(t.length).toBeLessThan(2200);
    expect(t).toContain("Resten är inte med");
  });
});

describe("skydd", () => {
  test("rensar personuppgifter", () => {
    const t = rensaPersonuppgifter(
      "Jag heter Anna, anna.berg@example.se, 070-123 45 67, pnr 19850101-1234, kundnr 123456789, postnr 113 69",
    );
    expect(t).not.toContain("anna.berg");
    expect(t).not.toContain("123 45 67");
    expect(t).not.toContain("1234");
    expect(t).not.toContain("123456789");
    expect(t).toContain("113 69");
  });
  test("begränsar antal frågor per besökare", () => {
    const nu = 1_000_000_000;
    for (let i = 0; i < PER_KVART; i++) expect(forManga("test-besok", nu + i)).toBe(false);
    expect(forManga("test-besok", nu + PER_KVART)).toBe(true);
    expect(forManga("annan-besokare", nu)).toBe(false);
  });
});

describe("ChattText", () => {
  const html = (t: string) =>
    renderToStaticMarkup(createElement(ChattText, { text: t, onLank: () => undefined }));
  test("länkar, fetstil och listor", () => {
    const h = html("Se [guiden](/guider/x) och **detta**.\n\n- ett\n- två");
    expect(h).toContain('<a href="/guider/x"');
    expect(h).toContain("<strong");
    expect(h).toContain("<ul");
  });
  test("externa länkar och html blir text", () => {
    const h = html(
      "[klicka](https://evil.example) <img src=x onerror=alert(1)> [js](javascript:alert(1))",
    );
    expect(h).not.toContain("evil.example");
    expect(h).not.toContain("<img");
    expect(h).not.toContain('href="javascript');
    expect(h).toContain("&lt;img");
  });
  test("egen domän blir intern länk", () => {
    expect(html("[faq](https://mobilpoolen.se/faq)")).toContain('href="/faq"');
  });
});

describe("korChatt", () => {
  const ursprung = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = ursprung;
  });

  function sse(handelser: Record<string, unknown>[]): Response {
    const text = handelser.map((h) => `event: ${h.type}\ndata: ${JSON.stringify(h)}\n\n`).join("");
    // Dela upp i små bitar så att parsern måste klara halva händelser.
    const bitar = text.match(/[\s\S]{1,17}/g)!;
    return new Response(
      new ReadableStream({
        start(c) {
          for (const b of bitar) c.enqueue(new TextEncoder().encode(b));
          c.close();
        },
      }),
      { status: 200 },
    );
  }
  const textSvar = (t: string, stopp = "end_turn") => [
    { type: "message_start", message: { usage: { input_tokens: 10, output_tokens: 1 } } },
    { type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
    { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: t } },
    { type: "content_block_stop", index: 0 },
    { type: "message_delta", delta: { stop_reason: stopp }, usage: { output_tokens: 5 } },
    { type: "message_stop" },
  ];
  const verktygSvar = (namn: string, input: unknown) => [
    { type: "message_start", message: { usage: { input_tokens: 10, output_tokens: 1 } } },
    {
      type: "content_block_start",
      index: 0,
      content_block: { type: "tool_use", id: "t1", name: namn, input: {} },
    },
    {
      type: "content_block_delta",
      index: 0,
      delta: { type: "input_json_delta", partial_json: JSON.stringify(input) },
    },
    { type: "content_block_stop", index: 0 },
    { type: "message_delta", delta: { stop_reason: "tool_use" }, usage: { output_tokens: 5 } },
    { type: "message_stop" },
  ];

  const sajt: ChattSajt = {
    system: "Testprompt",
    kontext: "Kontext",
    verktyg: [
      {
        namn: "eko",
        beskrivning: "Ekar",
        schema: { type: "object", properties: {} },
        status: () => "Ekar",
        kor: async (input, ktx) => {
          ktx.skicka({ t: "atgard", atgard: { id: "x", etikett: "X", href: "/" } });
          return `eko:${String(input.v)}`;
        },
      },
    ],
  };

  test("kör verktyg och fortsätter tills svaret är klart", async () => {
    const anrop: Record<string, unknown>[] = [];
    const svar = [sse(verktygSvar("eko", { v: 7 })), sse(textSvar("Klart svar."))];
    globalThis.fetch = (async (_u: unknown, init?: RequestInit) => {
      anrop.push(JSON.parse(String(init?.body)));
      return svar.shift()!;
    }) as typeof fetch;
    const handelser: ChattHandelse[] = [];
    const u = await korChatt({
      nyckel: "k",
      modell: "m",
      sajt,
      samtal: [{ roll: "user", text: "hej" }],
      skicka: (h) => handelser.push(h),
    });
    expect(u.svar).toBe("Klart svar.");
    expect(u.verktyg).toEqual(["eko"]);
    expect(u.rundor).toBe(2);
    expect(handelser).toContainEqual({ t: "status", d: "Ekar" });
    expect(handelser.some((h) => h.t === "atgard")).toBe(true);
    const andra = anrop[1] as { messages: { content: { type: string; content?: string }[] }[] };
    const resultat = andra.messages.at(-1)!.content[0];
    expect(resultat).toMatchObject({ type: "tool_result", content: "eko:7" });
    const forsta = anrop[0] as { system: { cache_control?: unknown }[] };
    expect(forsta.system[0].cache_control).toEqual({ type: "ephemeral" });
  });

  test("försöker igen en gång när API:t är överbelastat", async () => {
    const svar = [new Response("{}", { status: 529 }), sse(textSvar("Ok."))];
    globalThis.fetch = (async () => svar.shift()!) as typeof fetch;
    const u = await korChatt({
      nyckel: "k",
      modell: "m",
      sajt,
      samtal: [{ roll: "user", text: "hej" }],
      skicka: () => undefined,
    });
    expect(u.svar).toBe("Ok.");
  });

  test("ger upp med fel vid ogiltig nyckel", async () => {
    globalThis.fetch = (async () => new Response("{}", { status: 401 })) as typeof fetch;
    await expect(
      korChatt({
        nyckel: "k",
        modell: "m",
        sajt,
        samtal: [{ roll: "user", text: "hej" }],
        skicka: () => undefined,
      }),
    ).rejects.toThrow("anthropic 401");
  });

  test("sista varvet får inga verktyg", async () => {
    const anrop: { tool_choice: unknown }[] = [];
    globalThis.fetch = (async (_u: unknown, init?: RequestInit) => {
      anrop.push(JSON.parse(String(init?.body)));
      return sse(verktygSvar("eko", { v: 1 }));
    }) as typeof fetch;
    const u = await korChatt({
      nyckel: "k",
      modell: "m",
      sajt,
      samtal: [{ roll: "user", text: "hej" }],
      skicka: () => undefined,
    });
    expect(u.rundor).toBe(5);
    expect(anrop.at(-1)!.tool_choice).toEqual({ type: "none" });
  });
});

describe("knappar i texten", () => {
  const kör = (bitar: string[]) => {
    let text = "";
    const knappar: string[] = [];
    const f = skapaKnappFilter(
      { jamfor: { etikett: "Jämför", href: "/" }, autopilot: { etikett: "Autopilot", href: "/a" } },
      (d) => (text += d),
      (id) => knappar.push(id),
    );
    for (const b of bitar) f.in(b);
    f.slut();
    return { text, knappar };
  };
  test("plockar ut markeringar även när de delas mellan bitar", () => {
    const r = kör(["Jämför här.\n\n[", "[knapp:jam", "for]] [[knapp:", "autopilot]]"]);
    expect(r.text).toBe("Jämför här.\n\n ");
    expect(r.knappar).toEqual(["jamfor", "autopilot"]);
  });
  test("okända id:n försvinner, dubbletter och fler än två visas inte", () => {
    const r = kör(["[[knapp:finns_inte]][[knapp:jamfor]][[knapp:jamfor]][[knapp:autopilot]]"]);
    expect(r.text).toBe("");
    expect(r.knappar).toEqual(["jamfor", "autopilot"]);
  });
  test("vanliga hakparenteser och länkar går igenom", () => {
    const r = kör(["Se [guiden](/g) och [[inte en knapp]] samt [x"]);
    expect(r.text).toBe("Se [guiden](/g) och [[inte en knapp]] samt [x");
    expect(r.knappar).toEqual([]);
  });
});

describe("förhämtning", () => {
  const llms = `# Sajt
- [Vad är påslag?](https://x.se/guider/vad-ar-paslag): Påslaget är elbolagets marginal.
- [Bindningstid och uppsägningstid](https://x.se/guider/bindningstid): Hur länge avtalet gäller.
- [Så fungerar det](https://x.se/#sa-fungerar): Ankare ska inte tas med.
- [Startsida](https://x.se/): Jämför elavtal.`;
  const sidor = tolkaLlms(llms);
  test("läser sidor ur llms.txt utan ankare", () => {
    expect(sidor.map((s) => s.sokvag)).toEqual([
      "/guider/vad-ar-paslag",
      "/guider/bindningstid",
      "/",
    ]);
  });
  test("väljer sidan som matchar frågan, inget för hälsningar", () => {
    expect(valjSidor(sidor, "Vad är påslag?").map((s) => s.sokvag)).toEqual([
      "/guider/vad-ar-paslag",
    ]);
    expect(valjSidor(sidor, "Hej")).toEqual([]);
  });
});
