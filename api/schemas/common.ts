import { t } from 'elysia';

// ============================================================================
// Schemas
// ============================================================================

export const errorResponseSchema = t.Object({
  code: t.String(),
  message: t.String(),
  details: t.Optional(t.Record(t.String(), t.Unknown())),
});

export const successResponseSchema = t.Object({
  success: t.Optional(t.Literal(true)),
  message: t.String(),
});

export const queryParamSchema = t.Optional(
  t.Object({ q: t.Optional(t.String({ description: 'Terme recherché' })) }),
);

export const idParamSchema = t.Object({
  id: t.String(),
});

export const infParamSchema = t.Object({
  inf: t.String(),
});

export const paysageIdParamSchema = t.Object({
  paysageId: t.String(),
});

// ============================================================================
// Types
// ============================================================================

export type ErrorResponse = typeof errorResponseSchema.static;
export type SuccessResponse = typeof successResponseSchema.static;
export type QueryParam = typeof queryParamSchema.static;
export type IdParam = typeof idParamSchema.static;
export type InfParam = typeof infParamSchema.static;
export type PaysageIdParam = typeof paysageIdParamSchema.static;
