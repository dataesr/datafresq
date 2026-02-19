import { expect } from 'bun:test';
import type { ErrorResponse } from '~/schemas/common';

/**
 * Narrows an Eden Treaty error value to our standard ErrorResponse shape.
 *
 * Elysia's type system automatically unions a built-in validation error type
 * (`{ type: "validation"; on: string; ... }`) with any declared error response
 * schema whenever a route has body/query/params validation. At runtime, our
 * `onError` handler normalises ALL errors (including validation) to
 * `{ code, message, details? }`, but TypeScript still sees the union.
 *
 * This helper asserts the shape so tests can safely access `.code` / `.message`.
 */
export function expectError(error: { value: unknown } | null | undefined): ErrorResponse {
  expect(error).toBeTruthy();
  const value = error!.value;
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  expect(value).toHaveProperty('code');
  expect(value).toHaveProperty('message');
  return value as ErrorResponse;
}
