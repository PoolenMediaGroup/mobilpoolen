# Mobilpoolen

Mobilpoolen (mobilpoolen.se) jämför mobilabonnemang för privatpersoner och företag. Besökaren ser alla operatörers priser efter kampanjen, bindningstid och nät, med källa och datum, och beställer direkt hos operatören.

Sajten drivs av PMG Poolen Media Group AB (559602-5287) och är syskonsajt till Elpoolen och Larmpoolen.

## Läs CLAUDE.md först

`CLAUDE.md` gäller för allt arbete i repot. Där står reglerna för innehåll, data, SEO, design och git.

## Köra lokalt

```sh
bun install
bun run dev
```

Före merge:

```sh
bun run fix
npx tsc --noEmit
npx eslint src
bun run build
```

## Uppdatera priser

Priserna ligger i `src/lib/mobil/operatorer-data.ts` och genereras ur `research/*.json`:

```sh
python3 scripts/bygg_data.py
```

## Publicera på Cloudflare

Samma upplägg som Larmpoolen:

1. Cloudflare → Workers & Pages → Create → Import a repository → välj `PoolenMediaGroup/mobilpoolen`.
2. Build command: `bun run build`. Deploy command: `npx wrangler deploy` (Nitro skriver konfigurationen till `.output/server/wrangler.json`).
3. Lägg till domänen `mobilpoolen.se` (och `www`) under Settings → Domains & Routes.
4. Valfritt: miljövariablerna `VITE_SUPABASE_URL` och `VITE_SUPABASE_PUBLISHABLE_KEY` för besöksräkning (SQL i `supabase/migrations/`).

## Struktur

- `src/routes/`: en fil per sida
- `src/components/mobil/`: jämförelse, pelarsidor, kalkylator
- `src/lib/mobil/`: data, uträkningar, fakta med källor
- `research/`: underlaget som priser och fakta bygger på
- `public/`: `robots.txt`, `llms.txt`, ikoner
