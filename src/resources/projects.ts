import { Effect } from "effect";
import { Schema } from "@effect/schema";
import { PayArkConfigService, request } from "../http";
import { ProjectSchema } from "../schemas";
import { PayArkEffectError } from "../errors";
import type { PayArkConfig } from "@payark/sdk";
import type { Project } from "../schemas";
import type { HttpClient } from "@effect/platform";
import type { ParseResult } from "@effect/schema";

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
      Effect.flatMap(Schema.decodeUnknown(Schema.Array(ProjectSchema))),
      Effect.provideService(PayArkConfigService, this.config),
    );
  }
}
