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
