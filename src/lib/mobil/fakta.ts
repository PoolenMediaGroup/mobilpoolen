/**
 * Kontrollerade fakta som används på flera sidor. Varje post har källa och
 * datum. Ändras en siffra här ändras den överallt. Lägg aldrig in något här
 * som inte är belagt i en primärkälla.
 */

export type Kalla = { namn: string; url: string };

export const KALLOR = {
  ptsMarknad: {
    namn: "PTS, Svensk telekommarknad 2025 (publicerad 25 maj 2026)",
    url: "https://www.pts.se/contentassets/9f77870e1a904af1978495986b9a227c/slutversion-rapport-svensk-telekommarknad-2025-dnr-2516551_t.pdf",
  },
  ptsTackning: {
    namn: "PTS, Mobiltäcknings- och bredbandskartläggning 2025",
    url: "https://statistik.pts.se/media/n0ydbncc/mtbbk_25-17220_rapport.pdf",
  },
  opensignal: {
    namn: "Opensignal, Sweden Mobile Network Experience, december 2025",
    url: "https://insights.opensignal.com/reports/2025/12/sweden/mobile-network-experience",
  },
  ski: {
    namn: "Svenskt Kvalitetsindex, SKI Mobil 2025",
    url: "https://www.kvalitetsindex.se/wp-content/uploads/2025/10/ski-mobil-2025.pdf",
  },
  lek: {
    namn: "Lagen (2022:482) om elektronisk kommunikation",
    url: "https://data.riksdagen.se/dokument/sfs-2022-482.html",
  },
  distansavtal: {
    namn: "Distansavtalslagen (2005:59)",
    url: "https://data.riksdagen.se/dokument/sfs-2005-59.html",
  },
  roaming: {
    namn: "Your Europe, roaming i EU",
    url: "https://europa.eu/youreurope/citizens/consumers/internet-telecoms/mobile-roaming-costs/",
  },
  n4m5g: {
    namn: "Tele2, pressmeddelande om 5G i hela nätet (september 2025)",
    url: "https://tele2.com/media/news/2025/tele2-and-telenor-now-activate-5g-across-the-entire-mobile-network-covering-90-of-swedens-landmass-and-99-9-of-the-population",
  },
  telekomradgivarna: {
    namn: "Telekområdgivarna",
    url: "https://telekomradgivarna.se/",
  },
  skatteverketArbetsredskap: {
    namn: "Skatteverket, arbetsredskap",
    url: "https://skatteverket.se/foretag/arbetsgivare/lonochersattning/formaner/arbetsredskap.4.3016b5d91791bf546791ad4.html",
  },
} as const satisfies Record<string, Kalla>;

/** PTS, Svensk telekommarknad 2025. Läget 31 december 2025. */
export const MARKNAD = {
  abonnemang: "15,1 miljoner",
  privat: "10,7 miljoner",
  foretag: "4,4 miljoner",
  surfPerManad: 15, // GB, abonnemang med samtal och data
  surfPerManad2024: 14,
  femgAbonnemang: "8,7 miljoner",
  femgAndel: 60, // procent
  intakter: "32,4 miljarder kronor",
  andelar: [
    { namn: "Telia Company", andel: 30.3 },
    { namn: "Tele2", andel: 25.8 },
    { namn: "Telenor", andel: 20.5 },
    { namn: "Tre (Hi3G)", andel: 19.1 },
    { namn: "Övriga", andel: 4.3 },
  ],
  volteAndel: 95, // procent av samtalsminuterna gick över 4G
} as const;

export const TACKNING = {
  ptsYta: "89,95", // procent av Sveriges yta med grundläggande täckning utomhus, november 2025
  ptsYta2024: "86,93",
  ptsBebott: 81, // procent av bebodda områden med god täckning
  n4m5gYta: 90, // procent av landytan, Tele2 och Telenor, september 2025
  n4m5gBefolkning: "99,9",
  telia4g5gBefolkning: "99,9",
  telia4g5gYta: 94, // över 94 procent
} as const;

/** Opensignal december 2025, mätperiod 1 juli–28 september 2025. */
export const OPENSIGNAL = [
  { kategori: "Täckningsupplevelse (Coverage Experience)", vinnare: "Telia", varde: "7,7 av 10" },
  { kategori: "Nedladdningshastighet", vinnare: "Telenor", varde: "84,7 Mbit/s" },
  { kategori: "5G nedladdningshastighet", vinnare: "Tele2", varde: "219,0 Mbit/s" },
  { kategori: "5G uppladdning", vinnare: "Telia", varde: "20,0 Mbit/s" },
  { kategori: "Videoupplevelse", vinnare: "Tre", varde: "73,0" },
  { kategori: "Jämn kvalitet (Consistent Quality)", vinnare: "Tre", varde: "84,3 %" },
] as const;

export const SKI_PRIVAT = [
  { namn: "Vimla", varde: 82.5 },
  { namn: "Fello", varde: 81.7 },
  { namn: "Comviq", varde: 75.5 },
  { namn: "Halebop", varde: 74.1 },
  { namn: "Hallon", varde: 72.3 },
  { namn: "Övriga", varde: 67.1 },
  { namn: "Telia", varde: 66.6 },
  { namn: "Branschen", varde: 65.8 },
  { namn: "Telenor", varde: 63.9 },
  { namn: "Tele2", varde: 63.3 },
  { namn: "Tre", varde: 61.5 },
] as const;

export const SKI_FORETAG = [
  { namn: "Telia", varde: 70.1 },
  { namn: "Branschen", varde: 67.1 },
  { namn: "Övriga", varde: 66.9 },
  { namn: "Telenor", varde: 65.2 },
  { namn: "Tele2", varde: 65.1 },
  { namn: "Tre", varde: 65.0 },
] as const;

export const NEDSLACKNING = {
  n4mOchTre: "1 december 2025", // Tele2, Telenor och Tre stängde 2G och 3G
  teliaTvaG: "slutet av 2027", // Telia behåller 2G
} as const;

export function decimal(n: number): string {
  return n.toString().replace(".", ",");
}
