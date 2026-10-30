// GENERERAD av scripts/bygg_data.py ur research/prisandringar.json. Ändra inte för hand.

export type Prisandring = {
  datum: string;
  operator: string;
  namn: string;
  kundtyp: "privat" | "foretag";
  kalla: string | null;
  typ: "nytt" | "andrat" | "borttaget";
  falt: "pris" | "kampanjpris" | "kampanjManader" | "startavgift" | null;
  fran: number | null;
  till: number | null;
};

export const PRISANDRINGAR: Prisandring[] = [];
