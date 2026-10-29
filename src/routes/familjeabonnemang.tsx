import { createFileRoute, Link } from "@tanstack/react-router";
import { PelarSida } from "@/components/mobil/pelar-sida";
import { Jamforelse } from "@/components/mobil/jamforelse";
import { GuideTable } from "@/components/guide-page";
import { ABONNEMANG, SENAST_KONTROLLERAD, operator } from "@/lib/mobil/data";
import { bindningText, datumText, gbText, kr } from "@/lib/mobil/berakna";
import { breadcrumbJsonLd, faqJsonLd, pageHead } from "@/lib/seo";
import type { Abonnemang } from "@/lib/mobil/typer";

const TRAIL = [
  { name: "Start", path: "/" },
  { name: "Familjeabonnemang", path: "/familjeabonnemang" },
];

/**
 * Priser för extra familjemedlemmar. De står inte som egna abonnemang i datan
 * utan i operatörernas villkor och i notis-fälten (operatorer-data.ts),
 * kontrollerade 2026-10-29. Huvudabonnemangens priser hämtas ur ABONNEMANG.
 */
const MEDLEM = {
  comviq: 149, // Comviq Familj: 149 kr/mån per medlem, 20 GB var, ingen bindning
  telia: 239, // Telia: extra användare på Obegränsad Plus, upp till 9 st
  teliaKampanj: 175, // Telia "Familjeveckor": 175 kr/mån i 12 mån, därefter 239 kr
  treBunden: 149, // Tre: extra användare med 24 mån bindning
  treObunden: 169, // Tre: extra användare utan bindning
  katshingTva: 595, // katshing: familjeabonnemang med obegränsad surf för två personer
} as const;

const hitta = (id: string) => ABONNEMANG.find((a) => a.id === id);
const COMVIQ = hitta("comviq-comviq-20-gb");
const TELIA = hitta("telia-obegransad-plus");
const TRE = hitta("tre-obegransad-surf");
const TRE25 = hitta("tre-25-gb");
const TELE2 = hitta("tele2-mobil-15-gb");

const PERSONER = 4;
const EXTRA = PERSONER - 1;

type Exempel = { namn: string; huvud: Abonnemang; medlem: number; text: string };

const EXEMPEL: Exempel[] = [
  ...(COMVIQ
    ? [
        {
          namn: "Comviq Familj",
          huvud: COMVIQ,
          medlem: MEDLEM.comviq,
          text: `20 GB var, ${bindningText(COMVIQ.bindning).toLowerCase()}`,
        },
      ]
    : []),
  ...(TRE
    ? [
        {
          namn: "Tre Obegränsad med extra användare",
          huvud: TRE,
          medlem: MEDLEM.treBunden,
          text: `obegränsad surf för alla, ${bindningText(TRE.bindning).toLowerCase()}`,
        },
      ]
    : []),
  ...(TELIA
    ? [
        {
          namn: "Telia Obegränsad Plus med extra användare",
          huvud: TELIA,
          medlem: MEDLEM.telia,
          text: "obegränsad surf, ordinarie pris för extra användare",
        },
      ]
    : []),
].sort((x, y) => x.huvud.pris + EXTRA * x.medlem - (y.huvud.pris + EXTRA * y.medlem));

const summa = (e: Exempel) => e.huvud.pris + EXTRA * e.medlem;
const BILLIGAST = EXEMPEL[0];

const FAQ = [
  {
    q: "Vilket familjeabonnemang är billigast?",
    a: BILLIGAST
      ? `För ${PERSONER} personer är ${BILLIGAST.namn} billigast av de familjeerbjudanden vi kunnat räkna på: ${kr(summa(BILLIGAST))} i månaden till ordinarie pris (${BILLIGAST.text}).`
      : "Det beror på hur mycket surf familjen behöver. Se exemplen på sidan.",
  },
  {
    q: "Delar familjen på samma surf?",
    a: "Det beror på operatören. Hos Comviq Familj har varje medlem 20 GB. Hos Tre delar extra användarna på huvudabonnemangets surf på 25 GB-abonnemanget, och på Obegränsad får alla obegränsad surf.",
  },
  {
    q: "Måste alla i familjen ha samma operatör?",
    a: "För att få familjepriset, ja. Alla abonnemang i familjen ligger hos samma operatör och oftast på samma faktura. Det är huvudabonnenten som står på avtalet och betalar.",
  },
  {
    q: "Har familjeabonnemang bindningstid?",
    a: `Olika. Comviq Familj har ingen bindningstid. Tre tar ${MEDLEM.treBunden} kr per extra användare med 24 månaders bindning och ${MEDLEM.treObunden} kr utan. Tele2 anger 24 månaders bindning för sina familjeabonnemang.`,
  },
  {
    q: "Är det alltid billigare med familjeabonnemang?",
    a: "Inte alltid. Behöver familjemedlemmarna lite surf kan separata billiga abonnemang hos olika operatörer bli billigare. Räkna på båda, med de surfmängder ni faktiskt använder.",
  },
];

export const Route = createFileRoute("/familjeabonnemang")({
  head: () =>
    pageHead({
      title: "Familjeabonnemang mobil 2026: jämför priser | Mobilpoolen",
      description: BILLIGAST
        ? `Familjeabonnemang för ${PERSONER} personer från ${kr(summa(BILLIGAST))}/mån. Jämför Comviq, Tre, Telia, Tele2, Hallon och katshing: pris per medlem, surf och bindning.`
        : "Jämför familjeabonnemang: pris per medlem, delad surf och bindningstid hos Comviq, Tre, Telia, Tele2, Hallon och katshing.",
      canonical: "/familjeabonnemang",
      scripts: [breadcrumbJsonLd(TRAIL), faqJsonLd(FAQ)],
    }),
  component: Sida,
});

function Sida() {
  return (
    <PelarSida
      trail={TRAIL}
      rubrik="Familjeabonnemang: jämför pris per medlem"
      ingress={
        BILLIGAST ? (
          <p>
            För en familj på {PERSONER} kostar {BILLIGAST.namn} {kr(summa(BILLIGAST))} i månaden
            till ordinarie pris, med {BILLIGAST.text}. Det är billigast av erbjudandena vi kunnat
            räkna på. Extra medlemmar kostar mellan {MEDLEM.comviq} och {MEDLEM.telia} kr i månaden
            beroende på operatör. Skillnaden ligger i om varje person får egen surf eller om ni
            delar.
          </p>
        ) : (
          <p>Jämför familjeerbjudanden: pris per medlem, surf och bindningstid.</p>
        )
      }
      nyckeltal={[
        ...(BILLIGAST
          ? [
              {
                varde: kr(summa(BILLIGAST)),
                text: `${BILLIGAST.namn}, ${PERSONER} personer per månad`,
              },
            ]
          : []),
        { varde: `${MEDLEM.comviq} kr`, text: "lägsta pris per extra medlem (Comviq, Tre bundet)" },
        { varde: "9", text: "extra användare som mest hos Telia och Tre" },
      ]}
      jamforelse={
        <div className="space-y-10">
          <GuideTable
            head={["Erbjudande", "Huvudabonnemang", `+ ${EXTRA} medlemmar`, `${PERSONER} personer`]}
            rows={EXEMPEL.map((e) => [
              `${e.namn} (${e.text})`,
              `${e.huvud.namn}: ${kr(e.huvud.pris)}`,
              `${EXTRA} × ${kr(e.medlem)}`,
              `${kr(summa(e))}/mån`,
            ])}
            brytForsta
          />
          <p className="text-[13.5px] text-foreground/65">
            Ordinarie priser per månad. Källa: operatörernas webbplatser, kontrollerade{" "}
            {datumText(SENAST_KONTROLLERAD)}.
          </p>
          <Jamforelse
            urval={(a) => Boolean(a.malgrupp?.includes("familj")) || a.operator === "tre"}
            id="lista"
          />
        </div>
      }
      jamforelseRubrik={`Vad kostar familjeabonnemang för ${PERSONER} personer?`}
      jamforelseIngress="Exemplen räknar huvudabonnemanget plus tre extra medlemmar, bara med priser som operatörerna själva anger. Under tabellen finns huvudabonnemangen som familjeerbjudandena bygger på."
      faq={FAQ}
      lankar={[
        {
          href: "/barn",
          label: "Mobilabonnemang för barn",
          text: "Första abonnemanget, spärrar och vem som står på avtalet.",
        },
        {
          href: "/studentabonnemang",
          label: "Ungdom och student",
          text: "Rabatter för unga och studenter.",
        },
        {
          href: "/billigaste-mobilabonnemang",
          label: "Billigaste mobilabonnemang",
          text: "Jämför med separata abonnemang.",
        },
        {
          href: "/guider/sparad-surf-dubbel-surf",
          label: "Sparad surf och dubbel surf",
          text: "Så fungerar surf som rullar över.",
        },
      ]}
      ctaRubrik="Räkna på familjens mobilräkning"
      ctaBild="familj-hostpromenad"
      uppdaterad="2026-10-29"
    >
      <h2>Hur fungerar ett familjeabonnemang?</h2>
      <p>
        En person tecknar ett huvudabonnemang och lägger till fler medlemmar eller extra användare,
        som får egna nummer och SIM-kort. Alla hamnar på samma faktura, och huvudabonnenten står på
        avtalet. Varje extra medlem kostar mindre än ett eget abonnemang hos samma operatör. Hur
        surfen fungerar skiljer sig: hos vissa har varje medlem egen surf, hos andra delar alla på
        huvudabonnemangets.
      </p>

      <h2>Vilka familjeerbjudanden finns?</h2>
      <ul>
        {COMVIQ && (
          <li>
            <strong>Comviq Familj:</strong> {MEDLEM.comviq} kr i månaden per medlem med 20 GB var
            och ingen bindningstid. {COMVIQ.namn} för {kr(COMVIQ.pris)} fungerar som
            huvudabonnemang.
          </li>
        )}
        {TRE && (
          <li>
            <strong>Tre:</strong> upp till 9 extra användare för {MEDLEM.treBunden} kr i månaden med
            24 månaders bindning eller {MEDLEM.treObunden} kr utan. På {TRE.namn} ({kr(TRE.pris)})
            får alla obegränsad surf.
            {TRE25 && ` På ${TRE25.namn} delar ni på ${gbText(TRE25.gb)}.`}
          </li>
        )}
        {TELIA && (
          <li>
            <strong>Telia:</strong> upp till 9 extra användare för {MEDLEM.telia} kr i månaden på{" "}
            {TELIA.namn} ({kr(TELIA.pris)}). Just nu har Telia en kampanj där extra användare kostar{" "}
            {MEDLEM.teliaKampanj} kr i 12 månader. Extra användare går inte att lägga till på
            vanliga Obegränsad, 20 GB eller 10 GB.
          </li>
        )}
        {TELE2 && (
          <li>
            <strong>Tele2:</strong> upp till 10 familjeabonnemang med 24 månaders bindning. Priset
            per familjemedlem anges olika på Tele2s sidor, 169 eller 149 kr i månaden, så
            kontrollera vad som gäller när du beställer. Vi räknar därför inte med Tele2 i exemplet.
          </li>
        )}
        <li>
          <strong>Hallon:</strong> extra användare för 99 kr i månaden enligt en äldre prislista. Vi
          har inte kunnat bekräfta att priset gäller i dag och räknar inte med det.
        </li>
        <li>
          <strong>katshing:</strong> familjeabonnemang med obegränsad surf för 2–6 personer, från{" "}
          {MEDLEM.katshingTva} kr i månaden för två. Priset för fler personer har vi inte kunnat
          kontrollera.
        </li>
      </ul>
      <p>
        Telenor har också familjevarianter av sina abonnemang, men Telenors priser har vi inte
        kunnat kontrollera.
      </p>

      <h2>Vad kostar det för en familj på fyra?</h2>
      <p>Räknat till ordinarie pris, med huvudabonnemanget och tre extra medlemmar:</p>
      <ul>
        {EXEMPEL.map((e) => (
          <li key={e.namn}>
            {e.namn}: {kr(e.huvud.pris)} + {EXTRA} × {kr(e.medlem)} ={" "}
            <strong>{kr(summa(e))} i månaden</strong>, eller {kr(summa(e) * 12)} på ett år.
          </li>
        ))}
      </ul>
      {TELIA && (
        <p>
          Med Telias kampanjpris för extra användare blir Telia-exemplet{" "}
          {kr(TELIA.pris + EXTRA * MEDLEM.teliaKampanj)} i månaden de första 12 månaderna. Kampanjer
          på själva huvudabonnemanget har vi inte räknat in, eftersom längden inte alltid framgår.
        </p>
      )}

      <h2>Familjeabonnemang eller separata abonnemang?</h2>
      <p>
        Familjepriset är bara billigare om ni behöver ungefär det erbjudandet ger. Har barnen mest
        wifi hemma och i skolan kan ett litet abonnemang var bli billigare, även hos en annan
        operatör. Jämför med de{" "}
        <Link to={"/billigaste-mobilabonnemang" as never}>
          billigaste abonnemangen per surfmängd
        </Link>{" "}
        innan ni bestämmer er.
      </p>
      <p>Tänk också på det här:</p>
      <ul>
        <li>
          <strong>Bindningstid.</strong> Med bindning sitter hela familjen fast lika länge. Bryter
          ni i förtid betalar ni resten.
        </li>
        <li>
          <strong>Delad surf.</strong> Delar ni på en pott kan en person som streamar mycket ta slut
          på surfen för alla.
        </li>
        <li>
          <strong>Ägarskap.</strong> Huvudabonnenten står på avtalet. När ett barn flyttar hemifrån
          behöver numret föras över till barnet, vilket görs hos operatören.
        </li>
      </ul>

      <h2>Vem står på avtalet för barnens abonnemang?</h2>
      <p>
        Den som tecknar huvudabonnemanget, oftast en förälder. Det är den personen som betalar och
        ansvarar för abonnemangen. Mer om första abonnemanget, spärrar och kostnadskontroll finns på
        sidan om <Link to={"/barn" as never}>mobilabonnemang för barn</Link>.
      </p>
      <p className="kalla">
        Källa: operatörernas webbplatser och prislistor, kontrollerade{" "}
        {datumText(SENAST_KONTROLLERAD)}.
      </p>
    </PelarSida>
  );
}
