import { Data } from "effect";

/** Machine-readable error codes. */
export type PayArkErrorCode =
  | "authentication_error"
  | "permission_error"
  | "invalid_request_error"
  | "not_found_error"
  | "rate_limit_error"
  | "api_error"
  | "connection_error"
  | "unknown_error";

/** Raw error payload from the API. */
export interface PayArkErrorBody {
  readonly error: string;
  readonly details?: any;
}
/**
 * Effect-compatible error class for PayArk SDK.
 * Extends Data.TaggedError for easy matching in Effect.catchTag.
 */
export class PayArkEffectError extends Data.TaggedError("PayArkEffectError")<{
  readonly message: string;
  readonly statusCode: number;
  readonly code: PayArkErrorCode;
  readonly raw?: PayArkErrorBody;
  readonly localizedMessage?: string;
}> {
  /** Human-readable representation for logging/debugging. */
  override toString(): string {
    return `[PayArkEffectError: ${this.code}] ${this.localizedMessage || this.message} (HTTP ${this.statusCode})`;
  }
}
