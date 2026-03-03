import {
  HttpApi,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiMiddleware,
  HttpApiSecurity,
} from "@effect/platform";
import * as S from "@payark/sdk/schemas";
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

// ── Unified API ──────────────────────────────────────────────────────────

export const PayArkApi = HttpApi.make("PayArkApi")
  .add(CheckoutGroup)
  .add(PaymentsGroup)
  .add(CustomersGroup)
  .addError(AuthenticationError, { status: 401 })
  .addError(NotFoundError, { status: 404 })
  .addError(ConflictError, { status: 409 })
  .addError(InternalServerError, { status: 500 })
  .addError(IndustrialError, { status: 400 });
