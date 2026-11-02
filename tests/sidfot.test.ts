import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

// Leons beslut 2 november 2026: sex länkar i varje sidfotskolumn på alla tre sajterna.
test("sidfotens kolumner har sex länkar var", () => {
  const kod = readFileSync(new URL("../src/components/site-footer.tsx", import.meta.url), "utf8");
  const kolumner = [
    ...kod.matchAll(
      /(?:title|rubrik|heading)\s*:\s*"([^"]+)"\s*,\s*(?:links|lankar|items)\s*:\s*\[([\s\S]*?)\n\s*\]/g,
    ),
  ];
  expect(kolumner.length).toBeGreaterThanOrEqual(6);
  for (const [, namn, lankar] of kolumner) {
    const antal = (lankar.match(/label\s*:/g) ?? []).length;
    expect({ namn, antal }).toEqual({ namn, antal: 6 });
  }
});
