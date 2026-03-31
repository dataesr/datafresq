import { t } from 'elysia';

// ============================================================================
// Breakdown Schemas
// ============================================================================

const keyedBreakdownSchema = t.Object({
  key: t.String(),
  label: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
});

// ============================================================================
// Year Stats Schema
// ============================================================================

export const etablissementYearStatsSchema = t.Object({
  year: t.String(),
  total: t.Number(),
  female: t.Number(),
  male: t.Number(),
  byCycle: t.Array(
    t.Object({
      cycle: t.String(),
      cycleLabel: t.String(),
      total: t.Number(),
      female: t.Number(),
      male: t.Number(),
    }),
  ),
  byDiploma: t.Array(keyedBreakdownSchema),
  byDiscipline: t.Array(keyedBreakdownSchema),
  byLargeDiscipline: t.Array(keyedBreakdownSchema),
});

// ============================================================================
// Etablissement Aggregation Document Schema (stored in MongoDB)
// ============================================================================

export const etablissementAggSchema = t.Object({
  paysageId: t.String(),
  name: t.String(),
  type: t.String(),
  typologie: t.String(),
  wikidataId: t.String(),
  rorId: t.String(),
  uaiIds: t.Array(t.String()),
  commune: t.Union([t.String(), t.Null()]),
  communeCode: t.String(),
  departement: t.String(),
  departementCode: t.String(),
  academie: t.String(),
  academieCode: t.String(),
  region: t.String(),
  regionCode: t.String(),
  totalStudents: t.Number(),
  totalFemale: t.Number(),
  totalMale: t.Number(),
  years: t.Array(t.String()),
  byYear: t.Array(etablissementYearStatsSchema),
  updatedAt: t.Date(),
});

// ============================================================================
// Search / List Schemas
// ============================================================================

export const etablissementSummarySchema = t.Object({
  paysageId: t.String(),
  name: t.String(),
  type: t.String(),
  typologie: t.String(),
  commune: t.Union([t.String(), t.Null()]),
  departement: t.String(),
  academie: t.String(),
  region: t.String(),
  totalStudents: t.Number(),
  totalFemale: t.Number(),
  totalMale: t.Number(),
  years: t.Array(t.String()),
  lastYear: t.String(),
  lastYearStudents: t.Number(),
});

export const etablissementsParamsSchema = t.Object({
  q: t.Optional(t.String({ description: 'Search query (name)' })),
  page: t.Optional(t.Numeric({ description: 'Page number (1-based)', default: 1 })),
  pageSize: t.Optional(
    t.Numeric({ description: 'Number of results per page', default: 20, maximum: 100 }),
  ),
  sort: t.Optional(
    t.String({
      description: 'Sort field:direction (e.g. "totalStudents:desc", "name:asc")',
      default: 'totalStudents:desc',
    }),
  ),
  type: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Establishment type filter' }),
  ),
  typologie: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Establishment typology filter' }),
  ),
  academie: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Academy filter' }),
  ),
  region: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: 'Region filter' })),
  departement: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Department filter' }),
  ),
});

export const etablissementsSearchResponseSchema = t.Object({
  etablissements: t.Array(etablissementSummarySchema),
  totalCount: t.Number(),
});

export const facetItemSchema = t.Object({
  key: t.String(),
  count: t.Number(),
});

export const etablissementsFacetsResponseSchema = t.Object({
  totalCount: t.Number(),
  facets: t.Object({
    types: t.Array(facetItemSchema),
    typologies: t.Array(facetItemSchema),
    academies: t.Array(facetItemSchema),
    regions: t.Array(facetItemSchema),
    departements: t.Array(facetItemSchema),
  }),
});

// ============================================================================
// Detail Response Schema
// ============================================================================

export const etablissementDetailResponseSchema = t.Object({
  paysageId: t.String(),
  name: t.String(),
  type: t.String(),
  typologie: t.String(),
  wikidataId: t.String(),
  rorId: t.String(),
  uaiIds: t.Array(t.String()),
  commune: t.Union([t.String(), t.Null()]),
  communeCode: t.String(),
  departement: t.String(),
  departementCode: t.String(),
  academie: t.String(),
  academieCode: t.String(),
  region: t.String(),
  regionCode: t.String(),
  totalStudents: t.Number(),
  totalFemale: t.Number(),
  totalMale: t.Number(),
  years: t.Array(t.String()),
  byYear: t.Array(etablissementYearStatsSchema),
});

// ============================================================================
// Types
// ============================================================================

export type EtablissementYearStats = typeof etablissementYearStatsSchema.static;
export type EtablissementAgg = typeof etablissementAggSchema.static;
export type EtablissementSummary = typeof etablissementSummarySchema.static;
export type EtablissementsParams = typeof etablissementsParamsSchema.static;
export type EtablissementsSearchResponse = typeof etablissementsSearchResponseSchema.static;
export type EtablissementsFacetsResponse = typeof etablissementsFacetsResponseSchema.static;
export type EtablissementDetailResponse = typeof etablissementDetailResponseSchema.static;
export type KeyedBreakdown = typeof keyedBreakdownSchema.static;
