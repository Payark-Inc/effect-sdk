import { it, expect, describe } from "bun:test";
import { Schema } from "effect";
import * as S from "../src/schemas";
import { MandateViolationError, MandateExpiredError } from "../src/errors";

describe("AP2 Validation & Errors", () => {
  it("should validate a correct Mandate object", () => {
    const validMandate = {
      id: "mnd_123",
      project_id: "pr_123",
      customer_id: null,
      type: "intent",
      status: "active",
      principal_id: "usr_abc",
      max_amount: 5000,
      currency: "NPR",
      permitted_vendors: ["esewa"],
      valid_from: "2026-03-09T00:00:00Z",
      valid_until: "2026-03-15T00:00:00Z",
      credential_jwt: "v.d.c",
      public_key: "pub_key",
      signature: "sig",
      parent_mandate_id: null,
      payment_id: null,
      created_at: "2026-03-09T00:00:00Z",
      consumed_at: null,
      metadata_json: {},
    };

    const decoded = Schema.decodeSync(S.Mandate)(validMandate);
    expect(decoded.id).toBe("mnd_123" as any);
    expect(decoded.type).toBe("intent");
  });

  it("should fail validation on invalid mandate status", () => {
    const invalidMandate = {
      id: "mnd_123",
      project_id: "pr_123",
      type: "intent",
      status: "junk", // Invalid status
      principal_id: "usr_abc",
      max_amount: 5000,
      currency: "NPR",
      valid_from: "2026-03-09T00:00:00Z",
      valid_until: "2026-03-15T00:00:00Z",
      credential_jwt: "v.d.c",
      public_key: "pub_key",
      signature: "sig",
      metadata_json: {},
    };

    expect(() => Schema.decodeSync(S.Mandate)(invalidMandate)).toThrow();
  });

  it("should instantiate MandateViolationError correctly", () => {
    const error = new MandateViolationError({
      message: "Limit exceeded",
      mandateId: "mnd_123",
    });

    expect(error._tag).toBe("MandateViolationError");
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe("mandate_violation");
  });

  it("should instantiate MandateExpiredError correctly", () => {
    const error = new MandateExpiredError({
      message: "Expired mandate",
      mandateId: "mnd_123",
      expiredAt: "2026-03-01T00:00:00Z",
    });

    expect(error._tag).toBe("MandateExpiredError");
    expect(error.statusCode).toBe(410);
    expect(error.code).toBe("mandate_expired");
  });
});
