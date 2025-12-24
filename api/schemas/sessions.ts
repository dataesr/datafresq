import { t } from 'elysia';

// ============================================================================
// Schemas
// ============================================================================

export const sessionSchema = t.Object({
  id: t.String(),
  userAgent: t.String(),
  ipAddress: t.Nullable(t.String()),
  createdAt: t.String(),
  lastUsedAt: t.String(),
  expiresAt: t.String(),
  isCurrent: t.Boolean(),
});

// ============================================================================
// Types
// ============================================================================

export type Session = typeof sessionSchema.static;
