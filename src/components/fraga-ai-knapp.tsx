import { MessageCircle } from "lucide-react";

/**
 * Öppnar AI-chatten genom att klicka på chattknappen, så att chattens
 * gemensamma kod (likadan på Elpoolen och Larmpoolen) inte behöver ändras.
 */
export function oppnaChatten() {
  document.querySelector<HTMLButtonElement>("button.chatt-knapp")?.click();
}

/** Mörkt kort: "Hittar du inte svaret?" med knapp till AI-chatten och länk till /faq. */
export function FragaAiKort({ className = "" }: { className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl hero-mesh p-6 text-white shadow-[0_24px_48px_-24px_rgba(22,19,58,0.6)] ${className}`}
    >
      <p className="font-display text-[19px] font-semibold">Hittar du inte svaret?</p>
      <p className="mt-2 text-[14.5px] leading-relaxed text-dark-muted">
        Fråga vår AI-assistent. Den svarar direkt, dygnet runt, utifrån priserna och guiderna på
        sajten.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <button
          type="button"
          onClick={oppnaChatten}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 font-display text-[15px] font-semibold text-primary transition-transform hover:-translate-y-0.5"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          Fråga vår AI-chatt
        </button>
        <a
          href="/faq"
          className="text-[14px] font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline"
        >
          Alla frågor och svar →
        </a>
      </div>
    </div>
  );
}
