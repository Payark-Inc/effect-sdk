import { Schema, ParseResult, Effect } from "effect";
import { PayArkConfigService, request } from "../http";
import {
  Payment,
  PaginatedResponse,
  PayArkConfig,
  ListPaymentsParams,
} from "../schemas";
import { PayArkEffectError } from "../errors";
import type { HttpClient } from "@effect/platform";

/**
 * Effect-based resource for PayArk Payments.
 */
export class PaymentsEffect {
  constructor(private readonly config: PayArkConfig) {}

  /**
   * List payments for the authenticated project.
   *
   * @param params - Optional pagination parameters.
   * @returns Effect that resolves to paginated payments.
   */
  list(
    params: ListPaymentsParams = {},
  ): Effect.Effect<
    PaginatedResponse<Payment>,
    PayArkEffectError | ParseResult.ParseError,
    HttpClient.HttpClient
  > {
    return request<unknown>("GET", "/v1/payments", {
      query: {
        limit: params.limit,
        offset: params.offset,
        projectId: params.projectId,
      },
    }).pipe(
      Effect.flatMap(Schema.decodeUnknown(PaginatedResponse(Payment))),
      Effect.provideService(PayArkConfigService, this.config),
    );
  }

  /**
   * Retrieve a single payment by its ID.
   *
   * @param id - The payment identifier.
   * @returns Effect that resolves to the payment object.
   */
  retrieve(
    id: string,
  ): Effect.Effect<
    Payment,
    PayArkEffectError | ParseResult.ParseError,
    HttpClient.HttpClient
  > {
    return request<unknown>(
      "GET",
      `/v1/payments/${encodeURIComponent(id)}`,
    ).pipe(
      Effect.flatMap(Schema.decodeUnknown(Payment)),
      Effect.provideService(PayArkConfigService, this.config),
    );
  }
}
