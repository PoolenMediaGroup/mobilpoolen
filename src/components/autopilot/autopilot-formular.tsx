import { useId, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Check, MailCheck, Sparkles } from "lucide-react";
import { OPERATORER } from "@/lib/mobil/data";
import { kr, snittForstaAret } from "@/lib/mobil/berakna";
import { forslagFor } from "@/lib/mobil/autopilot-forslag";
import {
  AUTOPILOT_LANSERAD,
  AUTOPILOT_OPPEN,
  INTRESSE_SAMTYCKE,
  anmalIntresse,
  FULLMAKT_INTRESSE,
  NYHETSBREV,
  SAMTYCKE,
  SMS_SAMTYCKE,
  anropaAutopilot,
} from "@/lib/autopilot";

type Val = "" | string;

type Uppgifter = {
  operator: string;
  abonnemang: string;
  manadskostnad: string;
  harRabatt: Val;
  ordinariePris: string;
  rabattManader: string;
  surf: Val;
  surfGb: string;
  friaSamtal: Val;
  friaSms: Val;
  euSurfGb: string;
  utlandssamtal: Val;
  antalSim: string;
  bindning: Val;
  bindningManader: string;
  uppsagningstid: Val;
  avbetalning: Val;
  avbetalningManader: string;
  namn: string;
  epost: string;
  mobil: string;
  sms: boolean;
  nyhetsbrev: boolean;
  fullmakt: boolean;
  samtycke: boolean;
  webbplats: string;
};

const TOM: Uppgifter = {
  operator: "",
  abonnemang: "",
  manadskostnad: "",
  harRabatt: "",
  ordinariePris: "",
  rabattManader: "",
  surf: "",
  surfGb: "",
  friaSamtal: "",
  friaSms: "",
  euSurfGb: "",
  utlandssamtal: "",
  antalSim: "1",
  bindning: "",
  bindningManader: "",
  uppsagningstid: "",
  avbetalning: "",
  avbetalningManader: "",
  namn: "",
  epost: "",
  mobil: "",
  sms: false,
  nyhetsbrev: false,
  fullmakt: false,
  samtycke: false,
  webbplats: "",
};

const STEG = [
  "Ditt abonnemang i dag",
  "Din surf",
  "Samtal och sms",
  "Om abonnemanget",
  "Bindningstid",
  "Rabatt och avbetalning",
  "Så når vi dig",
] as const;
const SISTA = STEG.length - 1;
const MANADER = Array.from({ length: 36 }, (_, i) => i + 1);
const INPUT =
  "block min-h-[50px] w-full rounded-xl border border-input-border bg-input px-4 text-[16px] focus:outline-none focus:ring-2 focus:ring-primary/40";
const tal = (s: string) => {
  const n = Number(s.replace(",", ".").replace(/\s/g, ""));
  return s.trim() !== "" && Number.isFinite(n) ? n : null;
};

function Falt({
  id,
  etikett,
  hjalp,
  children,
}: {
  id?: string;
  etikett: ReactNode;
  hjalp?: string;
  children: ReactNode;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label htmlFor={id} className="block text-[14.5px] font-semibold">
        {etikett}
      </label>
      {hjalp && <p className="mt-0.5 text-[13px] text-foreground/60">{hjalp}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Knappval({
  namn,
  varde,
  alternativ,
  onChange,
}: {
  namn: string;
  varde: string;
  alternativ: { v: string; t: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={namn} className="flex flex-wrap gap-2">
      {alternativ.map((a) => (
        <button
          key={a.v}
          type="button"
          role="radio"
          aria-checked={varde === a.v}
          onClick={() => onChange(a.v)}
          className={`min-h-11 rounded-full border px-4 text-[14.5px] font-medium transition-colors ${
            varde === a.v
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-surface text-foreground hover:border-primary/50"
          }`}
        >
          {a.t}
        </button>
      ))}
    </div>
  );
}

function Kryss({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="mt-3 flex cursor-pointer items-start gap-3 text-[14px] leading-snug">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 rounded border-input-border accent-[var(--primary)]"
      />
      <span>{children}</span>
    </label>
  );
}

export function AutopilotFormular({ kalla = "autopilot" }: { kalla?: string }) {
  const uid = useId();
  const [steg, setSteg] = useState(0);
  const [u, setU] = useState<Uppgifter>(TOM);
  const [fel, setFel] = useState<string | null>(null);
  const [skickar, setSkickar] = useState(false);
  const [klart, setKlart] = useState(false);
  const satt = <K extends keyof Uppgifter>(k: K, v: Uppgifter[K]) =>
    setU((x) => ({ ...x, [k]: v }));

  const kostnad = tal(u.manadskostnad);
  const behovGb = u.surf === "gb" ? tal(u.surfGb) : null;
  const billigast = useMemo(() => {
    if (u.surf !== "obegransad" && behovGb == null) return null;
    return (
      forslagFor(
        { gb: behovGb, obegransad: u.surf === "obegransad", euGb: tal(u.euSurfGb) },
        1,
      )[0] ?? null
    );
  }, [u.surf, behovGb, u.euSurfGb]);
  const efterRabatt = u.harRabatt === "ja" ? (tal(u.ordinariePris) ?? kostnad) : kostnad;
  const spar =
    billigast && efterRabatt != null ? Math.round(efterRabatt - snittForstaAret(billigast)) : null;

  function kontrollera(s: number): string | null {
    if (s === 0) {
      if (!u.operator) return "Välj din operatör.";
      if (kostnad == null) return "Fyll i vad du betalar per månad.";
    }
    if (s === 1) {
      if (!u.surf) return "Välj hur mycket surf du har.";
      if (u.surf === "gb" && behovGb == null) return "Fyll i hur många GB du har.";
    }
    if (s === 4 && !u.bindning) return "Svara på om du har bindningstid.";
    if (s === 5 && !u.harRabatt) return "Svara på om du har rabatt just nu.";
    if (s === SISTA) {
      if (!u.namn.trim()) return "Fyll i ditt namn.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(u.epost.trim()))
        return "Fyll i en giltig e-postadress.";
      if (u.mobil.trim() && !/^(\+46|0)7\d{8}$/.test(u.mobil.replace(/[\s-]/g, "")))
        return "Mobilnumret ser inte rätt ut. Skriv till exempel 070 123 45 67.";
      if (!u.samtycke)
        return "Kryssa i att vi får mejla dig, annars kan vi inte bevaka ditt abonnemang.";
    }
    return null;
  }

  const formRef = useRef<HTMLFormElement>(null);
  function bytSteg(till: number) {
    setSteg(till);
    // På mobil kan formulärets topp ha scrollat ur bild när steget blir kortare.
    const el = formRef.current;
    if (el && el.getBoundingClientRect().top < 0)
      el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function nasta() {
    const f = kontrollera(steg);
    setFel(f);
    if (!f) bytSteg(steg + 1);
  }

  async function skicka() {
    const f = kontrollera(SISTA);
    setFel(f);
    if (f) return;
    setSkickar(true);
    const abonnemang = {
      operator: u.operator,
      abonnemang: u.abonnemang,
      manadskostnad: u.manadskostnad,
      har_rabatt: u.harRabatt === "ja" ? true : u.harRabatt === "nej" ? false : null,
      ordinarie_pris: u.ordinariePris,
      rabatt_manader: u.rabattManader,
      obegransad: u.surf === "obegransad",
      surf_gb: u.surf === "gb" ? u.surfGb : null,
      fria_samtal: u.friaSamtal === "ja" ? true : u.friaSamtal === "nej" ? false : null,
      fria_sms: u.friaSms === "ja" ? true : u.friaSms === "nej" ? false : null,
      eu_surf_gb: u.euSurfGb,
      utlandssamtal: u.utlandssamtal || null,
      antal_sim: u.antalSim,
      bindning: u.bindning,
      bindning_manader: u.bindningManader,
      uppsagningstid_man: u.uppsagningstid === "vet_ej" ? null : u.uppsagningstid,
      telefon_avbetalning: u.avbetalning === "ja" ? true : u.avbetalning === "nej" ? false : null,
      avbetalning_manader: u.avbetalningManader,
      vill_byta_nu: u.bindning === "ingen",
    };
    const svar = AUTOPILOT_LANSERAD
      ? await anropaAutopilot({
          action: "anmalan",
          kalla,
          webbplats: u.webbplats,
          namn: u.namn,
          epost: u.epost,
          mobil: u.mobil,
          sms: u.sms,
          ...abonnemang,
          fullmakt_intresse: u.fullmakt,
          nyhetsbrev: u.nyhetsbrev,
          samtycke: u.samtycke,
        })
      : await anmalIntresse({
          namn: u.namn,
          epost: u.epost,
          webbplats: u.webbplats,
          samtycke: u.samtycke,
          nyhetsbrev: u.nyhetsbrev,
          fullmakt_intresse: u.fullmakt,
          kalla,
          // Uppgifterna räknas om till datum när Autopilot öppnar, från anmälningsdagen.
          uppgifter: { ...abonnemang, anmald: new Date().toISOString().slice(0, 10) },
        });
    setSkickar(false);
    if (svar.ok) setKlart(true);
    else
      setFel(
        svar.fel === "stangd"
          ? "Autopilot öppnar inom kort. Försök gärna igen om några dagar."
          : "Något gick fel när vi skulle spara. Försök igen om en stund, eller mejla info@mobilpoolen.se.",
      );
  }

  if (klart) {
    return (
      <div
        className="rounded-[22px] bg-surface p-6 text-foreground shadow-mork sm:p-8"
        aria-live="polite"
      >
        <MailCheck className="h-10 w-10 text-primary" aria-hidden />
        {AUTOPILOT_LANSERAD ? (
          <>
            <h2 className="mt-4 text-[24px] font-bold">Kolla din inkorg</h2>
            <p className="mt-2 text-[16px] text-foreground/80">
              Vi har skickat ett mejl till <strong>{u.epost}</strong>. Klicka på knappen i mejlet så
              startar bevakningen. Hittar du det inte, titta i skräpposten.
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-4 text-[24px] font-bold">Tack, du står på listan</h2>
            <p className="mt-2 text-[16px] text-foreground/80">
              Autopilot öppnar inom kort. Då mejlar vi dig en gång till <strong>{u.epost}</strong>{" "}
              och ber dig bekräfta, och sedan startar bevakningen med uppgifterna du har fyllt i.
              Fram till dess får du inga mejl från oss.
            </p>
          </>
        )}
        {spar != null && spar >= 20 && (
          <p className="mt-4 rounded-xl bg-highlight p-4 text-[15px]">
            Med din surf finns abonnemang för {kr(snittForstaAret(billigast!))} i månaden i snitt
            första året. Det är {kr(spar)} mindre än du betalar
            {u.harRabatt === "ja" ? " efter rabatten" : ""}.{" "}
            <Link
              to="/"
              hash="alla"
              className="font-semibold text-primary underline underline-offset-2"
            >
              Se alla abonnemang
            </Link>
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      className="scroll-mt-24 rounded-[22px] bg-surface p-5 text-foreground shadow-mork sm:p-7"
      onSubmit={(e) => {
        e.preventDefault();
        if (steg < SISTA) nasta();
        else void skicka();
      }}
      noValidate
      aria-labelledby={`${uid}-rubrik`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id={`${uid}-rubrik`} className="text-[21px] font-bold sm:text-[23px]">
          {STEG[steg]}
        </h2>
        <span className="text-[13px] text-foreground/60">
          Steg {steg + 1} av {STEG.length}
        </span>
      </div>
      <div className="mt-3 flex gap-1.5" aria-hidden>
        {STEG.map((s, i) => (
          <span
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${i <= steg ? "bg-primary" : "bg-border"}`}
          />
        ))}
      </div>

      <div className="mt-6">
        {steg === 0 && (
          <>
            <Falt id={`${uid}-op`} etikett="Vilken operatör har du?">
              <select
                id={`${uid}-op`}
                value={u.operator}
                onChange={(e) => satt("operator", e.target.value)}
                className={INPUT}
              >
                <option value="">Välj operatör</option>
                {OPERATORER.map((o) => (
                  <option key={o.slug} value={o.namn}>
                    {o.namn}
                  </option>
                ))}
                <option value="Annan">Annan operatör</option>
              </select>
            </Falt>
            <Falt
              id={`${uid}-kost`}
              etikett="Vad betalar du per månad?"
              hjalp="Det som står på fakturan i dag, med eventuell rabatt."
            >
              <div className="relative">
                <input
                  id={`${uid}-kost`}
                  inputMode="numeric"
                  value={u.manadskostnad}
                  onChange={(e) => satt("manadskostnad", e.target.value)}
                  placeholder="t.ex. 299"
                  className={`${INPUT} pr-20`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
                  kr/mån
                </span>
              </div>
            </Falt>
          </>
        )}

        {steg === 1 && (
          <>
            <Falt etikett="Hur mycket surf ingår?">
              <Knappval
                namn="Surf"
                varde={u.surf}
                onChange={(v) => satt("surf", v)}
                alternativ={[
                  { v: "gb", t: "Antal GB" },
                  { v: "obegransad", t: "Obegränsad" },
                ]}
              />
              {u.surf === "gb" && (
                <div className="relative mt-3">
                  <input
                    aria-label="Antal GB per månad"
                    inputMode="decimal"
                    value={u.surfGb}
                    onChange={(e) => satt("surfGb", e.target.value)}
                    placeholder="t.ex. 20"
                    className={`${INPUT} pr-24`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
                    GB/mån
                  </span>
                </div>
              )}
            </Falt>
          </>
        )}

        {steg === 2 && (
          <>
            <p className="-mt-2 mb-1 text-[14px] text-foreground/65">
              Allt här är valfritt. Hoppa över det du inte vet.
            </p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 [&>div]:mt-0">
              <Falt etikett="Fria samtal?">
                <Knappval
                  namn="Fria samtal"
                  varde={u.friaSamtal}
                  onChange={(v) => satt("friaSamtal", v)}
                  alternativ={[
                    { v: "ja", t: "Ja" },
                    { v: "nej", t: "Nej" },
                    { v: "vet_ej", t: "Vet ej" },
                  ]}
                />
              </Falt>
              <Falt etikett="Fria sms?">
                <Knappval
                  namn="Fria sms"
                  varde={u.friaSms}
                  onChange={(v) => satt("friaSms", v)}
                  alternativ={[
                    { v: "ja", t: "Ja" },
                    { v: "nej", t: "Nej" },
                    { v: "vet_ej", t: "Vet ej" },
                  ]}
                />
              </Falt>
            </div>
            <Falt etikett="Samtal till utlandet">
              <Knappval
                namn="Samtal till utlandet"
                varde={u.utlandssamtal}
                onChange={(v) => satt("utlandssamtal", v)}
                alternativ={[
                  { v: "ingar", t: "Ingår" },
                  { v: "kostar", t: "Kostar extra" },
                  { v: "anvander_inte", t: "Ringer inte utomlands" },
                  { v: "vet_ej", t: "Vet ej" },
                ]}
              />
            </Falt>
          </>
        )}

        {steg === 3 && (
          <>
            <p className="-mt-2 mb-1 text-[14px] text-foreground/65">
              Också valfritt. Det hjälper oss att föreslå rätt.
            </p>
            <Falt
              id={`${uid}-eu`}
              etikett={
                <>
                  Surf i EU <span className="font-normal text-foreground/60">(valfritt)</span>
                </>
              }
              hjalp="Hur många GB du kan surfa per månad när du reser i EU."
            >
              <div className="relative">
                <input
                  id={`${uid}-eu`}
                  inputMode="decimal"
                  value={u.euSurfGb}
                  onChange={(e) => satt("euSurfGb", e.target.value)}
                  placeholder="t.ex. 10"
                  className={`${INPUT} pr-24`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
                  GB/mån
                </span>
              </div>
            </Falt>
            <Falt
              id={`${uid}-sim`}
              etikett="Hur många SIM-kort har du på abonnemanget?"
              hjalp="Räkna med extra SIM till familjen, surfplattan eller klockan."
            >
              <select
                id={`${uid}-sim`}
                value={u.antalSim}
                onChange={(e) => satt("antalSim", e.target.value)}
                className={INPUT}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Falt>
            <Falt
              id={`${uid}-ab`}
              etikett={
                <>
                  Abonnemangets namn{" "}
                  <span className="font-normal text-foreground/60">(valfritt)</span>
                </>
              }
            >
              <input
                id={`${uid}-ab`}
                value={u.abonnemang}
                onChange={(e) => satt("abonnemang", e.target.value)}
                placeholder="t.ex. Mobil 20 GB"
                className={INPUT}
                maxLength={120}
              />
            </Falt>
          </>
        )}

        {steg === 4 && (
          <>
            <Falt etikett="Har du bindningstid?">
              <Knappval
                namn="Bindningstid"
                varde={u.bindning}
                onChange={(v) => satt("bindning", v)}
                alternativ={[
                  { v: "har", t: "Ja" },
                  { v: "ingen", t: "Nej" },
                  { v: "vet_ej", t: "Vet ej" },
                ]}
              />
              {u.bindning === "har" && (
                <select
                  aria-label="Månader kvar av bindningstiden"
                  value={u.bindningManader}
                  onChange={(e) => satt("bindningManader", e.target.value)}
                  className={`${INPUT} mt-3`}
                >
                  <option value="">Hur många månader är kvar?</option>
                  {MANADER.map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "månad" : "månader"} kvar
                    </option>
                  ))}
                </select>
              )}
              {u.bindning === "vet_ej" && (
                <p className="mt-2 text-[13px] text-foreground/65">
                  Det står på fakturan eller på Mina sidor hos operatören. Du kan fylla i det
                  senare.
                </p>
              )}
            </Falt>
            <Falt etikett="Uppsägningstid">
              <Knappval
                namn="Uppsägningstid"
                varde={u.uppsagningstid}
                onChange={(v) => satt("uppsagningstid", v)}
                alternativ={[
                  { v: "0", t: "Ingen" },
                  { v: "1", t: "1 månad" },
                  { v: "3", t: "3 månader" },
                  { v: "vet_ej", t: "Vet ej" },
                ]}
              />
            </Falt>
          </>
        )}

        {steg === 5 && (
          <>
            <Falt
              etikett="Har du rabatt eller kampanjpris just nu?"
              hjalp="Till exempel halva priset i sex månader."
            >
              <Knappval
                namn="Rabatt"
                varde={u.harRabatt}
                onChange={(v) => satt("harRabatt", v)}
                alternativ={[
                  { v: "ja", t: "Ja" },
                  { v: "nej", t: "Nej" },
                  { v: "vet_ej", t: "Vet ej" },
                ]}
              />
              {u.harRabatt === "ja" && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <select
                    aria-label="Månader kvar av rabatten"
                    value={u.rabattManader}
                    onChange={(e) => satt("rabattManader", e.target.value)}
                    className={INPUT}
                  >
                    <option value="">Hur länge till?</option>
                    {MANADER.map((m) => (
                      <option key={m} value={m}>
                        {m} {m === 1 ? "månad" : "månader"} kvar
                      </option>
                    ))}
                  </select>
                  <div className="relative">
                    <input
                      aria-label="Pris efter rabatten"
                      inputMode="numeric"
                      value={u.ordinariePris}
                      onChange={(e) => satt("ordinariePris", e.target.value)}
                      placeholder="Pris efter"
                      className={`${INPUT} pr-20`}
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[14px] text-foreground/60">
                      kr/mån
                    </span>
                  </div>
                </div>
              )}
            </Falt>
            <Falt etikett="Betalar du av en mobil via operatören?">
              <Knappval
                namn="Mobil på avbetalning"
                varde={u.avbetalning}
                onChange={(v) => satt("avbetalning", v)}
                alternativ={[
                  { v: "ja", t: "Ja" },
                  { v: "nej", t: "Nej" },
                ]}
              />
              {u.avbetalning === "ja" && (
                <select
                  aria-label="Månader kvar av avbetalningen"
                  value={u.avbetalningManader}
                  onChange={(e) => satt("avbetalningManader", e.target.value)}
                  className={`${INPUT} mt-3`}
                >
                  <option value="">Hur många månader är kvar?</option>
                  {MANADER.map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "månad" : "månader"} kvar
                    </option>
                  ))}
                </select>
              )}
            </Falt>
          </>
        )}

        {steg === SISTA && (
          <>
            <Falt id={`${uid}-namn`} etikett="Namn">
              <input
                id={`${uid}-namn`}
                autoComplete="name"
                value={u.namn}
                onChange={(e) => satt("namn", e.target.value)}
                className={INPUT}
                maxLength={100}
              />
            </Falt>
            <Falt id={`${uid}-epost`} etikett="E-post">
              <input
                id={`${uid}-epost`}
                type="email"
                autoComplete="email"
                value={u.epost}
                onChange={(e) => satt("epost", e.target.value)}
                className={INPUT}
                maxLength={200}
              />
            </Falt>
            {AUTOPILOT_LANSERAD && (
              <Falt
                id={`${uid}-mobil`}
                etikett={
                  <>
                    Mobilnummer <span className="font-normal text-foreground/60">(valfritt)</span>
                  </>
                }
                hjalp="Bara om du vill ha sms-påminnelser när vi börjar skicka dem."
              >
                <input
                  id={`${uid}-mobil`}
                  type="tel"
                  autoComplete="tel"
                  value={u.mobil}
                  onChange={(e) => satt("mobil", e.target.value)}
                  placeholder="070 123 45 67"
                  className={INPUT}
                />
              </Falt>
            )}
            {/* Honungsfält mot botar. Syns inte och nås inte med tab. */}
            <input
              type="text"
              name="webbplats"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={u.webbplats}
              onChange={(e) => satt("webbplats", e.target.value)}
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <div className="mt-6 rounded-xl border border-border p-4">
              <Kryss checked={u.samtycke} onChange={(v) => satt("samtycke", v)}>
                {AUTOPILOT_LANSERAD ? SAMTYCKE : INTRESSE_SAMTYCKE}
              </Kryss>
              {AUTOPILOT_LANSERAD && u.mobil.trim() && (
                <Kryss checked={u.sms} onChange={(v) => satt("sms", v)}>
                  {SMS_SAMTYCKE}
                </Kryss>
              )}
              <Kryss checked={u.fullmakt} onChange={(v) => satt("fullmakt", v)}>
                {FULLMAKT_INTRESSE}
              </Kryss>
              <Kryss checked={u.nyhetsbrev} onChange={(v) => satt("nyhetsbrev", v)}>
                {NYHETSBREV}
              </Kryss>
            </div>
            <p className="mt-3 text-[12.5px] text-foreground/60">
              Gratis. Vi säljer inga uppgifter och ingen ringer dig. Läs{" "}
              <Link to={"/autopilot/villkor" as never} className="underline underline-offset-2">
                villkoren
              </Link>{" "}
              och{" "}
              <Link to="/integritetspolicy" className="underline underline-offset-2">
                integritetspolicyn
              </Link>
              .
            </p>
          </>
        )}
      </div>

      {steg === 1 && spar != null && spar >= 20 && billigast && (
        <div
          className="mt-6 flex items-start gap-2 rounded-xl bg-highlight p-4 text-[15px] leading-snug"
          aria-live="polite"
        >
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>
            Med din surf finns abonnemang för <strong>{kr(snittForstaAret(billigast))}/mån</strong>{" "}
            i snitt första året, <strong>{kr(spar)} mindre</strong> än du betalar.
          </span>
        </div>
      )}

      {fel && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-[14.5px] text-destructive"
        >
          {fel}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        {steg > 0 && (
          <button
            type="button"
            onClick={() => {
              setFel(null);
              bytSteg(steg - 1);
            }}
            className="inline-flex min-h-12 items-center gap-1.5 rounded-xl border border-border px-4 font-semibold hover:border-primary/50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Tillbaka
          </button>
        )}
        <button type="submit" disabled={skickar} className="btn-cta flex-1 disabled:opacity-60">
          {steg < SISTA ? (
            <>
              Nästa
              <ArrowRight className="h-4 w-4" aria-hidden />
            </>
          ) : skickar ? (
            "Sparar …"
          ) : (
            <>
              <Check className="h-4 w-4" aria-hidden />
              {AUTOPILOT_LANSERAD ? "Starta Autopilot" : "Anmäl intresse"}
            </>
          )}
        </button>
      </div>
      {(!AUTOPILOT_OPPEN || !AUTOPILOT_LANSERAD) && steg === SISTA && (
        <p className="mt-3 text-[12.5px] text-foreground/60">
          Autopilot öppnar inom kort. Anmäl dig nu, så startar din bevakning när vi öppnar.
        </p>
      )}
    </form>
  );
}
