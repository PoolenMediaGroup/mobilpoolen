/**
 * AI-chatten på Mobilpoolen: det som syns i webbläsaren. Texter, snabbval och knappar.
 *
 * CHATT_PA styr om chattknappen syns för alla (påslagen 25 oktober 2026). Med false
 * går den ändå att öppna med ?chatt=1 i adressen, för test innan den visas.
 * Kräver ANTHROPIC_API_KEY som hemlighet på workern i Cloudflare (Runtime variables).
 */
export const CHATT_PA = false;

/** Sidor där chattknappen inte visas: formulärsidorna för offerter. */
export const CHATT_DOLD_PA = /^\/offert(\/|$)/;

export const CHATT_SAJT = {
  namn: "Mobilpoolen",
  doman: "mobilpoolen.se",
  rubrik: "Mobilpoolens AI-assistent",
  // Hårt bindestreck (U+2011) så att "AI-assistent" aldrig bryts över två rader.
  bubbla: "Frågor? Fråga vår AI\u2011assistent",
  valkomst:
    "Hej! Jag svarar på frågor om hemlarm, larmbolagens priser och villkor och vad som passar ditt boende. Vad undrar du över?",
  snabbval: [
    "Vilket larm passar en villa?",
    "Vad kostar ett hemlarm?",
    "Verisure eller Sector Alarm?",
    "Hur fungerar Mobilpoolen?",
  ],
  integritet: "/integritetspolicy#ai-chatt",
  kontaktEpost: "info@mobilpoolen.se",
} as const;

/** Knappar chatten kan visa. Utan href är det ett formulär i chatten (chatt-formular.tsx). */
export const CHATT_ATGARDER = {
  vantelista: { etikett: "Få besked när vi öppnar" },
  larmbolag: { etikett: "Se larmbolagen", href: "/larmbolag" },
  jamfor: { etikett: "Jämför larmbolag", href: "/jamfor" },
  kalkylator: { etikett: "Räkna på kostnaden", href: "/verktyg/hemlarm-kalkylator" },
  kontakt: { etikett: "Kontakta oss", href: "/kontakt" },
} as const satisfies Record<string, { etikett: string; href?: string }>;

export type AtgardId = keyof typeof CHATT_ATGARDER;
