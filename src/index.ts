import { Context, Layer } from "effect";
import { CheckoutEffect } from "./resources/checkout";
import { PaymentsEffect } from "./resources/payments";
import { ProjectsEffect } from "./resources/projects";
import type { PayArkConfig } from "@payark/sdk";

/**
 * Main entry point for the Effect-based PayArk API.
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
 * Service tag for the PayArk API.
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

export { PayArkEffectError } from "./errors";
export * from "./schemas";
export type {
  PayArkConfig,
  CheckoutSession,
  Payment,
  PaymentStatus,
  Project,
  ListPaymentsParams,
  PaginatedResponse,
  PaginationMeta,
  Provider,
  WebhookEvent,
  WebhookEventType,
  PayArkErrorBody,
  PayArkErrorCode,
} from "@payark/sdk";
