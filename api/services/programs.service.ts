import * as XLSX from 'xlsx';
import {
  ES_INDEXES,
  elastic,
  extractHits,
  extractTermBuckets,
  extractTotal,
  scroll,
  setFilters,
} from '~/database/elastic';
import { collections } from '~/database/mongo';
import { DatabaseError, NotFoundError } from '~/errors';
import type { ProgramAggregations } from '~/schemas/aggregations';
import type { ProgramSearch, ProgramsParams } from '~/schemas/programs';
import { buildSearchFields, PROGRAM_SEARCH_FIELDS } from '~/schemas/search-fields';
import { aggregateInsersupForProgram } from '~/services/insersup.service';
import { aggregateSiseForProgram } from '~/services/sise.service';

// ============================================================================
// Constants
// ============================================================================

export const SEARCH_CONFIG = {
  maxWorkspacePrograms: 5000,
  warningThreshold: 1000,
} as const;

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
  codeRome: 'romeInfos.codeRome.keyword',
} as const;

const FACET_AGGREGATIONS = {
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

const EXPORT_CONFIG = {
  maxResults: 25000,
  pitKeepAlive: '5m',
  batchSize: 2500,
} as const;

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

const XLSX_COL_WIDTHS = [
  { wch: 15 },
  { wch: 60 },
  { wch: 8 },
  { wch: 20 },
  { wch: 15 },
  { wch: 20 },
  { wch: 15 },
  { wch: 15 },
  { wch: 12 },
  { wch: 40 },
  { wch: 10 },
  { wch: 20 },
  { wch: 25 },
  { wch: 20 },
  { wch: 20 },
  { wch: 12 },
  { wch: 12 },
  { wch: 12 },
];

// ============================================================================
// Filter param types
// ============================================================================

export type ProgramFilterParams = Omit<ProgramsParams, 'page' | 'pageSize' | 'q' | 'sort'>;

// ============================================================================
// Query Builders
// ============================================================================

function buildProgramFilters(query: ProgramFilterParams) {
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
    { key: FILTER_FIELD_MAP.codeRome, value: query.codeRome },
  ]);
}

function buildProgramQuery(q?: string) {
  return q ? { query_string: { query: q, fields: buildSearchFields() } } : { match_all: {} };
}

export function buildElasticsearchQuery(params: ProgramFilterParams & { q?: string }) {
  const { q, ...filterParams } = params;
  const textQuery = buildProgramQuery(q);
  const filters = buildProgramFilters(filterParams);

  return {
    bool: {
      must: [textQuery],
      filter: filters,
    },
  };
}

function buildHighlightFields(): Record<string, object> {
  return PROGRAM_SEARCH_FIELDS.reduce(
    (acc, config) => {
      acc[config.field] = {};
      return acc;
    },
    {} as Record<string, object>,
  );
}

export function buildHighlightConfig(q?: string) {
  if (!q) return undefined;
  return {
    fields: buildHighlightFields(),
    pre_tags: ['<strong>'],
    post_tags: ['</strong>'],
    number_of_fragments: 3,
    fragment_size: 150,
  };
}

// ============================================================================
// Export helpers
// ============================================================================

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

// ============================================================================
// Public API
// ============================================================================

export async function searchPrograms(params: ProgramsParams) {
  const { q, page = 1, pageSize = 10, ...rest } = params;
  const esQuery = buildElasticsearchQuery({ q, ...rest });
  const from = (page - 1) * pageSize;

  const searchResponse = await elastic
    .search<ProgramSearch>({
      index: ES_INDEXES.programs,
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

  return {
    programs: extractHits<ProgramSearch>(searchResponse),
    totalCount: extractTotal(searchResponse),
  };
}

export async function getFacets(params: Partial<ProgramsParams>) {
  const { q, ...rest } = params;
  const esQuery = buildElasticsearchQuery({ q, ...rest });

  const searchResponse = await elastic
    .search({
      index: ES_INDEXES.programs,
      size: 0,
      query: esQuery,
      track_total_hits: true,
      aggs: FACET_AGGREGATIONS,
    })
    .catch((err) => {
      console.error(err);
      throw new DatabaseError(err.message);
    });

  const totalCount = extractTotal(searchResponse);
  const aggregations = searchResponse.aggregations;

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
}

export async function getProgramDetail(inf: string) {
  const [program, sise, insersup] = await Promise.all([
    collections.programs.findOne({ inf }),
    aggregateSiseForProgram(inf),
    aggregateInsersupForProgram(inf),
  ]);

  if (!program) throw new NotFoundError('Formation introuvable');

  return { program: program!, sise, insersup };
}

export async function exportPrograms(
  params: ProgramsParams & { format?: string },
  set: { headers: Record<string, string | number | undefined> },
) {
  const { q, format, ...rest } = params;
  // Fix by annelhote
  const { diplomaType, ...rest2 } = rest;
  const diplomaType2 = typeof diplomaType === 'string' ? diplomaType.split(',') : diplomaType;
  const esQuery = buildElasticsearchQuery({ q, diplomaType: diplomaType2, ...rest2 });
  const timestamp = new Date().toISOString().split('T')[0];

  const { results: allPrograms } = await scroll<
    ProgramSearch,
    ReturnType<typeof transformProgramForExport>
  >({
    index: ES_INDEXES.programs!,
    query: esQuery,
    maxResults: EXPORT_CONFIG.maxResults,
    source: true,
    mapper: transformProgramForExport,
    batchSize: EXPORT_CONFIG.batchSize,
    keepAlive: EXPORT_CONFIG.pitKeepAlive,
  });

  const totalCount = allPrograms.length;

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

  const filename = `formations-export-${timestamp}.xlsx`;
  const headerKeys = Object.keys(XLSX_HEADERS) as (keyof typeof XLSX_HEADERS)[];

  const worksheetData = [
    Object.values(XLSX_HEADERS),
    ...allPrograms.map((program) =>
      headerKeys.map((key) => {
        const value = program[key as keyof typeof program];
        if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
        return value ?? '';
      }),
    ),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  worksheet['!cols'] = XLSX_COL_WIDTHS;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Formations');

  const xlsxBuffer = XLSX.write(workbook, {
    type: 'buffer',
    bookType: 'xlsx',
    compression: true,
  });

  set.headers['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  set.headers['Content-Disposition'] = `attachment; filename="${filename}"`;
  set.headers['Content-Length'] = String(xlsxBuffer.length);
  set.headers['X-Total-Count'] = String(totalCount);

  return xlsxBuffer;
}

export async function fetchAllProgramIds(
  params: ProgramFilterParams & { q?: string },
  maxResults: number = SEARCH_CONFIG.maxWorkspacePrograms,
): Promise<{ programIds: string[]; totalCount: number }> {
  const { results, totalCount } = await scroll<ProgramSearch, string>({
    index: ES_INDEXES.programs!,
    query: buildElasticsearchQuery(params),
    maxResults,
    source: ['inf'],
    mapper: (source) => source.inf,
  });

  return { programIds: results, totalCount };
}

export async function previewSearchOverlap(
  params: ProgramFilterParams & { q?: string },
  existingProgramIds: string[],
): Promise<{ toAdd: number; alreadyPresent: number; total: number }> {
  const esQuery = buildElasticsearchQuery(params);

  const response = await elastic.search({
    index: ES_INDEXES.programs,
    size: 0,
    query: esQuery,
    track_total_hits: true,
    aggs: {
      already_present: {
        filter: {
          terms: { 'inf.keyword': existingProgramIds },
        },
      },
    },
  });

  const totalCount = extractTotal(response);
  const alreadyPresent =
    (response.aggregations?.already_present as { doc_count: number })?.doc_count ?? 0;

  return {
    toAdd: totalCount - alreadyPresent,
    alreadyPresent,
    total: totalCount,
  };
}

// ============================================================================
// Program aggregations (workspace cache — moved from datasets/fresq)
// ============================================================================

export const emptyProgramAggregations: ProgramAggregations = {
  byCycle: [],
  byAcademy: [],
  byRegion: [],
  byDiploma: [],
  byInstitution: [],
  byDiscipline: [],
  byRome: [],
};

export async function computeProgramAggregations(
  programIds: string[],
): Promise<ProgramAggregations> {
  if (programIds.length === 0) {
    return emptyProgramAggregations;
  }

  const programsPipeline = [
    { $match: { inf: { $in: programIds } } },
    {
      $facet: {
        byCycle: [
          { $group: { _id: '$cycle', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, cycle: '$_id', count: 1 } },
        ],
        byAcademy: [
          { $unwind: '$etablissements' },
          {
            $group: {
              _id: '$etablissements.academy',
              programs: { $addToSet: '$inf' },
            },
          },
          { $project: { _id: 0, academy: '$_id', count: { $size: '$programs' } } },
          { $sort: { count: -1 } },
        ],
        byRegion: [
          { $unwind: '$etablissements' },
          {
            $group: {
              _id: '$etablissements.region',
              programs: { $addToSet: '$inf' },
            },
          },
          { $project: { _id: 0, region: '$_id', count: { $size: '$programs' } } },
          { $sort: { count: -1 } },
        ],
        byDiploma: [
          {
            $group: {
              _id: { diploma: '$diploma.code', diplomaLabel: '$diploma.type' },
              count: { $sum: 1 },
            },
          },
          { $sort: { count: -1 } },
          {
            $project: {
              _id: 0,
              diploma: '$_id.diploma',
              diplomaLabel: '$_id.diplomaLabel',
              count: 1,
            },
          },
        ],
        byInstitution: [
          { $unwind: '$etablissements' },
          {
            $group: {
              _id: { uai: '$etablissements.uai', name: '$etablissements.name' },
              programs: { $addToSet: '$inf' },
            },
          },
          {
            $project: {
              _id: 0,
              uai: '$_id.uai',
              name: '$_id.name',
              count: { $size: '$programs' },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 50 },
        ],
        byDiscipline: [
          { $match: { disciplinarySector: { $exists: true, $ne: null } } },
          { $group: { _id: '$disciplinarySector', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, discipline: '$_id', count: 1 } },
        ],
        byRome: [
          { $match: { romeInfos: { $exists: true, $ne: [] } } },
          { $unwind: '$romeInfos' },
          {
            $group: {
              _id: { code: '$romeInfos.idLevel1', label: '$romeInfos.level1' },
              programs: { $addToSet: '$inf' },
            },
          },
          {
            $project: {
              _id: 0,
              code: '$_id.code',
              label: '$_id.label',
              count: { $size: '$programs' },
            },
          },
          { $sort: { count: -1 } },
        ],
      },
    },
  ];

  const results = await collections.programs.aggregate(programsPipeline).toArray();
  const result = results[0];

  return {
    byCycle: result?.byCycle || [],
    byAcademy: result?.byAcademy || [],
    byRegion: result?.byRegion || [],
    byDiploma: result?.byDiploma || [],
    byInstitution: result?.byInstitution || [],
    byDiscipline: result?.byDiscipline || [],
    byRome: result?.byRome || [],
  };
}
