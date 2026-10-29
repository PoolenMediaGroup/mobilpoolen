/**
 * Lanseringsläge.
 *
 * `OFFERT_OPPEN = false`: Mobilpoolen har ännu inga avtal med operatörer.
 * Jämförelsen är öppen och länkar direkt till operatörernas egna sidor, men vi
 * får ingen ersättning för det. Därför visas ingen ersättningsrad vid knapparna,
 * och företagsförfrågningar sparas som intresseanmälningar som Mobilpoolen
 * själv svarar på, inte som leads till operatörer.
 *
 * Sätt till `true` först när avtal finns. Då visas ersättningsraden vid
 * knapparna till partnerbolag (`partner: true` i operatörsdatan).
 */
export const OFFERT_OPPEN = false;
