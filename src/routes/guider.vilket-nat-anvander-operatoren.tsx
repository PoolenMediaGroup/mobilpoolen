import { createFileRoute } from "@tanstack/react-router";
import {
  A,
  Callout,
  FaqAccordion,
  GuidePage,
  GuideTable,
  H2,
  P,
  UL,
} from "@/components/guide-page";
import { getGuide } from "@/lib/guides";
import { articleJsonLd, faqJsonLd, guideBreadcrumb, pageHead } from "@/lib/seo";
import { MOBILNAT, OPERATORER, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { datumText, kr, snittForstaAret, sortera } from "@/lib/mobil/berakna";
import type { NatId, Operator } from "@/lib/mobil/typer";

const SLUG = "vilket-nat-anvander-operatoren";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

const NAT_IDS = Object.keys(MOBILNAT) as NatId[];

/** Operatörer som själva inte bekräftar nätet på sin webbplats. */
const UPPGES = new Set(["lycamobile"]);

const GRUPP: Record<Operator["grupp"], string> = {
  natagare: "Äger nätet",
  varumarke: "Varumärke hos nätägaren",
  mvno: "Virtuell operatör (MVNO)",
};

/** Operatörer vars nät är känt, i den ordning de står i datan. */
const MED_NAT = OPERATORER.filter((o) => !o.natNotis);
const UTAN_NAT = OPERATORER.filter((o) => o.natNotis);

function natText(o: Operator): string {
  const nat = MOBILNAT[o.nat].namn;
  return UPPGES.has(o.slug) ? `${nat} (uppges)` : nat;
}

function lista(o: Operator[]): string {
  const namn = o.map((x) => x.namn);
  if (namn.length < 2) return namn.join("");
  return `${namn.slice(0, -1).join(", ")} och ${namn[namn.length - 1]}`;
}

const TOC = [
  { id: "lista", label: "Vilket nät kör operatören i?" },
  { id: "per-nat", label: "Operatörerna per nät" },
  { id: "samma-nat", label: "Samma nät, samma täckning?" },
  { id: "billigast", label: "Billigast i varje nät" },
  { id: "fragor", label: "Vanliga frågor" },
];

function faq() {
  const o = (s: string) => operator(s);
  const natNamn = (s: string) => {
    const op = o(s);
    return op ? MOBILNAT[op.nat].namn : null;
  };
  const fragor: { q: string; a: string }[] = [];
  for (const [s, q] of [
    ["hallon", "Vilket nät använder Hallon?"],
    ["vimla", "Vilket nät använder Vimla?"],
    ["comviq", "Vilket nät använder Comviq?"],
    ["fello", "Vilket nät använder Fello?"],
  ] as const) {
    const op = o(s);
    const nat = natNamn(s);
    if (op && nat) {
      fragor.push({
        q,
        a: `${op.namn} kör i ${nat} och ägs av ${op.agare}. Täckningen är därför densamma som hos ${o(op.nat)?.namn ?? nat} och de andra operatörerna i samma nät.`,
      });
    }
  }
  fragor.push({
    q: "Har Tele2 och Telenor samma nät?",
    a: "De delar radionätet för 4G och 5G genom det samägda bolaget Net4Mobility. Operatörerna säljer, prissätter och styr sina abonnemang var för sig, och anger själva Tele2s nät respektive Telenors nät.",
  });
  return fragor;
}

export const Route = createFileRoute("/guider/vilket-nat-anvander-operatoren")({
  head: () =>
    pageHead({
      title: `${guide.title} | Mobilpoolen`,
      description: guide.excerpt,
      socialTitle: guide.title,
      canonical: `/guider/${SLUG}`,
      ogType: "article",
      scripts: [
        guideBreadcrumb(guide.title, `/guider/${SLUG}`),
        articleJsonLd({
          title: guide.title,
          description: guide.excerpt,
          path: `/guider/${SLUG}`,
          publishedIso: guide.publishedIso,
          updatedIso: guide.updatedIso,
        }),
        faqJsonLd(faq()),
      ],
    }),
  component: Page,
});

function Page() {
  const FAQ = faq();
  const perNat = NAT_IDS.map((id) => ({
    nat: MOBILNAT[id],
    ops: MED_NAT.filter((o) => o.nat === id),
  }));
  const billigastPerNat = NAT_IDS.map((id) => {
    const a = sortera(
      PRIVATA.filter(
        (x) =>
          operator(x.operator)?.nat === id &&
          !operator(x.operator)?.natNotis &&
          !x.malgrupp?.some((m) => m === "senior" || m === "student" || m === "ung"),
      ),
      "snitt-ar",
    )[0];
    return { nat: MOBILNAT[id], a };
  });

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang per nät" }}
    >
      <P>
        Alla svenska operatörer kör i ett av fyra nät: Telias, Tele2s, Telenors eller Tres. Hallon
        kör i Tres nät, Comviq i Tele2s, Vimla i Telenors och Fello i Telias. Kör två operatörer i
        samma nät får de samma täckning. Det som skiljer är pris, maxhastighet och tjänster som eSIM
        och wifi-samtal.
      </P>

      <H2 id="lista">Vilket nät kör din operatör i?</H2>
      <P>
        Tabellen visar alla {MED_NAT.length} operatörer vi har gått igenom, vilket nät de kör i och
        hur de hänger ihop med nätägaren.
      </P>
      <GuideTable
        brytForsta
        head={["Operatör", "Nät", "Typ", "Ägare"]}
        rows={MED_NAT.map((o) => [
          o.aktiv ? o.namn : `${o.namn} (avvecklas)`,
          natText(o),
          GRUPP[o.grupp],
          o.agare.trim().startsWith("–")
            ? "Uppgift saknas"
            : o.agare.split(" (")[0]!.split(". ")[0]!,
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}, och
        Telekområdgivarna. &rdquo;Uppges&rdquo; betyder att operatören inte själv anger nätet på sin
        webbplats.
        {UTAN_NAT.length > 0 &&
          ` ${lista(UTAN_NAT)} anger inte vilket nät abonnemangen använder och står inte i tabellen.`}
      </p>
      {MED_NAT.some((o) => !o.aktiv) && (
        <Callout>
          Telia meddelade i juni 2026 att Halebop avvecklas och att kunderna flyttas till Telia. Läs
          mer i guiden om att <A href="/guider/halebop-laggs-ned">Halebop läggs ned</A>.
        </Callout>
      )}

      <H2 id="per-nat">Operatörerna per nät</H2>
      {perNat.map(({ nat, ops }) => (
        <div key={nat.id}>
          <P>
            <strong>
              <A href={`/nat/${nat.id}`}>{nat.namn}</A>:
            </strong>{" "}
            {lista(ops.filter((o) => o.aktiv))}. {nat.beskrivning}
          </P>
        </div>
      ))}
      <P>
        Tele2 och Telenor delar alltså radionätet för 4G och 5G, men säljer och styr var för sig.
        Det är därför vi räknar dem som två nät, precis som operatörerna själva gör.
      </P>

      <H2 id="samma-nat">Samma nät, samma täckning?</H2>
      <P>
        Ja, när det gäller var du har signal. En operatör som hyr in sig i ett nät använder samma
        master som nätägaren. Har Tres nät bra täckning där du bor har Hallon och de andra
        operatörerna i Tres nät det också.
      </P>
      <P>Det som kan skilja mellan operatörer i samma nät är:</P>
      <UL>
        <li>
          <strong>Maxhastighet.</strong> Vissa sätter ett tak, till exempel 100 eller 150 Mbit/s,
          medan nätägaren kan erbjuda mer.
        </li>
        <li>
          <strong>5G.</strong> Nätet kan ha 5G utan att alla abonnemang i det har det.
        </li>
        <li>
          <strong>eSIM och wifi-samtal.</strong> Det är tjänster som varje operatör väljer själv. Se{" "}
          <A href="/guider/vad-ar-esim">vad eSIM är</A> och vilka som har det.
        </li>
        <li>
          <strong>Kundtjänst och villkor.</strong> Bindningstid, uppsägningstid och öppettider
          skiljer mycket.
        </li>
      </UL>
      <P>
        Mer om hur det fungerar finns i guiden om{" "}
        <A href="/guider/virtuella-operatorer">virtuella operatörer</A>. Vilket nät som har bäst
        täckning enligt mätningarna står i guiden om{" "}
        <A href="/guider/basta-tackning-sverige">bästa täckningen i Sverige</A>.
      </P>

      <H2 id="billigast">Billigast i varje nät just nu</H2>
      <P>
        Har du bestämt dig för ett nät kan du välja den operatör i nätet som är billigast för din
        surfmängd. Här är det abonnemang som har lägst snittpris första året i varje nät, bland dem
        som alla kan teckna:
      </P>
      <GuideTable
        brytForsta
        head={["Nät", "Abonnemang", "Snitt år 1", "Ordinarie"]}
        rows={billigastPerNat
          .filter((x) => x.a)
          .map(({ nat, a }) => [
            nat.namn,
            `${operator(a!.operator)?.namn ?? a!.operator} ${a!.namn}`,
            `${kr(snittForstaAret(a!))}/mån`,
            `${kr(a!.pris)}/mån`,
          ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}. Operatörer
        utan kontrollerade priser är inte med.
      </p>
      <P>
        Billigast är sällan samma sak som rätt surfmängd. Se alla abonnemang per nät på sidorna för{" "}
        {NAT_IDS.map((id, i) => (
          <span key={id}>
            {i > 0 ? (i === NAT_IDS.length - 1 ? " och " : ", ") : ""}
            <A href={`/nat/${id}`}>{MOBILNAT[id].namn}</A>
          </span>
        ))}
        , eller jämför alla operatörer på <A href="/operatorer">operatörssidan</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
