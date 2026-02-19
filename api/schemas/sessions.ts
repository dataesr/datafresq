import { t } from 'elysia';

// ============================================================================
// Schemas
// ============================================================================

export const sessionSchema = t.Object({
  id: t.String(),
  userAgent: t.String(),
  ipAddress: t.Union([t.String(), t.Null()]),
  createdAt: t.Date(),
  lastRefreshedAt: t.Date(),
  expiresAt: t.Date(),
});

export const sessionsListResponseSchema = t.Object({
  sessions: t.Array(sessionSchema),
  total: t.Number(),
});

export const currentSessionResponseSchema = t.Object({
  success: t.Boolean(),
  data: sessionSchema,
});

// ============================================================================
// Types
// ============================================================================

export type Session = typeof sessionSchema.static;
export type SessionsListResponse = typeof sessionsListResponseSchema.static;
export type CurrentSessionResponse = typeof currentSessionResponseSchema.static;
