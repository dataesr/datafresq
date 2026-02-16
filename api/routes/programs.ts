import { Elysia, t } from 'elysia';
import type { Document } from 'mongodb';
import * as XLSX from 'xlsx';
import { collections } from '~/database/mongo';
import type { EmploymentCounts, SalaryQuartiles } from '~/schemas/aggregations';

// Program-level insersup types (using counts, not rates)
interface ProgramInsersupGenderStats {
  nbSortants: number;
  emploiSalFr: EmploymentCounts | null;
  emploiNonSal: EmploymentCounts | null;
  emploiStable: EmploymentCounts | null;
  salaires: SalaryQuartiles | null;
}

interface ProgramInsersupYearStats {
  promo: string;
  nbEtudiants: number;
  nbSortants: number;
  nbPoursuivants: number;
  emploiSalFr: EmploymentCounts | null;
  emploiNonSal: EmploymentCounts | null;
  emploiStable: EmploymentCounts | null;
  salaires: SalaryQuartiles | null;
  byGender: {
    femme: ProgramInsersupGenderStats | null;
    homme: ProgramInsersupGenderStats | null;
  };
}

interface ProgramInsersupStats {
  totalSortants: number;
  totalEtudiants: number;
  totalPoursuivants: number;
  totalSortantsFrancais: number;
  totalSortantsEtrangers: number;
  byYear: ProgramInsersupYearStats[];
}

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
  // Salary data
  nbSalaires6: number | null;
  nbSalaires12: number | null;
  nbSalaires18: number | null;
  nbSalaires24: number | null;
  nbSalaires30: number | null;
  salaireQ1_6: number | null;
  salaireQ1_12: number | null;
  salaireQ1_18: number | null;
  salaireQ1_24: number | null;
  salaireQ1_30: number | null;
  salaireQ2_6: number | null;
  salaireQ2_12: number | null;
  salaireQ2_18: number | null;
  salaireQ2_24: number | null;
  salaireQ2_30: number | null;
  salaireQ3_6: number | null;
  salaireQ3_12: number | null;
  salaireQ3_18: number | null;
  salaireQ3_24: number | null;
  salaireQ3_30: number | null;
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
  // Salary data
  nbSalaires6: number | null;
  nbSalaires12: number | null;
  nbSalaires18: number | null;
  nbSalaires24: number | null;
  nbSalaires30: number | null;
  salaireQ1_6: number | null;
  salaireQ1_12: number | null;
  salaireQ1_18: number | null;
  salaireQ1_24: number | null;
  salaireQ1_30: number | null;
  salaireQ2_6: number | null;
  salaireQ2_12: number | null;
  salaireQ2_18: number | null;
  salaireQ2_24: number | null;
  salaireQ2_30: number | null;
  salaireQ3_6: number | null;
  salaireQ3_12: number | null;
  salaireQ3_18: number | null;
  salaireQ3_24: number | null;
  salaireQ3_30: number | null;
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
import { buildElasticsearchQuery, buildHighlightConfig, scrollAll } from '~/utils/programs-search';

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
      const { q, page = 1, pageSize = 10, ...rest } = query;
      const esQuery = buildElasticsearchQuery({ q, ...rest });
      const from = (page - 1) * pageSize;

      const searchResponse = await elastic.programs
        .search<ProgramSearch>({
          from,
          size: pageSize,
          query: esQuery,
          track_total_hits: true,
          track_scores: true,
          highlight: buildHighlightConfig(q),
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
      const { q, format, maxResults = EXPORT_CONFIG.maxResults, ...rest } = query;
      const effectiveMaxResults = Math.min(Number(maxResults), EXPORT_CONFIG.maxResults);
      const esQuery = buildElasticsearchQuery({ q, ...rest });
      const timestamp = new Date().toISOString().split('T')[0];

      const { results: allPrograms } = await scrollAll<ProgramSearch, ReturnType<typeof transformProgramForExport>>({
        query: esQuery,
        maxResults: effectiveMaxResults,
        source: true,
        mapper: transformProgramForExport,
        batchSize: EXPORT_CONFIG.batchSize,
        pitKeepAlive: EXPORT_CONFIG.pitKeepAlive,
      });

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
      const { q, ...rest } = query;
      const esQuery = buildElasticsearchQuery({ q, ...rest });

      const searchResponse = await elastic.programs
        .search({
          size: 0,
          query: esQuery,
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
              enrollment: '$effectif',
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
              // Salary data - use $max since there's one record per promo for this program
              nbSalaires6: { $max: '$nb_salaires_6' },
              nbSalaires12: { $max: '$nb_salaires_12' },
              nbSalaires18: { $max: '$nb_salaires_18' },
              nbSalaires24: { $max: '$nb_salaires_24' },
              nbSalaires30: { $max: '$nb_salaires_30' },
              salaireQ1_6: { $max: '$salaire_q1_6' },
              salaireQ1_12: { $max: '$salaire_q1_12' },
              salaireQ1_18: { $max: '$salaire_q1_18' },
              salaireQ1_24: { $max: '$salaire_q1_24' },
              salaireQ1_30: { $max: '$salaire_q1_30' },
              salaireQ2_6: { $max: '$salaire_q2_6' },
              salaireQ2_12: { $max: '$salaire_q2_12' },
              salaireQ2_18: { $max: '$salaire_q2_18' },
              salaireQ2_24: { $max: '$salaire_q2_24' },
              salaireQ2_30: { $max: '$salaire_q2_30' },
              salaireQ3_6: { $max: '$salaire_q3_6' },
              salaireQ3_12: { $max: '$salaire_q3_12' },
              salaireQ3_18: { $max: '$salaire_q3_18' },
              salaireQ3_24: { $max: '$salaire_q3_24' },
              salaireQ3_30: { $max: '$salaire_q3_30' },
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
              // Salary data for gender
              nbSalaires6: { $max: '$nb_salaires_6' },
              nbSalaires12: { $max: '$nb_salaires_12' },
              nbSalaires18: { $max: '$nb_salaires_18' },
              nbSalaires24: { $max: '$nb_salaires_24' },
              nbSalaires30: { $max: '$nb_salaires_30' },
              salaireQ1_6: { $max: '$salaire_q1_6' },
              salaireQ1_12: { $max: '$salaire_q1_12' },
              salaireQ1_18: { $max: '$salaire_q1_18' },
              salaireQ1_24: { $max: '$salaire_q1_24' },
              salaireQ1_30: { $max: '$salaire_q1_30' },
              salaireQ2_6: { $max: '$salaire_q2_6' },
              salaireQ2_12: { $max: '$salaire_q2_12' },
              salaireQ2_18: { $max: '$salaire_q2_18' },
              salaireQ2_24: { $max: '$salaire_q2_24' },
              salaireQ2_30: { $max: '$salaire_q2_30' },
              salaireQ3_6: { $max: '$salaire_q3_6' },
              salaireQ3_12: { $max: '$salaire_q3_12' },
              salaireQ3_18: { $max: '$salaire_q3_18' },
              salaireQ3_24: { $max: '$salaire_q3_24' },
              salaireQ3_30: { $max: '$salaire_q3_30' },
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

      const SALARY_MIN_COUNT = 5;

      // Build salary quartiles from raw aggregation data
      const buildSalaryQuartiles = (data: {
        nbSalaires6: number | null;
        nbSalaires12: number | null;
        nbSalaires18: number | null;
        nbSalaires24: number | null;
        nbSalaires30: number | null;
        salaireQ1_6: number | null;
        salaireQ1_12: number | null;
        salaireQ1_18: number | null;
        salaireQ1_24: number | null;
        salaireQ1_30: number | null;
        salaireQ2_6: number | null;
        salaireQ2_12: number | null;
        salaireQ2_18: number | null;
        salaireQ2_24: number | null;
        salaireQ2_30: number | null;
        salaireQ3_6: number | null;
        salaireQ3_12: number | null;
        salaireQ3_18: number | null;
        salaireQ3_24: number | null;
        salaireQ3_30: number | null;
      }): SalaryQuartiles | null => {
        const hasAnyData = [
          data.nbSalaires6,
          data.nbSalaires12,
          data.nbSalaires18,
          data.nbSalaires24,
          data.nbSalaires30,
        ].some((n) => n !== null && n >= SALARY_MIN_COUNT);

        if (!hasAnyData) return null;

        const buildMonthData = (
          count: number | null,
          q1: number | null,
          median: number | null,
          q3: number | null,
        ) => {
          if (count === null || count < SALARY_MIN_COUNT) {
            return { count: null, q1: null, median: null, q3: null };
          }
          return { count, q1, median, q3 };
        };

        return {
          m6: buildMonthData(
            data.nbSalaires6,
            data.salaireQ1_6,
            data.salaireQ2_6,
            data.salaireQ3_6,
          ),
          m12: buildMonthData(
            data.nbSalaires12,
            data.salaireQ1_12,
            data.salaireQ2_12,
            data.salaireQ3_12,
          ),
          m18: buildMonthData(
            data.nbSalaires18,
            data.salaireQ1_18,
            data.salaireQ2_18,
            data.salaireQ3_18,
          ),
          m24: buildMonthData(
            data.nbSalaires24,
            data.salaireQ1_24,
            data.salaireQ2_24,
            data.salaireQ3_24,
          ),
          m30: buildMonthData(
            data.nbSalaires30,
            data.salaireQ1_30,
            data.salaireQ2_30,
            data.salaireQ3_30,
          ),
        };
      };

      // Build employment counts (raw counts, null if below threshold)
      const buildEmploymentCounts = (
        nbSortants: number,
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
        emploiSalFr: EmploymentCounts;
        emploiNonSal: EmploymentCounts;
        emploiStable: EmploymentCounts;
      } | null => {
        if (nbSortants < PRIVACY_THRESHOLD) return null;
        return {
          emploiSalFr: {
            m6: data.sal6,
            m12: data.sal12,
            m18: data.sal18,
            m24: data.sal24,
            m30: data.sal30,
          },
          emploiNonSal: {
            m6: data.nonSal6,
            m12: data.nonSal12,
            m18: data.nonSal18,
            m24: data.nonSal24,
            m30: data.nonSal30,
          },
          emploiStable: {
            m6: data.stable6,
            m12: data.stable12,
            m18: data.stable18,
            m24: data.stable24,
            m30: data.stable30,
          },
        };
      };

      const buildGenderStats = (
        genderData: InsersupGenderAggResult | undefined,
      ): ProgramInsersupGenderStats | null => {
        if (!genderData) return null;
        const nbSortants = genderData.nbSortants;
        const empCounts = buildEmploymentCounts(nbSortants, {
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
        const salaryQuartiles = buildSalaryQuartiles({
          nbSalaires6: genderData.nbSalaires6,
          nbSalaires12: genderData.nbSalaires12,
          nbSalaires18: genderData.nbSalaires18,
          nbSalaires24: genderData.nbSalaires24,
          nbSalaires30: genderData.nbSalaires30,
          salaireQ1_6: genderData.salaireQ1_6,
          salaireQ1_12: genderData.salaireQ1_12,
          salaireQ1_18: genderData.salaireQ1_18,
          salaireQ1_24: genderData.salaireQ1_24,
          salaireQ1_30: genderData.salaireQ1_30,
          salaireQ2_6: genderData.salaireQ2_6,
          salaireQ2_12: genderData.salaireQ2_12,
          salaireQ2_18: genderData.salaireQ2_18,
          salaireQ2_24: genderData.salaireQ2_24,
          salaireQ2_30: genderData.salaireQ2_30,
          salaireQ3_6: genderData.salaireQ3_6,
          salaireQ3_12: genderData.salaireQ3_12,
          salaireQ3_18: genderData.salaireQ3_18,
          salaireQ3_24: genderData.salaireQ3_24,
          salaireQ3_30: genderData.salaireQ3_30,
        });
        return {
          nbSortants,
          emploiSalFr: empCounts?.emploiSalFr ?? null,
          emploiNonSal: empCounts?.emploiNonSal ?? null,
          emploiStable: empCounts?.emploiStable ?? null,
          salaires: salaryQuartiles,
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

      let totalSortants = 0;
      let totalEtudiants = 0;
      let totalPoursuivants = 0;

      const byYear: ProgramInsersupYearStats[] = insersupRaw.map((row) => {
        const nbSortants = row.nbSortants;
        const nbEtudiants = row.nbEtudiants;
        const nbPoursuivants = row.nbPoursuivants;

        totalSortants += nbSortants;
        totalEtudiants += nbEtudiants;
        totalPoursuivants += nbPoursuivants;

        const genderData = genderByPromo.get(row._id);
        const femmeStats = buildGenderStats(genderData?.femme);
        const hommeStats = buildGenderStats(genderData?.homme);

        // Build employment counts for this year
        const empCounts = buildEmploymentCounts(nbSortants, {
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

        // Build salary quartiles for this year
        const salaryQuartiles = buildSalaryQuartiles({
          nbSalaires6: row.nbSalaires6,
          nbSalaires12: row.nbSalaires12,
          nbSalaires18: row.nbSalaires18,
          nbSalaires24: row.nbSalaires24,
          nbSalaires30: row.nbSalaires30,
          salaireQ1_6: row.salaireQ1_6,
          salaireQ1_12: row.salaireQ1_12,
          salaireQ1_18: row.salaireQ1_18,
          salaireQ1_24: row.salaireQ1_24,
          salaireQ1_30: row.salaireQ1_30,
          salaireQ2_6: row.salaireQ2_6,
          salaireQ2_12: row.salaireQ2_12,
          salaireQ2_18: row.salaireQ2_18,
          salaireQ2_24: row.salaireQ2_24,
          salaireQ2_30: row.salaireQ2_30,
          salaireQ3_6: row.salaireQ3_6,
          salaireQ3_12: row.salaireQ3_12,
          salaireQ3_18: row.salaireQ3_18,
          salaireQ3_24: row.salaireQ3_24,
          salaireQ3_30: row.salaireQ3_30,
        });

        return {
          promo: row._id,
          nbEtudiants,
          nbSortants,
          nbPoursuivants,
          emploiSalFr: empCounts?.emploiSalFr ?? null,
          emploiNonSal: empCounts?.emploiNonSal ?? null,
          emploiStable: empCounts?.emploiStable ?? null,
          salaires: salaryQuartiles,
          byGender: { femme: femmeStats, homme: hommeStats },
        };
      });

      const insersup: ProgramInsersupStats = {
        totalSortants,
        totalEtudiants,
        totalPoursuivants,
        totalSortantsFrancais,
        totalSortantsEtrangers,
        byYear,
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
