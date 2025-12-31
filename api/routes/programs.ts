import { Elysia, t } from 'elysia';
import { collections } from '~/database/mongo';
import { NotFoundError } from '~/errors';
import { DatabaseError } from '~/errors/database.error';
import {
  elastic,
  extractHits,
  extractTermBuckets,
  extractTotal,
  setFilters,
} from '~/external/elastic';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema } from '~/schemas/common';
import {
  type ProgramSearch,
  programDetailResponseSchema,
  programSearchSchema,
  programsFacetsResponseSchema,
  programsParamsSchema,
  programsSearchResponseSchema,
  type SiseRecord,
} from '~/schemas/programs';

const fields = Object.keys(programSearchSchema.properties);

// Filter field mappings for Elasticsearch
const FILTER_FIELD_MAP = {
  cycle: 'cycle.keyword',
  diplomaType: 'diploma.type.keyword',
  diplomaCode: 'diploma.code.keyword',
  diplomaCategory: 'diploma.category.keyword',
  academy: 'etablissements.academy.keyword',
  region: 'etablissements.region.keyword',
  institution: 'etablissements.uai.keyword',
  institutionName: 'etablissements.name.keyword',
  paysageId: 'etablissements.paysageElt.id.keyword',
  sector: 'etablissements.sector.keyword',
  disciplinarySector: 'disciplinarySector.keyword',
  domain: 'domains.keyword',
  keyword: 'keywords.keyword',
  hasSiseInfos: 'hasSiseInfos',
  hasRncpInfos: 'hasRncpInfos',
  hasRomeInfos: 'hasRomeInfos',
} as const;

// Aggregation definitions for facets
const AGGREGATIONS = {
  cycles: { terms: { field: 'cycle.keyword', size: 20 } },
  diplomaTypes: { terms: { field: 'diploma.type.keyword', size: 50 } },
  diplomaCodes: { terms: { field: 'diploma.code.keyword', size: 50 } },
  diplomaCategories: { terms: { field: 'diploma.category.keyword', size: 20 } },
  academies: { terms: { field: 'etablissements.academy.keyword', size: 50 } },
  regions: { terms: { field: 'etablissements.region.keyword', size: 30 } },
  sectors: { terms: { field: 'etablissements.sector.keyword', size: 10 } },
  disciplinarySectors: { terms: { field: 'disciplinarySector.keyword', size: 50 } },
  domains: { terms: { field: 'domains.keyword', size: 100 } },
  hasSiseInfos: { terms: { field: 'hasSiseInfos', size: 2 } },
  hasRncpInfos: { terms: { field: 'hasRncpInfos', size: 2 } },
  hasRomeInfos: { terms: { field: 'hasRomeInfos', size: 2 } },
};

export const programsRoutes = new Elysia({ prefix: '/programs' })
  .use(authMacro)
  .get(
    '/',
    async ({ query }) => {
      const {
        q,
        page = 1,
        pageSize = 10,
        cycle,
        diplomaType,
        diplomaCode,
        diplomaCategory,
        academy,
        region,
        institution,
        paysageId,
        sector,
        disciplinarySector,
        domain,
        keyword,
        hasSiseInfos,
        hasRncpInfos,
        hasRomeInfos,
      } = query;

      // Build the main query
      const textQuery = q ? { query_string: { query: q } } : { match_all: {} };
      const from = (page - 1) * pageSize;

      // Build filters array
      const filters = setFilters([
        { key: FILTER_FIELD_MAP.cycle, value: cycle },
        { key: FILTER_FIELD_MAP.diplomaType, value: diplomaType },
        { key: FILTER_FIELD_MAP.diplomaCode, value: diplomaCode },
        { key: FILTER_FIELD_MAP.diplomaCategory, value: diplomaCategory },
        { key: FILTER_FIELD_MAP.academy, value: academy },
        { key: FILTER_FIELD_MAP.region, value: region },
        { key: FILTER_FIELD_MAP.institution, value: institution },
        { key: FILTER_FIELD_MAP.paysageId, value: paysageId },
        { key: FILTER_FIELD_MAP.sector, value: sector },
        { key: FILTER_FIELD_MAP.disciplinarySector, value: disciplinarySector },
        { key: FILTER_FIELD_MAP.domain, value: domain },
        { key: FILTER_FIELD_MAP.keyword, value: keyword },
        { key: FILTER_FIELD_MAP.hasSiseInfos, value: hasSiseInfos },
        { key: FILTER_FIELD_MAP.hasRncpInfos, value: hasRncpInfos },
        { key: FILTER_FIELD_MAP.hasRomeInfos, value: hasRomeInfos },
      ]);

      const searchResponse = await elastic.programs
        .search<ProgramSearch>({
          from,
          size: pageSize,
          fields,
          query: {
            bool: {
              must: [textQuery],
              filter: filters,
            },
          },
          track_scores: true,
          highlight: q
            ? {
                fields: {
                  label: {},
                  'etablissements.name': {},
                  'diploma.type': {},
                  domains: {},
                  mentionNormalized: {},
                },
                pre_tags: ['<strong>'],
                post_tags: ['</strong>'],
                number_of_fragments: 3,
                fragment_size: 150,
              }
            : undefined,
        })
        .catch((err) => {
          console.error(err);
          throw new DatabaseError(err.message);
        });

      const totalCount = extractTotal(searchResponse);
      const programs = extractHits<ProgramSearch>(searchResponse);

      return { programs, totalCount };
    },
    {
      isAuth: true,
      query: programsParamsSchema,
      response: {
        200: programsSearchResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        description: 'Lister les formations avec des filtres optionnels',
        summary: 'Lister les formations',
        tags: ['Formations'],
      },
    },
  )
  .get(
    '/facets',
    async ({ query }) => {
      const {
        q,
        cycle,
        diplomaType,
        diplomaCode,
        diplomaCategory,
        academy,
        region,
        institution,
        paysageId,
        sector,
        disciplinarySector,
        domain,
        keyword,
        hasSiseInfos,
        hasRncpInfos,
        hasRomeInfos,
      } = query;

      const textQuery = q ? { query_string: { query: q } } : { match_all: {} };

      const filters = setFilters([
        { key: FILTER_FIELD_MAP.cycle, value: cycle },
        { key: FILTER_FIELD_MAP.diplomaType, value: diplomaType },
        { key: FILTER_FIELD_MAP.diplomaCode, value: diplomaCode },
        { key: FILTER_FIELD_MAP.diplomaCategory, value: diplomaCategory },
        { key: FILTER_FIELD_MAP.academy, value: academy },
        { key: FILTER_FIELD_MAP.region, value: region },
        { key: FILTER_FIELD_MAP.institution, value: institution },
        { key: FILTER_FIELD_MAP.paysageId, value: paysageId },
        { key: FILTER_FIELD_MAP.sector, value: sector },
        { key: FILTER_FIELD_MAP.disciplinarySector, value: disciplinarySector },
        { key: FILTER_FIELD_MAP.domain, value: domain },
        { key: FILTER_FIELD_MAP.keyword, value: keyword },
        { key: FILTER_FIELD_MAP.hasSiseInfos, value: hasSiseInfos },
        { key: FILTER_FIELD_MAP.hasRncpInfos, value: hasRncpInfos },
        { key: FILTER_FIELD_MAP.hasRomeInfos, value: hasRomeInfos },
      ]);

      const searchResponse = await elastic.programs
        .search({
          size: 0,
          query: {
            bool: {
              must: [textQuery],
              filter: filters,
            },
          },
          aggs: AGGREGATIONS,
        })
        .catch((err) => {
          console.error(err);
          throw new DatabaseError(err.message);
        });

      const totalCount = extractTotal(searchResponse);
      const aggregations = searchResponse?.aggregations;

      return {
        totalCount,
        facets: {
          cycles: extractTermBuckets(aggregations?.cycles),
          diplomaTypes: extractTermBuckets(aggregations?.diplomaTypes),
          diplomaCodes: extractTermBuckets(aggregations?.diplomaCodes),
          diplomaCategories: extractTermBuckets(aggregations?.diplomaCategories),
          academies: extractTermBuckets(aggregations?.academies),
          regions: extractTermBuckets(aggregations?.regions),
          sectors: extractTermBuckets(aggregations?.sectors),
          disciplinarySectors: extractTermBuckets(aggregations?.disciplinarySectors),
          domains: extractTermBuckets(aggregations?.domains),
          hasSiseInfos: extractTermBuckets(aggregations?.hasSiseInfos),
          hasRncpInfos: extractTermBuckets(aggregations?.hasRncpInfos),
          hasRomeInfos: extractTermBuckets(aggregations?.hasRomeInfos),
        },
      };
    },
    {
      isAuth: true,
      query: t.Partial(programsParamsSchema),
      response: {
        200: programsFacetsResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        description: 'Get facets/aggregations for filter dropdowns',
        summary: 'Get filter facets',
        tags: ['Formations'],
      },
    },
  )
  .get(
    '/:inf',
    async ({ params: { inf } }) => {
      const programQuery = collections.programs.findOne({ inf });
      const siseQuery = collections.sise
        .aggregate<SiseRecord>([
          { $match: { inf } },
          {
            $project: {
              _id: 0,
              academicYear: '$annee_universitaire',
              enrollment: '$effectif_sans_cpge',
              women: '$femmes',
              men: '$hommes',
              studyYear: '$degetu_lib',
              city: '$implantation_commune',
            },
          },
        ])
        .toArray();
      const [program, sise] = await Promise.all([programQuery, siseQuery]);
      if (!program) {
        throw new NotFoundError('Program not found');
      }
      return { program, sise };
    },
    {
      isAuth: true,
      params: t.Object({
        inf: t.String(),
      }),
      response: {
        200: programDetailResponseSchema,
        422: errorResponseSchema,
        500: errorResponseSchema,
      },
      detail: {
        description: 'Récupérer un programme par son identifiant',
        summary: 'Récupérer un programme',
        tags: ['Programmes'],
      },
    },
  );
