import { Context, Layer, Effect } from "effect";
import { HttpApiClient, HttpClient } from "@effect/platform";
import { PayArkApi } from "./api-spec";
import type { PayArkConfig } from "./schemas";
import { CheckoutEffect } from "./resources/checkout";
import { PaymentsEffect } from "./resources/payments";
import { ProjectsEffect } from "./resources/projects";

/**
 * The Industrial SDK Client.
 * Automatically derived from the PayArk HttpApi specification.
 *
 * This provides perfect type-sync between the server and client.
 */
export const makeClient = (options?: {
  readonly baseUrl?: string;
  readonly httpClient?: HttpClient.HttpClient;
}) => HttpApiClient.make(PayArkApi, options);

/**
 * Service Tag for the Industrial Client.
 */
export class PayArkClient extends Context.Tag(
  "@payark/sdk-effect/PayArkClient",
)<PayArkClient, Effect.Effect.Success<ReturnType<typeof makeClient>>>() {
  static readonly Live = (options?: {
    readonly baseUrl?: string;
    readonly httpClient?: HttpClient.HttpClient;
  }) => Layer.effect(PayArkClient, makeClient(options));
}

/**
 * Main entry point for the Effect-based PayArk API (Legacy wrapper).
 */
export class PayArkEffect {
  private _checkout?: CheckoutEffect;
  private _payments?: PaymentsEffect;
  private _projects?: ProjectsEffect;

  constructor(private readonly config: PayArkConfig) {}

  /**
   * Checkout sessions resource (Effect).
   */
  get checkout(): CheckoutEffect {
    if (!this._checkout) {
      this._checkout = new CheckoutEffect(this.config);
    }
    return this._checkout;
  }

  /**
   * Payments resource (Effect).
   */
  get payments(): PaymentsEffect {
    if (!this._payments) {
      this._payments = new PaymentsEffect(this.config);
    }
    return this._payments;
  }

  /**
   * Projects resource (Effect).
   */
  get projects(): ProjectsEffect {
    if (!this._projects) {
      this._projects = new ProjectsEffect(this.config);
    }
    return this._projects;
  }
}

/**
 * Service tag for the PayArk API (Legacy).
 */
export class PayArk extends Context.Tag("@payark/sdk-effect/PayArk")<
  PayArk,
  PayArkEffect
>() {
  /**
   * Create a Layer that provides the PayArk service.
   */
  static readonly Live = (config: PayArkConfig) =>
    Layer.succeed(PayArk, new PayArkEffect(config));
}

export * from "./api-spec";
export { PayArkEffectError } from "./errors";
export * from "./schemas";
