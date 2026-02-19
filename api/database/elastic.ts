import { Client, type ClientOptions, type estypes, HttpConnection } from '@elastic/elasticsearch';
import { config } from '~/config';

const esConfig: ClientOptions = {
  Connection: HttpConnection,
  auth: config.elastic.auth,
  node: config.elastic.node,
};

export const elastic = new Client(esConfig);

export const ES_INDEXES = config.elastic.indexes;

// ---------------------------------------------------------------------------
// Scroll (PIT-based)
// ---------------------------------------------------------------------------

const SCROLL_DEFAULTS = { batchSize: 2000, keepAlive: '5m' } as const;

export interface ScrollOptions<T, R = T> {
  index: string;
  query: estypes.QueryDslQueryContainer;
  maxResults: number;
  source?: estypes.SearchSourceConfig;
  mapper?: (source: T) => R;
  batchSize?: number;
  keepAlive?: string;
}

export interface ScrollResult<R> {
  results: R[];
  totalCount: number;
}

export async function scroll<T, R = T>(options: ScrollOptions<T, R>): Promise<ScrollResult<R>> {
  const {
    index,
    query,
    maxResults,
    source,
    mapper = ((s: T) => s) as unknown as (source: T) => R,
    batchSize = SCROLL_DEFAULTS.batchSize,
    keepAlive = SCROLL_DEFAULTS.keepAlive,
  } = options;

  const results: R[] = [];
  const pitResponse = await elastic.openPointInTime({ index, keep_alive: keepAlive });
  let pitId = pitResponse.id;

  try {
    let searchAfter: (string | number)[] | undefined;
    let totalCount = 0;

    while (results.length < maxResults) {
      const response = await elastic.search<T>({
        size: Math.min(batchSize, maxResults - results.length),
        query,
        pit: { id: pitId, keep_alive: keepAlive },
        sort: [{ _shard_doc: 'asc' }],
        ...(searchAfter && { search_after: searchAfter }),
        track_total_hits: results.length === 0,
        _source: source,
      });

      if (results.length === 0 && response.hits.total) {
        totalCount =
          typeof response.hits.total === 'number' ? response.hits.total : response.hits.total.value;
      }

      const hits = response.hits.hits;
      if (hits.length === 0) break;

      for (const hit of hits) {
        if (hit._source && results.length < maxResults) {
          results.push(mapper(hit._source));
        }
      }

      const lastHit = hits.at(-1);
      if (lastHit?.sort) {
        searchAfter = lastHit.sort as (string | number)[];
      }
      if (response.pit_id) {
        pitId = response.pit_id;
      }
    }

    return { results, totalCount: totalCount || results.length };
  } finally {
    await elastic.closePointInTime({ id: pitId }).catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

export type SearchHit<T> = T & {
  score: number | null;
  highlight?: Record<string, string[]>;
};

export type AggregationBucket = {
  key: string;
  count: number;
};

function normalizeScore(score?: number | null, max?: number | null): number | null {
  if (!score || !max) return null;
  return Number((Math.round((score / max) * 100) / 100).toFixed(2));
}

export function extractHits<T>(response: estypes.SearchResponse<T> | undefined): SearchHit<T>[] {
  if (!response) return [];
  const maxScore = response.hits.max_score ?? null;

  return response.hits.hits
    .map((hit): SearchHit<T> | undefined => {
      if (!hit._source) return undefined;
      return {
        ...hit._source,
        score: normalizeScore(hit._score, maxScore),
        highlight: hit.highlight,
      };
    })
    .filter((h): h is SearchHit<T> => h !== undefined);
}

export function extractTotal(response: estypes.SearchResponse | undefined): number {
  if (!response) return 0;
  return typeof response.hits.total === 'number'
    ? response.hits.total
    : response.hits.total?.value || 0;
}

export function extractTermBuckets(
  agg: estypes.AggregationsAggregate | undefined,
): AggregationBucket[] {
  if (!agg) return [];

  const termsAgg = agg as estypes.AggregationsStringTermsAggregate;
  if (!termsAgg.buckets) return [];

  return (termsAgg.buckets as estypes.AggregationsStringTermsBucket[]).map((bucket) => {
    let key: string;
    if (bucket.key === 1 || bucket.key === true) {
      key = 'true';
    } else if (bucket.key === 0 || bucket.key === false) {
      key = 'false';
    } else {
      key = bucket.key.toString();
    }
    return { key, count: bucket.doc_count };
  });
}

// ---------------------------------------------------------------------------
// Query helpers
// ---------------------------------------------------------------------------

const toBooleanIfNeeded = (value: string): string | boolean => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export const setFilters = (filters: { key: string; value?: string | string[] }[]) => {
  return filters
    .filter(({ value }) => {
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    })
    .map(({ key, value }) => {
      if (Array.isArray(value)) return { terms: { [key]: value } };
      const processedValue = toBooleanIfNeeded(value as string);
      return { term: { [key]: processedValue } };
    });
};
