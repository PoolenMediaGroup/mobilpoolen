/**
 * Taket för nyheter: skyddar mot massproduktion. Kör med: bun test tests/nyhetstak.test.ts
 * Reglerna står i docs/nyhetsroboten.md under "Tak och kvalitet". Samma test finns
 * på Elpoolen, Mobilpoolen, Larmpoolen och Solcellspoolen (bara MAX_FAST_PER_MANAD skiljer).
 * Höj aldrig ett tak för att få in en artikel. Leon beslutar om taken.
 */
import { describe, expect, test } from "bun:test";
import { NYHETER } from "../src/lib/nyheter";

/** Taken gäller artiklar publicerade från den här dagen. Startpartierna före räknas inte. */
const TAK_FRAN = "2026-11-10";
const MAX_PER_DAG = 3;
const MAX_PER_7_DAGAR = 8;
const MAX_FAST_PER_MANAD = 1;
const MAX_TIPS_PER_7_DAGAR = 1;
const MAX_TIPS_PER_MANAD = 4;
const MAX_FAST_OCH_TIPS_PER_7_DAGAR = 3;

const dag = (iso: string) => iso.slice(0, 10);
const typ = (n: (typeof NYHETER)[number]) => n.typ ?? "nyhet";

function iFonster(slut: string, dagar: number) {
  const s = new Date(slut + "T12:00:00Z").getTime();
  return UNDER_TAK.filter((n) => {
    const t = new Date(dag(n.publiceradIso) + "T12:00:00Z").getTime();
    return t <= s && t > s - dagar * 86_400_000;
  });
}

const UNDER_TAK = NYHETER.filter((n) => dag(n.publiceradIso) >= TAK_FRAN);
const allaDagar = [...new Set(UNDER_TAK.map((n) => dag(n.publiceradIso)))];

describe("nyhetstak", () => {
  test("slug och seoTitel är unika", () => {
    expect(new Set(NYHETER.map((n) => n.slug)).size).toBe(NYHETER.length);
    expect(new Set(NYHETER.map((n) => n.seoTitel.toLowerCase())).size).toBe(NYHETER.length);
  });

  test(`högst ${MAX_PER_DAG} artiklar per dag och ${MAX_PER_7_DAGAR} per sju dagar`, () => {
    for (const d of allaDagar) {
      expect({ d, antal: iFonster(d, 1).length }).toEqual({
        d,
        antal: Math.min(iFonster(d, 1).length, MAX_PER_DAG),
      });
      expect({ d, antal: iFonster(d, 7).length }).toEqual({
        d,
        antal: Math.min(iFonster(d, 7).length, MAX_PER_7_DAGAR),
      });
    }
  });

  test("tips och fasta format håller sina tak", () => {
    for (const d of allaDagar) {
      const vecka = iFonster(d, 7);
      const tips = vecka.filter((n) => typ(n) === "tips").length;
      const ovriga = vecka.filter((n) => typ(n) !== "nyhet").length;
      expect({ d, tips }).toEqual({ d, tips: Math.min(tips, MAX_TIPS_PER_7_DAGAR) });
      expect({ d, ovriga }).toEqual({ d, ovriga: Math.min(ovriga, MAX_FAST_OCH_TIPS_PER_7_DAGAR) });
    }
    const manader = [...new Set(UNDER_TAK.map((n) => n.publiceradIso.slice(0, 7)))];
    for (const m of manader) {
      const iManad = UNDER_TAK.filter((n) => n.publiceradIso.startsWith(m));
      const fast = iManad.filter((n) => typ(n) === "fast").length;
      const tips = iManad.filter((n) => typ(n) === "tips").length;
      expect({ m, fast }).toEqual({ m, fast: Math.min(fast, MAX_FAST_PER_MANAD) });
      expect({ m, tips }).toEqual({ m, tips: Math.min(tips, MAX_TIPS_PER_MANAD) });
    }
  });
});
