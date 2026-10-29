/**
 * AI-chatten: gör om en renderad sida på sajten till ren text som Claude kan läsa.
 *
 * Samma fil finns i Mobilpoolens repo. Ändra i båda.
 *
 * Bara innehållet i <main> tas med. Meny, sidfot, skript, stilar, ikoner och
 * dolda element tas bort. Rubriker och listpunkter behålls som markeringar så
 * att strukturen syns, och länkar blir "text (/sokvag)" när de pekar inom sajten.
 */

const ENTITETER: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  ndash: "–",
  mdash: "—",
  hellip: "…",
  shy: "",
  aring: "å",
  auml: "ä",
  ouml: "ö",
  Aring: "Å",
  Auml: "Ä",
  Ouml: "Ö",
  eacute: "é",
};

export function avkodaEntiteter(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (hel, kod: string) => {
    if (kod[0] === "#") {
      const n =
        kod[1] === "x" || kod[1] === "X" ? parseInt(kod.slice(2), 16) : parseInt(kod.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
    }
    return ENTITETER[kod] ?? hel;
  });
}

function hamtaTitel(html: string): string | null {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? avkodaEntiteter(m[1]).replace(/\s+/g, " ").trim() : null;
}

/**
 * Tar bort element med allt innehåll, även nästlade av samma sort.
 * Med `villkor` tas bara element vars starttagg matchar villkoret bort.
 */
function taBortElement(html: string, tagg: string, villkor?: RegExp): string {
  let ut = html;
  let fran = 0;
  for (let varv = 0; varv < 200; varv++) {
    const oppna = new RegExp(`<${tagg}\\b[^>]*>`, "gi");
    oppna.lastIndex = fran;
    let start: RegExpExecArray | null;
    while ((start = oppna.exec(ut)) && villkor && !villkor.test(start[0])) {
      /* leta vidare efter en starttagg som uppfyller villkoret */
    }
    if (!start) break;
    // Hitta matchande sluttagg med räkning av nivåer.
    const re = new RegExp(`<(/?)${tagg}\\b[^>]*>`, "gi");
    re.lastIndex = start.index;
    let niva = 0;
    let slut = -1;
    let m: RegExpExecArray | null;
    while ((m = re.exec(ut))) {
      if (m[0].endsWith("/>")) continue;
      niva += m[1] ? -1 : 1;
      if (niva === 0) {
        slut = m.index + m[0].length;
        break;
      }
    }
    ut = slut === -1 ? ut.slice(0, start.index) : ut.slice(0, start.index) + " " + ut.slice(slut);
    fran = start.index;
  }
  return ut;
}

/**
 * Dekorativa element med aria-hidden="true". Attributet hidden räknas inte: stängda
 * dragspel (vanliga frågor) ligger ofta i HTML:en med hidden och ska läsas.
 * CSS-klasser som overflow-hidden påverkar inte.
 */
const DOLD = /\saria-hidden=["']true["']/i;

export type Sidtext = { titel: string | null; text: string };

/**
 * @param html hela sidans HTML
 * @param maxTecken texten kortas till så här många tecken
 */
export function sidaTillText(html: string, maxTecken = 14_000): Sidtext {
  const titel = hamtaTitel(html);
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/i);
  let s = main ? main[1] : (html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html);

  s = s.replace(/<!--[\s\S]*?-->/g, " ");
  for (const t of [
    "script",
    "style",
    "noscript",
    "svg",
    "template",
    "iframe",
    "nav",
    "footer",
    "form",
    "dialog",
  ]) {
    s = taBortElement(s, t);
  }
  // Dekorativa element (aria-hidden) tas bort.
  for (const t of ["div", "span", "p", "section", "ul"]) s = taBortElement(s, t, DOLD);

  // Struktur: rubriker, listpunkter, stycken, tabellceller och radbrytningar.
  s = s.replace(/<h([1-4])\b[^>]*>/gi, (_, n: string) => `\n\n${"#".repeat(Number(n))} `);
  s = s.replace(/<\/h[1-6]>/gi, "\n");
  s = s.replace(/<li\b[^>]*>/gi, "\n- ");
  s = s.replace(/<(td|th)\b[^>]*>/gi, " | ");
  s = s.replace(/<\/tr>/gi, "\n");
  s = s.replace(/<(br|hr)\b[^>]*>/gi, "\n");
  s = s.replace(
    /<\/(p|div|section|article|header|ul|ol|table|blockquote|dd|dt|figcaption|summary|details)>/gi,
    "\n",
  );

  // Interna länkar behålls som "text (/sokvag)", externa blir bara text.
  s = s.replace(
    /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_, href: string, inre: string) => {
      const text = inre
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
      if (!text) return " ";
      const h = avkodaEntiteter(href);
      return /^\/(?!\/)/.test(h) && !h.startsWith(text)
        ? ` ${text} (${h.split("#")[0] || h}) `
        : ` ${text} `;
    },
  );

  // Inline-element tas bort utan mellanslag, så att "Verisure<span>s</span>" blir "Verisures".
  s = s.replace(/<\/?(span|strong|em|b|i|u|s|small|sup|sub|abbr|time|mark|bdi|wbr)\b[^>]*>/gi, "");
  s = s.replace(/<[^>]+>/g, " ");
  s = avkodaEntiteter(s);
  s = s
    .split("\n")
    .map((rad) => rad.replace(/[ \t\u00a0]+/g, " ").trim())
    .filter((rad, i, alla) => rad !== "" || (i > 0 && alla[i - 1] !== ""))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (s.length > maxTecken) {
    const kortad = s.slice(0, maxTecken);
    const sistaRad = kortad.lastIndexOf("\n");
    s = `${kortad.slice(0, sistaRad > maxTecken * 0.8 ? sistaRad : maxTecken)}\n\n[Sidan är längre än så här. Resten är inte med.]`;
  }
  return { titel, text: s };
}
