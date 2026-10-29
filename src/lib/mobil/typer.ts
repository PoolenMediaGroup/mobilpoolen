/**
 * Datamodellen för Mobilpoolen: operatörer, mobilnät och abonnemang.
 *
 * Varje pris och villkor är hämtat från operatörens egen webbplats och har en
 * källa (`kalla`) och ett kontrolldatum (`kontrollerad` på operatören). Kan en
 * uppgift inte beläggas står den som `null` och visas som "uppgift saknas",
 * aldrig som en gissning.
 */

/**
 * Mobilnäten som operatörerna själva och kunderna räknar med. Tele2 och
 * Telenor delar radionätet för 4G och 5G genom det samägda Net4Mobility, men
 * säljer och styr var för sig, och operatörerna anger "Tele2s nät" eller
 * "Telenors nät". Därför fyra nät här.
 */
export type NatId = "telia" | "tele2" | "telenor" | "tre";

export type OperatorGrupp = "natagare" | "varumarke" | "mvno";

export type Kundtyp = "privat" | "foretag";

export type Malgrupp = "barn" | "ung" | "senior" | "familj" | "student";

export type Abonnemang = {
  /** Unikt id, `<operator>-<kort namn>`. */
  id: string;
  operator: string;
  namn: string;
  kundtyp: Kundtyp;
  /** Surf i GB per månad. `null` = obegränsad. */
  gb: number | null;
  /** Ordinarie månadspris i kronor. Privat inkl. moms, företag exkl. moms. */
  pris: number;
  /** Kampanjpris per månad, om operatören har ett just nu. */
  kampanjpris?: number | null;
  /** Hur många månader kampanjpriset gäller. */
  kampanjManader?: number | null;
  kampanjText?: string | null;
  /** Bindningstid i månader. 0 = ingen. `null` = framgår inte av operatörens sida. */
  bindning: number | null;
  /** Uppsägningstid i månader när bindningstiden löpt ut. */
  uppsagning?: number | null;
  startavgift?: number | null;
  /** GB surf inom EU/EES per månad, enligt operatören. */
  euGb?: number | null;
  /** Fria samtal och sms inom Sverige. */
  friaSamtal: boolean;
  femg: boolean;
  /** Maxhastighet om operatören anger en, t.ex. "1 Mbit/s efter förbrukad surf". */
  hastighet?: string | null;
  /** Sparad surf som rullar över till nästa månad. */
  sparadSurf?: boolean | null;
  malgrupp?: Malgrupp[];
  /** Kontantkort eller förbetalt paket i stället för abonnemang med faktura. */
  kontantkort?: boolean;
  /** Företagspriser: om operatören anger priset exkl. moms, inkl. moms eller inte alls. */
  moms?: "exkl" | "inkl" | "okand";
  /** Kort fritext om något som skiljer abonnemanget från andra. */
  notis?: string | null;
  /** Källa: URL till operatörens egen sida. */
  kalla: string;
};

export type Operator = {
  slug: string;
  namn: string;
  /** Vem som äger varumärket, t.ex. "Telia Company". */
  agare: string;
  grupp: OperatorGrupp;
  nat: NatId;
  /** Hur operatören själv beskriver nätet, om det behövs mer än nätets namn. */
  natNotis?: string | null;
  femg: boolean;
  esim: boolean | null;
  wifiSamtal: boolean | null;
  kontantkort: boolean | null;
  harForetag: boolean;
  webb: string;
  kundtjanst?: string | null;
  /** 2–4 meningar, sakligt. Ingen värdering utan belägg. */
  om: string;
  starkor: string[];
  svagheter: string[];
  villkor: {
    uppsagningstid?: string | null;
    startavgift?: string | null;
    ovrigt?: string | null;
  };
  kallor: string[];
  /** ISO-datum då priserna senast kontrollerades. */
  kontrollerad: string;
  /** Uppgifter som inte gick att belägga och ska kontrolleras igen. */
  osakert?: string[];
  /**
   * Har Mobilpoolen ett avtal med operatören? Styr bara upplysningen om
   * ersättning vid knappen. Påverkar aldrig sorteringen.
   */
  partner: boolean;
  /** false för operatörer som läggs ned eller inte längre säljer nya abonnemang. */
  aktiv: boolean;
  /** Kort statusrad, t.ex. att varumärket avvecklas. */
  status?: string | null;
  /** Svenskt Kvalitetsindex 2025, privatkunder (branschsnitt 65,8). */
  skiPrivat?: number | null;
  /** Svenskt Kvalitetsindex 2025, företagskunder (branschsnitt 67,1). */
  skiForetag?: number | null;
  /** Har abonnemang för privatpersoner som vi kunnat kontrollera. */
  prisKontrollerade: boolean;
};

export type MobilNat = {
  id: NatId;
  namn: string;
  /** Kort form i listor, t.ex. "Telias nät". */
  kortText: string;
  agare: string;
  beskrivning: string;
};
