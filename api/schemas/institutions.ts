import { t } from 'elysia';

// ============================================================================
// Institution Search Schema
// Based on Elasticsearch index mapping for fresq-etablissements-2
// ============================================================================

export const institutionSearchSchema = t.Object({
  uai_etablissement: t.Optional(t.String({ description: 'UAI identifier of the institution' })),
  denomination_etablissement: t.Optional(
    t.String({ description: 'Denomination of the institution' }),
  ),
  libelle_etablissement: t.Optional(t.String({ description: 'Label of the institution' })),
  sigle_etablissement: t.Optional(t.String({ description: 'Acronym of the institution' })),
  ville_etablissement: t.Optional(t.String({ description: 'City of the institution' })),
  code_postal_etablissement: t.Optional(t.String({ description: 'Postal code' })),
  statut_etablissement: t.Optional(t.String({ description: 'Status (public/private)' })),
  nature_etablissement: t.Optional(t.String({ description: 'Nature of the institution' })),
  paysage_elt: t.Optional(
    t.Object({
      id: t.Optional(t.String({ description: 'Paysage identifier' })),
      name: t.Optional(t.String({ description: 'Paysage name' })),
      geoloc: t.Optional(t.String({ description: 'Geolocation' })),
      uai_to_paysage_method: t.Optional(t.String({ description: 'Mapping method' })),
    }),
  ),
});

export const institutionSearchParamsSchema = t.Object({
  q: t.Optional(t.String({ description: 'Search query (searches on autocompleted field)' })),
  page: t.Optional(t.Numeric({ default: 1, description: 'Page number' })),
  pageSize: t.Optional(t.Numeric({ default: 20, description: 'Number of results per page' })),
});

export const institutionSearchResponseSchema = t.Object({
  institutions: t.Array(
    t.Object({
      id: t.String({ description: 'Paysage ID for filtering programs' }),
      label: t.String({ description: 'Display name (paysage_elt.name)' }),
      uai: t.Optional(t.String({ description: 'UAI code' })),
      city: t.Optional(t.String({ description: 'City name' })),
      nature: t.Optional(t.String({ description: 'Nature of the institution' })),
    }),
  ),
  totalCount: t.Number({ description: 'Total number of matching institutions' }),
});

// ============================================================================
// Types
// ============================================================================

export type InstitutionSearch = typeof institutionSearchSchema.static;
export type InstitutionSearchParams = typeof institutionSearchParamsSchema.static;
export type InstitutionSearchResponse = typeof institutionSearchResponseSchema.static;
