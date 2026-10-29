/**
 * AI-chatten: visar ett svar från Claude. Samma fil finns i Mobilpoolens repo.
 *
 * Bara en liten del markdown stöds: stycken, listor med "- " eller "1. ",
 * **fetstil** och länkar [text](/sokvag). Allt byggs som React-element, aldrig
 * som HTML, så svaret kan inte innehålla skript. Länkar som inte pekar inom
 * sajten visas som vanlig text.
 */
import type { ReactNode } from "react";
import { arInternSokvag } from "@/lib/chatt/protokoll";
import { CHATT_SAJT } from "@/lib/chatt/sajt-klient";

type Props = {
  text: string;
  onLank: (href: string) => void;
};

function inline(text: string, onLank: Props["onLank"], nyckel: string): ReactNode[] {
  const ut: ReactNode[] = [];
  const re = /\[([^\]\n]{1,120})\]\(([^)\s]{1,300})\)|\*\*([^*\n]{1,200})\*\*/g;
  let pos = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > pos) ut.push(text.slice(pos, m.index));
    if (m[3] !== undefined) {
      ut.push(
        <strong key={`${nyckel}-${i++}`} className="font-semibold">
          {m[3]}
        </strong>,
      );
    } else {
      const etikett = m[1];
      const egen = new RegExp(
        `^https?://(www\\.)?${CHATT_SAJT.doman.replace(/\./g, "\\.")}(?=/|$)`,
        "i",
      );
      const href = m[2].replace(egen, "") || "/";
      if (arInternSokvag(href)) {
        ut.push(
          <a
            key={`${nyckel}-${i++}`}
            href={href}
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
              e.preventDefault();
              onLank(href);
            }}
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {etikett}
          </a>,
        );
      } else {
        ut.push(etikett);
      }
    }
    pos = m.index + m[0].length;
  }
  if (pos < text.length) ut.push(text.slice(pos));
  return ut;
}

type Del = { typ: "p"; rader: string[] } | { typ: "ul" | "ol"; punkter: string[] };

function delaUpp(text: string): Del[] {
  const delar: Del[] = [];
  for (const radRa of text.replace(/\r/g, "").split("\n")) {
    const rad = radRa.trimEnd();
    const ul = rad.match(/^\s*[-*•]\s+(.*)$/);
    const ol = rad.match(/^\s*\d{1,2}[.)]\s+(.*)$/);
    const sista = delar[delar.length - 1];
    if (ul || ol) {
      const typ = ul ? "ul" : "ol";
      const innehall = (ul ?? ol)![1].replace(/^#+\s*/, "");
      if (sista && sista.typ === typ) sista.punkter.push(innehall);
      else delar.push({ typ, punkter: [innehall] });
    } else if (rad.trim() === "") {
      delar.push({ typ: "p", rader: [] });
    } else {
      // Rubriker (#) blir vanlig fetare text, tabellrader blir text.
      const ren = rad.replace(/^#{1,6}\s+/, "").replace(/^\|\s*|\s*\|$/g, "");
      if (sista && sista.typ === "p") sista.rader.push(ren);
      else delar.push({ typ: "p", rader: [ren] });
    }
  }
  return delar.filter((d) => (d.typ === "p" ? d.rader.length > 0 : d.punkter.length > 0));
}

export function ChattText({ text, onLank }: Props) {
  const delar = delaUpp(text);
  return (
    <div className="space-y-2.5">
      {delar.map((d, i) => {
        if (d.typ === "p") {
          return (
            <p key={i}>
              {d.rader.map((r, j) => (
                <span key={j}>
                  {j > 0 ? <br /> : null}
                  {inline(r, onLank, `${i}-${j}`)}
                </span>
              ))}
            </p>
          );
        }
        const Lista = d.typ;
        return (
          <Lista
            key={i}
            className={`space-y-1 pl-5 ${d.typ === "ul" ? "list-disc" : "list-decimal"} marker:text-foreground/50`}
          >
            {d.punkter.map((p, j) => (
              <li key={j}>{inline(p, onLank, `${i}-${j}`)}</li>
            ))}
          </Lista>
        );
      })}
    </div>
  );
}
