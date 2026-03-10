import { Schema } from "effect";

/**
 * ── Refinements ──
 */

export const NonEmptyString = Schema.String.pipe(
  Schema.nonEmptyString(),
  Schema.brand("NonEmptyString"),
);
export type NonEmptyString = Schema.Schema.Type<typeof NonEmptyString>;

export const UrlString = Schema.String.pipe(
  Schema.pattern(/^https?:\/\/.+/),
  Schema.brand("UrlString"),
);
export type UrlString = Schema.Schema.Type<typeof UrlString>;

export const MinorUnitsInt = Schema.Number.pipe(
  Schema.int(),
  Schema.greaterThan(0),
  Schema.brand("MinorUnitsInt"),
);
export type MinorUnitsInt = Schema.Schema.Type<typeof MinorUnitsInt>;

export const NprAmount = Schema.Number.pipe(
  Schema.filter(
    (n) => Number.isFinite(n) && n > 0 && Math.round(n * 100) === n * 100,
  ),
  Schema.brand("NprAmount"),
);
export type NprAmount = Schema.Schema.Type<typeof NprAmount>;
