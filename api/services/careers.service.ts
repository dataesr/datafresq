import { ES_INDEXES, elastic, extractTotal } from '~/database/elastic';
import { DatabaseError } from '~/errors';

const SOURCE_FIELDS = ['code_rome', 'label', 'level_1', 'level_2'];

export async function searchCareers(q?: string, page = 1, pageSize = 20) {
  const textQuery = q
    ? {
        multi_match: {
          query: q,
          fields: ['label^3', 'level_1^2', 'level_2^2', 'metiers.label^2', 'autocompleted'],
          type: 'best_fields' as const,
          fuzziness: 'AUTO',
        },
      }
    : { match_all: {} };

  const from = (page - 1) * pageSize;

  const searchResponse = await elastic
    .search({
      index: ES_INDEXES.careers,
      from,
      size: pageSize,
      _source: SOURCE_FIELDS,
      query: textQuery,
      track_scores: true,
    })
    .catch((err) => {
      console.error('Elasticsearch error:', err);
      throw new DatabaseError(err.message);
    });

  const totalCount = extractTotal(searchResponse);

  const careers = (searchResponse?.hits?.hits ?? [])
    .map((hit) => {
      const source = hit._source as Record<string, unknown> | undefined;
      if (!source) return null;

      const codeRome = source.code_rome as string | undefined;
      if (!codeRome) return null;

      return {
        codeRome,
        label: (source.label as string) || '',
        level1: (source.level_1 as string) || undefined,
        level2: (source.level_2 as string) || undefined,
      };
    })
    .filter((career): career is NonNullable<typeof career> => career !== null);

  return { careers, totalCount };
}
