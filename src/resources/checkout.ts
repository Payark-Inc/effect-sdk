import { Schema, ParseResult, Effect } from "effect";
import { PayArkConfigService, request } from "../http";
import {
  CheckoutSession,
  PayArkConfig,
  CreateCheckoutParams,
} from "../schemas";
import { PayArkEffectError } from "../errors";
import type { HttpClient } from "@effect/platform";

/**
 * Effect-based resource for PayArk Checkout.
 */
export class CheckoutEffect {
  constructor(private readonly config: PayArkConfig) {}

  /**
   * Create a new checkout session.
   *
   * @param params - Configuration for the checkout session.
   * @returns Effect that resolves to the created checkout session.
   */
  create(
    params: CreateCheckoutParams,
  ): Effect.Effect<
    CheckoutSession,
    PayArkEffectError | ParseResult.ParseError,
    HttpClient.HttpClient
  > {
    return request<unknown>("POST", "/v1/checkout", { body: params }).pipe(
      Effect.flatMap(Schema.decodeUnknown(CheckoutSession)),
      Effect.provideService(PayArkConfigService, this.config),
    );
  }
}
