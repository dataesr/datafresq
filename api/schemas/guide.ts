import { t } from 'elysia';

// ============================================================================
// Body Schemas
// ============================================================================

export const guideReviewBodySchema = t.Object({
  pageId: t.String({ minLength: 1, description: 'Identifiant de la page du guide (pathname)' }),
  thumb: t.Union([t.Literal(1), t.Literal(-1)], { description: '1 = utile, -1 = pas utile' }),
  comment: t.Optional(t.String({ maxLength: 2000, description: 'Commentaire optionnel' })),
});

// ============================================================================
// Query Schemas
// ============================================================================

export const guideReviewsQuerySchema = t.Object({
  q: t.Optional(t.String({ description: 'Recherche sur email utilisateur ou commentaire' })),
  pageId: t.Optional(t.String({ description: 'Filtrer par identifiant de page' })),
  thumb: t.Optional(
    t.Union([t.Literal('1'), t.Literal('-1')], { description: 'Filtrer par type de vote' }),
  ),
  since: t.Optional(t.String({ description: 'Date de début (ISO 8601)' })),
  until: t.Optional(t.String({ description: 'Date de fin (ISO 8601)' })),
  page: t.Optional(t.Numeric({ default: 1, description: 'Numéro de page' })),
  pageSize: t.Optional(
    t.Numeric({ default: 50, description: 'Nombre de résultats par page', maximum: 100 }),
  ),
});

// ============================================================================
// Response Schemas
// ============================================================================

export const guideReviewSchema = t.Object({
  id: t.String(),
  userId: t.String(),
  userEmail: t.String(),
  pageId: t.String(),
  thumb: t.Union([t.Literal(1), t.Literal(-1)]),
  comment: t.Nullable(t.String()),
  createdAt: t.Date(),
});

export const guideReviewsListResponseSchema = t.Object({
  data: t.Array(guideReviewSchema),
  pagination: t.Object({
    total: t.Number(),
    page: t.Number(),
    pageSize: t.Number(),
  }),
});

// ============================================================================
// Types
// ============================================================================

export type GuideReviewBody = typeof guideReviewBodySchema.static;
export type GuideReviewsQuery = typeof guideReviewsQuerySchema.static;
export type GuideReview = typeof guideReviewSchema.static;
export type GuideReviewsListResponse = typeof guideReviewsListResponseSchema.static;
