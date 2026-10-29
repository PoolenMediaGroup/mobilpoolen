import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Clock, Headset, KeyRound, Search } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { CtaBand } from "@/components/cta-band";
import { absoluteUrl, breadcrumbJsonLd, jsonLdScript, pageHead } from "@/lib/seo";
import { bild } from "@/lib/bildbank";
import { storMatt } from "@/lib/bildbank-matt";

const TITLE = "Ordlista för hemlarm";
const DESC =
  "Alla ord du möter i en larmoffert, förklarade på svenska. Från bindningstid och skalskydd till SSF 130 och ägandeform.";
const UPPDATERAD = "september 2026";
const HEROBILD = bild("kvinna-soffa-mobil");

type Term = { term: string; definition: string; href?: string };

/* Orden står i bokstavsordning i listan, sorteringen sköts i koden. */
const TERMS: Term[] = [
  {
    term: "Abonnemang",
    definition:
      "Den löpande tjänsten du betalar för varje månad: larmcentral, app och support. Utan abonnemang skickar larmet bara en notis till dig själv.",
    href: "/guider/hemlarm-utan-abonnemang",
  },
  {
    term: "Anläggarintyg",
    definition:
      "Intyg från en certifierad anläggarfirma på att larmet är installerat enligt normen. Kan krävas av försäkringsbolaget, särskilt för företag.",
  },
  { term: "Batteribackup", definition: "Reservbatteri som håller larmet igång vid strömavbrott." },
  {
    term: "Bindningstid",
    definition:
      "Den period du har lovat att betala för avtalet. Två år är vanligt och den räknas från installationen, inte från när du skrev på.",
    href: "/guider/bindningstid-och-uppsagning",
  },
  {
    term: "Centralenhet",
    definition: "Larmets hjärna. Tar emot signaler från detektorerna och skickar vidare larmet.",
  },
  {
    term: "Certifierad anläggarfirma",
    definition:
      "Företag som är godkänt att installera inbrottslarm enligt Stöldskyddsföreningens regler. Krävs för att du ska få ett anläggarintyg.",
  },
  {
    term: "Detektor",
    definition:
      "Samlingsnamn för givarna som känner av något: rörelse, rök, vatten, glaskross eller att en dörr öppnas.",
  },
  {
    term: "Dubbel kommunikation",
    definition:
      "Larmet kan skicka signaler både via bredband och mobilnät, så det fungerar även om det ena slås ut.",
  },
  {
    term: "Egendomsskydd",
    definition:
      "Den del av hemförsäkringen som ersätter stulna och skadade saker. Ett larm kan ge rabatt eller lägre självrisk, men villkoren skiljer sig mellan bolagen.",
    href: "/guider/hemlarm-och-forsakring",
  },
  {
    term: "Extern siren",
    definition:
      "Siren monterad på fasaden. Hörs av grannarna och gör att den som tagit sig in vet att larmet gått.",
  },
  {
    term: "Falsklarm",
    definition:
      "Ett larm som löser ut utan att något hänt, till exempel av ett husdjur eller en gardin i draget.",
  },
  {
    term: "Friköpt larm",
    definition: "Ett larm där du äger utrustningen och bara betalar för uppkopplingen.",
  },
  {
    term: "Gateway",
    definition:
      "Enheten som kopplar larmet till internet och mobilnätet. Ibland är den en del av centralenheten, ibland en egen dosa.",
  },
  {
    term: "Glaskrossdetektor",
    definition: "Detektor som reagerar på ljudet av krossat glas i stället för på rörelse.",
  },
  {
    term: "Husdjursanpassad detektor",
    definition:
      "Rörelsedetektor som ignorerar djur under en viss vikt, oftast runt 25 kilo. Vikten och hur högt djuret kan hoppa avgör.",
    href: "/guider/hemlarm-och-husdjur",
  },
  {
    term: "Hyrlarm",
    definition:
      "Ett larm där larmbolaget äger utrustningen och du betalar en månadsavgift så länge avtalet löper. Utrustningen lämnas tillbaka när du säger upp.",
  },
  {
    term: "Inbrottslarm",
    definition:
      "Larm som ska upptäcka att någon tar sig in i bostaden. Ofta samma system som även har rök- och vattendetektorer.",
  },
  {
    term: "Installationsavgift",
    definition:
      "Engångsavgift för att en tekniker monterar larmet. Ingår ibland i startpaketet, ibland inte. Fråga innan du skriver på.",
  },
  {
    term: "Jour",
    definition:
      "Larmcentralens bemanning dygnet runt, året om. Ett larm utan jour går bara till din egen mobil.",
  },
  {
    term: "Jämförpris",
    definition:
      "Priset som gör avtal jämförbara. Vi använder första året: startkostnad plus tolv månadsavgifter.",
  },
  {
    term: "Kameradetektor",
    definition:
      "Rörelsedetektor med kamera som tar bilder när den löser ut, så att larmcentralen kan se om något faktiskt händer.",
    href: "/guider/hemlarm-med-kamera",
  },
  {
    term: "Kontaktperson",
    definition:
      "Den larmcentralen ringer när de inte får tag på dig. Oftast en granne eller släkting som kan ta sig till bostaden.",
  },
  {
    term: "Larm utan abonnemang",
    definition:
      "Ett larm som bara skickar notiser till din mobil, utan larmcentral. Billigare i drift, men hela ansvaret att agera ligger på dig.",
    href: "/guider/hemlarm-utan-abonnemang",
  },
  {
    term: "Larmbricka",
    definition: "Bricka eller tagg som slår av och på larmet när du håller den mot manöverpanelen.",
  },
  {
    term: "Larmcentral",
    definition:
      "Bemannad central som tar emot larmet, bedömer det och agerar. Skickar väktare eller larmar räddningstjänsten.",
    href: "/guider/larmcentral-och-certifiering",
  },
  {
    term: "Larmklass",
    definition:
      "Klassning av inbrottslarm enligt normen SSF 130, från 1 till 4. Ställs ofta som krav av försäkringsbolag för företag.",
    href: "/guider/larmklasser",
  },
  {
    term: "Magnetkontakt",
    definition: "Sensor på dörr eller fönster som löser ut när den öppnas.",
  },
  { term: "Manöverpanel", definition: "Panelen där du slår av och på larmet." },
  {
    term: "Nattkoppling",
    definition:
      "Du larmar bara delar av bostaden, till exempel entréplanet, medan du sover på övervåningen.",
  },
  {
    term: "Nödknapp",
    definition:
      "Knapp du bär med dig eller har på väggen som larmar larmcentralen direkt. Kallas även överfallslarm.",
  },
  {
    term: "Områdesskydd",
    definition:
      "Skydd utanför väggarna, till exempel detektorer eller kameror på tomten, som larmar innan någon nått huset.",
  },
  {
    term: "Operatör",
    definition:
      "Personen på larmcentralen som tar emot larmet, bedömer det och bestämmer vad som ska hända.",
  },
  {
    term: "PIR-detektor",
    definition:
      "Passiv infraröd detektor. Den vanligaste rörelsedetektorn, reagerar på kroppsvärme som rör sig.",
  },
  {
    term: "Prisjustering",
    definition:
      "Larmbolagets rätt att höja månadsavgiften under avtalstiden. Står i villkoren och är en vanlig orsak till att priset stiger efter första året.",
    href: "/guider/pruta-pa-hemlarm",
  },
  {
    term: "QR-kod",
    definition:
      "Koden du skannar med appen för att koppla ihop en ny detektor eller panel med larmet.",
  },
  {
    term: "Rökdetektor",
    definition:
      "Detektor som känner av rök. Kopplad till hemlarmet larmar den även larmcentralen, inte bara dig i rummet.",
    href: "/guider/brandvarnare-och-brandlarm",
  },
  { term: "Rörelsedetektor", definition: "Detektor som reagerar på rörelse och värme i ett rum." },
  {
    term: "Sabotagelarm",
    definition:
      "Larmar om någon försöker öppna, flytta eller störa ut en detektor, även när larmet är frånkopplat.",
  },
  {
    term: "Skalskydd",
    definition:
      "Skydd som larmar redan när någon försöker ta sig in, via dörrar och fönster, innan personen är inne.",
  },
  {
    term: "SSF 130",
    definition:
      "Stöldskyddsföreningens norm för hur ett inbrottslarm ska projekteras och installeras. Ligger till grund för larmklasserna.",
  },
  { term: "SSF 136", definition: "Svensk norm för certifierade larmcentraler." },
  { term: "Tillkoppling", definition: "Att slå på larmet. Att slå av det heter frånkoppling." },
  {
    term: "Trygghetslarm",
    definition:
      "Larm för att kalla på hjälp vid sjukdom eller fall, oftast via kommunen. Det är något annat än ett inbrottslarm.",
  },
  {
    term: "Uppsägningstid",
    definition:
      "Hur länge avtalet fortsätter efter att du sagt upp det. Tre månader är vanligt och läggs ovanpå bindningstiden.",
    href: "/guider/bindningstid-och-uppsagning",
  },
  {
    term: "Utomhusdetektor",
    definition:
      "Detektor byggd för att sitta ute och tåla väder, djur och växtlighet utan att lösa ut i onödan.",
  },
  {
    term: "Vattenlarm",
    definition: "Sensor som larmar vid vattenläckage, ofta placerad under diskmaskinen.",
  },
  {
    term: "Verifiering",
    definition:
      "Larmcentralens kontroll av om ett larm är riktigt, via kamera eller ljud. Avgör om väktare skickas.",
  },
  { term: "Väktarutryckning", definition: "En väktare åker till bostaden när larmet gått." },
  {
    term: "Wifi-larm",
    definition:
      "Larm som kopplas upp via ditt wifi. Saknar det mobilnät som reserv står du utan larm om nätet går ner.",
  },
  {
    term: "Xenonblixt",
    definition:
      "Blixtljuset vid sirenen som blinkar när larmet går, så att det syns utifrån var larmet kommer ifrån.",
  },
  {
    term: "Ytskydd",
    definition:
      "Skydd inne i bostaden, med rörelsedetektorer som täcker rum och ytor. Motsatsen till skalskydd, som larmar redan i dörren.",
  },
  {
    term: "Zon",
    definition:
      "En avgränsad del av larmet, till exempel ett rum eller ett plan, som kan larmas på eller av för sig.",
  },
  {
    term: "Z-Wave",
    definition:
      "Trådlöst protokoll som en del larm och smarta hem-produkter pratar med varandra genom.",
  },
  {
    term: "Ångerrätt",
    definition:
      "Rätten att ångra ett köp inom 14 dagar vid till exempel dörrförsäljning. Ångern ska vara skriftlig.",
    href: "/guider/dorrforsaljning-och-angerratt",
  },
  {
    term: "Årsavgift",
    definition:
      "Avgift som betalas en gång om året i stället för varje månad. Räkna om den till månadskostnad när du jämför.",
  },
  {
    term: "Återställning",
    definition:
      "Att kvittera och nollställa larmet efter att det gått, så att systemet är skarpt igen.",
  },
  {
    term: "Ägandeform",
    definition:
      "Om du äger, hyr eller avbetalar utrustningen. Avgör vad larmet kostar över tid och vad som händer när du säger upp avtalet.",
  },
  {
    term: "Överfallslarm",
    definition: "Knapp som larmar larmcentralen direkt om du hotas i hemmet.",
  },
  {
    term: "Övervakningskamera",
    definition:
      "Kamera som spelar in eller strömmar bild. Det finns regler för vad du får filma, särskilt om grannar eller gata syns.",
    href: "/guider/kameraovervakning-hemma-regler",
  },
];

const LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Å",
  "Ä",
  "Ö",
];

/* Å, Ä och Ö måste få egna ankare. Slås de ihop med A och O krockar länkarna. */
const LETTER_IDS: Record<string, string> = { Å: "aa", Ä: "ae", Ö: "oe" };
const letterId = (letter: string) => LETTER_IDS[letter] ?? letter.toLocaleLowerCase("sv-SE");

const termId = (term: string) =>
  term
    .toLocaleLowerCase("sv-SE")
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const forstaBokstaven = (term: string) => term[0]?.toLocaleUpperCase("sv-SE") ?? "";

const SORTERADE = [...TERMS].sort((a, b) => a.term.localeCompare(b.term, "sv"));

/* Tre ord som styr vad avtalet faktiskt kostar. Lyfts fram högst upp. */
const NYCKELORD = [
  {
    term: "Bindningstid",
    Icon: Clock,
    text: "Avgör hur länge du sitter fast om priset höjs eller du flyttar.",
  },
  {
    term: "Ägandeform",
    Icon: KeyRound,
    text: "Äger, hyr eller avbetalar du larmet? Det styr kostnaden över tid.",
  },
  {
    term: "Larmcentral",
    Icon: Headset,
    text: "Ingår den eller inte? Utan den går larmet bara till din egen mobil.",
  },
];

export const Route = createFileRoute("/ordlista")({
  head: () =>
    pageHead({
      title: `${TITLE}: alla ord förklarade | Mobilpoolen`,
      description: DESC,
      socialTitle: TITLE,
      canonical: "/ordlista",
      scripts: [
        breadcrumbJsonLd([
          { name: "Start", path: "/" },
          { name: TITLE, path: "/ordlista" },
        ]),
        jsonLdScript({
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          name: TITLE,
          description: DESC,
          url: absoluteUrl("/ordlista"),
          hasDefinedTerm: SORTERADE.map((item) => ({
            "@type": "DefinedTerm",
            name: item.term,
            description: item.definition,
            url: `${absoluteUrl("/ordlista")}#${termId(item.term)}`,
          })),
        }),
      ],
    }),
  component: Page,
});

function Page() {
  const [fraga, setFraga] = useState("");

  const traffar = useMemo(() => {
    const q = fraga.trim().toLocaleLowerCase("sv-SE");
    if (!q) return SORTERADE;
    return SORTERADE.filter(
      (item) =>
        item.term.toLocaleLowerCase("sv-SE").includes(q) ||
        item.definition.toLocaleLowerCase("sv-SE").includes(q),
    );
  }, [fraga]);

  const bokstaverMedTraff = useMemo(
    () => new Set(traffar.map((item) => forstaBokstaven(item.term))),
    [traffar],
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteNav />
      <main>
        <section className="relative overflow-hidden bg-dark-section text-footer-foreground">
          <picture>
            <source srcSet={HEROBILD.webp} type="image/webp" />
            <img
              src={HEROBILD.jpg}
              alt={HEROBILD.alt}
              {...storMatt(HEROBILD.nyckel)}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
              loading="eager"
              decoding="async"
            />
          </picture>
          <div
            className="absolute inset-0"
            aria-hidden
            style={{
              background:
                "linear-gradient(100deg, color-mix(in srgb, var(--dark-section) 94%, transparent) 0%, color-mix(in srgb, var(--dark-section) 86%, transparent) 46%, color-mix(in srgb, var(--dark-section) 52%, transparent) 100%)",
            }}
          />
          <div className="relative mx-auto max-w-[1140px] px-6 py-16 lg:py-24">
            <h1 className="max-w-[18ch] font-bold text-white">{TITLE}</h1>
            <p className="mt-5 max-w-[56ch] text-[18px] leading-relaxed text-dark-muted">
              Alla ord du möter i en larmoffert, förklarade på svenska. Slå upp det säljaren sa
              innan du skriver på.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-white/75">
              <span>{SORTERADE.length} ord</span>
              <span aria-hidden>·</span>
              <span>A till Ö</span>
              <span aria-hidden>·</span>
              <span>Uppdaterad {UPPDATERAD}</span>
            </div>
          </div>
        </section>

        <section className="bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-[1140px] px-6">
            <div className="max-w-[68ch] space-y-5 text-[17.5px] leading-[1.7]">
              <p>
                Larmbranschen har ett eget språk, och det används mest när något ska säljas. En
                offert kan säga att paketet har skalskydd med verifiering och dubbel kommunikation
                utan att du blir klokare på vad du får.
              </p>
              <p>
                Orden avgör också vad du betalar. Skillnaden mellan att äga och hyra larmet är
                tusenlappar över några år, och skillnaden mellan larm med och utan larmcentral är
                vem som faktiskt åker hem till dig när det smäller. Här är varje ord förklarat på
                ren svenska, i den betydelse larmbolagen själva använder.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {NYCKELORD.map(({ term, Icon, text }) => (
                <a
                  key={term}
                  href={`#${termId(term)}`}
                  className="group rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-primary/50 hover:bg-muted/40"
                >
                  <span className="icon-badge icon-badge-cta">
                    <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="mt-3.5 flex items-center gap-1.5 text-[16.5px] font-bold">
                    {term}
                    <ArrowRight
                      className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1.5 block text-[14.5px] leading-relaxed text-muted-foreground">
                    {text}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="sticky top-12 z-30 border-y border-border bg-surface/95 backdrop-blur md:top-[58px]">
          <div className="mx-auto max-w-[1140px] px-6 py-3.5">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
              <label className="relative flex-1 md:max-w-[320px]" htmlFor="ordsok">
                <span className="sr-only">Sök i ordlistan</span>
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <input
                  id="ordsok"
                  type="search"
                  value={fraga}
                  onChange={(e) => setFraga(e.target.value)}
                  placeholder="Sök ord, till exempel bindningstid"
                  className="h-11 w-full rounded-lg border border-input-border bg-background pl-9 pr-3 text-[15px] outline-none focus-visible:border-primary"
                />
              </label>
              {/* På mobil en rad som rullar i sidled, så att den klistrade listen inte
                  blir fyra rader hög när bokstäverna får 44 px klickyta. */}
              <nav
                aria-label="Hoppa till bokstav"
                className="-mx-1 flex w-full gap-1 overflow-x-auto px-1 md:mx-0 md:w-auto md:flex-wrap md:overflow-visible md:px-0"
              >
                {LETTERS.map((letter) =>
                  bokstaverMedTraff.has(letter) ? (
                    <a
                      key={letter}
                      href={`#bokstav-${letterId(letter)}`}
                      className="inline-flex h-11 min-w-9 shrink-0 items-center justify-center rounded-md text-[13.5px] font-semibold text-primary hover:bg-muted md:h-8 md:min-w-8"
                    >
                      {letter}
                    </a>
                  ) : (
                    <span
                      key={letter}
                      aria-disabled="true"
                      className="inline-flex h-11 min-w-9 shrink-0 items-center justify-center rounded-md text-[13.5px] text-muted-foreground/40 md:h-8 md:min-w-8"
                    >
                      {letter}
                    </span>
                  ),
                )}
              </nav>
            </div>
          </div>
        </div>

        <section className="surface-soft py-14 lg:py-20">
          <div className="mx-auto max-w-[1140px] px-6">
            {traffar.length === 0 ? (
              <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-[17px] font-semibold">Inget ord matchar ”{fraga}”.</p>
                <button
                  type="button"
                  onClick={() => setFraga("")}
                  className="mt-3 text-[15px] font-semibold text-primary hover:underline"
                >
                  Visa alla ord
                </button>
              </div>
            ) : (
              LETTERS.filter((letter) => bokstaverMedTraff.has(letter)).map((letter) => (
                <section
                  key={letter}
                  id={`bokstav-${letterId(letter)}`}
                  className="mb-12 scroll-mt-32"
                >
                  <h2 className="mb-5 flex items-center gap-4 text-[26px] font-extrabold">
                    <span>{letter}</span>
                    <span aria-hidden className="h-px flex-1 bg-border" />
                  </h2>
                  <div className="grid gap-4 lg:grid-cols-2">
                    {traffar
                      .filter((item) => forstaBokstaven(item.term) === letter)
                      .map((item) => (
                        <article
                          key={item.term}
                          id={termId(item.term)}
                          className="scroll-mt-32 rounded-2xl border border-border bg-surface p-5"
                        >
                          <h3 className="text-[17px] font-bold">{item.term}</h3>
                          <p className="mt-2 text-[15.5px] leading-relaxed text-muted-foreground">
                            {item.definition}
                          </p>
                          {item.href ? (
                            <Link
                              to={item.href}
                              className="mt-1 inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-primary hover:underline"
                            >
                              Läs mer
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                            </Link>
                          ) : null}
                        </article>
                      ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </section>

        <CtaBand
          rubrik="Nu vet du vad orden betyder. Se vad de kostar."
          ingress="Mobilpoolen öppnar snart. Lämna din e-post så hör vi av oss när du kan begära offert."
          knapptext="Jämför larm gratis →"
          bildnyckel="vanner-middag-utomhus"
        />
      </main>
      <SiteFooter />
    </div>
  );
}
