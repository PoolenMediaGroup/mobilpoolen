import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { GuideTable } from "@/components/guide-page";
import { OPERATORER, PRIVATA, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import {
  arVillkorat,
  bindningText,
  datumText,
  gbText,
  kr,
  snittForstaAret,
  tackerBehov,
  totalKostnad,
} from "@/lib/mobil/berakna";
import { KALLOR, OPENSIGNAL, SKI_PRIVAT, decimal } from "@/lib/mobil/fakta";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Bästa mobilabonnemang", path: "/basta-mobilabonnemang" },
];

const OPPNA = PRIVATA.filter((a) => !arVillkorat(a));

function vem(a: Abonnemang): string {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

/** Lägst total kostnad över tolv månader bland dem som uppfyller villkoret. */
function billigast12(lista: Abonnemang[]): Abonnemang | undefined {
  return [...lista].sort((x, y) => totalKostnad(x, 12) - totalKostnad(y, 12))[0];
}

const NIVAER: { label: string; kriterium: string; lista: Abonnemang[] }[] = [
  {
    label: "10 GB",
    kriterium: "lägst kostnad över 12 mån med minst 10 GB",
    lista: OPPNA.filter((a) => tackerBehov(a, 10)),
  },
  {
    label: "20 GB",
    kriterium: "lägst kostnad över 12 mån med minst 20 GB",
    lista: OPPNA.filter((a) => tackerBehov(a, 20)),
  },
  {
    label: "50 GB",
    kriterium: "lägst kostnad över 12 mån med minst 50 GB",
    lista: OPPNA.filter((a) => tackerBehov(a, 50)),
  },
  {
    label: "obegränsad surf",
    kriterium: "lägst kostnad över 12 mån med obegränsad surf",
    lista: OPPNA.filter((a) => a.gb == null),
  },
];

const PER_NIVA = NIVAER.map((n) => ({ ...n, a: billigast12(n.lista) }));
const UTAN = billigast12(OPPNA.filter((a) => a.bindning === 0 && tackerBehov(a, 10)));
const EU = [...OPPNA]
  .filter((a) => a.euGb != null && a.euGb > 0)
  .sort((x, y) => y.euGb! / snittForstaAret(y) - x.euGb! / snittForstaAret(x))[0];
const SKI_TOPP = SKI_PRIVAT.filter((s) => s.namn !== "Övriga" && s.namn !== "Branschen")[0];
const SKI_BRANSCH = SKI_PRIVAT.find((s) => s.namn === "Branschen")!;
const TACKNING = OPENSIGNAL[0];
const SKI_TOPP_OP = OPERATORER.find((o) => o.namn === SKI_TOPP.namn);
const SKI_TOPP_I_JAMFORELSEN = SKI_TOPP_OP?.prisKontrollerade ?? false;
const SKI_BASTA_MED_PRIS = SKI_PRIVAT.find((s) =>
  OPERATORER.some((o) => o.namn === s.namn && o.prisKontrollerade && o.aktiv),
);

const FAQ = [
  {
    q: "Vilket är det bästa mobilabonnemanget?",
    a: `Det finns inget som är bäst för alla. Vi utser inget totalt bästa abonnemang och sätter inga betyg. I stället visar vi vilket som är bäst på ett mätbart kriterium: med minst 20 GB kostar ${vem(PER_NIVA[1].a!)} minst över tolv månader, ${kr(totalKostnad(PER_NIVA[1].a!, 12))} totalt.`,
  },
  {
    q: "Vilken operatör har nöjdast kunder?",
    a: `${SKI_TOPP.namn}, med ${decimal(SKI_TOPP.varde)} av 100 bland privatkunderna i Svenskt Kvalitetsindex 2025. Snittet för branschen var ${decimal(SKI_BRANSCH.varde)}.`,
    kalla: "Svenskt Kvalitetsindex, SKI Mobil 2025",
  },
  {
    q: "Vilket nät har bäst täckning?",
    a: `I Opensignals mätning från december 2025 vann ${TACKNING.vinnare} kategorin täckningsupplevelse med ${TACKNING.varde}. Mätningen bygger på data från juli till september 2025. Täckningen där du själv bor och rör dig avgör ändå mest.`,
    kalla: "Opensignal, Sweden Mobile Network Experience, december 2025",
  },
  {
    q: "Har ni testat abonnemangen?",
    a: "Nej. Vi har granskat priser och villkor på operatörernas egna webbplatser. Kundnöjdhet hämtar vi från Svenskt Kvalitetsindex och nätdata från Opensignal, alltid med källa och period.",
  },
  {
    q: "Påverkar ersättning från operatörerna vilka som utses?",
    a: "Nej. Vi har inga avtal med operatörer och får ingen ersättning. Utnämningarna räknas fram ur prisdatan med samma kriterium för alla.",
  },
];

export const Route = createFileRoute("/basta-mobilabonnemang")({
  head: () =>
    pageHead({
      title: "Bästa mobilabonnemang 2026: bäst för dig | Mobilpoolen",
      description:
        "Bästa mobilabonnemanget beror på vad du behöver. Utnämningar räknade ur priserna: billigast per surfmängd, utan bindning, mest EU-surf, SKI och Opensignal.",
      canonical: "/basta-mobilabonnemang",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  const p20 = PER_NIVA[1].a!;
  const obegr = PER_NIVA[3].a!;
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Bästa mobilabonnemang 2026, räknat på fakta"
      ingress={
        <p>
          Det bästa mobilabonnemanget är det som täcker din surf till lägst kostnad. Med minst 20 GB
          är det just nu {vem(p20)}, {kr(totalKostnad(p20, 12))} på ett år. Obegränsad surf kostar
          minst {kr(totalKostnad(obegr, 12))} på ett år hos {operator(obegr.operator)?.namn}.
          Nöjdast kunder har {SKI_TOPP.namn} enligt SKI 2025. Vi sätter inga egna betyg.
        </p>
      }
      nyckeltal={[
        { varde: kr(totalKostnad(p20, 12)), text: "lägsta årskostnad med minst 20 GB surf" },
        {
          varde: decimal(SKI_TOPP.varde),
          text: `${SKI_TOPP.namn}, högst kundnöjdhet i SKI 2025 (privat)`,
        },
        {
          varde: TACKNING.varde,
          text: `${TACKNING.vinnare}, bäst täckningsupplevelse enligt Opensignal dec 2025`,
        },
      ]}
      jamforelse={
        <div className="space-y-10">
          <GuideTable
            head={["Bäst för", "Abonnemang", "Kriterium", "Värde"]}
            rows={[
              ...PER_NIVA.filter((n) => n.a).map((n) => [
                `Billigast med ${n.label}`,
                `${vem(n.a!)} (${n.a!.gb == null ? "obegränsad" : gbText(n.a!.gb)})`,
                n.kriterium,
                `${kr(totalKostnad(n.a!, 12))} på 12 mån`,
              ]),
              ...(UTAN
                ? [
                    [
                      "Billigast utan bindningstid",
                      `${vem(UTAN)} (${UTAN.gb == null ? "obegränsad" : gbText(UTAN.gb)})`,
                      "lägst kostnad över 12 mån, minst 10 GB, ingen bindningstid",
                      `${kr(totalKostnad(UTAN, 12))} på 12 mån`,
                    ],
                  ]
                : []),
              ...(EU
                ? [
                    [
                      "Mest EU-surf per krona",
                      vem(EU),
                      "GB surf i EU/EES delat med snittpris första året",
                      `${EU.euGb} GB i EU för ${kr(snittForstaAret(EU))}/mån`,
                    ],
                  ]
                : []),
              [
                "Nöjdast kunder",
                SKI_TOPP.namn,
                "högst index bland privatkunder, SKI 2025 (extern källa)",
                `${decimal(SKI_TOPP.varde)} av 100`,
              ],
              [
                "Bäst täckningsupplevelse",
                `${TACKNING.vinnare}s nät`,
                "Opensignal, Coverage Experience, dec 2025 (extern källa)",
                TACKNING.varde,
              ],
            ]}
            brytForsta
          />
          <p className="text-[13.5px] text-foreground/65">
            Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.{" "}
            {KALLOR.ski.namn}. {KALLOR.opensignal.namn}.
          </p>
          <Jamforelse id="lista" />
        </div>
      }
      jamforelseRubrik="Bäst för vad? Utnämningarna"
      jamforelseIngress="Varje rad har ett kriterium som går att kontrollera. Priserna räknas om varje gång datan uppdateras, så utnämningarna följer priserna."
      faq={FAQ}
      lankar={[
        {
          href: "/sa-jamfor-vi",
          label: "Så jämför vi",
          text: "Metoden bakom utnämningarna och vad vi inte räknar med.",
        },
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Billigast per surfmängd, med och utan bindning.",
        },
        {
          href: "/nat",
          label: "Mobilnät och täckning",
          text: "Vad PTS och Opensignal säger om de fyra näten.",
        },
        {
          href: "/operatorer",
          label: "Alla operatörer",
          text: "Nät, billigaste abonnemang och kundnöjdhet per operatör.",
        },
        {
          href: "/guider/basta-tackning-sverige",
          label: "Bästa täckningen i Sverige",
          text: "Så tolkar du mätningarna och täckningskartorna.",
        },
      ]}
      ctaRubrik="Vilket abonnemang är bäst för dig?"
      ctaIngress="Filtrera på din surf, bindningstid och nät, så ser du vad som passar dig."
      ctaBild="glasogon-finstilt"
      uppdaterad="2026-10-29"
    >
      <h2>Varför utser vi inget bästa abonnemang totalt?</h2>
      <p>
        Ett totalbetyg kräver att någon bestämmer hur mycket pris, surf, nät och kundtjänst ska
        väga. Den viktningen blir alltid godtycklig, och den passar sällan just dig. Den som surfar
        lite och vill slippa bindning har ett helt annat bästa abonnemang än den som streamar varje
        dag. Därför visar vi i stället vem som är bäst på ett kriterium i taget. Varje kriterium går
        att kontrollera, och utnämningen ändras när priserna ändras.
      </p>
      <p>
        Vi har inte testat abonnemangen. Vi har granskat priser och villkor på operatörernas egna
        webbplatser. Det vi säger om kundnöjdhet kommer från Svenskt Kvalitetsindex och det vi säger
        om näten från Opensignal och PTS.
      </p>

      <h2>Vilket abonnemang är bäst för den som vill betala minst?</h2>
      <p>
        Vi räknar total kostnad över tolv månader, med kampanjpris, kampanjens längd och
        startavgift. Abonnemang med ålders- eller studentkrav räknas inte med, eftersom alla inte
        kan teckna dem.
      </p>
      <ul>
        {PER_NIVA.filter((n) => n.a).map((n) => (
          <li key={n.label}>
            <strong>Med {n.label}:</strong> {vem(n.a!)}, {kr(totalKostnad(n.a!, 12))} på ett år.{" "}
            {bindningText(n.a!.bindning)}.
          </li>
        ))}
      </ul>
      {UTAN && (
        <p>
          Vill du kunna säga upp när du vill är {vem(UTAN)} billigast utan bindningstid med minst 10
          GB, {kr(totalKostnad(UTAN, 12))} på ett år. Fler finns på sidan om{" "}
          <Link to={"/utan-bindningstid" as never}>abonnemang utan bindningstid</Link>.
        </p>
      )}

      {EU && (
        <>
          <h2>Vilket abonnemang ger mest surf i EU för pengarna?</h2>
          <p>
            Vi delar antalet GB som operatören anger för surf i EU/EES med snittpriset första året.
            Högst kvot har {vem(EU)}: {EU.euGb} GB i EU för {kr(snittForstaAret(EU))} i månaden i
            snitt. EU-surfen är ofta lägre än surfen hemma på stora och obegränsade abonnemang,
            eftersom EU-reglerna tillåter en gräns för rimlig användning.
            {EU.notis && /fair use/i.test(EU.notis)
              ? " Operatören anger inte tydligt om det finns ett tak för rimlig användning, så kontrollera det innan du reser."
              : ""}{" "}
            Läs mer i guiden om att <Link to={"/guider/surfa-i-eu" as never}>surfa i EU</Link>.
          </p>
        </>
      )}

      <h2>Vilken operatör har nöjdast kunder?</h2>
      <p>
        I Svenskt Kvalitetsindex mätning 2025 hade {SKI_TOPP.namn} nöjdast privatkunder med{" "}
        {decimal(SKI_TOPP.varde)} av 100. Snittet för branschen var {decimal(SKI_BRANSCH.varde)}.
        {!SKI_TOPP_I_JAMFORELSEN && SKI_BASTA_MED_PRIS
          ? ` ${SKI_TOPP.namn}s priser har vi inte kunnat kontrollera, så operatören finns inte med i prisjämförelsen. Högst index bland operatörerna i jämförelsen har ${SKI_BASTA_MED_PRIS.namn}, med ${decimal(SKI_BASTA_MED_PRIS.varde)}.`
          : ""}{" "}
        SKI mäter hur nöjda kunderna själva säger att de är. Det är inte vårt betyg.
      </p>
      <GuideTable
        head={["Operatör", "SKI 2025, privatkunder"]}
        rows={SKI_PRIVAT.map((s) => [s.namn, decimal(s.varde)])}
      />
      <p className="kalla">
        Källa:{" "}
        <a href={KALLOR.ski.url} target="_blank" rel="noopener nofollow">
          {KALLOR.ski.namn}
        </a>
        .
      </p>

      <h2>Vilket nät är bäst?</h2>
      <p>
        I Opensignals mätning från december 2025, med data från juli till september 2025, vann{" "}
        {TACKNING.vinnare} täckningsupplevelse. Övriga kategorier fördelades så här:
      </p>
      <ul>
        {OPENSIGNAL.map((r) => (
          <li key={r.kategori}>
            {r.kategori}: {r.vinnare}, {r.varde}
          </li>
        ))}
      </ul>
      <p>
        Alla operatörer i samma nät får samma täckning. Ett abonnemang hos en mindre operatör i{" "}
        {TACKNING.vinnare}s nät har alltså samma täckning som {TACKNING.vinnare}s egna. Mer om näten
        på sidan om <Link to={"/nat" as never}>mobilnät och täckning</Link>.
      </p>
      <p className="kalla">
        Källa:{" "}
        <a href={KALLOR.opensignal.url} target="_blank" rel="noopener nofollow">
          {KALLOR.opensignal.namn}
        </a>
        .
      </p>

      <h2>Så hittar du det bästa abonnemanget för dig</h2>
      <ol>
        <li>
          Ta reda på hur mycket du surfar. Det står i mobilens inställningar eller i operatörens
          app.
        </li>
        <li>Bestäm om du kan tänka dig bindningstid. Utan bindning kan du byta när du vill.</li>
        <li>Kolla täckningen där du bor och var du är mest.</li>
        <li>Jämför snittpriset första året, inte bara priset första månaden.</li>
        <li>Läs vad abonnemanget kostar när kampanjen slutar.</li>
      </ol>
      <p>
        Hela metoden, och vad vi inte tar med, står på sidan{" "}
        <Link to={"/sa-jamfor-vi" as never}>så jämför vi</Link>.
      </p>
    </PelarSida>
  );
}
