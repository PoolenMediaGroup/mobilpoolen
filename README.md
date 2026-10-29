# Mobilpoolen

Mobilpoolen är en svensk jämförelsetjänst för hemlarm. Besökaren jämför larmbolagens publicerade villkor och kan skicka en offertförfrågan, som går vidare till två till tre utvalda larmbolag.

Sajten drivs av PMG Poolen Media Group AB (559602-5287) och är syskonsajt till Elpoolen. Mobilpoolen får ersättning från larmbolagen. Det står öppet på `/sa-tjanar-vi-pengar` och vid varje offertknapp.

## Läs CLAUDE.md först

`CLAUDE.md` gäller för allt arbete i repot, både för människor och för AI-sessioner. Där står reglerna för innehåll, SEO, bilder, design, git och vilka påståenden som är kontrollerade. Den här filen är bara en översikt.

## Två saker som aldrig får stå på sajten

- **Ordet "oberoende" om Mobilpoolen.** Vi får betalt av larmbolagen och är inte oberoende. Skriv det inte, inte heller i omskriven form.
- **Påståenden om att vi testar larm.** Vi installerar inga larm och provar dem inte i bruk. Vi jämför bolagens publicerade villkor och priser. Skriv aldrig "testat", "testvinnare", "bäst i test" eller liknande, och sätt aldrig egna betyg eller stjärnor på bolagen.

Hitta heller aldrig på siffror. Varje pris och villkor kontrolleras mot bolagets egen webbplats och får ett datum.

## Teknik

- TanStack Start (SSR), React och Tailwind CSS
- Supabase som backend: larmbolag, publicerade startpaket och offertförfrågningar (`src/lib/mobilpoolen-supabase.ts`)
- Hostas på Cloudflare Workers (worker `mobilpoolen`). Cloudflare Workers Builds bygger och publicerar varje merge till `main` automatiskt.
- Bun som pakethanterare

## Köra lokalt

```sh
bun install
bun run dev
```

Före en PR:

```sh
bun run fix          # prettier + eslint --fix
npx tsc --noEmit
bun run lint
bun run build
```

Allt ska vara grönt innan något mergas. Arbeta på en egen gren och pusha aldrig direkt till `main`.

## Struktur i korthet

- `src/routes/`: en fil per sida
- `src/components/`: sidmallar och delade komponenter
- `src/lib/`: data och hjälpfunktioner, bland annat `seo.ts`, `guides.ts` och bildbanken `bildbank.ts`
- `public/`: `robots.txt`, `llms.txt` och statiska filer
