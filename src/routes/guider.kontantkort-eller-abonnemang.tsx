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
import { PRIVATA, operator, SENAST_KONTROLLERAD } from "@/lib/mobil/data";
import { KALLOR, MARKNAD } from "@/lib/mobil/fakta";
import { datumText, gbText, kr, totalKostnad } from "@/lib/mobil/berakna";
import type { Abonnemang } from "@/lib/mobil/typer";

const SLUG = "kontantkort-eller-abonnemang";
const guide = (() => {
  const value = getGuide(SLUG);
  if (!value) throw new Error(`Guiden ${SLUG} saknas i registret.`);
  return value;
})();

const KALLRAD = "-mt-3 mb-6 text-[13.5px] leading-relaxed text-foreground/65";

/** Lyca Mobiles paket gäller 30 dagar. Så många paket går det på ett år. */
const PAKET_PER_AR = 365 / 30;

const TOC = [
  { id: "skillnad", label: "Vad är skillnaden?" },
  { id: "pris", label: "Vad är billigast?" },
  { id: "registrering", label: "Kontantkort måste registreras" },
  { id: "for-vem", label: "För vem passar kontantkort?" },
  { id: "byta", label: "Byta från kontantkort till abonnemang" },
  { id: "fragor", label: "Vanliga frågor" },
];

const FAQ = [
  {
    q: "Är kontantkort billigare än abonnemang?",
    a: "Ibland. Kontantkortspaket kan kosta lika mycket som eller mindre än abonnemang med samma surf, men abonnemang har oftare kampanjpriser de första månaderna. Räkna på ett helt år. Kontantkort passar extra bra om du vill ha full kontroll eller ringer mycket utomlands, där vissa paket har utlandsminuter.",
  },
  {
    q: "Måste man registrera kontantkort?",
    a: "Ja. Sedan 1 augusti 2022 måste alla kontantkort registreras innan de används. Operatören registrerar namn, adress och personnummer, samordningsnummer eller organisationsnummer och kontrollerar identiteten med id-handling eller e-legitimation.",
    kalla: "9 kap. 24–25 §§ lagen (2022:482) om elektronisk kommunikation",
  },
  {
    q: "Kan jag behålla numret när jag byter från kontantkort till abonnemang?",
    a: "Ja. Numret flyttas på samma sätt som från ett abonnemang. Vid flytten ska återstående saldo på kontantkortet återbetalas om du begär det.",
    kalla: "PTSFS 2022:4 om nummerportabilitet, 9 §",
  },
  {
    q: "Har kontantkort bindningstid?",
    a: "Nej, normalt inte. Du betalar i förskott för en period och fyller på när du vill. Hos Lyca Mobile förnyas paketet automatiskt efter 30 dagar om saldot räcker, men den automatiska förnyelsen går att stänga av.",
  },
];

export const Route = createFileRoute("/guider/kontantkort-eller-abonnemang")({
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
        faqJsonLd(FAQ),
      ],
    }),
  component: Page,
});

function namn(a: Abonnemang) {
  return `${operator(a.operator)?.namn ?? a.operator} ${a.namn}`;
}

/** Billigaste abonnemang utan bindning med minst `gb` surf, mätt på första året. */
function billigastAbonnemang(gb: number | null) {
  return PRIVATA.filter(
    (a) =>
      !a.kontantkort &&
      a.bindning === 0 &&
      operator(a.operator)?.aktiv &&
      !(a.malgrupp ?? []).some((m) => m !== "familj") &&
      (gb == null ? a.gb == null : a.gb == null || a.gb >= gb),
  ).sort((a, b) => totalKostnad(a, 12) - totalKostnad(b, 12))[0];
}

function Page() {
  const lyca = PRIVATA.filter((a) => a.operator === "lycamobile" && a.kontantkort).sort(
    (a, b) => a.pris - b.pris,
  );
  // Några paket över hela spannet, så att tabellen blir läsbar.
  const urval = lyca.filter((a) => a.gb != null && [4, 10, 20, 40].includes(a.gb));
  const rader = urval
    .map((k) => ({ k, abb: billigastAbonnemang(k.gb) }))
    .filter((r): r is { k: Abonnemang; abb: Abonnemang } => !!r.abb);

  const minsta = lyca[0];
  const billigareAr1 = rader.filter(
    ({ k, abb }) => k.pris * PAKET_PER_AR < totalKostnad(abb, 12),
  ).length;
  const billigareAr2 = rader.filter(({ k, abb }) => k.pris * PAKET_PER_AR < abb.pris * 12).length;

  return (
    <GuidePage
      title={guide.title}
      slug={SLUG}
      breadcrumb
      collapsibleToc
      toc={TOC}
      cta={{ label: "Jämför abonnemang och kontantkort" }}
    >
      <P>
        Kontantkort kan vara lika billigt som ett abonnemang, och ibland billigare. Abonnemang har
        oftare kampanjpriser de första månaderna, medan kontantkortet kostar lika mycket varje
        period. Med kontantkort betalar du i förskott, har ingen bindningstid och får aldrig en
        oväntad faktura. Jämför alltid vad samma surf kostar på ett år.
      </P>

      <H2 id="skillnad">Vad är skillnaden mellan kontantkort och abonnemang?</H2>
      <GuideTable
        head={["", "Kontantkort", "Abonnemang"]}
        rows={[
          ["Betalning", "I förskott, du fyller på", "Faktura i efterskott"],
          ["Bindningstid", "Nej", "Ibland, högst 24 månader"],
          ["Period", "Per paket, hos Lyca Mobile 30 dagar", "Oftast per månad"],
          ["Kampanjpriser", "Sällan", "Vanligt de första månaderna"],
          ["Registrering", "Krav sedan 1 augusti 2022", "Sker när avtalet tecknas"],
        ]}
      />
      <P>
        En viktig skillnad är perioden. Lyca Mobiles paket gäller i 30 dagar, inte en kalendermånad.
        Under ett år köper du alltså drygt 12 paket, inte 12. Räkna med det när du jämför.
      </P>

      <H2 id="pris">Vad är billigast, kontantkort eller abonnemang?</H2>
      <P>
        Vi jämför Lyca Mobiles kontantkortspaket med det billigaste abonnemanget utan bindningstid
        som har minst lika mycket surf. Kontantkortet är räknat på 365 dagar. Abonnemanget visas
        både första året, med kampanj, och andra året, till ordinarie pris.
      </P>
      <GuideTable
        brytForsta
        head={["Kontantkort (30 dagar)", "Per år", "Billigaste abonnemang", "År 1", "År 2"]}
        rows={rader.map(({ k, abb }) => [
          `${namn(k)} (${gbText(k.gb)}), ${kr(k.pris)}`,
          kr(k.pris * PAKET_PER_AR),
          `${namn(abb)} (${gbText(abb.gb)})`,
          kr(totalKostnad(abb, 12)),
          kr(abb.pris * 12),
        ])}
      />
      <p className={KALLRAD}>
        Källa: operatörernas webbplatser, kontrollerade {datumText(SENAST_KONTROLLERAD)}.
        Kontantkort räknat som {Math.round(PAKET_PER_AR * 10) / 10} paket på ett år. Abonnemangets
        år 1 räknar med kampanjpris och startavgift, år 2 med ordinarie pris.
      </p>
      <Callout>
        Just nu är kontantkortet billigare än abonnemanget första året i {billigareAr1} av{" "}
        {rader.length} fall, och billigare än abonnemangets ordinarie pris i {billigareAr2} av{" "}
        {rader.length} fall. Kampanjen hjälper abonnemanget första året, men den tar slut. Byter du
        abonnemang varje gång kampanjen tar slut kan du hålla nere priset även därefter.
      </Callout>
      <P>
        Lyca Mobile har obegränsade samtal och sms i Sverige och en kvot internationella minuter
        till en lista med länder i paketen. Det är något de flesta vanliga abonnemang inte har.
        Ringer du mycket utomlands kan det väga tyngre än surfpriset. Lyca Mobile säljer också
        långtidspaket för 3, 6 och 12 månader. Mer om operatören på{" "}
        <A href="/operatorer/lycamobile">Lyca Mobile</A>.
      </P>

      <H2 id="registrering">Kontantkort måste registreras</H2>
      <P>
        Sedan 1 augusti 2022 måste alla kontantkort registreras innan de används, både för mobil och
        mobilt bredband. Operatören registrerar namn, postadress och personnummer, samordningsnummer
        eller organisationsnummer. Identiteten kontrolleras med en giltig id-handling eller
        e-legitimation.
      </P>
      <P>
        Används ett registrerat kort av någon annan än den som registrerat det, utan ny
        registrering, ska tjänsten stängas av. Undantag gäller bland annat tillfällig användning och
        närstående.
      </P>
      <p className={KALLRAD}>
        Källa:{" "}
        <a href={KALLOR.lek.url} target="_blank" rel="noopener nofollow">
          {KALLOR.lek.namn}
        </a>
        , 9 kap. 24–26 §§.
      </p>
      <P>
        Kontantkort är fortfarande en mindre men stabil del av marknaden. Enligt PTS gav kontantkort
        strax under 2,5 miljarder kronor i intäkter 2025, av totalt {MARKNAD.intakter} för mobila
        tjänster.
      </P>

      <H2 id="for-vem">För vem passar kontantkort?</H2>
      <UL>
        <li>
          <strong>Dig som vill ha full kontroll.</strong> Saldot tar slut i stället för att fakturan
          växer. Det kan passa ett barns första mobil, se{" "}
          <A href="/barn">mobilabonnemang för barn</A>.
        </li>
        <li>
          <strong>Dig som ringer utomlands.</strong> Paket med internationella minuter kan bli
          billigare än abonnemang plus utlandssamtal.
        </li>
        <li>
          <strong>Dig som inte vill ha faktura.</strong> Du betalar i förskott och fyller på när du
          vill.
        </li>
        <li>
          <strong>Ett extranummer.</strong> En reservtelefon eller ett nummer du sällan använder.
          {minsta
            ? ` Lyca Mobiles minsta paket kostar ${kr(minsta.pris)} för ${gbText(minsta.gb)} i 30 dagar.`
            : ""}
        </li>
      </UL>
      <P>
        Använder du mobilen varje dag och vill betala så lite som möjligt är ett abonnemang utan
        bindningstid oftast billigare, särskilt om du byter när kampanjen tar slut. Se{" "}
        <A href="/kontantkort">alla kontantkort</A> och{" "}
        <A href="/utan-bindningstid">abonnemang utan bindningstid</A>.
      </P>

      <H2 id="byta">Byta från kontantkort till abonnemang</H2>
      <P>
        Du kan ta med numret från kontantkortet till ett abonnemang hos en annan operatör. Beställ
        hos den nya operatören och välj att flytta numret. Den gamla operatören får inte ta betalt
        för att lämna ifrån sig numret, och återstående saldo ska återbetalas om du begär det (PTSFS
        2022:4).
      </P>
      <P>
        Vissa kampanjer riktar sig till just dig som byter från kontantkort. Comviq skriver att
        deras kampanjpris gäller nya kunder och den som byter från kontantkort. Hela flytten steg
        för steg:{" "}
        <A href="/guider/byta-operator-behalla-nummer">byta operatör och behålla numret</A>.
      </P>

      <H2 id="fragor">Vanliga frågor</H2>
      <FaqAccordion items={FAQ} />
    </GuidePage>
  );
}
