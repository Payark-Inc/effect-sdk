import { Effect } from "effect";
import { Schema } from "@effect/schema";
import { PayArkConfigService, request } from "../http";
import { CheckoutSessionSchema } from "../schemas";
import { PayArkEffectError } from "../errors";
import type { CreateCheckoutParams, PayArkConfig } from "@payark/sdk";
import type { CheckoutSession } from "../schemas";
import type { HttpClient } from "@effect/platform";
import type { ParseResult } from "@effect/schema";

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
      Effect.flatMap(Schema.decodeUnknown(CheckoutSessionSchema)),
      Effect.provideService(PayArkConfigService, this.config),
    );
  }
}
