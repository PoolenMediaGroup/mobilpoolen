/**
 * AI-chatten på Mobilpoolen: det som syns i webbläsaren. Texter, snabbval och knappar.
 *
 * CHATT_PA styr om chattknappen syns för alla. Med false går den ändå att öppna
 * med ?chatt=1 i adressen, för test innan den visas. Kräver ANTHROPIC_API_KEY
 * som hemlighet på workern i Cloudflare (Runtime variables). Slå på först när
 * nyckeln finns och chatten är testad med ?chatt=1.
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
    "Hej! Jag svarar på frågor om mobilabonnemang, operatörernas priser och villkor och vad som passar dig. Vad undrar du över?",
  snabbval: [
    "Vilket abonnemang är billigast?",
    "Hur mycket surf behöver jag?",
    "Vad händer när kampanjen tar slut?",
    "Hur byter jag operatör?",
  ],
  integritet: "/integritetspolicy#ai-chatt",
  kontaktEpost: "info@mobilpoolen.se",
} as const;

/** Knappar chatten kan visa. Utan href är det ett formulär i chatten (chatt-formular.tsx). */
export const CHATT_ATGARDER = {
  jamfor: { etikett: "Jämför abonnemang", href: "/#alla" },
  operatorer: { etikett: "Se operatörerna", href: "/operatorer" },
  kampanjer: { etikett: "Kampanjer just nu", href: "/kampanjer" },
  surf: { etikett: "Räkna ut surfbehovet", href: "/verktyg/hur-mycket-surf-behover-jag" },
  byta: { etikett: "Så byter du operatör", href: "/guider/byta-operator-behalla-nummer" },
  kontakt: { etikett: "Kontakta oss", href: "/kontakt" },
} as const satisfies Record<string, { etikett: string; href?: string }>;

export type AtgardId = keyof typeof CHATT_ATGARDER;
