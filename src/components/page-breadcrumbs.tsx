/**
 * Synliga brödsmulor, som Elpoolens PageBreadcrumbs. Samma steg ska skickas
 * till breadcrumbJsonLd i routens head, så att det synliga och den
 * strukturerade datan stämmer överens.
 *
 * Länkarna är minst 44 px höga så att de går att träffa på mobil.
 * Kontrast: muted-foreground 6,7:1 mot bakgrunden, vit 75 procent 9:1 mot
 * marinblått.
 */
import { Link } from "@tanstack/react-router";

export type Crumb = { name: string; path: string };

export function PageBreadcrumbs({
  trail,
  tone = "light",
  className = "",
}: {
  /** Hela kedjan, sista steget är sidan själv. */
  trail: Crumb[];
  /** "dark" på marinblå eller röd bakgrund, "light" på ljus. */
  tone?: "light" | "dark";
  className?: string;
}) {
  const links = trail.slice(0, -1);
  const current = trail[trail.length - 1];
  const dark = tone === "dark";
  return (
    <nav
      aria-label="Brödsmulor"
      className={`mb-2 ${dark ? "text-white/75" : "text-muted-foreground"} ${className}`}
    >
      <ol className="flex flex-wrap items-center gap-x-2">
        {links.map((c) => (
          <li key={c.path} className="flex items-center gap-x-2">
            <Link
              to={c.path as never}
              className={`inline-flex min-h-11 items-center hover:underline ${
                dark ? "text-white/90 hover:text-white" : "hover:text-primary"
              }`}
            >
              {c.name}
            </Link>
            <span aria-hidden>/</span>
          </li>
        ))}
        {current ? (
          <li aria-current="page" className={dark ? "text-white" : "text-foreground"}>
            {current.name}
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
