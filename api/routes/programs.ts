import { Elysia, t } from 'elysia';
import * as XLSX from 'xlsx';
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

// Export configuration
const EXPORT_CONFIG = {
  maxResults: 10000, // Maximum number of results to export
  pitKeepAlive: '5m', // Point in time keep alive duration
  batchSize: 2000, // Number of results per batch
} as const;

// Build filters from query parameters (shared logic)
function buildFilters(query: {
  cycle?: string | string[];
  diplomaType?: string | string[];
  diplomaCode?: string | string[];
  diplomaCategory?: string | string[];
  academy?: string | string[];
  region?: string | string[];
  institution?: string | string[];
  paysageId?: string | string[];
  sector?: string | string[];
  disciplinarySector?: string | string[];
  domain?: string | string[];
  keyword?: string | string[];
  hasSiseInfos?: string;
  hasRncpInfos?: string;
  hasRomeInfos?: string;
}) {
  return setFilters([
    { key: FILTER_FIELD_MAP.cycle, value: query.cycle },
    { key: FILTER_FIELD_MAP.diplomaType, value: query.diplomaType },
    { key: FILTER_FIELD_MAP.diplomaCode, value: query.diplomaCode },
    { key: FILTER_FIELD_MAP.diplomaCategory, value: query.diplomaCategory },
    { key: FILTER_FIELD_MAP.academy, value: query.academy },
    { key: FILTER_FIELD_MAP.region, value: query.region },
    { key: FILTER_FIELD_MAP.institution, value: query.institution },
    { key: FILTER_FIELD_MAP.paysageId, value: query.paysageId },
    { key: FILTER_FIELD_MAP.sector, value: query.sector },
    { key: FILTER_FIELD_MAP.disciplinarySector, value: query.disciplinarySector },
    { key: FILTER_FIELD_MAP.domain, value: query.domain },
    { key: FILTER_FIELD_MAP.keyword, value: query.keyword },
    { key: FILTER_FIELD_MAP.hasSiseInfos, value: query.hasSiseInfos },
    { key: FILTER_FIELD_MAP.hasRncpInfos, value: query.hasRncpInfos },
    { key: FILTER_FIELD_MAP.hasRomeInfos, value: query.hasRomeInfos },
  ]);
}

// Transform program data for export (flatten nested structures)
function transformProgramForExport(program: ProgramSearch) {
  const firstEtablissement = program.etablissements?.[0];

  return {
    inf: program.inf,
    label: program.label,
    cycle: program.cycle,
    diplomaType: program.diploma?.type,
    diplomaCode: program.diploma?.code,
    diplomaCategory: program.diploma?.category,
    accreditationStart: program.accreditation?.startDate,
    accreditationEnd: program.accreditation?.endDate,
    etablissementUai: firstEtablissement?.uai,
    etablissementName: firstEtablissement?.name,
    etablissementSector: firstEtablissement?.sector,
    etablissementAcademy: firstEtablissement?.academy,
    etablissementRegion: firstEtablissement?.region,
    etablissementCity: firstEtablissement?.address?.city,
    etablissementCount: program.etablissements?.length ?? 0,
    hasSiseInfos: program.hasSiseInfos,
    hasRncpInfos: program.hasRncpInfos,
    hasRomeInfos: program.hasRomeInfos,
  };
}

// Column headers for XLSX export
const XLSX_HEADERS = {
  inf: 'Identifiant',
  label: 'Intitulé',
  cycle: 'Cycle',
  diplomaType: 'Type de diplôme',
  diplomaCode: 'Code diplôme',
  diplomaCategory: 'Catégorie diplôme',
  accreditationStart: 'Début accréditation',
  accreditationEnd: 'Fin accréditation',
  etablissementUai: 'UAI établissement',
  etablissementName: 'Nom établissement',
  etablissementSector: 'Secteur',
  etablissementAcademy: 'Académie',
  etablissementRegion: 'Région',
  etablissementCity: 'Ville',
  etablissementCount: "Nombre d'établissements",
  hasSiseInfos: 'Données SISE',
  hasRncpInfos: 'Données RNCP',
  hasRomeInfos: 'Données ROME',
};

// Export query schema (extends search params with format)
const exportParamsSchema = t.Composite([
  t.Omit(programsParamsSchema, ['page', 'pageSize']),
  t.Object({
    format: t.Union([t.Literal('json'), t.Literal('xlsx')], {
      description: 'Export format (json or xlsx)',
    }),
    maxResults: t.Optional(
      t.Numeric({
        description: `Maximum number of results to export (default: ${EXPORT_CONFIG.maxResults})`,
        default: EXPORT_CONFIG.maxResults,
      }),
    ),
  }),
]);

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
      const filters = buildFilters({
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
      });

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
          track_total_hits: true,
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
    '/export',
    async ({ query, set }) => {
      const {
        q,
        format,
        maxResults = EXPORT_CONFIG.maxResults,
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

      // Limit max results to prevent abuse
      const effectiveMaxResults = Math.min(Number(maxResults), EXPORT_CONFIG.maxResults);

      // Build the query
      const textQuery = q ? { query_string: { query: q } } : { match_all: {} };
      const filters = buildFilters({
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
      });

      const esQuery = {
        bool: {
          must: [textQuery],
          filter: filters,
        },
      };

      const timestamp = new Date().toISOString().split('T')[0];

      // Collect all results using search_after with PIT (Point In Time)
      const allPrograms: ReturnType<typeof transformProgramForExport>[] = [];

      // Create a Point In Time to ensure consistent results
      // @ts-expect-error - proxy injects index at runtime
      const pitResponse = await elastic.programs.openPointInTime({
        keep_alive: EXPORT_CONFIG.pitKeepAlive,
      });
      let pitId = pitResponse.id;

      try {
        let searchAfter: (string | number)[] | undefined;
        let hasMore = true;

        while (hasMore && allPrograms.length < effectiveMaxResults) {
          const searchResponse = await elastic.client.search<ProgramSearch>({
            size: Math.min(EXPORT_CONFIG.batchSize, effectiveMaxResults - allPrograms.length),
            query: esQuery,
            pit: {
              id: pitId,
              keep_alive: EXPORT_CONFIG.pitKeepAlive,
            },
            sort: [{ _shard_doc: 'asc' }], // Most efficient sort for iteration
            ...(searchAfter && { search_after: searchAfter }),
            track_total_hits: false, // Faster pagination
            _source: true,
          });

          const hits = searchResponse.hits.hits;

          if (hits.length === 0) {
            hasMore = false;
            break;
          }

          // Process batch
          for (const hit of hits) {
            if (hit._source && allPrograms.length < effectiveMaxResults) {
              allPrograms.push(transformProgramForExport(hit._source as ProgramSearch));
            }
          }

          // Get sort values from last hit for next page
          const lastHit = hits.at(-1);
          if (lastHit?.sort) {
            searchAfter = lastHit.sort as (string | number)[];
          }

          // Update PIT ID if it changed
          if (searchResponse.pit_id) {
            pitId = searchResponse.pit_id;
          }
        }
      } catch (err) {
        console.error('Export error:', err);
        throw new DatabaseError(err instanceof Error ? err.message : 'Error during export');
      } finally {
        // Always clean up the PIT
        await elastic.programs.closePointInTime({ id: pitId }).catch(() => {
          // Ignore errors when closing PIT
        });
      }

      const totalCount = allPrograms.length;

      // Return JSON format
      if (format === 'json') {
        const filename = `formations-export-${timestamp}.json`;

        set.headers['Content-Type'] = 'application/json';
        set.headers['Content-Disposition'] = `attachment; filename="${filename}"`;
        set.headers['X-Total-Count'] = String(totalCount);

        return {
          exportedAt: new Date().toISOString(),
          totalCount,
          programs: allPrograms,
        };
      }

      // Generate XLSX
      const filename = `formations-export-${timestamp}.xlsx`;

      // Create worksheet with headers
      const worksheetData = [
        Object.values(XLSX_HEADERS), // Header row
        ...allPrograms.map((program) =>
          Object.keys(XLSX_HEADERS).map((key) => {
            const value = program[key as keyof typeof program];
            // Convert booleans to Oui/Non for readability
            if (typeof value === 'boolean') {
              return value ? 'Oui' : 'Non';
            }
            return value ?? '';
          }),
        ),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

      // Set column widths for better readability
      const colWidths = [
        { wch: 15 }, // inf
        { wch: 60 }, // label
        { wch: 8 }, // cycle
        { wch: 20 }, // diplomaType
        { wch: 15 }, // diplomaCode
        { wch: 20 }, // diplomaCategory
        { wch: 15 }, // accreditationStart
        { wch: 15 }, // accreditationEnd
        { wch: 12 }, // etablissementUai
        { wch: 40 }, // etablissementName
        { wch: 10 }, // etablissementSector
        { wch: 20 }, // etablissementAcademy
        { wch: 25 }, // etablissementRegion
        { wch: 20 }, // etablissementCity
        { wch: 20 }, // etablissementCount
        { wch: 12 }, // hasSiseInfos
        { wch: 12 }, // hasRncpInfos
        { wch: 12 }, // hasRomeInfos
      ];
      worksheet['!cols'] = colWidths;

      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Formations');

      // Generate buffer
      const xlsxBuffer = XLSX.write(workbook, {
        type: 'buffer',
        bookType: 'xlsx',
        compression: true,
      });

      set.headers['Content-Type'] =
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      set.headers['Content-Disposition'] = `attachment; filename="${filename}"`;
      set.headers['Content-Length'] = String(xlsxBuffer.length);
      set.headers['X-Total-Count'] = String(totalCount);

      return new Response(xlsxBuffer, {
        headers: set.headers as HeadersInit,
      });
    },
    {
      isAuth: true,
      query: exportParamsSchema,
      detail: {
        description:
          'Export les formations au format JSON ou XLSX. Utilise le scroll Elasticsearch pour exporter de grands volumes de données.',
        summary: 'Exporter les formations',
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

      const filters = buildFilters({
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
      });

      const searchResponse = await elastic.programs
        .search({
          size: 0,
          query: {
            bool: {
              must: [textQuery],
              filter: filters,
            },
          },
          track_total_hits: true,
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
