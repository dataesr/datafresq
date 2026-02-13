// https://github.com/oven-sh/bun/issues/7920#issuecomment-1874386714
import { Client, type ClientOptions, type estypes, HttpConnection } from '@elastic/elasticsearch';
import { config } from '~/config';

const esConfig: ClientOptions = {
  Connection: HttpConnection,
  ...config.elastic,
};

const client = new Client(esConfig);

// Index mapping
const indexMap = {
  programs: 'fresq-20260213',
  institutions: 'fresq-etablissements-2025-staging',
  specializations: 'fresq-mentions-2025-staging',
  careers: 'fresq-metiers-2025-staging',
} as const;

/**
 * Create a proxy that automatically injects the index into any ES operation
 */
const createIndexProxy = (index: string) => {
  return new Proxy(client, {
    get(target, prop) {
      const method = target[prop as keyof typeof target];

      // If it's a function, wrap it to inject index
      if (typeof method === 'function') {
        return (params?: Record<string, unknown>) => {
          return (method as (...args: unknown[]) => unknown).call(target, { index, ...params });
        };
      }

      return method;
    },
  }) as typeof client;
};

// Create proxies for all indices, plus raw client for PIT searches
export const elastic = {
  ...Object.fromEntries(
    Object.entries(indexMap).map(([name, index]) => [name, createIndexProxy(index)]),
  ),
  // Raw client for operations that must not include index (e.g., search with PIT)
  client,
} as Record<keyof typeof indexMap, typeof client> & { client: typeof client };

// Types for enhanced search results
export type SearchHit<T> = T & {
  score: number | null;
  highlight?: Record<string, string[]>;
};

export type SearchResult<T> = {
  hits: SearchHit<T>[];
  total: number;
  maxScore: number | null;
};

export type AggregationBucket = {
  key: string;
  count: number;
};

export type SearchResultWithAggs<T> = SearchResult<T> & {
  aggregations: Record<string, AggregationBucket[]>;
};

/**
 * Extract just the source documents from an Elasticsearch response
 */
export function extractSources<T>(response: estypes.SearchResponse<T> | undefined): T[] {
  if (!response) return [];
  return response.hits.hits
    .map((hit) => hit._source)
    .filter((source): source is T => source !== undefined);
}

/**
 * Extract the maximum score from an Elasticsearch response
 */
export function extractMaxScore(response: estypes.SearchResponse | undefined): number | null {
  if (!response) return null;
  return response.hits.max_score ?? null;
}

/**
 * Normalize a score to a 0-1 range based on the maximum score
 */
export function normalizeScore(score?: number | null, max?: number | null): number | null {
  if (!score || !max) return null;
  return Number((Math.round((score / max) * 100) / 100).toFixed(2));
}

/**
 * Extract hits with normalized scores and highlights
 */
export function extractHits<T>(response: estypes.SearchResponse<T> | undefined): SearchHit<T>[] {
  if (!response) return [];
  const maxScore = extractMaxScore(response);

  return response.hits.hits
    .map((hit): SearchHit<T> | undefined => {
      if (!hit._source) return undefined;
      return {
        ...hit._source,
        score: normalizeScore(hit._score, maxScore),
        highlight: hit.highlight,
      };
    })
    .filter((source): source is SearchHit<T> => source !== undefined);
}

/**
 * Extract the total number of hits from an Elasticsearch response
 */
export function extractTotal(response: estypes.SearchResponse | undefined): number {
  if (!response) return 0;
  return typeof response.hits.total === 'number'
    ? response.hits.total
    : response.hits.total?.value || 0;
}

/**
 * Extract term aggregation buckets from an Elasticsearch aggregation
 */
export function extractTermBuckets(
  agg: estypes.AggregationsAggregate | undefined,
): AggregationBucket[] {
  if (!agg) return [];

  const termsAgg = agg as estypes.AggregationsStringTermsAggregate;
  if (!termsAgg.buckets) return [];

  return (termsAgg.buckets as estypes.AggregationsStringTermsBucket[]).map((bucket) => {
    // Handle boolean field keys: ES returns 0/1 for boolean terms aggregations
    let key: string;
    if (bucket.key === 1 || bucket.key === true) {
      key = 'true';
    } else if (bucket.key === 0 || bucket.key === false) {
      key = 'false';
    } else {
      key = bucket.key.toString();
    }
    return {
      key,
      count: bucket.doc_count,
    };
  });
}

/**
 * Convert string "true"/"false" to actual boolean values for Elasticsearch
 */
const toBooleanIfNeeded = (value: string): string | boolean => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

export const setFilters = (
  filters: {
    key: string;
    value?: string | string[];
  }[],
) => {
  return filters
    .filter(({ value }) => {
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    })
    .map(({ key, value }) => {
      if (Array.isArray(value)) return { terms: { [key]: value } };
      // Convert "true"/"false" strings to actual booleans for boolean fields
      const processedValue = toBooleanIfNeeded(value as string);
      return { term: { [key]: processedValue } };
    });
};
