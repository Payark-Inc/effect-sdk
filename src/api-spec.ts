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
 * PayArk Industrial API Specification.
 * Single source of truth for the entire platform.
 */

// ── Security ─────────────────────────────────────────────────────────────

export interface AuthContext {
  readonly project?: { readonly id: string };
  readonly user?: { readonly id: string };
}

export class SecurityMiddleware extends HttpApiMiddleware.Tag<SecurityMiddleware>()(
  "SecurityMiddleware",
  {
    security: {
      bearer: HttpApiSecurity.bearer,
    },
    provides: Context.Tag("@payark/sdk-effect/AuthContext")<
      AuthContext,
      AuthContext
    >(),
    failure: S.PayArkErrorBody,
  },
) {}

// ── Checkout Group ───────────────────────────────────────────────────────

export const CheckoutGroup = HttpApiGroup.make("checkout")
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(S.CheckoutSession)
      .setPayload(S.CreateCheckoutParams),
  )
  .prefix("/v1/checkout")
  .middleware(SecurityMiddleware);

// ── Payments Group ───────────────────────────────────────────────────────

export const PaymentsGroup = HttpApiGroup.make("payments")
  .add(
    HttpApiEndpoint.get("list", "/")
      .addSuccess(S.PaginatedResponse(S.Payment))
      .setUrlParams(S.ListPaymentsParams),
  )
  .add(
    HttpApiEndpoint.get("retrieve", "/:id")
      .addSuccess(S.Payment)
      .setPath(Schema.Struct({ id: S.Id })),
  )
  .prefix("/v1/payments")
  .middleware(SecurityMiddleware);

// ── Customers Group ──────────────────────────────────────────────────────

export const CustomersGroup = HttpApiGroup.make("customers")
  .add(
    HttpApiEndpoint.post("create", "/")
      .addSuccess(S.Customer)
      .setPayload(S.CreateCustomerParams),
  )
  .add(
    HttpApiEndpoint.get("retrieve", "/:id")
      .addSuccess(S.Customer)
      .setPath(Schema.Struct({ id: S.Id })),
  )
  .add(
    HttpApiEndpoint.patch("update", "/:id")
      .addSuccess(S.Customer)
      .setPath(Schema.Struct({ id: S.Id }))
      .setPayload(S.UpdateCustomerParams),
  )
  .add(
    HttpApiEndpoint.del("delete", "/:id").setPath(Schema.Struct({ id: S.Id })),
  )
  .prefix("/v1/customers")
  .middleware(SecurityMiddleware);

// ── Unified API ──────────────────────────────────────────────────────────

export const PayArkApi = HttpApi.make("PayArkApi")
  .add(CheckoutGroup)
  .add(PaymentsGroup)
  .add(CustomersGroup)
  .addError(S.PayArkErrorBody);
