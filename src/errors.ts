import { Data } from "effect";
import type { PayArkErrorCode, PayArkErrorBody } from "@payark/sdk";

/**
 * Effect-compatible error class for PayArk SDK.
 * Extends Data.TaggedError for easy matching in Effect.catchTag.
 */
export class PayArkEffectError extends Data.TaggedError("PayArkEffectError")<{
  readonly message: string;
  readonly statusCode: number;
  readonly code: PayArkErrorCode;
  readonly raw?: PayArkErrorBody;
}> {
  /** Human-readable representation for logging/debugging. */
  override toString(): string {
    return `[PayArkEffectError: ${this.code}] ${this.message} (HTTP ${this.statusCode})`;
  }
}
