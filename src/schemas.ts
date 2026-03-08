import { Schema } from "effect";
import * as V from "./schemas/validation";

/**
 * ── Branded Types ──
 */
export const Id = Schema.String.pipe(Schema.brand("Id"));
export const ProjectId = Schema.String.pipe(Schema.brand("ProjectId"));
export const PaymentId = Schema.String.pipe(Schema.brand("PaymentId"));
export const CheckoutSessionId = Schema.String.pipe(
  Schema.brand("CheckoutSessionId"),
);
export const SubscriptionId = Schema.String.pipe(
  Schema.brand("SubscriptionId"),
);
export const CustomerId = Schema.String.pipe(Schema.brand("CustomerId"));
export const TokenId = Schema.String.pipe(Schema.brand("TokenId"));

export type Id = Schema.Schema.Type<typeof Id>;
export type ProjectId = Schema.Schema.Type<typeof ProjectId>;
export type PaymentId = Schema.Schema.Type<typeof PaymentId>;
export type CheckoutSessionId = Schema.Schema.Type<typeof CheckoutSessionId>;
export type SubscriptionId = Schema.Schema.Type<typeof SubscriptionId>;
export type CustomerId = Schema.Schema.Type<typeof CustomerId>;
export type TokenId = Schema.Schema.Type<typeof TokenId>;

/**
 * ── Atomic Atoms ──
 */
export const Email = Schema.String.pipe(
  Schema.filter((s) => s.includes("@")),
  Schema.brand("Email"),
);
export type Email = Schema.Schema.Type<typeof Email>;

export const Timestamp = Schema.String.pipe(Schema.brand("Timestamp"));
export type Timestamp = Schema.Schema.Type<typeof Timestamp>;

export const Metadata = Schema.Record({
  key: Schema.String,
  value: Schema.Any,
});
export type Metadata = Schema.Schema.Type<typeof Metadata>;

export const Timestamps = Schema.Struct({
  created_at: Timestamp,
  updated_at: Timestamp,
});
export type Timestamps = Schema.Schema.Type<typeof Timestamps>;

/**
 * ── Enums ──
 */
export const Provider = Schema.Literal(
  "esewa",
  "khalti",
  "connectips",
  "imepay",
  "fonepay",
  "sandbox",
);
export type Provider = Schema.Schema.Type<typeof Provider>;

export const PaymentStatus = Schema.Literal("pending", "success", "failed");
export type PaymentStatus = Schema.Schema.Type<typeof PaymentStatus>;

export const SubscriptionStatus = Schema.Literal(
  "active",
  "past_due",
  "canceled",
  "paused",
);
export type SubscriptionStatus = Schema.Schema.Type<typeof SubscriptionStatus>;

export const SubscriptionInterval = Schema.Literal("month", "year", "week");
export type SubscriptionInterval = Schema.Schema.Type<
  typeof SubscriptionInterval
>;

export const CustomerLifecycle = Schema.Literal(
  "new",
  "active",
  "loyal",
  "at_risk",
  "churned",
);
export type CustomerLifecycle = Schema.Schema.Type<typeof CustomerLifecycle>;

/**
 * ── Models ──
 */

export const Customer = Schema.Struct({
  id: CustomerId,
  merchant_customer_id: V.NonEmptyString,
  email: Schema.NullOr(Email),
  name: Schema.NullOr(V.NonEmptyString),
  phone: Schema.NullOr(Schema.String),
  project_id: ProjectId,
  metadata: Schema.NullOr(Metadata),
  total_ltv: Schema.optional(Schema.Number),
  is_high_value: Schema.optional(Schema.Boolean),
  lifecycle_stage: Schema.optional(CustomerLifecycle),
  created_at: Timestamp,
  updated_at: Schema.optional(Timestamp),
});
export type Customer = Schema.Schema.Type<typeof Customer>;

export const Payment = Schema.Struct({
  id: PaymentId,
  project_id: ProjectId,
  customer_id: Schema.optional(Schema.NullOr(CustomerId)),
  amount: Schema.Number,
  currency: Schema.String,
  status: PaymentStatus,
  provider_ref: Schema.optional(Schema.NullOr(Schema.String)),
  metadata_json: Schema.optional(Schema.NullOr(Metadata)),
  gateway_response: Schema.optional(Schema.NullOr(Schema.Any)),
  created_at: Timestamp,
  updated_at: Schema.optional(Timestamp),
});
export type Payment = Schema.Schema.Type<typeof Payment>;

export const Subscription = Schema.Struct({
  id: SubscriptionId,
  project_id: ProjectId,
  customer_id: CustomerId,
  status: SubscriptionStatus,
  amount: Schema.Number,
  currency: Schema.String,
  interval: SubscriptionInterval,
  interval_count: Schema.Number,
  current_period_start: Timestamp,
  current_period_end: Timestamp,
  payment_link: V.UrlString,
  auto_send_link: Schema.Boolean,
  metadata: Schema.optional(Schema.NullOr(Metadata)),
  canceled_at: Schema.optional(Schema.NullOr(Timestamp)),
  created_at: Timestamp,
  updated_at: Schema.optional(Timestamp),
});
export type Subscription = Schema.Schema.Type<typeof Subscription>;

export const Project = Schema.Struct({
  id: ProjectId,
  name: V.NonEmptyString,
  api_key_secret: Schema.String,
  created_at: Timestamp,
});
export type Project = Schema.Schema.Type<typeof Project>;

export const Token = Schema.Struct({
  id: TokenId,
  name: V.NonEmptyString,
  scopes: Schema.Array(Schema.String),
  last_used_at: Schema.NullOr(Timestamp),
  expires_at: Schema.NullOr(Timestamp),
  created_at: Timestamp,
});
export type Token = Schema.Schema.Type<typeof Token>;

/**
 * ── Pagination ──
 */
export const PaginationMeta = Schema.Struct({
  total: Schema.NullOr(Schema.Number),
  limit: Schema.Number,
  offset: Schema.Number,
});
export type PaginationMeta = Schema.Schema.Type<typeof PaginationMeta>;

export const PaginatedResponse = <A, I, R>(schema: Schema.Schema<A, I, R>) =>
  Schema.Struct({
    data: Schema.Array(schema),
    meta: PaginationMeta,
  });

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMeta;
}

/**
 * ── Webhooks ──
 */
export const WebhookEventType = Schema.Literal(
  "payment.success",
  "payment.failed",
  "subscription.created",
  "subscription.payment_succeeded",
  "subscription.payment_failed",
  "subscription.renewal_due",
  "subscription.canceled",
);
export type WebhookEventType = Schema.Schema.Type<typeof WebhookEventType>;

export const WebhookEvent = Schema.Struct({
  type: WebhookEventType,
  id: Schema.optional(Schema.String),
  data: Schema.Union(
    Payment,
    Subscription,
    Customer,
    Schema.Struct({
      id: Schema.String,
      amount: Schema.optional(Schema.Number),
      currency: Schema.optional(Schema.String),
      status: Schema.String,
      metadata: Schema.optional(Metadata),
    }),
  ),
  is_test: Schema.Boolean,
  created: Schema.optional(Schema.Number),
});
export type WebhookEvent = Schema.Schema.Type<typeof WebhookEvent>;

/**
 * ── Params & Inputs ──
 */

export const CreateCheckoutParams = Schema.Struct({
  amount: Schema.optional(V.MinorUnitsInt),
  currency: Schema.optionalWith(Schema.String, { default: () => "NPR" }),
  provider: Provider,
  returnUrl: V.UrlString,
  cancelUrl: Schema.optional(V.UrlString),
  metadata: Schema.optional(Metadata),
  subscriptionId: Schema.optional(SubscriptionId),
  customerId: Schema.optional(CustomerId),
}).pipe(
  Schema.filter((data) => {
    if (!data.subscriptionId && !data.amount) {
      return "amount is required when subscriptionId is not provided";
    }
    return true;
  }),
);
export type CreateCheckoutParams = Schema.Schema.Type<
  typeof CreateCheckoutParams
>;

export const CheckoutSession = Schema.Struct({
  id: CheckoutSessionId,
  checkout_url: V.UrlString,
  payment_method: Schema.Struct({
    type: Provider,
    url: Schema.optional(V.UrlString),
    method: Schema.optional(Schema.Literal("GET", "POST")),
    fields: Schema.optional(
      Schema.Record({ key: Schema.String, value: Schema.String }),
    ),
  }),
});
export type CheckoutSession = Schema.Schema.Type<typeof CheckoutSession>;

export const CreateCustomerParams = Schema.Struct({
  merchant_customer_id: V.NonEmptyString,
  email: Schema.optional(Email),
  name: Schema.optional(V.NonEmptyString),
  phone: Schema.optional(Schema.String),
  project_id: Schema.optional(ProjectId),
  metadata: Schema.optional(Metadata),
});
export type CreateCustomerParams = Schema.Schema.Type<
  typeof CreateCustomerParams
>;

export const ListPaymentsParams = Schema.Struct({
  limit: Schema.optional(Schema.NumberFromString),
  offset: Schema.optional(Schema.NumberFromString),
  projectId: Schema.optional(ProjectId),
});
export type ListPaymentsParams = Schema.Schema.Type<typeof ListPaymentsParams>;

export const ListCustomersParams = Schema.Struct({
  limit: Schema.optional(Schema.NumberFromString),
  offset: Schema.optional(Schema.NumberFromString),
  email: Schema.optional(Schema.String),
  merchant_customer_id: Schema.optional(Schema.String),
  projectId: Schema.optional(ProjectId),
});
export type ListCustomersParams = Schema.Schema.Type<
  typeof ListCustomersParams
>;

export const UpdateCustomerParams = Schema.Struct({
  email: Schema.optional(Email),
  name: Schema.optional(V.NonEmptyString),
  phone: Schema.optional(Schema.String),
  metadata: Schema.optional(Metadata),
});
export type UpdateCustomerParams = Schema.Schema.Type<
  typeof UpdateCustomerParams
>;

export const CreateSubscriptionParams = Schema.Struct({
  customer_id: CustomerId,
  amount: V.MinorUnitsInt,
  currency: Schema.optionalWith(Schema.String, { default: () => "NPR" }),
  interval: SubscriptionInterval,
  interval_count: Schema.optional(Schema.Number),
  project_id: Schema.optional(ProjectId),
  auto_send_link: Schema.optional(Schema.Boolean),
  metadata: Schema.optional(Metadata),
});
export type CreateSubscriptionParams = Schema.Schema.Type<
  typeof CreateSubscriptionParams
>;

export const CallbackQueryParams = Schema.Struct({
  payment_id: Schema.optional(Schema.String),
  data: Schema.optional(Schema.String),
  pidx: Schema.optional(Schema.String),
});
export type CallbackQueryParams = Schema.Schema.Type<
  typeof CallbackQueryParams
>;

export const ListSubscriptionsParams = Schema.Struct({
  limit: Schema.optional(Schema.NumberFromString),
  offset: Schema.optional(Schema.NumberFromString),
  projectId: Schema.optional(ProjectId),
  customerId: Schema.optional(CustomerId),
  status: Schema.optional(SubscriptionStatus),
});
export type ListSubscriptionsParams = Schema.Schema.Type<
  typeof ListSubscriptionsParams
>;

export const RealtimeTriggerPayload = Schema.Struct({
  event: Schema.optional(WebhookEventType),
  data: Schema.optional(Schema.Any),
});
export type RealtimeTriggerPayload = Schema.Schema.Type<
  typeof RealtimeTriggerPayload
>;

/**
 * ── Client Config ──
 */
export const PayArkConfig = Schema.Struct({
  apiKey: Schema.String,
  baseUrl: Schema.optional(Schema.String),
  timeout: Schema.optional(Schema.Number),
  maxRetries: Schema.optional(Schema.Number),
  sandbox: Schema.optional(Schema.Boolean),
});
export type PayArkConfig = Schema.Schema.Type<typeof PayArkConfig>;

/**
 * ── Error Schemas ──
 */
export const PayArkErrorBody = Schema.Struct({
  error: Schema.String,
  details: Schema.optional(Schema.Any),
});
export type PayArkErrorBody = Schema.Schema.Type<typeof PayArkErrorBody>;
