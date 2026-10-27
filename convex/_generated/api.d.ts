/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditEvents from "../auditEvents.js";
import type * as branches from "../branches.js";
import type * as cashAccounts from "../cashAccounts.js";
import type * as cashTransfers from "../cashTransfers.js";
import type * as glJournalEntries from "../glJournalEntries.js";
import type * as seed from "../seed.js";
import type * as tillSessions from "../tillSessions.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditEvents: typeof auditEvents;
  branches: typeof branches;
  cashAccounts: typeof cashAccounts;
  cashTransfers: typeof cashTransfers;
  glJournalEntries: typeof glJournalEntries;
  seed: typeof seed;
  tillSessions: typeof tillSessions;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
