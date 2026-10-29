import { ExternalLink } from "lucide-react";
import { OperatorMonogram } from "@/components/mobil/operator-monogram";
import { bindningText, kr } from "@/lib/mobil/berakna";
import { mobilRabatt, opNamn } from "@/lib/mobil/telefon";
import type { Telefonerbjudande, Telefonmodell } from "@/lib/mobil/typer";

/**
 * Ett erbjudande på mobil med abonnemang. Mobilens pris och abonnemanget står
 * var för sig, så att det går att se vad man betalar för vad.
 */
export function TelefonKort({
  m,
  e,
  etta = false,
}: {
  m: Telefonmodell;
  e: Telefonerbjudande;
  etta?: boolean;
}) {
  const rabatt = mobilRabatt(m, e);
  return (
    <li
      className={`rounded-2xl border bg-surface p-4 shadow-kort-litet sm:p-5 ${
        etta ? "border-primary/60" : "border-border"
      }`}
    >
      {etta && (
        <p className="-mt-1 mb-3 text-[13px] font-semibold text-primary">
          Lägst totalkostnad under bindningstiden
        </p>
      )}
      <div className="flex items-start gap-3">
        <OperatorMonogram namn={opNamn(e)} size={40} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold text-foreground">{opNamn(e)}</p>
          <p className="text-[13.5px] text-foreground/65">
            {e.valfrittAbonnemang && e.abonnemangPris == null
              ? "Valfritt abonnemang"
              : bindningText(e.bindning)}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Mobilen</dt>
          <dd className="font-display text-[16px] font-semibold text-foreground">
            {e.perManad != null
              ? `${kr(e.perManad)}`
              : e.kontantpris != null
                ? kr(e.kontantpris)
                : "–"}
          </dd>
          <dd className="text-[12px] leading-tight text-foreground/65">
            {e.perManad != null && e.manader ? `per mån i ${e.manader} mån` : "kontant"}
          </dd>
        </div>
        <div className="rounded-xl bg-muted/60 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Abonnemang</dt>
          <dd className="font-display text-[16px] font-semibold text-foreground">
            {e.abonnemangPris != null ? kr(e.abonnemangPris) : "Valfritt"}
          </dd>
          <dd className="text-[12px] leading-tight text-foreground/65">
            {e.abonnemangGb != null ? `${e.abonnemangGb} GB` : "betalas separat"}
            {e.abonnemangOrdinarie != null ? `, sedan ${kr(e.abonnemangOrdinarie)}` : ""}
          </dd>
        </div>
        <div className="rounded-xl bg-primary/8 px-2 py-2.5">
          <dt className="text-[12.5px] text-foreground/65">Totalt</dt>
          <dd className="font-display text-[16px] font-semibold text-primary">
            {e.minstaTotal != null ? kr(e.minstaTotal) : "–"}
          </dd>
          <dd className="text-[12px] leading-tight text-foreground/65">
            {e.minstaTotal != null && e.bindning
              ? `mobil + ${e.bindning} mån`
              : "abonnemang tillkommer"}
          </dd>
        </div>
      </dl>
      {rabatt != null && rabatt !== 0 && (
        <p className="mt-3 text-[13.5px] text-foreground/75">
          {rabatt > 0
            ? `Mobilen kostar ${kr(rabatt)} mindre än hos ${m.marke}.`
            : `Mobilen kostar ${kr(-rabatt)} mer än hos ${m.marke}.`}
        </p>
      )}
      {e.notis && <p className="mt-1.5 text-[13.5px] text-foreground/65">{e.notis}</p>}
      <a
        href={e.kalla}
        target="_blank"
        rel="noopener nofollow"
        className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-[14.5px] font-semibold text-primary hover:underline"
      >
        Till {opNamn(e)} <ExternalLink className="size-4" aria-hidden />
      </a>
    </li>
  );
}
