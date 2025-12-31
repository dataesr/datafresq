import { t } from 'elysia';

// ============================================================================
// Base Schemas (Sub-components)
// ============================================================================

export const locationTypeSchema = t.Union([t.Literal('etablissement'), t.Literal('site')]);

export const geoPointSchema = t.Object({
  type: t.Optional(t.String()),
  coordinates: t.Array(t.Number()),
});

export const addressSchema = t.Object({
  street: t.Optional(t.String()),
  streetLine2: t.Optional(t.String()),
  postalCode: t.Optional(t.String()),
  city: t.Optional(t.String()),
  siteName: t.Optional(t.String()),
});

export const locationSchema = t.Object({
  id: t.String(),
  uai: t.Optional(t.String()),
  name: t.String(),
  address: t.Optional(addressSchema),
  geo: t.Optional(geoPointSchema),
  types: t.Array(locationTypeSchema),
});

export const teachingModalitySchema = t.Object({
  code: t.String(),
  label: t.String(),
});

export const paysageInfoSchema = t.Object({
  id: t.String(),
  name: t.String(),
  geoloc: t.Optional(t.String()),
  uaiToPaysageMethod: t.Optional(t.String()),
});

export const pedagogicalInfoSchema = t.Object({
  keywords: t.Optional(t.Array(t.String())),
  disciplines: t.Optional(t.Array(t.String())),
  languages: t.Optional(t.Array(t.String())),
  teachingLanguages: t.Optional(t.Array(t.String())),
  programLink: t.Optional(t.String()),
  pedagogicalEmail: t.Optional(t.String()),
  administrativeEmail: t.Optional(t.String()),
  formationLink: t.Optional(t.String()),
});

export const recruitmentInfoSchema = t.Object({
  expectations: t.Optional(t.Array(t.String())),
  recommendedDiplomas: t.Optional(t.Array(t.String())),
  examCriteria: t.Optional(t.Array(t.String())),
  selectionMethods: t.Optional(t.Array(t.String())),
});

export const etablissementSchema = t.Object({
  uai: t.String(),
  name: t.String(),
  shortName: t.Optional(t.String()),
  sigle: t.Optional(t.String()),
  siret: t.Optional(t.String()),
  nature: t.Optional(t.String()),
  sector: t.String(),
  status: t.Optional(t.String()),
  juridicalCategory: t.Optional(t.String()),
  types: t.Optional(t.Array(t.String())),
  groups: t.Optional(t.Array(t.String())),
  supervisoryMinistries: t.Optional(t.Array(t.String())),
  level: t.Optional(t.String()),
  address: t.Optional(addressSchema),
  geo: t.Optional(geoPointSchema),
  phone: t.Optional(t.String()),
  typeDelivrance: t.String(),
  coaccredited: t.Optional(t.Array(t.Record(t.String(), t.String()))),
  academy: t.String(),
  region: t.String(),
  wave: t.Optional(t.String()),
  locationIds: t.Optional(t.Array(t.String())),
  paysageElt: t.Optional(paysageInfoSchema),
  paysageEltToUse: t.Optional(paysageInfoSchema),
});

export const etapeSchema = t.Object({
  infe: t.String(),
  label: t.String(),
  level: t.Optional(t.String()),
  openingYear: t.Optional(t.Number()),
  isDiplomante: t.Boolean(),
  isOpen: t.Boolean(),
  siteIds: t.Array(t.String()),
  teachingModalities: t.Array(teachingModalitySchema),
  pedagogicalInfo: t.Optional(pedagogicalInfoSchema),
  recruitmentInfo: t.Optional(recruitmentInfoSchema),
  capacity: t.Optional(t.Number()),
});

export const parcoursSchema = t.Object({
  infp: t.String(),
  label: t.String(),
  sigle: t.Optional(t.String()),
  rncp: t.Optional(t.String()),
  codeSise: t.Optional(t.Union([t.String(), t.Number()])),
  openingYear: t.Optional(t.Number()),
  isDiplomante: t.Boolean(),
  isOpen: t.Boolean(),
  cursus: t.Optional(t.Array(t.Array(t.String()))),
});

export const accreditationSchema = t.Object({
  startDate: t.Optional(t.String()),
  endDate: t.Optional(t.String()),
  endYears: t.Optional(t.Array(t.String())),
  gradeEndDate: t.Optional(t.String()),
  visaEndDate: t.Optional(t.String()),
});

export const diplomaSchema = t.Object({
  code: t.String(),
  type: t.String(),
  category: t.String(),
  order: t.Optional(t.Number()),
});

export const rncpInfoSchema = t.Object({
  rncp: t.String(),
  typeEmploiAccessibles: t.Optional(t.String()),
});

export const romeInfoSchema = t.Object({
  codeRome: t.String(),
  idLevel1: t.String(),
  level1: t.String(),
  idLevel2: t.String(),
  level2: t.String(),
  level3: t.String(),
  label: t.String(),
  ogr: t.String(),
  rncp: t.Optional(t.String()),
});

// ============================================================================
// Program Schemas (Main)
// ============================================================================

export const programSchema = t.Object({
  inf: t.String(),
  label: t.String(),
  mentionNormalized: t.String(),
  mentionId: t.String(),
  cycle: t.String(),
  diploma: diplomaSchema,
  accreditation: accreditationSchema,
  domains: t.Optional(t.Array(t.String())),
  codeSise: t.Optional(t.Union([t.String(), t.Array(t.String())])),
  codeSiseValid: t.Optional(t.Array(t.String())),
  codeSiseInvalid: t.Optional(t.Array(t.String())),
  rncp: t.Optional(t.String()),
  qualificationLevel: t.Optional(t.String()),
  teachingModalities: t.Optional(t.Array(t.String())),
  healthCycle: t.Optional(t.String()),
  healthSpecialty: t.Optional(t.String()),
  engineeringSpecialties: t.Optional(t.Array(t.String())),
  butType: t.Optional(t.String()),
  butSpecialtySigle: t.Optional(t.String()),
  disciplinarySector: t.Optional(t.String()),
  keywords: t.Optional(t.Array(t.String())),
  etablissements: t.Array(etablissementSchema),
  parcours: t.Array(parcoursSchema),
  etapes: t.Array(etapeSchema),
  locations: t.Array(locationSchema),
  collectionId: t.Optional(t.String()),
  recordId: t.Optional(t.String()),
  bucketId: t.Optional(t.String()),
  sourceId: t.Optional(t.String()),
  rncpInfos: t.Optional(t.Array(rncpInfoSchema)),
  hasRncpInfos: t.Boolean(),
  romeInfos: t.Optional(t.Array(romeInfoSchema)),
  hasRomeInfos: t.Boolean(),
  siseInfos: t.Optional(t.Record(t.String(), t.Any())),
  hasSiseInfos: t.Boolean(),
});

export const programLightSchema = t.Pick(programSchema, [
  'inf',
  'label',
  'cycle',
  'accreditation',
  'diploma',
  'etablissements',
  'hasSiseInfos',
  'hasRncpInfos',
  'hasRomeInfos',
]);

export const programSearchSchema = t.Composite([
  programLightSchema,
  t.Object({
    score: t.Optional(t.Number({ description: 'Score normalisé (0-1)' })),
    highlight: t.Optional(
      t.Record(t.String(), t.Array(t.String()), {
        description: 'Elasticsearch highlight avec tags <strong>',
      }),
    ),
  }),
]);

// ============================================================================
// Search & Query Schemas
// ============================================================================

export const programsParamsSchema = t.Object({
  q: t.Optional(t.String({ description: 'Search query text' })),
  page: t.Optional(t.Numeric({ description: 'Page number (1-based)', default: 1 })),
  pageSize: t.Optional(t.Numeric({ description: 'Number of results per page', default: 10 })),
  sort: t.Optional(t.String({ description: 'Sort field and direction (e.g., "label:asc")' })),
  cycle: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Cycle filter (L, M, D, etc.)' }),
  ),
  diplomaType: t.Optional(
    t.Union([t.String(), t.Array(t.String())], {
      description: 'Diploma type (Master, Licence, etc.)',
    }),
  ),
  diplomaCode: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Diploma code' }),
  ),
  diplomaCategory: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Diploma category' }),
  ),
  academy: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Academy filter' }),
  ),
  region: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: 'Region filter' })),
  institution: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Institution UAI code' }),
  ),
  paysageId: t.Optional(
    t.Union([t.String(), t.Array(t.String())], {
      description: 'Paysage ID for institution filtering',
    }),
  ),
  sector: t.Optional(
    t.Union([t.String(), t.Array(t.String())], {
      description: 'Institution sector (public/private)',
    }),
  ),
  disciplinarySector: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Disciplinary sector' }),
  ),
  domain: t.Optional(t.Union([t.String(), t.Array(t.String())], { description: 'Domain filter' })),
  keyword: t.Optional(
    t.Union([t.String(), t.Array(t.String())], { description: 'Keyword filter' }),
  ),
  hasSiseInfos: t.Optional(t.String({ description: 'Has SISE data (true/false)' })),
  hasRncpInfos: t.Optional(t.String({ description: 'Has RNCP data (true/false)' })),
  hasRomeInfos: t.Optional(t.String({ description: 'Has ROME data (true/false)' })),
});

export const facetItemSchema = t.Object({
  key: t.String(),
  count: t.Number(),
});

// ============================================================================
// Response Schemas
// ============================================================================

export const programsFacetsResponseSchema = t.Object({
  totalCount: t.Number(),
  facets: t.Object({
    cycles: t.Array(facetItemSchema),
    diplomaTypes: t.Array(facetItemSchema),
    diplomaCodes: t.Array(facetItemSchema),
    diplomaCategories: t.Array(facetItemSchema),
    academies: t.Array(facetItemSchema),
    regions: t.Array(facetItemSchema),
    sectors: t.Array(facetItemSchema),
    disciplinarySectors: t.Array(facetItemSchema),
    domains: t.Array(facetItemSchema),
    hasSiseInfos: t.Array(facetItemSchema),
    hasRncpInfos: t.Array(facetItemSchema),
    hasRomeInfos: t.Array(facetItemSchema),
  }),
});

export const programsSearchResponseSchema = t.Object({
  programs: t.Array(programSearchSchema),
  totalCount: t.Number(),
});

// ============================================================================
// SISE Schemas (Student enrollment data)
// ============================================================================

export const siseRecordSchema = t.Object({
  academicYear: t.String(),
  enrollment: t.Number(),
  women: t.Number(),
  men: t.Number(),
  studyYear: t.String(),
  city: t.String(),
});

export const programDetailResponseSchema = t.Object({
  program: programSchema,
  sise: t.Array(siseRecordSchema),
});

// ============================================================================
// Types
// ============================================================================

export type LocationType = typeof locationTypeSchema.static;
export type GeoPoint = typeof geoPointSchema.static;
export type Address = typeof addressSchema.static;
export type Location = typeof locationSchema.static;
export type TeachingModality = typeof teachingModalitySchema.static;
export type PaysageInfo = typeof paysageInfoSchema.static;
export type PedagogicalInfo = typeof pedagogicalInfoSchema.static;
export type RecruitmentInfo = typeof recruitmentInfoSchema.static;
export type Etablissement = typeof etablissementSchema.static;
export type Etape = typeof etapeSchema.static;
export type Parcours = typeof parcoursSchema.static;
export type Accreditation = typeof accreditationSchema.static;
export type Diploma = typeof diplomaSchema.static;
export type RncpInfo = typeof rncpInfoSchema.static;
export type RomeInfo = typeof romeInfoSchema.static;
export type Program = typeof programSchema.static;
export type ProgramLight = typeof programLightSchema.static;
export type ProgramSearch = typeof programSearchSchema.static;
export type ProgramsParams = typeof programsParamsSchema.static;
export type FacetItem = typeof facetItemSchema.static;
export type ProgramsFacetsResponse = typeof programsFacetsResponseSchema.static;
export type ProgramsSearchResponse = typeof programsSearchResponseSchema.static;
export type SiseRecord = typeof siseRecordSchema.static;
export type ProgramDetailResponse = typeof programDetailResponseSchema.static;
