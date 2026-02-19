import { t } from 'elysia';

// ============================================================================
// Career Search Schema
// Based on Elasticsearch index mapping for fresq-metiers-2025-staging
// ============================================================================

export const careerSearchParamsSchema = t.Object({
  q: t.Optional(t.String({ description: 'Search query' })),
  page: t.Optional(t.Numeric({ default: 1, description: 'Page number' })),
  pageSize: t.Optional(
    t.Numeric({ default: 20, description: 'Number of results per page', maximum: 100 }),
  ),
});

export const careerSearchResponseSchema = t.Object({
  careers: t.Array(
    t.Object({
      codeRome: t.String({ description: 'ROME code for filtering programs' }),
      label: t.String({ description: 'Career family label' }),
      level1: t.Optional(t.String({ description: 'Level 1 category' })),
      level2: t.Optional(t.String({ description: 'Level 2 category' })),
    }),
  ),
  totalCount: t.Number({ description: 'Total number of matching careers' }),
});

// ============================================================================
// Types
// ============================================================================

export type CareerSearchParams = typeof careerSearchParamsSchema.static;
export type CareerSearchResponse = typeof careerSearchResponseSchema.static;
