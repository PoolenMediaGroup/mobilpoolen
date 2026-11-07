/**
 * Cookiesamtycke, egen lösning. Samma fil på Larmpoolen, Mobilpoolen och
 * Solcellspoolen (och samma upplägg som Elpoolen). Ändra i alla tre.
 * Det enda som skiljer sajterna åt ligger i lib/samtycke-tjanster.ts.
 *
 * Så fungerar det:
 *  - Varje mätverktyg är en "tjänst" i katalogen TJANST_KATALOG nedan (Meta Pixel,
 *    Google Ads, Google Analytics, TikTok Pixel). En tjänst är påslagen när den har
 *    ett giltigt id i SAMTYCKE_ID (lib/samtycke-tjanster.ts). Utan någon påslagen
 *    tjänst visas ingen cookieruta och ingen länk till cookieinställningarna, för då
 *    finns inget att fråga om (LEK 9 kap. 28 §: nödvändig lagring kräver inget samtycke).
 *  - Valet sparas i lokal lagring (SAMTYCKE_SAJT.nyckel) med version, tid och ett
 *    slumpat id. Efter SAMTYCKE_GILTIG_DAGAR, eller om SAMTYCKE_VERSION höjs, frågar
 *    vi igen. Höj versionen när en ny tjänst slås på, så att alla tillfrågas om den.
 *  - Skriptet i <head> läser valet innan sidan ritas. Finns ett giltigt val sätts
 *    data-samtycke="klart" på <html>, och CSS döljer rutan. Ingen blinkning.
 *  - Tjänsternas skript ligger i HTML:en som type="text/plain" med
 *    data-samtycke="<tjänst>". De körs först när besökaren har sagt ja till just den
 *    tjänsten. Utan ja laddas ingenting från Meta, Google eller TikTok.
 *  - Google Consent Mode v2: allt nekat som standard (gcm-default). Vid ja uppdateras
 *    bara det tjänsten behöver (annonser eller statistik) innan taggen laddas.
 *  - Varje val loggas anonymt i Supabase (SAMTYCKE_SAJT.rpc): slumpat id, valet per
 *    tjänst, versionen och sidan. Ingen IP-adress, inget annat om besökaren. Det är
 *    beviset på att samtycke gavs. SQL i supabase/samtycken.sql.
 *  - Tar besökaren tillbaka ett ja raderas tjänstens cookies och sidan laddas om.
 *  - Knappar i rutan har data-samtycke-knapp. Flikarna har data-samtycke-knapp="flik"
 *    och data-flik (samtycke, installningar, om). Länkar som öppnar inställningarna
 *    (sidfoten, cookiepolicyn) anropar visaSamtyckesInstallningar().
 *
 * Ny tjänst i katalogen: lägg till den i TJANST_KATALOG (id-format, skript, cookies,
 * Consent Mode), och ett tomt id i SAMTYCKE_ID på alla tre sajter.
 */
import { SAMTYCKE_ID, SAMTYCKE_SAJT, SAMTYCKE_VERSION } from "./samtycke-tjanster";

export { SAMTYCKE_SAJT, SAMTYCKE_VERSION };
export const SAMTYCKE_GILTIG_DAGAR = 365;

export type SamtyckeTjanst = keyof typeof SAMTYCKE_ID;
export type SamtyckeKategori = "statistik" | "marknadsforing";

export type TjanstInfo = {
  id: SamtyckeTjanst;
  kategori: SamtyckeKategori;
  /** Namnet i rutan och policyn, t.ex. "Meta Pixel". */
  namn: string;
  /** Bolaget som tar emot uppgifterna. */
  leverantor: string;
  /** Kort mottagarnamn i löptext, t.ex. "Meta (Facebook och Instagram)". */
  mottagare: string;
  /** Vad tjänsten gör, en mening. */
  syfte: string;
  /** Cookies och livslängd, för rutan och policyn. */
  cookies: string;
  /** Gemensamt personuppgiftsansvar (Meta). */
  gemensamtAnsvar?: boolean;
  /** Formatet på id:t. Fel format = tjänsten är avstängd. */
  idFormat: RegExp;
  /** Skriptet som körs efter ja. Får bara använda id:t. */
  skript: (id: string) => string;
  /** Consent Mode-nycklar som ska bli granted vid ja. */
  gcm?: string[];
  /** Cookies som raderas när ett ja tas tillbaka. Slutar namnet på * är det ett prefix. */
  rensa: string[];
};

const GTAG_LADDA = (id: string) =>
  `(function(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${id}';document.head.appendChild(s);})();` +
  `gtag('js',new Date());`;

export const TJANST_KATALOG: readonly TjanstInfo[] = [
  {
    id: "google-analytics",
    kategori: "statistik",
    namn: "Google Analytics",
    leverantor: "Google Ireland Ltd",
    mottagare: "Google",
    syfte:
      "Räknar hur besökare använder sajten, till exempel vilka sidor som läses och var de kommer ifrån.",
    cookies: "_ga och _ga_*, upp till 13 månader",
    idFormat: /^G-[A-Z0-9]{4,20}$/,
    skript: (id) => GTAG_LADDA(id) + `gtag('config','${id}',{anonymize_ip:true});`,
    gcm: ["analytics_storage"],
    rensa: ["_ga", "_ga_*", "_gid"],
  },
  {
    id: "meta",
    kategori: "marknadsforing",
    namn: "Meta Pixel",
    leverantor: "Meta Platforms Ireland Ltd",
    mottagare: "Meta (Facebook och Instagram)",
    syfte:
      "Mäter om annonser på Facebook och Instagram leder till besök och förfrågningar, och hjälper oss visa annonserna för rätt personer.",
    cookies: "_fbp och _fbc, upp till 90 dagar",
    gemensamtAnsvar: true,
    idFormat: /^\d{6,20}$/,
    skript: (id) =>
      "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');" +
      // autoConfig av: inga automatiska knappklick, formulärfält eller sidmetadata.
      `fbq('set','autoConfig',false,'${id}');fbq('init','${id}');fbq('track','PageView');`,
    rensa: ["_fbp", "_fbc"],
  },
  {
    id: "google-ads",
    kategori: "marknadsforing",
    namn: "Google Ads",
    leverantor: "Google Ireland Ltd",
    mottagare: "Google",
    syfte: "Mäter om annonser på Google leder till besök och förfrågningar.",
    cookies: "_gcl_au, upp till 90 dagar",
    idFormat: /^AW-\d{6,20}$/,
    skript: (id) => GTAG_LADDA(id) + `gtag('config','${id}');`,
    gcm: ["ad_storage", "ad_user_data", "ad_personalization"],
    rensa: ["_gcl_au", "_gcl_aw", "_gcl_dc"],
  },
  {
    id: "tiktok",
    kategori: "marknadsforing",
    namn: "TikTok Pixel",
    leverantor: "TikTok Technology Ltd (Irland)",
    mottagare: "TikTok",
    syfte: "Mäter om annonser på TikTok leder till besök och förfrågningar.",
    cookies: "_ttp och _tt_enable_cookie, upp till 13 månader",
    idFormat: /^[A-Z0-9]{10,30}$/,
    skript: (id) =>
      "!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=d.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=d.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)};" +
      `ttq.load('${id}');ttq.page();}(window,document,'ttq');`,
    rensa: ["_ttp", "_tt_enable_cookie", "ttcsid*"],
  },
];

/** Tjänsterna som är påslagna (har ett giltigt id), i katalogens ordning. */
export const AKTIVA_TJANSTER: readonly TjanstInfo[] = TJANST_KATALOG.filter((t) =>
  t.idFormat.test(SAMTYCKE_ID[t.id] ?? ""),
);

/** Finns det något att fråga om? Annars ingen ruta och ingen länk. */
export const SAMTYCKE_AKTIV = AKTIVA_TJANSTER.length > 0;

/** "Meta (Facebook och Instagram) och Google", utan dubbletter. */
export function mottagareText(tjanster: readonly TjanstInfo[] = AKTIVA_TJANSTER): string {
  const namn = [...new Set(tjanster.map((t) => t.mottagare))];
  if (namn.length <= 1) return namn[0] ?? "";
  return `${namn.slice(0, -1).join(", ")} och ${namn[namn.length - 1]}`;
}

export type SamtyckeVal = Partial<Record<SamtyckeTjanst, boolean>>;

type SamtyckeApi = {
  las: () => SamtyckeVal | null;
  har: (t: SamtyckeTjanst) => boolean;
  visa: () => void;
};

type Fbq = (...args: unknown[]) => void;
type Ttq = { page: () => void; track: (namn: string, data?: Record<string, unknown>) => void };

declare global {
  interface Window {
    poolenSamtycke?: SamtyckeApi;
    fbq?: Fbq;
    ttq?: Ttq;
    gtag?: (...args: unknown[]) => void;
  }
}

/** Har besökaren sagt ja till tjänsten? false på servern och om skriptet saknas. */
export function harSamtycke(t: SamtyckeTjanst): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.poolenSamtycke?.har(t) === true;
  } catch {
    return false;
  }
}

/** Öppnar cookieinställningarna. */
export function visaSamtyckesInstallningar(): void {
  if (typeof window === "undefined") return;
  window.poolenSamtycke?.visa();
}

/**
 * Sidvisning vid navigering inom sajten. Första sidan skickar skripten själva.
 * Google Analytics räknar navigeringen själv (förbättrad mätning).
 */
export function rapporteraSidvisning(): void {
  if (typeof window === "undefined") return;
  try {
    if (harSamtycke("meta")) window.fbq?.("track", "PageView");
    if (harSamtycke("tiktok")) window.ttq?.page();
  } catch {
    /* mätningen får aldrig stoppa sidan */
  }
}

/**
 * En händelse (t.ex. "Lead" när en förfrågan skickas) till varje tjänst besökaren
 * har sagt ja till. Skicka aldrig namn, e-post, telefon eller annat som pekar ut en
 * person i data.
 */
export function rapporteraHandelse(namn: string, data: Record<string, string | number> = {}): void {
  if (typeof window === "undefined") return;
  try {
    if (harSamtycke("meta")) window.fbq?.("trackCustom", namn, data);
    if (harSamtycke("tiktok")) window.ttq?.track(namn, data);
    if (harSamtycke("google-analytics") || harSamtycke("google-ads")) {
      window.gtag?.("event", namn, data);
    }
  } catch {
    /* mätningen får aldrig stoppa sidan */
  }
}

/** Consent Mode-standard: allt nekat tills besökaren säger ja. */
const GCM_DEFAULT =
  "window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;" +
  "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});" +
  "gtag('set','ads_data_redaction',true);gtag('set','url_passthrough',true);";

/**
 * Skripten till <head>, i rätt ordning: Consent Mode-standard, samtyckesskriptet,
 * sedan tjänsternas skript (vilande tills ja). Tom lista utan påslagna tjänster.
 */
export function samtyckeHeadSkript(): Record<string, unknown>[] {
  if (!SAMTYCKE_AKTIV) return [];
  const google = AKTIVA_TJANSTER.some((t) => t.gcm);
  return [
    ...(google ? [{ id: "gcm-default", children: GCM_DEFAULT }] : []),
    { id: "samtycke", children: samtyckeSkript() },
    ...AKTIVA_TJANSTER.map((t) => ({
      id: `samtycke-${t.id}`,
      type: "text/plain",
      "data-samtycke": t.id,
      children: t.skript(SAMTYCKE_ID[t.id]),
    })),
  ];
}

/**
 * Skriptet i <head>. Ren ES5 utan beroenden, så att det kan köras innan React.
 * Måste ligga efter gcm-default och före tjänsternas skript.
 */
export function samtyckeSkript(): string {
  const gcm: Record<string, string[]> = {};
  const rensa: Record<string, string[]> = {};
  for (const t of AKTIVA_TJANSTER) {
    if (t.gcm) gcm[t.id] = t.gcm;
    rensa[t.id] = t.rensa;
  }
  const cfg = JSON.stringify({
    k: SAMTYCKE_SAJT.nyckel,
    v: SAMTYCKE_VERSION,
    d: SAMTYCKE_GILTIG_DAGAR,
    t: AKTIVA_TJANSTER.map((t) => t.id),
    g: gcm,
    r: rensa,
    u: SAMTYCKE_SAJT.rpc,
    a: SAMTYCKE_SAJT.rpcNyckel,
  });
  return `(function(){var C=${cfg};var H=document.documentElement;var aktiva={};
function las(){try{var r=JSON.parse(localStorage.getItem(C.k)||'null');if(!r||r.v!==C.v||!r.val||typeof r.t!=='number')return null;if(Date.now()-r.t>C.d*864e5)return null;return r;}catch(e){return null;}}
function val(){var r=las();return r?r.val:null;}
function har(t){var v=val();return !!(v&&v[t]===true);}
function gcm(v){if(typeof gtag!=='function')return;var u={},n=0;for(var t in C.g){if(!v[t])continue;for(var i=0;i<C.g[t].length;i++){u[C.g[t][i]]='granted';n++;}}if(n)gtag('consent','update',u);}
function aktivera(v){gcm(v);var s=document.querySelectorAll('script[type="text/plain"][data-samtycke]');for(var i=0;i<s.length;i++){var g=s[i],t=g.getAttribute('data-samtycke');if(!v[t]||g.getAttribute('data-aktiv'))continue;g.setAttribute('data-aktiv','1');var n=document.createElement('script');if(g.src){n.src=g.src;n.async=true;}else{n.text=g.text;}g.parentNode.insertBefore(n,g.nextSibling);aktiva[t]=true;}}
function nar(f){if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',f);}else{f();}}
function rutor(v){for(var i=0;i<C.t.length;i++){var e=document.getElementById('samtycke-'+C.t[i]);if(e)e.checked=!!(v&&v[C.t[i]]);}}
function id(){try{return crypto.randomUUID();}catch(e){return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g,function(){return(Math.random()*16|0).toString(16);});}}
function logga(r){try{fetch(C.u,{method:'POST',keepalive:true,headers:{'Content-Type':'application/json',apikey:C.a},body:JSON.stringify({p_id:r.id,p_val:r.val,p_version:C.v,p_sida:location.pathname.slice(0,120)})}).catch(function(){});}catch(e){}}
function rensa(v){var d=location.hostname.replace(/^www\\./,'');var namn=document.cookie.split(';').map(function(c){return c.split('=')[0].trim();});for(var t in C.r){if(v[t])continue;for(var i=0;i<C.r[t].length;i++){var m=C.r[t][i],p=m.charAt(m.length-1)==='*'?m.slice(0,-1):null;for(var j=0;j<namn.length;j++){var c=namn[j];if(p!==null?c.indexOf(p)!==0:c!==m)continue;var x=c+'=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';document.cookie=x;document.cookie=x+';domain=.'+d;document.cookie=x+';domain='+d;}}}}
function spara(v){var gammal=las();var r={v:C.v,t:Date.now(),id:(gammal&&gammal.id)||id(),val:v};try{localStorage.setItem(C.k,JSON.stringify(r));}catch(e){}logga(r);H.setAttribute('data-samtycke','klart');H.removeAttribute('data-samtycke-vy');var aterkallad=false;for(var t in aktiva){if(aktiva[t]&&!v[t])aterkallad=true;}if(aterkallad){rensa(v);location.reload();return;}aktivera(v);}
function allaVal(b){var v={};for(var i=0;i<C.t.length;i++)v[C.t[i]]=b;return v;}
function visa(){rutor(val());H.removeAttribute('data-samtycke');H.setAttribute('data-samtycke-vy','installningar');nar(function(){var f=document.getElementById('samtycke-rubrik');if(f){f.focus();}});}
H.setAttribute('data-samtycke-redo','1');
window.poolenSamtycke={las:val,har:har,visa:visa};
var start=val();if(start){H.setAttribute('data-samtycke','klart');nar(function(){aktivera(start);});}
document.addEventListener('click',function(e){var k=e.target&&e.target.closest?e.target.closest('[data-samtycke-knapp]'):null;if(!k)return;e.preventDefault();var a=k.getAttribute('data-samtycke-knapp');
if(a==='alla'){spara(allaVal(true));}else if(a==='neka'){spara(allaVal(false));}else if(a==='flik'){var f=k.getAttribute('data-flik');if(f==='installningar'){rutor(val());}if(f==='samtycke'){H.removeAttribute('data-samtycke-vy');}else{H.setAttribute('data-samtycke-vy',f);}}else if(a==='spara'){var v={};for(var i=0;i<C.t.length;i++){var r=document.getElementById('samtycke-'+C.t[i]);v[C.t[i]]=!!(r&&r.checked);}spara(v);}});
})();`;
}
