import { Effect, Context, Schedule } from "effect";
import { HttpClient, HttpClientRequest } from "@effect/platform";
import { PayArkEffectError, type PayArkErrorCode } from "./errors";
import { PayArkConfig } from "./schemas";

/** SDK version string for runtime introspection. */
export const SDK_VERSION = "0.1.8" as const;

/**
 * Service tag for the PayArk configuration.
 */
export class PayArkConfigService extends Context.Tag("PayArkConfigService")<
  PayArkConfigService,
  PayArkConfig
>() {}

/**
 * Executes an HTTP request using Effect and returns the JSON body or a PayArkEffectError.
 */
export const request = <T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  options?: {
    readonly query?: Record<string, string | number | undefined>;
    readonly body?: any;
    readonly headers?: Record<string, string>;
  },
): Effect.Effect<
  T,
  PayArkEffectError,
  PayArkConfigService | HttpClient.HttpClient
> =>
  Effect.gen(function* (_) {
    const config = yield* _(PayArkConfigService);
    const client = yield* _(HttpClient.HttpClient);

    const baseUrl = (config.baseUrl ?? "https://api.payark.dev").replace(
      /\/+$/,
      "",
    );
    const url = new URL(`${baseUrl}${path}`);

    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "User-Agent": `payark-sdk-effect/${SDK_VERSION}`,
      ...options?.headers,
    };

    if (config.sandbox) {
      headers["x-sandbox-mode"] = "true";
    }

    let req = HttpClientRequest.make(method)(url.toString()).pipe(
      HttpClientRequest.setHeaders(headers),
    );

    if (options?.body) {
      req = yield* _(
        HttpClientRequest.bodyJson(options.body)(req).pipe(
          Effect.mapError(
            (e) =>
              new PayArkEffectError({
                message: `Invalid request body: ${String(e)}`,
                statusCode: 400,
                code: "invalid_request_error",
                localizedMessage: getLocalizedError("invalid_request_error"),
              }),
          ),
        ),
      );
    }

    const response = yield* _(
      client.execute(req).pipe(
        Effect.mapError(
          (e) =>
            new PayArkEffectError({
              message: `Network error: ${e.message}`,
              statusCode: 0,
              code: "connection_error",
              localizedMessage: getLocalizedError("connection_error"),
            }),
        ),
      ),
    );

    if (response.status >= 200 && response.status < 300) {
      if (response.status === 204) return {} as T;
      return (yield* _(
        response.json.pipe(
          Effect.mapError(
            (e) =>
              new PayArkEffectError({
                message: `Failed to parse response: ${String(e)}`,
                statusCode: response.status,
                code: "api_error",
                localizedMessage: getLocalizedError("api_error"),
              }),
          ),
        ),
      )) as T;
    }

    const errorBody: any = yield* _(
      response.json.pipe(
        Effect.catchAll(() => Effect.succeed({ error: undefined })),
      ),
    );

    return yield* _(
      Effect.fail(
        new PayArkEffectError({
          message:
            errorBody?.error || `Request failed with status ${response.status}`,
          statusCode: response.status,
          code: mapStatusToCode(response.status),
          raw: errorBody,
          localizedMessage: getLocalizedError(mapStatusToCode(response.status)),
        }),
      ),
    );
  }).pipe(
    Effect.retry(
      Schedule.exponential("200 millis").pipe(
        Schedule.upTo("5 seconds"),
        // Only retry connection-level or 429/5xx transient errors:
        Schedule.check((error: PayArkEffectError) => {
          return (
            error.code === "connection_error" ||
            error.code === "rate_limit_error" ||
            error.statusCode >= 500
          );
        }),
      ),
    ),
  );

function mapStatusToCode(status: number): PayArkErrorCode {
  if (status === 401) return "authentication_error";
  if (status === 403) return "permission_error";
  if (status === 400 || status === 422) return "invalid_request_error";
  if (status === 404) return "not_found_error";
  if (status === 429) return "rate_limit_error";
  if (status >= 500) return "api_error";
  return "unknown_error";
}

function getLocalizedError(code: PayArkErrorCode): string {
  switch (code) {
    case "authentication_error":
      return "Your API key is missing or invalid. Please check your PayArk credentials.";
    case "permission_error":
      return "You don't have permission to perform this action.";
    case "invalid_request_error":
      return "The request is missing required parameters or they are invalid. Please check your implementation.";
    case "not_found_error":
      return "The requested resource could not be found.";
    case "rate_limit_error":
      return "You are making too many requests to PayArk. Please wait a moment before trying again.";
    case "api_error":
      return "PayArk servers are currently experiencing issues. Please try again later.";
    case "connection_error":
      return "Could not connect to PayArk. Please check your internet connection.";
    default:
      return "An unexpected error occurred. Please contact support if the issue persists.";
  }
}
