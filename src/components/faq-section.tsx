import { useEffect, useId, useMemo, useState } from "react";
import { ArrowRight, ChevronDown, Minus, Plus, Search } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { FRAGOR_PA_UNDERSIDA } from "@/lib/faq";

/**
 * `href` är valfri och pekar på sidan som fördjupar svaret. `kalla` anger var
 * en uppgift om ett bolags villkor kommer ifrån och när den kontrollerades,
 * och visas under svaret på den sida frågan står.
 */
export type Qa = { q: string; a: string; href?: string; kalla?: string };

/**
 * En grupp motsvarar en sida. `sida` är den route där frågorna visas och där
 * de ska ranka. Grupperna med sida "/faq" är de allmänna frågorna som bara
 * står på /faq. Övriga grupper visas på /faq som ett kort med länkar till
 * sidan, aldrig med svaret utskrivet. `title` är målsidans namn på kortet.
 */
export type FaqGroup = {
  title: string;
  sida: string;
  items: readonly Qa[];
};

/**
 * Registret över sajtens frågor. Varje fråga står i exakt en grupp, och
 * gruppen avgör på vilken sida den visas. Svaren underhålls bara här.
 *
 * `as const` gör frågetexterna till literaltyper, så att fragorUrRegistret i
 * src/lib/faq.ts kan kräva att en sida bara begär frågor ur sin egen grupp.
 * En felstavad fråga blir då ett fel i `tsc` i stället för ett fel vid rendering.
 */
export const FAQ_GROUPS = [
  {
    title: "Startsidan",
    sida: "/",
    items: [
      {
        q: "Vilket är det billigaste mobilabonnemanget just nu?",
        a: "Det beror på hur mycket surf du behöver. Räknat som snittpris första året, med kampanj och startavgift, är de billigaste abonnemangen just nu oftast de mindre varumärkena som Hallon, Comviq och Tellus. Tabellen ovan visar det billigaste per surfmängd och uppdateras när priserna ändras.",
        href: "/billigaste-mobilabonnemang",
      },
      {
        q: "Hur mycket surf behöver jag?",
        a: "Ett abonnemang med både samtal och surf använde i snitt 15 GB i månaden 2025 enligt PTS. Surfar du mest på wifi räcker ofta 5–10 GB. Strömmar du video på mobilnätet varje dag behöver du 40 GB eller obegränsat. Kolla din faktiska förbrukning i mobilens inställningar innan du väljer.",
        kalla: "PTS, Svensk telekommarknad 2025",
        href: "/verktyg/hur-mycket-surf-behover-jag",
      },
      {
        q: "Är billiga operatörer sämre än Telia, Tele2 och Telenor?",
        a: "Inte när det gäller nätet. Alla operatörer i Sverige kör i något av de fyra näten som Telia, Tele2, Telenor och Tre äger. Hallon kör i Tres nät, Comviq i Tele2s och Fello i Telias. Skillnaden ligger i pris, kundtjänst, maxhastighet och extratjänster.",
        href: "/guider/virtuella-operatorer",
      },
      {
        q: "Kan jag byta operatör och behålla mitt nummer?",
        a: "Ja. Du har rätt att behålla numret när du byter operatör. Du beställer hos den nya operatören, som sköter flytten och avslutar det gamla abonnemanget. Avbrottet får vara högst en arbetsdag, och har du bindningstid kvar hindrar den inte flytten, men den återstående tiden ska betalas.",
        kalla: "lagen (2022:482) om elektronisk kommunikation och PTSFS 2022:4",
        href: "/guider/byta-operator-behalla-nummer",
      },
      {
        q: "Vad händer när kampanjpriset tar slut?",
        a: "Då går abonnemanget över till ordinarie pris, ofta två till fem gånger högre. Därför sorterar vi på snittpriset första året och visar ordinarie pris på varje abonnemang. Saknar abonnemanget bindningstid kan du byta igen när kampanjen är slut.",
        href: "/guider/kampanjpris-efter-kampanjen",
      },
      {
        q: "Är Mobilpoolen gratis?",
        a: "Ja. Det kostar ingenting att jämföra, och du beställer direkt hos operatören. I dag får vi ingen ersättning från någon operatör. Om vi får det framöver står det vid knappen till den operatören, och det påverkar aldrig ordningen i jämförelsen.",
        href: "/sa-tjanar-vi-pengar",
      },
    ],
  },
  {
    title: "Om Mobilpoolen",
    sida: "/faq",
    items: [
      {
        q: "Hur jämför ni abonnemangen?",
        a: "Vi hämtar priser och villkor från operatörernas egna webbplatser och prislistor och sparar källan och datumet. Standardordningen är snittpriset per månad under första året, där kampanjens längd och startavgiften räknas in. Ordningen påverkas aldrig av om en operatör betalar oss.",
        href: "/sa-jamfor-vi",
      },
      {
        q: "Jämför ni alla operatörer i Sverige?",
        a: "Nej. Vi jämför de stora operatörerna och de mindre varumärken vi har kunnat kontrollera priserna hos. Saknas en operatör beror det på att vi inte har kunnat belägga priserna, inte på att den har betalat för att synas eller inte synas.",
      },
      {
        q: "Hur ofta uppdateras priserna?",
        a: "Varje operatör har ett datum för när priserna senast kontrollerades. Det står på operatörens sida och i detaljerna för varje abonnemang. Kampanjer ändras ofta, så kontrollera alltid priset hos operatören innan du beställer.",
      },
      {
        q: "Hur tjänar ni pengar?",
        a: "I dag tjänar vi inga pengar på jämförelsen. Längre fram kan vi få ersättning från operatörer när någon beställer via oss. Det ska i så fall stå vid knappen till operatören och på sidan om hur vi tjänar pengar, och det får aldrig påverka ordningen.",
        href: "/sa-tjanar-vi-pengar",
      },
      {
        q: "Säljer ni abonnemang själva?",
        a: "Nej. Du beställer alltid direkt hos operatören, och avtalet gäller mellan dig och operatören. Vi hanterar inga personuppgifter för din beställning.",
      },
    ],
  },
  {
    title: "Pris och avtal",
    sida: "/faq",
    items: [
      {
        q: "Hur lång bindningstid får ett mobilabonnemang ha?",
        a: "Högst 24 månader för privatpersoner, och samma gräns gäller mikroföretag, småföretag och ideella organisationer om de inte avstår. Uppsägningstiden får vara högst en månad för konsumenter.",
        kalla: "12 kap. 8 och 13 §§ lagen (2022:482) om elektronisk kommunikation",
        href: "/guider/bindningstid-uppsagningstid",
      },
      {
        q: "Får operatören höja priset under avtalstiden?",
        a: "Ja, om avtalet tillåter det, men du ska få besked minst en månad innan ändringen gäller. Du har då rätt att säga upp avtalet utan extra kostnad, även om du har bindningstid kvar, om ändringen inte enbart är till din fördel.",
        kalla: "12 kap. 12 § lagen (2022:482) om elektronisk kommunikation",
        href: "/guider/prishojning-mobilabonnemang",
      },
      {
        q: "Har jag ångerrätt på ett mobilabonnemang?",
        a: "Ja, om du har beställt på nätet eller per telefon har du 14 dagars ångerrätt. Blir du uppringd av en säljare gäller avtalet bara om du efter samtalet godkänner erbjudandet skriftligt.",
        kalla: "2 kap. 3 a och 10 §§ distansavtalslagen (2005:59)",
        href: "/guider/angerratt-mobilabonnemang",
      },
      {
        q: "Lönar det sig med bindningstid?",
        a: "Ibland. Tele2 och Tre ger till exempel lägre pris i 24 månader mot 24 månaders bindning. Räkna på totalkostnaden över hela bindningstiden och jämför med ett abonnemang utan bindning. Utan bindning kan du byta när en bättre kampanj dyker upp.",
        href: "/utan-bindningstid",
      },
      {
        q: "Vad är en startavgift?",
        a: "En engångsavgift när abonnemanget startar. Många operatörer tar ingen startavgift vid köp på nätet, men Telias prislista anger till exempel 299 kronor. Vi räknar in startavgiften i snittpriset när operatören anger den.",
      },
    ],
  },
  {
    title: "Byta operatör",
    sida: "/faq",
    items: [
      {
        q: "Måste jag säga upp mitt gamla abonnemang när jag byter?",
        a: "Nej, inte om du flyttar numret. Den nya operatören begär flytten, och det gamla abonnemanget avslutas när numret flyttas. Säg bara upp själv om du inte vill behålla numret.",
        href: "/guider/byta-operator-behalla-nummer",
      },
      {
        q: "Hur lång tid tar det att flytta numret?",
        a: "Själva bytet får ge högst en arbetsdags avbrott. Hela processen tar oftast några dagar, eftersom du väljer ett datum och väntar på SIM-kortet eller aktiverar ett eSIM.",
        kalla: "12 kap. 32 § lagen (2022:482) om elektronisk kommunikation",
      },
      {
        q: "Kostar det något att flytta numret?",
        a: "Den gamla operatören får inte ta betalt för att lämna ifrån sig numret. Den nya operatören får i princip ta betalt för att ta emot det, men många gör det inte. Har du bindningstid kvar ska den återstående tiden betalas.",
        kalla: "PTSFS 2022:4",
      },
      {
        q: "Kan jag behålla numret från ett kontantkort?",
        a: "Ja. Kontantkort är registrerade sedan 2022, och numret kan flyttas till ett abonnemang hos en annan operatör på samma sätt som ett abonnemangsnummer.",
        href: "/guider/kontantkort-eller-abonnemang",
      },
    ],
  },
  {
    title: "Surf, nät och täckning",
    sida: "/faq",
    items: [
      {
        q: "Vilket mobilnät har bäst täckning?",
        a: "Det beror på var du är. I Opensignals mätning från december 2025 vann Telia kategorin för täckningsupplevelse, medan Telenor och Tele2 vann kategorier för hastighet. Kolla operatörernas täckningskartor för just din adress och de platser du brukar vara på.",
        kalla: "Opensignal, Sweden Mobile Network Experience, december 2025",
        href: "/guider/basta-tackning-sverige",
      },
      {
        q: "Vilket nät använder Hallon, Comviq, Vimla och Fello?",
        a: "Hallon kör i Tres nät, Comviq i Tele2s, Vimla i Telenors och Fello i Telias. Tele2 och Telenor delar dessutom radionätet för 4G och 5G genom Net4Mobility.",
        href: "/guider/vilket-nat-anvander-operatoren",
      },
      {
        q: "Behöver jag 5G?",
        a: "Inte för att ringa eller surfa som vanligt, men 5G ger högre hastighet där det finns. Sedan september 2025 har Tele2 och Telenor 5G i hela sitt gemensamma nät. Du behöver en telefon som stöder 5G och ett abonnemang där det ingår.",
        href: "/guider/behover-jag-5g",
      },
      {
        q: "Fungerar min gamla telefon efter att 3G släckts?",
        a: "Bara om den kan ringa över 4G (VoLTE). Tele2, Telenor och Tre stängde 2G och 3G den 1 december 2025. Telia behåller 2G till slutet av 2027.",
        href: "/guider/2g-3g-nedslackning",
      },
      {
        q: "Vad är eSIM?",
        a: "Ett SIM-kort som är inbyggt i telefonen. Du laddar ner abonnemanget digitalt, oftast med en QR-kod, i stället för att sätta i ett plastkort. De flesta stora operatörer erbjuder eSIM, och det går ofta snabbare att komma igång.",
        href: "/esim",
      },
    ],
  },
  {
    title: "Utland",
    sida: "/faq",
    items: [
      {
        q: "Kostar det extra att surfa i EU?",
        a: "Nej, inom EU/EES ringer och surfar du som hemma enligt reglerna om roam like at home, som gäller till 2032. Har du obegränsad eller väldigt mycket surf får operatören sätta ett tak för EU-surfen, så kolla hur många GB som ingår.",
        kalla: "EU-kommissionen och Your Europe",
        href: "/guider/surfa-i-eu",
      },
      {
        q: "Ingår Storbritannien, Schweiz och Turkiet i EU-surfen?",
        a: "Inte enligt EU:s regler. Roam like at home gäller i EU-länderna och Island, Liechtenstein och Norge. Vissa operatörer inkluderar ändå Storbritannien eller Schweiz frivilligt, så kontrollera din operatörs prislista innan du reser.",
        href: "/guider/surfa-utanfor-eu",
      },
    ],
  },
  {
    title: "Företag",
    sida: "/faq",
    items: [
      {
        q: "Kan jag ha företagsabonnemang med enskild firma?",
        a: "Ja, de flesta operatörer säljer företagsabonnemang till enskilda firmor med organisationsnummer. Ett privat abonnemang som används i firman går också att dra av till den del det används i verksamheten.",
        href: "/foretag/enskild-firma",
      },
      {
        q: "Är jobbmobilen en skattepliktig förmån?",
        a: "Nej, inte om mobilen och abonnemanget behövs i arbetet och privat användning är av mindre omfattning. Betalar arbetsgivaren för privata tjänster som faktureras separat, till exempel ett extra familjeabonnemang, blir det en skattepliktig förmån.",
        kalla: "Skatteverket",
        href: "/guider/jobbmobil-formansskatt",
      },
      {
        q: "Är företagspriser angivna med eller utan moms?",
        a: "Oftast utan moms, men alla operatörer skriver inte ut det. I vår jämförelse står det vid varje företagsabonnemang om operatören anger priset exkl. moms eller inte anger det alls.",
        href: "/guider/moms-mobilabonnemang",
      },
    ],
  },
] as const satisfies readonly FaqGroup[];

type Grupp = (typeof FAQ_GROUPS)[number];

/** Sidorna som har frågor i registret. */
export type FaqSida = Grupp["sida"];

/** Frågetexterna som hör till en viss sida. */
export type FragaPa<S extends FaqSida> = Extract<Grupp, { sida: S }>["items"][number]["q"];

const GRUPPER: readonly FaqGroup[] = FAQ_GROUPS;

/** De allmänna frågorna, som bara visas på /faq. */
export const FAQ_PA_FAQSIDAN = GRUPPER.filter((g) => g.sida === "/faq");

/** Grupperna som visas på andra sidor. /faq länkar till de frågor som syns där. */
export const FAQ_PA_ANDRA_SIDOR = GRUPPER.filter((g) => g.sida !== "/faq");

/** Ankar-id av en grupprubrik, så att ämnesnavigeringen kan länka dit. */
export function amnesId(titel: string): string {
  return titel
    .toLocaleLowerCase("sv-SE")
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ANDRA_SIDOR_ID = "andra-sidor";

/** Mellanrubriken en målsida hamnar under på /faq. */
function kategori(sida: string): "Startsidan" | "Guider" | "Operatörer och jämförelser" {
  if (sida === "/") return "Startsidan";
  if (sida.startsWith("/operatorer/") || sida.startsWith("/jamfor/"))
    return "Operatörer och jämförelser";
  return "Guider";
}

const KATEGORIER = ["Startsidan", "Guider", "Operatörer och jämförelser"] as const;

function antalSynliga(g: FaqGroup): number {
  if (g.sida === "/") return g.items.length;
  return FRAGOR_PA_UNDERSIDA;
}

let lankade: FaqGroup[] | null = null;

/**
 * Grupperna som /faq länkar till, med bara de frågor som syns på målsidan.
 * Byggs först vid rendering, eftersom src/lib/faq importerar den här filen
 * och FRAGOR_PA_UNDERSIDA inte finns när modulen laddas.
 */
function lankadeGrupper(): FaqGroup[] {
  lankade ??= FAQ_PA_ANDRA_SIDOR.map((g) => ({
    ...g,
    items: g.items.slice(0, antalSynliga(g)),
  }));
  return lankade;
}

function antalLankade() {
  return lankadeGrupper().reduce((n, g) => n + g.items.length, 0);
}

/** Så många frågor visas i ett kort innan resten fälls ut. */
const SYNLIGA_PER_KORT = 6;

function antalFragor(n: number) {
  return `${n} ${n === 1 ? "fråga" : "frågor"}`;
}

function matchar(text: string, q: string) {
  return text.toLocaleLowerCase("sv-SE").includes(q);
}

export function FaqItem({ item }: { item: Qa }) {
  const [open, setOpen] = useState(false);
  const svarId = useId();

  return (
    <div
      // Som på Elpoolen: den öppna frågan får en ljus tonad yta och plus blir minus.
      className={`overflow-hidden rounded-[var(--radius)] border transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none ${
        open
          ? "border-primary/25 bg-secondary shadow-sm"
          : "border-border bg-surface hover:border-primary/25 hover:shadow-md"
      }`}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={svarId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-4 text-left px-5 py-5 sm:px-6"
      >
        <span className="text-[16px] font-semibold text-foreground">{item.q}</span>
        {open ? (
          <Minus className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        ) : (
          <Plus className="h-5 w-5 shrink-0 text-primary" aria-hidden />
        )}
      </button>
      {/* Svaret ligger alltid i HTML:en, så att sökmotorer läser det även stängt.
          inert gör att en dold "Läs mer"-länk inte går att tabba till. */}
      <div
        id={svarId}
        className={`grid transition-all duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
        inert={!open}
      >
        <div className="overflow-hidden">
          <div className="text-[15px] leading-relaxed text-muted-foreground px-5 pb-5 sm:px-6 sm:pb-6">
            <p>{item.a}</p>
            {item.kalla ? <p className="mt-2 text-[14px]">{`Källa: ${item.kalla}.`}</p> : null}
            {item.href ? (
              <Link
                to={item.href}
                className="mt-3 inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
              >
                Läs mer
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FullFaqPage({
  query,
  setQuery,
  hideSearch = false,
  grupper = FAQ_PA_FAQSIDAN,
}: {
  query: string;
  setQuery: (value: string) => void;
  hideSearch?: boolean;
  /** Grupperna med platshållarna ifyllda, se fyllPlatshallare i src/lib/faq.ts. */
  grupper?: readonly FaqGroup[];
}) {
  const q = query.trim().toLocaleLowerCase("sv-SE");

  const groups = useMemo(
    () =>
      grupper
        .map((g) => ({
          ...g,
          items: g.items.filter((it) => !q || matchar(it.q, q) || matchar(it.a, q)),
        }))
        .filter((g) => g.items.length > 0),
    [q, grupper],
  );

  // Flyttade frågor söks bara på frågetexten. Svaret står på målsidan och
  // ska inte skrivas ut här.
  const flyttade = useMemo(
    () =>
      q
        ? lankadeGrupper().flatMap((g) =>
            g.items
              .filter((it) => matchar(it.q, q))
              .map((it) => ({ q: it.q, sida: g.sida, namn: g.title })),
          )
        : [],
    [q],
  );

  const antalTraffar = groups.reduce((n, g) => n + g.items.length, 0) + flyttade.length;

  const amnen = useMemo(
    () => [
      ...groups.map((g) => ({ id: amnesId(g.title), namn: g.title, n: g.items.length })),
      { id: ANDRA_SIDOR_ID, namn: "Andra sidor", n: antalLankade() },
    ],
    [groups],
  );
  const [aktivt, setAktivt] = useState<string | null>(null);

  // Markera kategorin vars avsnitt ligger i läsfältet, som Elpoolens kolumn.
  useEffect(() => {
    if (q) return;
    const els = amnen
      .map((a) => document.getElementById(a.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const synliga = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) synliga.add(e.target as HTMLElement);
          else synliga.delete(e.target as HTMLElement);
        });
        const forsta = [...synliga].sort(
          (x, y) => x.getBoundingClientRect().top - y.getBoundingClientRect().top,
        )[0];
        if (forsta) setAktivt(forsta.id);
      },
      { rootMargin: "-33% 0px -45% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [amnen, q]);

  return (
    <div>
      {!hideSearch && (
        <div className="relative mb-8 max-w-md">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök bland frågorna"
            aria-label="Sök bland frågorna"
            className="w-full rounded-[16px] border border-border bg-surface py-3.5 pr-4 pl-11 text-[16px] outline-none focus:border-primary"
          />
        </div>
      )}

      {/* Samma lista är ämnesknappar på mobil och en klistrad kategorikolumn på
          dator, som hos Elpoolen. En nav, så att länkarna bara står en gång i
          HTML:en. Den aktiva kategorin följer det avsnitt du läser. */}
      <div className={q ? "" : "lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10"}>
        {!q && (
          <nav
            aria-label="Ämnen"
            className="-mx-4 mb-10 overflow-x-auto px-4 sm:mx-0 sm:overflow-visible sm:px-0 lg:mb-0"
          >
            <ul className="flex w-max gap-2 pr-4 pb-1 sm:w-auto sm:flex-wrap sm:pr-0 sm:pb-0 lg:sticky lg:top-24 lg:flex-col lg:flex-nowrap lg:gap-1">
              {amnen.map((p) => {
                const aktiv = p.id === aktivt;
                return (
                  <li key={p.id} className="flex shrink-0">
                    <a
                      href={`#${p.id}`}
                      aria-current={aktiv ? "true" : undefined}
                      className={`inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-[14px] font-medium transition-colors lg:w-full lg:justify-between lg:gap-3 lg:rounded-lg lg:px-3 lg:text-[15px] ${
                        aktiv
                          ? "lg:border-primary lg:bg-primary lg:text-primary-foreground border-border bg-surface text-foreground"
                          : "border-border bg-surface text-foreground hover:border-primary hover:text-primary lg:border-transparent lg:bg-transparent lg:hover:border-transparent lg:hover:bg-primary/[0.06]"
                      }`}
                    >
                      {p.namn}
                      <span
                        className={
                          aktiv
                            ? "text-muted-foreground lg:text-primary-foreground/80"
                            : "text-muted-foreground"
                        }
                      >
                        {p.n}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
        <div className="min-w-0">
          {/* Läses upp av skärmläsare när träffarna ändras. Visas bara när det finns träffar,
          annars står det i tom-rutan nedanför. */}
          <p
            role="status"
            className={q && antalTraffar > 0 ? "mb-6 text-[15px] text-foreground/65" : "sr-only"}
          >
            {!q
              ? ""
              : antalTraffar === 0
                ? `Ingen fråga matchar "${query.trim()}".`
                : `${antalFragor(antalTraffar)} matchar "${query.trim()}".`}
          </p>

          {q && antalTraffar === 0 ? (
            <div className="card-soft bg-surface p-8 text-center">
              <p className="text-[16px] font-semibold text-foreground">
                Ingen fråga matchar "{query.trim()}".
              </p>
              <p className="mx-auto mt-2 max-w-[460px] text-[15px] leading-relaxed text-foreground/65">
                Prova ett kortare ord, till exempel kamera, pris eller uppsägning. Hittar du ändå
                inte svaret kan du{" "}
                <Link to="/kontakt" className="font-semibold text-primary hover:underline">
                  skicka din fråga till oss
                </Link>
                .
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 min-h-[44px] px-3 text-[14px] font-semibold text-primary hover:underline"
              >
                Rensa sökningen
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {groups.map((g) => (
                <section key={g.title} id={amnesId(g.title)} className="scroll-mt-24">
                  <h2 className="mb-3 border-b border-border pb-2 text-[22px] font-semibold text-foreground">
                    {g.title}
                  </h2>
                  <div className="space-y-3">
                    {g.items.map((it) => (
                      <FaqItem key={it.q} item={it} />
                    ))}
                  </div>
                </section>
              ))}

              {q && flyttade.length > 0 ? <FlyttadeTraffar traffar={flyttade} /> : null}
            </div>
          )}

          {!q && <AndraSidor />}
        </div>
      </div>
    </div>
  );
}

/** Sökträffar bland frågorna som besvaras på andra sidor. */
function FlyttadeTraffar({ traffar }: { traffar: { q: string; sida: string; namn: string }[] }) {
  return (
    <section aria-labelledby="traffar-andra-sidor">
      <h2
        id="traffar-andra-sidor"
        className="mb-3 border-b border-border pb-2 text-[22px] font-semibold text-foreground"
      >
        Besvaras på andra sidor
      </h2>
      <ul className="overflow-hidden rounded-[var(--radius)] border border-border bg-surface">
        {traffar.map((t) => (
          <li key={t.q} className="border-b border-border last:border-b-0">
            <Link
              to={t.sida}
              className="group flex min-h-[44px] flex-col gap-1.5 px-5 py-4 transition-colors hover:bg-primary/[0.04] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
            >
              <span className="text-[16px] font-semibold text-foreground group-hover:text-primary">
                {t.q}
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-[13px] text-foreground/65">
                {t.namn}
                <ArrowRight className="h-3.5 w-3.5 text-primary" aria-hidden />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Frågorna som flyttats till sidan de handlar om, ett kort per målsida.
 * Bara frågetexten står här, som länk. Svaret finns på målsidan, och schemat
 * för frågan också.
 */
function AndraSidor() {
  return (
    <section
      id={ANDRA_SIDOR_ID}
      aria-labelledby="andra-sidor-rubrik"
      className="mt-16 scroll-mt-24"
    >
      <h2
        id="andra-sidor-rubrik"
        className="border-b border-border pb-2 text-[22px] font-semibold text-foreground"
      >
        Frågor som besvaras på andra sidor
      </h2>
      <p className="mt-3 max-w-[680px] text-[15.5px] leading-relaxed text-foreground/65">
        {`${antalLankade()} frågor har sitt svar på sidan de handlar om. Klicka på en fråga så kommer du dit.`}
      </p>

      <div className="mt-8 space-y-12">
        {KATEGORIER.map((k) => {
          // Flest frågor först, så att korten i samma rad blir ungefär lika höga.
          const kort = lankadeGrupper()
            .filter((g) => kategori(g.sida) === k)
            .sort((x, y) => y.items.length - x.items.length);
          if (kort.length === 0) return null;
          return (
            <div key={k}>
              <h3 className="mb-4 text-[18px] font-semibold text-foreground">{k}</h3>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kort.map((g) => (
                  <SidKort key={g.sida} grupp={g} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function SidKort({ grupp }: { grupp: FaqGroup }) {
  const [visaAlla, setVisaAlla] = useState(false);
  const listId = useId();
  const antal = grupp.items.length;
  const fallbar = antal > SYNLIGA_PER_KORT;

  return (
    <li className="flex flex-col rounded-[var(--radius)] border border-border bg-surface p-5 transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-[17px] font-semibold leading-snug">
          <Link
            to={grupp.sida}
            className="inline-flex min-h-[44px] items-center text-foreground hover:text-primary hover:underline"
          >
            {grupp.title}
          </Link>
        </h4>
        <span className="shrink-0 text-[13px] text-foreground/60">{antalFragor(antal)}</span>
      </div>
      {/* Alla länkar ligger i HTML:en även när kortet är hopfällt. */}
      <ul id={listId} className="mt-1 border-t border-border">
        {grupp.items.map((it, i) => (
          <li
            key={it.q}
            className={`border-b border-border last:border-b-0 ${
              fallbar && !visaAlla && i >= SYNLIGA_PER_KORT ? "hidden" : ""
            }`}
          >
            <Link
              to={grupp.sida}
              className="flex min-h-[44px] items-center py-2.5 text-[15px] leading-snug text-foreground/90 transition-colors hover:text-primary"
            >
              {it.q}
            </Link>
          </li>
        ))}
      </ul>
      {fallbar ? (
        <button
          type="button"
          aria-expanded={visaAlla}
          aria-controls={listId}
          onClick={() => setVisaAlla((v) => !v)}
          className="mt-auto inline-flex min-h-[44px] items-center gap-1.5 self-start pt-2 text-[14px] font-semibold text-primary hover:underline"
        >
          {visaAlla ? "Visa färre" : `Visa alla ${antal} frågor`}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${visaAlla ? "rotate-180" : ""}`}
            aria-hidden
          />
        </button>
      ) : null}
    </li>
  );
}
