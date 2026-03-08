import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "@effect/platform";
import * as S from "./schemas";
import { Schema, Context } from "effect";

/**
 * Industrial Error Schema with Status mapping.
 */
export class IndustrialError extends Schema.TaggedError<IndustrialError>()(
  "IndustrialError",
  {
    error: Schema.String,
    details: Schema.optional(Schema.Any),
  },
) {}

export class AuthenticationError extends Schema.TaggedError<AuthenticationError>()(
  "AuthenticationError",
  {
    error: Schema.String,
  },
) {}

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "NotFoundError",
  {
    error: Schema.String,
  },
) {}

export class InternalServerError extends Schema.TaggedError<InternalServerError>()(
  "InternalServerError",
  {
    error: Schema.String,
    details: Schema.optional(Schema.Any),
  },
) {}

export class ConflictError extends Schema.TaggedError<ConflictError>()(
  "ConflictError",
  {
    error: Schema.String,
  },
) {}

/**
 * PayArk Industrial API Specification.
 * Single source of truth for the entire platform.
 */

// ── Security ─────────────────────────────────────────────────────────────

export interface AuthContext {
  readonly project?: { readonly id: string };
  readonly user?: { readonly id: string };
}

export const AuthContext = Context.GenericTag<AuthContext>(
  "@payark/sdk-effect/AuthContext",
);

export class SecurityMiddleware extends HttpApiMiddleware.Tag<SecurityMiddleware>()(
  "SecurityMiddleware",
  {
    security: {
      bearer: HttpApiSecurity.bearer,
    },
    provides: AuthContext,
    failure: Schema.Union(AuthenticationError, IndustrialError),
  },
) {}

export class CronSecurity extends HttpApiMiddleware.Tag<CronSecurity>()(
  "CronSecurity",
  {
    security: {
      secret: HttpApiSecurity.apiKey({ in: "header", key: "x-cron-secret" }),
    },
    failure: Schema.Union(AuthenticationError, IndustrialError),
  },
) {}

export class UserSecurity extends HttpApiMiddleware.Tag<UserSecurity>()(
  "UserSecurity",
  {
    security: {
      bearer: HttpApiSecurity.bearer,
    },
    provides: AuthContext,
    failure: Schema.Union(AuthenticationError, IndustrialError),
  },
) {}

// ── Checkout Group ───────────────────────────────────────────────────────

export const CheckoutGroup = HttpApiGroup.make("checkout")
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(S.CheckoutSession)
      .setPayload(S.CreateCheckoutParams)
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .prefix("/v1/checkout")
  .middleware(SecurityMiddleware);

// ── Payments Group ───────────────────────────────────────────────────────

export const PaymentsGroup = HttpApiGroup.make("payments")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(S.PaginatedResponse(S.Payment))
      .setUrlParams(S.ListPaymentsParams)
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .add(
    HttpApiEndpoint.get("retrieve", "/:id")
      .addSuccess(S.Payment)
      .setPath(Schema.Struct({ id: S.Id }))
      .addError(AuthenticationError, { status: 401 })
      .addError(NotFoundError, { status: 404 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .prefix("/v1/payments")
  .middleware(SecurityMiddleware);

// ── Customers Group ──────────────────────────────────────────────────────

export const CustomersGroup = HttpApiGroup.make("customers")
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(S.Customer, { status: 201 })
      .setPayload(S.CreateCustomerParams)
      .addError(AuthenticationError, { status: 401 })
      .addError(ConflictError, { status: 409 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .add(
    HttpApiEndpoint.get("retrieve", "/:id")
      .addSuccess(S.Customer)
      .setPath(Schema.Struct({ id: S.Id }))
      .addError(AuthenticationError, { status: 401 })
      .addError(NotFoundError, { status: 404 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .add(
    HttpApiEndpoint.patch("update", "/:id")
      .addSuccess(S.Customer)
      .setPath(Schema.Struct({ id: S.Id }))
      .setPayload(S.UpdateCustomerParams)
      .addError(AuthenticationError, { status: 401 })
      .addError(NotFoundError, { status: 404 })
      .addError(ConflictError, { status: 409 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .add(
    HttpApiEndpoint.del("delete", "/:id")
      .setPath(Schema.Struct({ id: S.Id }))
      .addError(AuthenticationError, { status: 401 })
      .addError(NotFoundError, { status: 404 })
      .addError(ConflictError, { status: 409 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .prefix("/v1/customers")
  .middleware(SecurityMiddleware);

// ── Subscriptions Group ──────────────────────────────────────────────────

export const SubscriptionsGroup = HttpApiGroup.make("subscriptions")
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(S.Subscription, { status: 201 })
      .setPayload(S.CreateSubscriptionParams)
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 })
      .middleware(SecurityMiddleware),
  )
  .add(
    HttpApiEndpoint.get("retrieve", "/:id")
      .addSuccess(S.Subscription)
      .setPath(Schema.Struct({ id: S.SubscriptionId }))
      .addError(AuthenticationError, { status: 401 })
      .addError(NotFoundError, { status: 404 })
      .addError(InternalServerError, { status: 500 })
      .middleware(SecurityMiddleware),
  )
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(S.PaginatedResponse(S.Subscription))
      .setUrlParams(S.ListSubscriptionsParams)
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 })
      .middleware(SecurityMiddleware),
  )
  .add(
    HttpApiEndpoint.post("cancel", "/:id/cancel")
      .addSuccess(S.Subscription)
      .setPath(Schema.Struct({ id: S.SubscriptionId }))
      .addError(AuthenticationError, { status: 401 })
      .addError(NotFoundError, { status: 404 })
      .addError(InternalServerError, { status: 500 })
      .middleware(SecurityMiddleware),
  )
  .add(
    HttpApiEndpoint.post("activate", "/:id/activate")
      .addSuccess(
        Schema.Struct({
          checkout_url: Schema.String,
          payment_id: Schema.String,
        }),
      )
      .setPath(Schema.Struct({ id: S.SubscriptionId }))
      .setPayload(
        Schema.Struct({
          provider: S.Provider,
          returnUrl: Schema.String,
          cancelUrl: Schema.optional(Schema.String),
        }),
      )
      .addError(NotFoundError, { status: 404 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .prefix("/v1/subscriptions");

// ── Automation Group ─────────────────────────────────────────────────────

export const AutomationGroup = HttpApiGroup.make("automation")
  .add(
    HttpApiEndpoint.post("reminders", "/reminders")
      .addSuccess(
        Schema.Struct({
          message: Schema.String,
          count: Schema.Number,
        }),
      )
      .addError(InternalServerError, { status: 500 }),
  )
  .add(
    HttpApiEndpoint.post("reaper", "/reaper")
      .addSuccess(
        Schema.Struct({
          message: Schema.String,
          count: Schema.Number,
        }),
      )
      .addError(InternalServerError, { status: 500 }),
  )
  .prefix("/v1/automation")
  .middleware(CronSecurity);

// ── Tokens Group ─────────────────────────────────────────────────────────

export const TokensGroup = HttpApiGroup.make("tokens")
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(
        Schema.Struct({
          ...S.Token.fields,
          token: Schema.String,
        }),
      )
      .setPayload(
        Schema.Struct({
          name: Schema.String,
          scopes: Schema.optionalWith(Schema.Array(Schema.String), {
            default: () => [],
          }),
          expires_in_days: Schema.optional(Schema.Number),
        }),
      )
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 }),
  )
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(S.Token))
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 }),
  )
  .add(
    HttpApiEndpoint.del("delete", "/:id")
      .setPath(Schema.Struct({ id: S.TokenId }))
      .addSuccess(Schema.Null)
      .addError(AuthenticationError, { status: 401 })
      .addError(NotFoundError, { status: 404 })
      .addError(InternalServerError, { status: 500 }),
  )
  .prefix("/v1/tokens")
  .middleware(UserSecurity);

// ── Projects Group ────────────────────────────────────────────────────────

export const ProjectsGroup = HttpApiGroup.make("projects")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(Schema.Array(S.Project))
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 }),
  )
  .prefix("/v1/projects")
  .middleware(SecurityMiddleware);

// ── Callbacks Group ──────────────────────────────────────────────────────

export const CallbacksGroup = HttpApiGroup.make("callbacks")
  .add(
    HttpApiEndpoint.get("handle", "/:provider")
      .addSuccess(Schema.Union(Schema.String, Schema.Null))
      .setPath(Schema.Struct({ provider: Schema.String }))
      .setUrlParams(S.CallbackQueryParams)
      .addError(NotFoundError, { status: 404 })
      .addError(InternalServerError, { status: 500 })
      .addError(IndustrialError, { status: 400 }),
  )
  .prefix("/v1/callback");

// ── Realtime Group ───────────────────────────────────────────────────────

export const RealtimeGroup = HttpApiGroup.make("realtime")
  .add(
    HttpApiEndpoint.get("connect", "/")
      .addSuccess(Schema.Any)
      .setUrlParams(Schema.Struct({ token: Schema.String }))
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 }),
  )
  .add(
    HttpApiEndpoint.post("trigger", "/trigger")
      .addSuccess(
        Schema.Struct({
          status: Schema.String,
          event: Schema.optional(Schema.String),
        }),
      )
      .setPayload(S.RealtimeTriggerPayload)
      .setUrlParams(Schema.Struct({ token: Schema.optional(Schema.String) }))
      .addError(AuthenticationError, { status: 401 })
      .addError(InternalServerError, { status: 500 }),
  )
  .prefix("/v1/realtime");

// ── Unified API ──────────────────────────────────────────────────────────

export const PayArkApi = HttpApi.make("PayArkApi")
  .add(CheckoutGroup)
  .add(PaymentsGroup)
  .add(CustomersGroup)
  .add(SubscriptionsGroup)
  .add(AutomationGroup)
  .add(TokensGroup)
  .add(ProjectsGroup)
  .add(CallbacksGroup)
  .add(RealtimeGroup)
  .addError(AuthenticationError, { status: 401 })
  .addError(NotFoundError, { status: 404 })
  .addError(ConflictError, { status: 409 })
  .addError(InternalServerError, { status: 500 })
  .addError(IndustrialError, { status: 400 });
