// Sparar månadens prisindex. Körs efter scripts/bygg_data.py:  bun scripts/prisindex_manad.ts
//
// Varje månad får en rad i research/prisindex-historik.json. Körs skriptet igen
// samma månad skrivs månadens rad över, så att den alltid speglar de senast
// kontrollerade priserna. Tidigare månader ändras aldrig: de är historiken.
// Ur JSON-filen genereras src/lib/mobil/prisindex-historik.ts, som sajten läser.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PRIVATA, SENAST_KONTROLLERAD } from "../src/lib/mobil/data";
import { indexNyckeltal, indexUrval, perNiva, type IndexManad } from "../src/lib/mobil/prisindex";

const ROT = join(import.meta.dir, "..");
const JSON_FIL = join(ROT, "research/prisindex-historik.json");
const TS_FIL = join(ROT, "src/lib/mobil/prisindex-historik.ts");

const urval = indexUrval(PRIVATA);
const avrunda = (x: number | null) => (x == null ? null : Math.round(x * 10) / 10);

const denna: IndexManad = {
  manad: SENAST_KONTROLLERAD.slice(0, 7),
  kontrollerad: SENAST_KONTROLLERAD,
  perNiva: perNiva(urval).map((r) => ({
    ...r,
    min: avrunda(r.min),
    med: avrunda(r.med),
    max: avrunda(r.max),
    kampanjAndel: avrunda(r.kampanjAndel),
  })),
  nyckeltal: (() => {
    const n = indexNyckeltal(urval);
    return {
      ...n,
      kampanjAndel: avrunda(n.kampanjAndel) as number,
      snittHojning: avrunda(n.snittHojning),
      medianHojningKr: avrunda(n.medianHojningKr),
      utanBindningAndel: avrunda(n.utanBindningAndel) as number,
      medianPerGb: avrunda(n.medianPerGb),
    };
  })(),
};

const historik: IndexManad[] = existsSync(JSON_FIL)
  ? JSON.parse(readFileSync(JSON_FIL, "utf8"))
  : [];
const ovriga = historik.filter((m) => m.manad !== denna.manad);
const ny = [...ovriga, denna].sort((a, b) => a.manad.localeCompare(b.manad));

writeFileSync(JSON_FIL, JSON.stringify(ny, null, 2) + "\n");
writeFileSync(
  TS_FIL,
  `// GENERERAD av scripts/prisindex_manad.ts ur research/prisindex-historik.json. Ändra inte för hand.

import type { IndexManad } from "./prisindex";

export const PRISINDEX_HISTORIK: IndexManad[] = ${JSON.stringify(ny, null, 2)};
`,
);
Bun.spawnSync(["npx", "prettier", "--write", TS_FIL], { cwd: ROT });
console.log(
  `Prisindex ${denna.manad}: ${denna.nyckeltal.antal} abonnemang, ${ny.length} ${ny.length === 1 ? "månad" : "månader"} sparad${ny.length === 1 ? "" : "e"}.`,
);
