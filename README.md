# @payark/sdk-effect

A high-performance, functional TypeScript SDK for [PayArk](https://payark-public-demo.vercel.app/), built natively on the [Effect](https://effect.website/) ecosystem.

> **Native Effect** · **Type-safe** · **Runtime Validation** · **Zero Promise overhead**

---

## Features

- **Effect-Native**: Built directly on `@effect/platform/HttpClient`. Returns pure `Effect` types without Promise wrappers.
- **Strict Validation**: All API responses are parsed and validated at runtime using `@effect/schema`, ensuring your data is exactly what you expect.
- **Branded Types**: IDs (e.g., `PaymentId`, `ProjectId`) are branded for compile-time safety, preventing mix-ups.
- **Structured Errors**: Errors are typed as `PayArkEffectError`, a `TaggedError` that integrates seamlessly with `Effect.catchTag`.
- **Tracing Ready**: Fully instrumented for observability with Effect's built-in tracing.
- **Zero-Dependency Core**: Lightweight and tree-shakeable.

## Installation

```bash
# bun
bun add @payark/sdk-effect

# npm
npm install @payark/sdk-effect
```

> **Note**: This package requires `effect` as a peer dependency.

## Quick Start

```ts
import { Effect, Console } from "effect";
import { PayArkEffect } from "@payark/sdk-effect";

// 1. Initialize the client
const payark = new PayArkEffect({
  apiKey: "sk_live_...",
  // optional: baseUrl, timeout, etc.
});

// 2. Define your program
const program = Effect.gen(function* (_) {
  // Create a checkout session
  const session = yield* _(
    payark.checkout.create({
      amount: 1000, // NPR 1000
      provider: "esewa",
      returnUrl: "https://your-site.com/success",
    }),
  );

  yield* _(Console.log(`Checkout created: ${session.checkout_url}`));

  // Retrieve payment details later
  const payment = yield* _(
    payark.payments.retrieve(session.id.replace("ch_", "pay_")),
  );

  return payment;
});

// 3. Run safely
const result = await Effect.runPromise(
  program.pipe(
    Effect.catchTag("PayArkEffectError", (err) =>
      Console.error(`Payment failed: ${err.message} (${err.code})`),
    ),
  ),
);
```

## API Reference

### Resources

- **`payark.checkout`**: Create hosted payment sessions.
- **`payark.payments`**: List and retrieve payment records.
- **`payark.projects`**: Manage project settings (requires PAT).

### Types & Schemas

We export all Zod-like schemas for runtime validation if you need them independently:

```ts
import { PaymentSchema } from "@payark/sdk-effect";
import { Schema } from "@effect/schema";

const isPayment = Schema.is(PaymentSchema);
```

## Error Handling

All methods return an `Effect<Success, Error, Requirements>`. The error channel is strictly typed.

```ts
import { PayArkEffectError } from "@payark/sdk-effect";
import { Effect } from "effect";

// ...

program.pipe(
  Effect.catchTag("PayArkEffectError", (error) => {
    // error is fully typed
    console.error(error.statusCode); // 400, 401, etc.
    console.error(error.code); // "authentication_error", "invalid_request_error"
    return Effect.succeed(null);
  }),
  Effect.catchTag("ParseError", (error) => {
    // Handle schema validation errors (e.g. API changed shape)
    console.error("Response validation failed", error);
    return Effect.die(error);
  }),
);
```

## Configuration & Testing

You can interact with the underlying `HttpClient` by providing layers. This is useful for testing or custom networking requirements.

```ts
import { PayArkEffect } from "@payark/sdk-effect";
import { HttpClient } from "@effect/platform";

// The SDK uses the default HttpClient by default, but you can provide your own context.
// (Advanced usage for testing mocking)
```

## License

MIT
