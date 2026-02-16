import type { estypes } from '@elastic/elasticsearch';
import { elastic, extractTotal, setFilters } from '~/external/elastic';
import { type ProgramSearch, programSearchSchema } from '~/schemas/programs';
import { buildSearchFields, PROGRAM_SEARCH_FIELDS } from '~/utils/search';

export const FILTER_FIELD_MAP = {
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

export interface ProgramFilterParams {
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
  codeRome?: string | string[];
}

export function buildProgramFilters(query: ProgramFilterParams) {
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

export function buildProgramQuery(q?: string) {
  return q
    ? { query_string: { query: q, fields: buildSearchFields() } }
    : { match_all: {} };
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

export function buildHighlightFields(): Record<string, object> {
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

export async function previewSearchOverlap(
  params: ProgramFilterParams & { q?: string },
  existingProgramIds: string[],
): Promise<{ toAdd: number; alreadyPresent: number; total: number }> {
  const esQuery = buildElasticsearchQuery(params);

  const response = await elastic.programs.search({
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

  const total = extractTotal(response);
  const alreadyPresent =
    (response.aggregations?.already_present as { doc_count: number })?.doc_count ?? 0;

  return {
    toAdd: total - alreadyPresent,
    alreadyPresent,
    total,
  };
}

export const SEARCH_CONFIG = {
  maxWorkspacePrograms: 5000,
  warningThreshold: 1000,
  pitKeepAlive: '5m',
  batchSize: 2000,
} as const;

export const PROGRAM_FIELDS = Object.keys(programSearchSchema.properties);

interface ScrollOptions<T, R> {
  query: estypes.QueryDslQueryContainer;
  maxResults: number;
  source: estypes.SearchSourceConfig;
  mapper: (source: T) => R;
  batchSize?: number;
  pitKeepAlive?: string;
}

export async function scrollAll<T, R>(options: ScrollOptions<T, R>): Promise<{ results: R[]; totalCount: number }> {
  const {
    query,
    maxResults,
    source,
    mapper,
    batchSize = SEARCH_CONFIG.batchSize,
    pitKeepAlive = SEARCH_CONFIG.pitKeepAlive,
  } = options;

  const results: R[] = [];

  // @ts-expect-error - proxy injects index at runtime
  const pitResponse = await elastic.programs.openPointInTime({
    keep_alive: pitKeepAlive,
  });
  let pitId = pitResponse.id;

  try {
    let searchAfter: (string | number)[] | undefined;
    let hasMore = true;
    let totalCount = 0;

    while (hasMore && results.length < maxResults) {
      const searchResponse = await elastic.client.search<T>({
        size: Math.min(batchSize, maxResults - results.length),
        query,
        pit: {
          id: pitId,
          keep_alive: pitKeepAlive,
        },
        sort: [{ _shard_doc: 'asc' }],
        ...(searchAfter && { search_after: searchAfter }),
        track_total_hits: results.length === 0,
        _source: source,
      });

      if (results.length === 0 && searchResponse.hits.total) {
        totalCount =
          typeof searchResponse.hits.total === 'number'
            ? searchResponse.hits.total
            : searchResponse.hits.total.value;
      }

      const hits = searchResponse.hits.hits;

      if (hits.length === 0) {
        hasMore = false;
        break;
      }

      for (const hit of hits) {
        if (hit._source && results.length < maxResults) {
          results.push(mapper(hit._source));
        }
      }

      const lastHit = hits.at(-1);
      if (lastHit?.sort) {
        searchAfter = lastHit.sort as (string | number)[];
      }

      if (searchResponse.pit_id) {
        pitId = searchResponse.pit_id;
      }
    }

    return { results, totalCount: totalCount || results.length };
  } finally {
    await elastic.programs.closePointInTime({ id: pitId }).catch(() => {});
  }
}

export async function fetchAllProgramIds(
  params: ProgramFilterParams & { q?: string },
  maxResults: number = SEARCH_CONFIG.maxWorkspacePrograms
): Promise<{ programIds: string[]; totalCount: number }> {
  const { results, totalCount } = await scrollAll<ProgramSearch, string>({
    query: buildElasticsearchQuery(params),
    maxResults,
    source: ['inf'],
    mapper: (source) => source.inf,
  });

  return { programIds: results, totalCount };
}
