import { Schema } from "@effect/schema";

/**
 * Supported payment providers on the PayArk platform.
 */
export const ProviderSchema = Schema.Union(
  Schema.Literal(
    "esewa",
    "khalti",
    "connectips",
    "imepay",
    "fonepay",
    "sandbox",
  ),
);

// ── Branded Types ──────────────────────────────────────────────────────────

/**
 * Branded Type for Checkout Session ID.
 */
export const CheckoutSessionId = Schema.String.pipe(
  Schema.brand("CheckoutSessionId"),
);
export type CheckoutSessionId = Schema.Schema.Type<typeof CheckoutSessionId>;

/**
 * Branded Type for Payment ID.
 */
export const PaymentId = Schema.String.pipe(Schema.brand("PaymentId"));
export type PaymentId = Schema.Schema.Type<typeof PaymentId>;

/**
 * Branded Type for Project ID.
 */
export const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"));
export type ProjectId = Schema.Schema.Type<typeof ProjectId>;

/**
 * Schema for creating a checkout session.
 */
export const CreateCheckoutSchema = Schema.Struct({
  amount: Schema.Number,
  currency: Schema.optionalWith(Schema.String, {
    default: () => "NPR" as const,
  }),
  provider: ProviderSchema,
  returnUrl: Schema.String,
  cancelUrl: Schema.optional(Schema.String),
  metadata: Schema.optional(
    Schema.Record({ key: Schema.String, value: Schema.Any }),
  ),
});

/**
 * Schema for a checkout session response.
 */
export const CheckoutSessionSchema = Schema.Struct({
  id: CheckoutSessionId,
  checkout_url: Schema.String,
  payment_method: Schema.Struct({
    type: ProviderSchema,
    url: Schema.optional(Schema.String),
    method: Schema.optional(
      Schema.Union(Schema.Literal("GET"), Schema.Literal("POST")),
    ),
    fields: Schema.optional(
      Schema.Record({ key: Schema.String, value: Schema.String }),
    ),
  }),
});

/**
 * Schema for a Payment response.
 */
export const PaymentSchema = Schema.Struct({
  id: PaymentId,
  project_id: ProjectId,
  amount: Schema.Number,
  currency: Schema.String,
  status: Schema.Union(
    Schema.Literal("pending"),
    Schema.Literal("success"),
    Schema.Literal("failed"),
  ),
  provider_ref: Schema.optional(Schema.NullOr(Schema.String)),
  metadata_json: Schema.optional(
    Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Any })),
  ),
  gateway_response: Schema.optional(
    Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Any })),
  ),
  created_at: Schema.String,
  updated_at: Schema.optional(Schema.String),
});

/**
 * Schema for a Project response.
 */
export const ProjectSchema = Schema.Struct({
  id: ProjectId,
  name: Schema.String,
  api_key_secret: Schema.String,
  created_at: Schema.String,
});

/**
 * Higher-order schema for paginated responses.
 */
export const PaginatedResponseSchema = <A, I>(item: Schema.Schema<A, I>) =>
  Schema.Struct({
    data: Schema.Array(item),
    meta: Schema.Struct({
      total: Schema.NullOr(Schema.Number),
      limit: Schema.Number,
      offset: Schema.Number,
    }),
  });

// ── Inferred Types ─────────────────────────────────────────────────────────

export type CheckoutSession = Schema.Schema.Type<typeof CheckoutSessionSchema>;
export type Payment = Schema.Schema.Type<typeof PaymentSchema>;
export type Project = Schema.Schema.Type<typeof ProjectSchema>;
export interface PaginatedResponse<T> {
  readonly data: ReadonlyArray<T>;
  readonly meta: {
    readonly total: number | null;
    readonly limit: number;
    readonly offset: number;
  };
}
