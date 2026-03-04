import { Schema, ParseResult, Effect } from "effect";
import { PayArkConfigService, request } from "../http";
import { Project, PayArkConfig } from "../schemas";
import { PayArkEffectError } from "../errors";
import type { HttpClient } from "@effect/platform";

/**
 * Effect-based resource for PayArk Projects.
 */
export class ProjectsEffect {
  constructor(private readonly config: PayArkConfig) {}

  /**
   * List all projects belonging to the authenticated account.
   *
   * @returns Effect that resolves to an array of projects.
   */
  list(): Effect.Effect<
    readonly Project[],
    PayArkEffectError | ParseResult.ParseError,
    HttpClient.HttpClient
  > {
    return request<unknown>("GET", "/v1/projects").pipe(
      Effect.flatMap(Schema.decodeUnknown(Schema.Array(Project))),
      Effect.provideService(PayArkConfigService, this.config),
    );
  }
}
