import { Elysia } from 'elysia';
import { DatabaseError } from '~/errors/database.error';
import { elastic, extractTotal } from '~/external/elastic';
import { authMacro } from '~/macros/authMacro';
import { errorResponseSchema } from '~/schemas/common';
import {
  institutionSearchParamsSchema,
  institutionSearchResponseSchema,
} from '~/schemas/institutions';

// Fields to retrieve from Elasticsearch
const SOURCE_FIELDS = [
  'uai_etablissement',
  'denomination_etablissement',
  'libelle_etablissement',
  'sigle_etablissement',
  'ville_etablissement',
  'nature_etablissement',
  'paysage_elt.id',
  'paysage_elt.name',
];

export const institutionsRoutes = new Elysia({ prefix: '/institutions' }).use(authMacro).get(
  '/',
  async ({ query }) => {
    const { q, page = 1, pageSize = 20 } = query;

    // Build the main query - search on all name-like fields
    const textQuery = q
      ? {
          multi_match: {
            query: q,
            fields: [
              'denomination_etablissement^3',
              'libelle_etablissement^3',
              'nom_etablissement^3',
              'nom_courant_etablissement^2',
              'nom_commun_etablissement^2',
              'nom_bce_etablissement^2',
              'sigle_etablissement^2',
              'paysage_elt.name^3',
              'libelle_avec_parent_etablissement',
              'uai_etablissement',
            ],
            type: 'best_fields' as const,
            fuzziness: 'AUTO',
          },
        }
      : { match_all: {} };

    const from = (page - 1) * pageSize;

    const searchResponse = await elastic.institutions
      .search({
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

    // Transform results to return paysage_elt.id as the id for filtering
    const institutions = (searchResponse?.hits?.hits ?? [])
      .map((hit) => {
        const source = hit._source as Record<string, unknown> | undefined;
        if (!source) return null;

        const paysageElt = source.paysage_elt as { id?: string; name?: string } | undefined;

        // Skip if no paysage_elt.id (we need it for filtering programs)
        if (!paysageElt?.id) return null;

        return {
          id: paysageElt.id,
          label:
            paysageElt.name ||
            (source.denomination_etablissement as string) ||
            (source.libelle_etablissement as string) ||
            '',
          uai: source.uai_etablissement as string | undefined,
          city: source.ville_etablissement as string | undefined,
          nature: source.nature_etablissement as string | undefined,
        };
      })
      .filter((inst): inst is NonNullable<typeof inst> => inst !== null);

    return { institutions, totalCount };
  },
  {
    isAuth: true,
    query: institutionSearchParamsSchema,
    response: {
      200: institutionSearchResponseSchema,
      422: errorResponseSchema,
      500: errorResponseSchema,
    },
    detail: {
      description:
        'Search institutions/establishments. Returns paysage_elt.id for filtering programs.',
      summary: 'Search institutions',
      tags: ['Institutions'],
    },
  },
);
