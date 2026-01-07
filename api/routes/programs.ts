import { Elysia, t } from 'elysia';
import type { Document } from 'mongodb';
import * as XLSX from 'xlsx';
import { collections } from '~/database/mongo';
import type {
  EmploymentRates,
  InsersupGenderStats,
  InsersupStats,
  InsersupYearStats,
} from '~/database/types';

interface InsersupAggResult extends Document {
  _id: string;
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
  emploiNonSal6: number;
  emploiNonSal12: number;
  emploiNonSal18: number;
  emploiNonSal24: number;
  emploiNonSal30: number;
  emploiSalFr6: number;
  emploiSalFr12: number;
  emploiSalFr18: number;
  emploiSalFr24: number;
  emploiSalFr30: number;
  emploiStable6: number;
  emploiStable12: number;
  emploiStable18: number;
  emploiStable24: number;
  emploiStable30: number;
}

interface InsersupGenderAggResult extends Document {
  _id: { promo: string; genre: string };
  nbSortants: number;
  emploiNonSal6: number;
  emploiNonSal12: number;
  emploiNonSal18: number;
  emploiNonSal24: number;
  emploiNonSal30: number;
  emploiSalFr6: number;
  emploiSalFr12: number;
  emploiSalFr18: number;
  emploiSalFr24: number;
  emploiSalFr30: number;
  emploiStable6: number;
  emploiStable12: number;
  emploiStable18: number;
  emploiStable24: number;
  emploiStable30: number;
}

interface InsersupNationalityAggResult extends Document {
  _id: string;
  nbSortants: number;
}

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
import { buildHighlightFields, buildSearchFields } from '~/utils/search';

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

      // Build the main query with configured search fields
      const textQuery = q
        ? { query_string: { query: q, fields: buildSearchFields() } }
        : { match_all: {} };
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
                fields: buildHighlightFields(),
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

      // Build the query with configured search fields
      const textQuery = q
        ? { query_string: { query: q, fields: buildSearchFields() } }
        : { match_all: {} };
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

      const textQuery = q
        ? { query_string: { query: q, fields: buildSearchFields() } }
        : { match_all: {} };

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
      const PRIVACY_THRESHOLD = 20;

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

      const insersupQuery = collections.insersup
        .aggregate<InsersupAggResult>([
          {
            $match: {
              inf,
              genre: 'ensemble',
              obtention_diplome: 'diplômé',
              nationalite: 'français',
              regime_inscription: 'ensemble',
            },
          },
          {
            $group: {
              _id: '$promo',
              nbEtudiants: { $sum: '$nb_etudiants' },
              nbSortants: { $sum: '$nb_sortants' },
              nbPoursuivants: { $sum: '$nb_poursuivants' },
              emploiNonSal6: { $sum: '$nb_sortants_en_emploi_non_sal_6' },
              emploiNonSal12: { $sum: '$nb_sortants_en_emploi_non_sal_12' },
              emploiNonSal18: { $sum: '$nb_sortants_en_emploi_non_sal_18' },
              emploiNonSal24: { $sum: '$nb_sortants_en_emploi_non_sal_24' },
              emploiNonSal30: { $sum: '$nb_sortants_en_emploi_non_sal_30' },
              emploiSalFr6: { $sum: '$nb_sortants_en_emploi_sal_fr_6' },
              emploiSalFr12: { $sum: '$nb_sortants_en_emploi_sal_fr_12' },
              emploiSalFr18: { $sum: '$nb_sortants_en_emploi_sal_fr_18' },
              emploiSalFr24: { $sum: '$nb_sortants_en_emploi_sal_fr_24' },
              emploiSalFr30: { $sum: '$nb_sortants_en_emploi_sal_fr_30' },
              emploiStable6: { $sum: '$nb_sortants_en_emploi_stable_6' },
              emploiStable12: { $sum: '$nb_sortants_en_emploi_stable_12' },
              emploiStable18: { $sum: '$nb_sortants_en_emploi_stable_18' },
              emploiStable24: { $sum: '$nb_sortants_en_emploi_stable_24' },
              emploiStable30: { $sum: '$nb_sortants_en_emploi_stable_30' },
            },
          },
          { $sort: { _id: -1 } },
        ])
        .toArray();

      const insersupGenderQuery = collections.insersup
        .aggregate<InsersupGenderAggResult>([
          {
            $match: {
              inf,
              genre: { $in: ['femme', 'homme'] },
              obtention_diplome: 'diplômé',
              nationalite: 'français',
              regime_inscription: 'ensemble',
            },
          },
          {
            $group: {
              _id: { promo: '$promo', genre: '$genre' },
              nbSortants: { $sum: '$nb_sortants' },
              emploiNonSal6: { $sum: '$nb_sortants_en_emploi_non_sal_6' },
              emploiNonSal12: { $sum: '$nb_sortants_en_emploi_non_sal_12' },
              emploiNonSal18: { $sum: '$nb_sortants_en_emploi_non_sal_18' },
              emploiNonSal24: { $sum: '$nb_sortants_en_emploi_non_sal_24' },
              emploiNonSal30: { $sum: '$nb_sortants_en_emploi_non_sal_30' },
              emploiSalFr6: { $sum: '$nb_sortants_en_emploi_sal_fr_6' },
              emploiSalFr12: { $sum: '$nb_sortants_en_emploi_sal_fr_12' },
              emploiSalFr18: { $sum: '$nb_sortants_en_emploi_sal_fr_18' },
              emploiSalFr24: { $sum: '$nb_sortants_en_emploi_sal_fr_24' },
              emploiSalFr30: { $sum: '$nb_sortants_en_emploi_sal_fr_30' },
              emploiStable6: { $sum: '$nb_sortants_en_emploi_stable_6' },
              emploiStable12: { $sum: '$nb_sortants_en_emploi_stable_12' },
              emploiStable18: { $sum: '$nb_sortants_en_emploi_stable_18' },
              emploiStable24: { $sum: '$nb_sortants_en_emploi_stable_24' },
              emploiStable30: { $sum: '$nb_sortants_en_emploi_stable_30' },
            },
          },
        ])
        .toArray();

      const insersupNationalityQuery = collections.insersup
        .aggregate<InsersupNationalityAggResult>([
          {
            $match: {
              inf,
              genre: 'ensemble',
              obtention_diplome: 'diplômé',
              nationalite: { $in: ['français', 'étranger'] },
              regime_inscription: 'ensemble',
            },
          },
          {
            $group: {
              _id: '$nationalite',
              nbSortants: { $sum: '$nb_sortants' },
            },
          },
        ])
        .toArray();

      const [program, sise, insersupRaw, insersupGenderRaw, insersupNationalityRaw] =
        await Promise.all([
          programQuery,
          siseQuery,
          insersupQuery,
          insersupGenderQuery,
          insersupNationalityQuery,
        ]);

      if (!program) {
        throw new NotFoundError('Program not found');
      }

      const computeRates = (
        sortants: number,
        data: {
          sal6: number;
          sal12: number;
          sal18: number;
          sal24: number;
          sal30: number;
          nonSal6: number;
          nonSal12: number;
          nonSal18: number;
          nonSal24: number;
          nonSal30: number;
          stable6: number;
          stable12: number;
          stable18: number;
          stable24: number;
          stable30: number;
        },
      ): {
        emploiSalFr: EmploymentRates;
        emploiNonSal: EmploymentRates;
        emploiStable: EmploymentRates;
      } => {
        const pct = (val: number) =>
          sortants > 0 ? Math.round((val / sortants) * 1000) / 10 : null;
        return {
          emploiSalFr: {
            m6: pct(data.sal6),
            m12: pct(data.sal12),
            m18: pct(data.sal18),
            m24: pct(data.sal24),
            m30: pct(data.sal30),
          },
          emploiNonSal: {
            m6: pct(data.nonSal6),
            m12: pct(data.nonSal12),
            m18: pct(data.nonSal18),
            m24: pct(data.nonSal24),
            m30: pct(data.nonSal30),
          },
          emploiStable: {
            m6: pct(data.stable6),
            m12: pct(data.stable12),
            m18: pct(data.stable18),
            m24: pct(data.stable24),
            m30: pct(data.stable30),
          },
        };
      };

      const buildGenderStats = (
        genderData: InsersupGenderAggResult | undefined,
      ): InsersupGenderStats | null => {
        if (!genderData) return null;
        const nbSortants = genderData.nbSortants;
        const canShow = nbSortants >= PRIVACY_THRESHOLD;
        if (!canShow) {
          return {
            nbSortants,
            canShowPercentages: false,
            emploiSalFr: null,
            emploiNonSal: null,
            emploiStable: null,
          };
        }
        const rates = computeRates(nbSortants, {
          sal6: genderData.emploiSalFr6,
          sal12: genderData.emploiSalFr12,
          sal18: genderData.emploiSalFr18,
          sal24: genderData.emploiSalFr24,
          sal30: genderData.emploiSalFr30,
          nonSal6: genderData.emploiNonSal6,
          nonSal12: genderData.emploiNonSal12,
          nonSal18: genderData.emploiNonSal18,
          nonSal24: genderData.emploiNonSal24,
          nonSal30: genderData.emploiNonSal30,
          stable6: genderData.emploiStable6,
          stable12: genderData.emploiStable12,
          stable18: genderData.emploiStable18,
          stable24: genderData.emploiStable24,
          stable30: genderData.emploiStable30,
        });
        return {
          nbSortants,
          canShowPercentages: true,
          emploiSalFr: rates.emploiSalFr,
          emploiNonSal: rates.emploiNonSal,
          emploiStable: rates.emploiStable,
        };
      };

      const genderByPromo = new Map<
        string,
        { femme?: InsersupGenderAggResult; homme?: InsersupGenderAggResult }
      >();
      for (const g of insersupGenderRaw) {
        const promo = g._id.promo;
        if (!genderByPromo.has(promo)) {
          genderByPromo.set(promo, {});
        }
        const entry = genderByPromo.get(promo)!;
        if (g._id.genre === 'femme') {
          entry.femme = g;
        } else if (g._id.genre === 'homme') {
          entry.homme = g;
        }
      }

      const totalSortantsFrancais =
        insersupNationalityRaw.find((n) => n._id === 'français')?.nbSortants || 0;
      const totalSortantsEtrangers =
        insersupNationalityRaw.find((n) => n._id === 'étranger')?.nbSortants || 0;

      let globalFemmeSortants = 0;
      let globalHommeSortants = 0;
      const globalFemmeData = {
        sal6: 0,
        sal12: 0,
        sal18: 0,
        sal24: 0,
        sal30: 0,
        nonSal6: 0,
        nonSal12: 0,
        nonSal18: 0,
        nonSal24: 0,
        nonSal30: 0,
        stable6: 0,
        stable12: 0,
        stable18: 0,
        stable24: 0,
        stable30: 0,
      };
      const globalHommeData = {
        sal6: 0,
        sal12: 0,
        sal18: 0,
        sal24: 0,
        sal30: 0,
        nonSal6: 0,
        nonSal12: 0,
        nonSal18: 0,
        nonSal24: 0,
        nonSal30: 0,
        stable6: 0,
        stable12: 0,
        stable18: 0,
        stable24: 0,
        stable30: 0,
      };

      for (const g of insersupGenderRaw) {
        if (g._id.genre === 'femme') {
          globalFemmeSortants += g.nbSortants;
          globalFemmeData.sal6 += g.emploiSalFr6;
          globalFemmeData.sal12 += g.emploiSalFr12;
          globalFemmeData.sal18 += g.emploiSalFr18;
          globalFemmeData.sal24 += g.emploiSalFr24;
          globalFemmeData.sal30 += g.emploiSalFr30;
          globalFemmeData.nonSal6 += g.emploiNonSal6;
          globalFemmeData.nonSal12 += g.emploiNonSal12;
          globalFemmeData.nonSal18 += g.emploiNonSal18;
          globalFemmeData.nonSal24 += g.emploiNonSal24;
          globalFemmeData.nonSal30 += g.emploiNonSal30;
          globalFemmeData.stable6 += g.emploiStable6;
          globalFemmeData.stable12 += g.emploiStable12;
          globalFemmeData.stable18 += g.emploiStable18;
          globalFemmeData.stable24 += g.emploiStable24;
          globalFemmeData.stable30 += g.emploiStable30;
        } else if (g._id.genre === 'homme') {
          globalHommeSortants += g.nbSortants;
          globalHommeData.sal6 += g.emploiSalFr6;
          globalHommeData.sal12 += g.emploiSalFr12;
          globalHommeData.sal18 += g.emploiSalFr18;
          globalHommeData.sal24 += g.emploiSalFr24;
          globalHommeData.sal30 += g.emploiSalFr30;
          globalHommeData.nonSal6 += g.emploiNonSal6;
          globalHommeData.nonSal12 += g.emploiNonSal12;
          globalHommeData.nonSal18 += g.emploiNonSal18;
          globalHommeData.nonSal24 += g.emploiNonSal24;
          globalHommeData.nonSal30 += g.emploiNonSal30;
          globalHommeData.stable6 += g.emploiStable6;
          globalHommeData.stable12 += g.emploiStable12;
          globalHommeData.stable18 += g.emploiStable18;
          globalHommeData.stable24 += g.emploiStable24;
          globalHommeData.stable30 += g.emploiStable30;
        }
      }

      let totalSortants = 0;
      let totalEtudiants = 0;
      let totalPoursuivants = 0;
      let globalSal6 = 0,
        globalSal12 = 0,
        globalSal18 = 0,
        globalSal24 = 0,
        globalSal30 = 0;
      let globalNonSal6 = 0,
        globalNonSal12 = 0,
        globalNonSal18 = 0,
        globalNonSal24 = 0,
        globalNonSal30 = 0;
      let globalStable6 = 0,
        globalStable12 = 0,
        globalStable18 = 0,
        globalStable24 = 0,
        globalStable30 = 0;

      const byYear: InsersupYearStats[] = insersupRaw.map((row) => {
        const nbSortants = row.nbSortants;
        const nbEtudiants = row.nbEtudiants;
        const nbPoursuivants = row.nbPoursuivants;

        totalSortants += nbSortants;
        totalEtudiants += nbEtudiants;
        totalPoursuivants += nbPoursuivants;

        globalSal6 += row.emploiSalFr6;
        globalSal12 += row.emploiSalFr12;
        globalSal18 += row.emploiSalFr18;
        globalSal24 += row.emploiSalFr24;
        globalSal30 += row.emploiSalFr30;
        globalNonSal6 += row.emploiNonSal6;
        globalNonSal12 += row.emploiNonSal12;
        globalNonSal18 += row.emploiNonSal18;
        globalNonSal24 += row.emploiNonSal24;
        globalNonSal30 += row.emploiNonSal30;
        globalStable6 += row.emploiStable6;
        globalStable12 += row.emploiStable12;
        globalStable18 += row.emploiStable18;
        globalStable24 += row.emploiStable24;
        globalStable30 += row.emploiStable30;

        const canShowPercentages = nbSortants >= PRIVACY_THRESHOLD;

        const genderData = genderByPromo.get(row._id);
        const femmeStats = buildGenderStats(genderData?.femme);
        const hommeStats = buildGenderStats(genderData?.homme);

        if (canShowPercentages) {
          const rates = computeRates(nbSortants, {
            sal6: row.emploiSalFr6,
            sal12: row.emploiSalFr12,
            sal18: row.emploiSalFr18,
            sal24: row.emploiSalFr24,
            sal30: row.emploiSalFr30,
            nonSal6: row.emploiNonSal6,
            nonSal12: row.emploiNonSal12,
            nonSal18: row.emploiNonSal18,
            nonSal24: row.emploiNonSal24,
            nonSal30: row.emploiNonSal30,
            stable6: row.emploiStable6,
            stable12: row.emploiStable12,
            stable18: row.emploiStable18,
            stable24: row.emploiStable24,
            stable30: row.emploiStable30,
          });
          return {
            promo: row._id,
            nbEtudiants,
            nbSortants,
            nbPoursuivants,
            canShowPercentages: true,
            emploiSalFr: rates.emploiSalFr,
            emploiNonSal: rates.emploiNonSal,
            emploiStable: rates.emploiStable,
            byGender: { femme: femmeStats, homme: hommeStats },
          };
        }

        return {
          promo: row._id,
          nbEtudiants,
          nbSortants,
          nbPoursuivants,
          canShowPercentages: false,
          emploiSalFr: null,
          emploiNonSal: null,
          emploiStable: null,
          byGender: { femme: femmeStats, homme: hommeStats },
        };
      });

      const globalCanShow = totalSortants >= PRIVACY_THRESHOLD;

      const globalFemmeCanShow = globalFemmeSortants >= PRIVACY_THRESHOLD;
      const globalHommeCanShow = globalHommeSortants >= PRIVACY_THRESHOLD;

      const insersup: InsersupStats = {
        totalSortants,
        totalEtudiants,
        totalPoursuivants,
        totalSortantsFrancais,
        totalSortantsEtrangers,
        canShowPercentages: globalCanShow,
        byYear,
        globalRates: globalCanShow
          ? computeRates(totalSortants, {
              sal6: globalSal6,
              sal12: globalSal12,
              sal18: globalSal18,
              sal24: globalSal24,
              sal30: globalSal30,
              nonSal6: globalNonSal6,
              nonSal12: globalNonSal12,
              nonSal18: globalNonSal18,
              nonSal24: globalNonSal24,
              nonSal30: globalNonSal30,
              stable6: globalStable6,
              stable12: globalStable12,
              stable18: globalStable18,
              stable24: globalStable24,
              stable30: globalStable30,
            })
          : null,
        globalRatesByGender: {
          femme: globalFemmeCanShow
            ? {
                nbSortants: globalFemmeSortants,
                canShowPercentages: true,
                ...computeRates(globalFemmeSortants, globalFemmeData),
              }
            : {
                nbSortants: globalFemmeSortants,
                canShowPercentages: false,
                emploiSalFr: null,
                emploiNonSal: null,
                emploiStable: null,
              },
          homme: globalHommeCanShow
            ? {
                nbSortants: globalHommeSortants,
                canShowPercentages: true,
                ...computeRates(globalHommeSortants, globalHommeData),
              }
            : {
                nbSortants: globalHommeSortants,
                canShowPercentages: false,
                emploiSalFr: null,
                emploiNonSal: null,
                emploiStable: null,
              },
        },
      };

      return { program, sise, insersup };
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
