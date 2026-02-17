# @payark/sdk-effect

A high-performance, functional TypeScript SDK for [PayArk](https://payark.com), built natively on the [Effect](https://effect.website/) ecosystem.

> **Native Effect** · **Type-safe** · **Runtime Validation** · **Zero Promise overhead**

---

## Why this instead of @payark/sdk?

The core `@payark/sdk` is designed for zero dependencies and universal compatibility. This package, `@payark/sdk-effect`, is optimized specifically for developers already using Effect:

- **Effect-Native**: Uses `@effect/platform/HttpClient` and `@effect/schema` under the hood. No `Effect.promise()` wrappers.
- **Strict Validation**: All API responses are automatically parsed and validated using `@effect/schema`.
- **Clean Error Handling**: Uses `Data.TaggedError` for specialized `PayArkEffectError`, allowing idiomatic `Effect.catchTag` usage.
- **Tracing Ready**: Ready for distributed tracing with Effect's built-in telemetry features.

## Installation

```bash
# bun
bun add @payark/sdk-effect

# npm
npm install @payark/sdk-effect
```

## Quick Start

```ts
import { Effect } from "effect";
import { PayArkEffect } from "@payark/sdk-effect";

const payark = new PayArkEffect({ apiKey: "sk_live_..." });

// Create a program (lazy description)
const program = payark.checkout.create({
  amount: 500,
  provider: "esewa",
  returnUrl: "https://your-site.com/thank-you",
});

// Run it!
const session = await Effect.runPromise(program);
console.log(session.checkout_url);
```

## API Reference

All methods return an `Effect<T, PayArkEffectError, HttpClient.HttpClient>`.

### Checkout

- `payark.checkout.create(params)`: Create a hosted checkout session.

### Payments

- `payark.payments.retrieve(id)`: Get a specific payment record.
- `payark.payments.list(params)`: List payments with optional filtering and pagination.

### Projects

- `payark.projects.list()`: List all projects (requires Personal Access Token).

## Error Handling

Errors are instances of `PayArkEffectError`, which is a `TaggedError("PayArkEffectError")`.

```ts
import { Effect, Console } from "effect";

const safeProgram = program.pipe(
  Effect.catchTag("PayArkEffectError", (err) =>
    Console.error(`Payment failed: ${err.message} (HTTP ${err.statusCode})`),
  ),
);
```

## Advanced Usage: Custom Layer

By default, the methods use the global `HttpClient.HttpClient`. You can provide a custom client (e.g. for testing or Node-specific tuning):

```ts
import { NodeHttpClient } from "@effect/platform-node";

const result = await Effect.runPromise(
  program.pipe(Effect.provide(NodeHttpClient.layer)),
);
```

## License

MIT
